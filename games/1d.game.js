/*
 * 1d-確定申告ダンジョン のゲーム内容。
 * - 税額査定: d4〜d100。d20 判定は査定印（承認／差戻／差戻・重加算税）。大成功は「判例となる」
 * - 納税者票: 体力 / 気力 / 税務信用スコア（0-1000, A〜Eランク）の増減（税務調査・申述書と共有）
 * - 税務調査: 検査回トラッカー。査察官マルサの「追徴予定額」を0にすれば調査終了（勝利）
 * - 領収書綴: 申告済/未計上額の実データ化。領収書カードは個別に「計上する」操作が可能
 * - 申述書: 分岐シナリオ「窓口にて、金貨三百枚の件」（信用スコアルール・複数エンディング）
 *   GM 秘匿（マルサの刀「更正」は経費で落ちていない）を交渉材料として回収する真ルートあり
 * - 署長室: 事案切替・調査の深度・庁舎の異変表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 41, MP_MAX = 18, SHINYO_MAX = 1000;
  var BOSS_MAX = 300000;

  var SKILLS = [
    { name: '剣術', mod: 7 },
    { name: '値切り交渉', mod: 5 },
    { name: '逃走', mod: 4 },
    { name: '帳簿づけ', mod: -2 },
    { name: '経費の目利き', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  function commaG(n) { return n.toLocaleString('en-US') + 'G'; }

  function shinyoInfo(v) {
    if (v >= 700) return { rank: 'A', color: '#1f6e50' };
    if (v >= 500) return { rank: 'B', color: '#1f6e50' };
    if (v >= 300) return { rank: 'C', color: '#b58a1f' };
    if (v >= 100) return { rank: 'D', color: '#b58a1f' };
    return { rank: 'E', color: '#bf3a2b' };
  }

  // 査定印: 出目20=満場一致で承認（判例となる） / 大失敗=差戻・重加算税 / 通常成功=承認 / 失敗=差戻
  function stampInfo(r) {
    var refund = Math.max(0, (r.total - r.dc + 1) * 200);
    var ok = r.ok != null ? r.ok : (r.outcome === 'crit' || r.outcome === 'success');
    if (r.die === 20) return { word: '承認', verdict: '＝ ' + r.total + ' ・ 満場一致で承認（判例となる） ・ 還付 +' + commaG(refund * 3), color: '#1f6e50', ok: true, refund: refund * 3 };
    if (r.outcome === 'fumble') return { word: '差戻', verdict: '＝ ' + r.total + ' ・ 差戻・重加算税（追徴 +' + commaG(3000) + '）', color: '#bf3a2b', ok: false, refund: -3000 };
    if (ok) return { word: '承認', verdict: '＝ ' + r.total + ' ・ 経費として認められた（還付 +' + commaG(refund) + '）', color: '#1f6e50', ok: true, refund: refund };
    return { word: '差戻', verdict: '＝ ' + r.total + ' ・ 差戻（追加資料を求められた）', color: '#bf3a2b', ok: false, refund: 0 };
  }

  var RECEIPT_DEFS = [
    { k: 'potion', title: 'ポーション ×3', amt: '360G', bd: 'rgba(35,50,74,.4)', bg: '#fdfcf7', note: '但し 治療薬代として ・ 医療費控除対象', mark: '✓', markColor: '#1f6e50', noteColor: '#5b6472', done: true },
    { k: 'scale', title: 'ドラゴンの鱗 ×1', amt: '時価不明', amtColor: '#bf3a2b', bd: 'rgba(35,50,74,.4)', bg: '#fdfcf7', note: '雑所得 ・ 鑑定士の押印が無ければ認められない', mark: '⚠', markColor: '#bf3a2b', noteColor: '#5b6472', actionable: true, actLabel: '計上する' },
    { k: 'jar', title: '謎の壺 ×1', amt: '0G？', bd: 'rgba(35,50,74,.4)', bg: '#fdfcf7', note: '美術品 ・ 中から声がする ・ 資産計上を拒否している', mark: '審', markColor: '#b58a1f', noteColor: '#5b6472', actionable: true, actLabel: '開ける' },
    { k: 'blank', title: '白紙の領収書 ×5', amt: '—', amtColor: '#bf3a2b', bd: 'rgba(191,58,43,.5)', bg: 'rgba(191,58,43,.03)', note: '所持しているだけで調査官の敵意+1 ・ 廃棄推奨', mark: '⚠⚠', markColor: '#bf3a2b', noteColor: '#bf3a2b', actionable: true, actLabel: '廃棄する' },
    { k: 'stamp', title: '幽霊税理士の認印', amt: '評価不能', amtColor: '#7a5a9e', bd: 'rgba(122,90,158,.5)', bg: 'rgba(122,90,158,.04)', note: '押すと何かが「経費で落ちた」ことになる。使い道は不明', mark: '？', markColor: '#7a5a9e', noteColor: '#5b6472', hidden0: true },
  ];

  var TOKEN_HUMAN = "width:30px;height:30px;flex:none;border-radius:50%;border:2px solid #23324a;background:repeating-linear-gradient(45deg,rgba(35,50,74,.12) 0 4px,transparent 4px 8px);";
  var TOKEN_BOSS = "width:30px;height:30px;flex:none;border-radius:50%;border:2px solid #bf3a2b;background:repeating-linear-gradient(45deg,rgba(191,58,43,.14) 0 4px,transparent 4px 8px);";

  var COMBATANTS = [
    { key: 'seiAriel', name: 'アリエル', init: 18, max: 41, boss: false, deadTag: '戦意喪失', tags: [{ t: '領収書の束', bg: 'rgba(31,110,80,.12)', color: '#1f6e50' }] },
    { key: 'seiMorga', name: 'モルガ', init: 14, max: 26, boss: false, deadTag: '戦意喪失', tags: [{ t: '交際費の抗弁 詠唱中', bg: 'rgba(44,95,138,.12)', color: '#2c5f8a' }] },
    { key: 'seiVeru', name: 'ヴェル', init: 6, max: 24, boss: false, deadTag: '戦意喪失', tags: [{ t: '重加算税（毎ターン精神-3）', bg: 'rgba(191,58,43,.12)', color: '#bf3a2b' }, { t: '冷や汗', bg: 'rgba(181,138,31,.14)', color: '#b58a1f' }] },
    { key: 'choutei', name: '税務調査官 マルサ・ヴァルキュリア', init: 22, max: BOSS_MAX, boss: true, deadTag: '調査終了', tags: [{ t: '全帳簿透視', bg: 'rgba(191,58,43,.12)', color: '#bf3a2b' }, { t: '笑顔', bg: 'rgba(35,50,74,.1)', color: '#5b6472' }] },
  ];

  var GM_TABLE = ['追加資料を求められる', '追加資料を求められる', '内線電話が鳴る（誰も出ない）', '整理番号が飛ぶ', '書類が一枚だけ増えている', 'お茶が出る（和解の兆し）'];
  var GM_SCENES = ['窓口の指摘', '資料保管窟の探索', '査察官マルサとの対決'];

  // ─────────────────────────────────────────────
  // シナリオ「窓口にて、金貨三百枚の件」（申述書 事案087-3）
  // fx: tai / mp / shinyo / gold / items / flags / taiSet / shinyoSet
  // ─────────────────────────────────────────────
  var NODES = {
    t1: {
      kicker: '申述書 ・ 事案番号 087-3', title: '窓口にて、金貨三百枚の件', pct: 64,
      text: [
        '受付窓口の職員は、羽根ペンを置き、眼鏡の奥からアリエルを見た。「地下三階で取得された金貨三百枚ですが——申告書のどこにも記載がございませんね」',
        '背後でヴェルが口笛を吹くのをやめた。訂正印は、確かに彼の字である。モルガが小声で呪文を唱えかけ——ここが庁舎内であることを思い出して、咳払いに変えた。窓口の奥、書類の山の向こうで、誰かがゆっくりと立ち上がる気配がした。',
        { q: '申告なき戦利品は、存在しない戦利品である。' },
        '「なお」職員は続けた。「当署は、正直な申告者の味方です」その笑顔が、かえって恐ろしい。',
      ],
      choices: [
        { num: '①', pre: '正直に修正申告する（信用スコア維持 ・ 追徴あり）', to: 't2honest' },
        { num: '②', pre: '「拾ったのは別のパーティです」と申述する ', skillText: '値切り交渉', post: 'で言い抜ける', check: { name: '値切り交渉', mod: 5, dc: 15 }, success: 't2false_ok', fail: 't2false_fail' },
        { num: '③', pre: '領収書綴りの奥の"アレ"（白紙の領収書）に手を伸ばす', to: 't2jar' },
      ],
    },
    t2honest: {
      kicker: '申述書 ・ 事案番号 087-3', title: '修正申告書、提出', pct: 70, fx: { gold: -400, shinyo: 10 },
      text: [
        '羽根ペンが紙の上を滑る音だけが、しばらく響いた。追徴金四百枚。痛いが、正直に払える額だ。職員は印を三つ押し、それから顔を上げた。「以上で、本件は片付きました。……なお」',
        '「なお」の後に続く言葉を、庁舎に六年通うアリエルは知っている。あれは絶対に、ろくでもない話の前触れだ。',
      ],
      choices: [{ pre: '身構えて、続きを聞く', to: 't3nao' }],
    },
    t2false_ok: {
      kicker: '申述書 ・ 事案番号 087-3', title: '言い抜けの代償', pct: 68, fx: { gold: 300, flags: { lied: 1 } },
      text: [
        '「なるほど、それは失礼いたしました」職員は涼しい顔で頷き、書類を戻した。あっけないほど簡単に通った。三百枚は懐に残ったままだ。',
        'だが背筋の産毛が、ずっと逆立っている。書類の山の奥の気配は、まだ立ち上がったままこちらを見ているような気がした。',
      ],
      choices: [{ pre: '何事もなかった顔で、窓口を離れる', to: 't3nao' }],
    },
    t2false_fail: {
      kicker: '申述書 ・ 事案番号 087-3', title: '露見', pct: 68, fx: { shinyo: -150, tai: -3, flags: { caughtLie: 1 } },
      text: [
        '「別のパーティ、ですか」職員の声が、一段低くなった。「では、その"別のパーティ"の受付番号を、いま呼んで参りましょうか」——嘘は、この庁舎では通らない。（信用 −150 ・ 体力 −3）',
        '書類の山の奥から、赤い制服の女が音もなく立ち上がった。「呼ばれる前に、来ました」査察官マルサ・ヴァルキュリア。目が、笑っていない。',
      ],
      choices: [
        { pre: 'その場で ', skillText: '帳簿づけ', post: 'をやり直し、誠意を見せる', check: { name: '帳簿づけ', mod: -2, dc: 16 }, success: 't3confront', fail: 'E_forced' },
      ],
    },
    t2jar: {
      kicker: '申述書 ・ 事案番号 087-3', title: '白紙の領収書', pct: 66,
      text: [
        '綴りの奥、五枚の白紙が、指先に吸いつくように冷たい。触れた瞬間、紙の隙間から嗄れた声が漏れた。「経費で……落として……くれ……」先代の税理士の声だと、後で知ることになる。',
        '声は取引を持ちかけてくる。「わしを一枚、認めてくれれば、お前の申告を手伝ってやろう」',
      ],
      choices: [
        { pre: '頷いて、取引に応じる', to: 't2jarA' },
        { pre: '綴りごと蓋を閉じ、拒否する', to: 't2jarB' },
      ],
    },
    t2jarA: {
      kicker: '申述書 ・ 事案番号 087-3', title: '幽霊税理士との契約', pct: 68, fx: { items: { stamp: 1 }, flags: { dealGhost: 1 } },
      text: [
        '白紙の一枚に、自然と文字が浮かんだ。「幽霊税理士の認印」——受け取った瞬間、掌にひやりとした重みが宿る。「使いどころは、お前が決めろ。わしはもう、決められる立場じゃない」',
        '声は満足げに、残りの白紙とともに沈黙した。',
      ],
      choices: [{ pre: '認印を懐に、窓口へ戻る', to: 't3nao' }],
    },
    t2jarB: {
      kicker: '申述書 ・ 事案番号 087-3', title: '拒まれた声', pct: 67, fx: { mp: -2, shinyo: -20, flags: { refusedGhost: 1 } },
      text: [
        '蓋を閉じた瞬間、綴り全体がぶるりと震え、拒絶の波動が指先から肘まで痺れさせた。（気力 −2 ・ 信用 −20）',
        '「そうか……」声は寂しげに遠のいていく。マルサがどこからか現れ、綴りを一瞥した。「白紙とお話しになりましたか。それは、規定違反ではありませんが——推奨は、いたしません」',
      ],
      choices: [{ pre: '何も言わず、窓口へ戻る', to: 't3nao' }],
    },
    t3confront: {
      kicker: '申述書 ・ 事案番号 087-3', title: '即席の帳簿修正', pct: 71, fx: { shinyo: 50 },
      text: [
        '震える手で、ペンを走らせる。数字は合わない、が、誠意だけは伝わったらしい。マルサは長い沈黙のあと、書類に「厳重注意」の判を押した。「今回だけです」（信用 ＋50）',
        '彼女は踵を返しかけ、ふと足を止めた。「……あなた方は、資料保管窟をご存知ですか。過去の判例に、参考になるものがあるかもしれません」',
      ],
      choices: [{ pre: '案内に従い、資料保管窟へ向かう', to: 't4vault' }],
    },
    t3nao: {
      kicker: '申述書 ・ 事案番号 087-3', title: '「なお」の続き', pct: 73,
      text: [
        '「なお」職員リンドウは続けた。「資料保管窟にて、興味深い書類が一枚、見つかっております。皆様の事案に、関係があるかもしれません」',
        'その一言だけを残し、彼は次の窓口業務に戻っていった。感応を澄ませれば、何か裏がありそうな気配がする。',
      ],
      choices: [
        { pre: '感応を澄ませ、リンドウの真意を ', skillText: '探る', check: { name: '感応', mod: 2, dc: 12 }, success: 't3naoA', fail: 't3naoB' },
      ],
    },
    t3naoA: {
      kicker: '申述書 ・ 事案番号 087-3', title: '感じ取った気配', pct: 75, fx: { flags: { earlyHint: 1 } },
      text: [
        'リンドウの声の端に、微かな同情が滲んでいた。彼は「知っている」のだ——保管窟にある書類が、査察官マルサ個人に関わることを。だが職務上、それ以上は言えない。',
        '目線で「そちらから、見つけてください」と伝えている。',
      ],
      choices: [{ pre: '資料保管窟へ向かう', to: 't4vault' }],
    },
    t3naoB: {
      kicker: '申述書 ・ 事案番号 087-3', title: '読めない顔', pct: 74, fx: { tai: -2 },
      text: [
        'リンドウの顔からは何も読み取れなかった。ただ庁舎特有の圧の中で、なぜか肩の重さだけが増した気がする。（体力 −2）',
        'ともかく、保管窟に行くしかなさそうだ。',
      ],
      choices: [{ pre: '資料保管窟へ向かう', to: 't4vault' }],
    },
    t4vault: {
      kicker: '申述書 ・ 事案番号 087-3', title: 'B1F 資料保管窟', pct: 79,
      text: [
        '過去三百年分の申告書が、天井まで積み上がっている。紙魚の群れが本棚の隙間で蠢く音がする。目的の一枚は、おそらく「査察官」の項目にあるはずだ。',
        '古い購入記録の綴りに手をかける。経理の目で読めば、何かが見えてくるかもしれない。',
      ],
      choices: [
        { pre: '古い記録を、', skillText: '経費の目利き', post: 'で読み解く', check: { name: '経費の目利き', mod: 3, dc: 13 }, success: 't4vaultA', fail: 't4vaultB' },
      ],
    },
    t4vaultA: {
      kicker: '申述書 ・ 事案番号 087-3', title: '一枚の購入記録', pct: 84, fx: { flags: { knowSword: 1 } },
      text: [
        '見つけた。二十年前、マルサ・ヴァルキュリア個人による斬魔刀「更正」の購入記録。備考欄には赤字で「業務使用と認められず、経費計上を却下」——却下したのは、当時の窓口担当者。名は、リンドウ。',
        '彼女は身銭を切って、仕事の得物を買った。そしてそれを、二十年間、誰にも経費にしてもらえていない。',
      ],
      choices: [{ pre: '書類を胸に、窓口へ戻る', to: 't5final' }],
    },
    t4vaultB: {
      kicker: '申述書 ・ 事案番号 087-3', title: '読み解けない記録', pct: 82, fx: { mp: -2, flags: { knowSwordPartial: 1 } },
      text: [
        '古い書体は難しく、断片しか拾えない。「斬魔刀」「却下」「二十年」——それだけの単語が、意味を結ばないまま頭に残る。（気力 −2）',
        '紙魚に指を齧られながら、窟を後にする。',
      ],
      choices: [{ pre: '窓口へ戻る', to: 't5final' }],
    },
    t5final: {
      kicker: '申述書 ・ 事案番号 087-3', title: '査察官との対峙', pct: 90,
      text: [
        '窓口に戻ると、マルサが待っていた。決裁印を片手に、表情を変えずに問う。「本件、最終決裁といたします。何か、申し立てはございますか」',
        '答え方ひとつで、この事案の結末が決まる。',
      ],
      choices: [
        { pre: '刀「更正」の購入記録を差し出す', to: 't6true', if: function (st) { return st.flags.knowSword; } },
        { pre: '幽霊税理士の認印を、そっと差し出す', to: 't6ghost', if: function (st) { return st.flags.dealGhost; } },
        { pre: '堂々と、', skillText: '感応', post: 'で申し立てる', check: { name: '感応', mod: 2, dc: 14 }, success: 't6persuade', fail: 't6reject' },
        { pre: '大人しく、決裁に従う', to: 't6comply' },
      ],
    },
    t6true: {
      kicker: '申述書 ・ 事案番号 087-3', title: '二十年目の経費', pct: 96,
      text: [
        '書類を見た瞬間、査察官の決裁印を持つ手が、初めて止まった。「……これを、どこで」声が、わずかに揺れる。',
        '「更正を、経費として認めていただけませんか。あなたが、正しく仕事をしてきた証として」アリエルが言うと、庁舎中の空気が変わった気がした。',
      ],
      choices: [{ pre: '返事を待つ', to: 'E_true' }],
    },
    t6ghost: {
      kicker: '申述書 ・ 事案番号 087-3', title: '幽霊の認印', pct: 94, fx: { items: { stamp: -1 } },
      text: [
        'マルサは差し出された古い認印を一目見て、絶句した。「先代の……これは、先々代の税理士殿の印章です。どこで手に入れたのですか」',
        '答えられずにいると、彼女は静かに、書類にその印を押した。「規定にはありませんが……先達の判断を、尊重いたします」',
      ],
      choices: [{ pre: '成り行きを見守る', to: 'E_ghost' }],
    },
    t6persuade: {
      kicker: '申述書 ・ 事案番号 087-3', title: '申し立て、通る', pct: 92,
      text: [
        '感応を込めた申し立ては、下手な弁論よりずっと誠実に響いた。マルサは細く息を吐き、決裁印の角度を、わずかに緩めた。「……次席への報告は、軽微な訂正として処理します」',
      ],
      choices: [{ pre: '一礼して受け取る', to: 'E_partial' }],
    },
    t6reject: {
      kicker: '申述書 ・ 事案番号 087-3', title: '突っぱねられる', pct: 92, fx: { shinyo: -100, gold: -500 },
      text: [
        '言葉は届かなかった。マルサの印が、迷いなく紙に落ちる。「本件、追加徴収額五百枚。信用スコアはランクを一段、引き下げます」（信用 −100 ・ ５００Ｇ徴収）',
      ],
      choices: [{ pre: '結果を受け入れる', to: 'E_reject' }],
    },
    t6comply: {
      kicker: '申述書 ・ 事案番号 087-3', title: '粛々と', pct: 90, fx: { gold: -200 },
      text: [
        '波風を立てず、決裁に従う。追徴二百枚。悪くはないが、良くもない——庁舎で生き延びる、いちばん平凡なやり方だった。',
      ],
      choices: [{ pre: '窓口を後にする', to: 'E_comply' }],
    },
    E_true: {
      kicker: '申述書 ・ 結審', title: '更正、経費で落ちる', pct: 100, end: true, fx: { gold: 5000, shinyo: 300 },
      text: [
        'マルサは決裁印を置き、代わりに古い購入記録に自らの印を重ねた。二十年越しの経費承認。彼女の目に浮かんだものを、庁舎の誰も見たことがなかった。',
        '「本件、完全なる帳簿として承認いたします」追徴どころか、還付金五千枚。信用スコアは満点に近い数値まで跳ね上がった。（真結 ・ 還付 ＋5,000G ・ 信用 ＋300）',
      ],
      choices: [],
    },
    E_ghost: {
      kicker: '申述書 ・ 結審', title: '先達の判断', pct: 100, end: true, fx: { gold: 50000, shinyoSet: 1 },
      text: [
        '認印の効力は絶大だった。金貨三百枚どころか、これまでの全経費が一括で「先達の判断」により承認される。手持ちは五万枚まで膨れ上がった。',
        'ただし——後日、庁舎のあらゆる帳簿にその印の影響が及んでいることが判明し、パーティの信用スコアは「規定外の要注意先」として最低ランクに固定された。金はある。信用は、ない。（貝殻硬貨ならぬ金貨 ＋50,000G ・ 信用スコア最低ランクに）',
      ],
      choices: [],
    },
    E_partial: {
      kicker: '申述書 ・ 結審', title: '軽微な訂正', pct: 100, end: true, fx: { gold: 1000, shinyo: 50 },
      text: [
        '「軽微な訂正」の四文字は、この庁舎で得られる中庸としては上出来の結果だった。追徴は最小限、信用も僅かに回復。マルサは最後に小さく頷いた。「また、いらしてください」',
        '（結 ・ 還付 ＋1,000G ・ 信用 ＋50）',
      ],
      choices: [],
    },
    E_reject: {
      kicker: '申述書 ・ 結審', title: '通らなかった申し立て', pct: 100, end: true,
      text: [
        '追徴五百枚、信用ランク一段降格。悪い結末ではあるが、致命傷でもない。庁舎はいつも通り、次の受付番号を呼び上げている。',
        '来年は、もう少しうまくやろう。事案087、結審。',
      ],
      choices: [],
    },
    E_comply: {
      kicker: '申述書 ・ 結審', title: '波風なく', pct: 100, end: true,
      text: [
        '追徴二百枚を払い、頭を下げ、窓口を後にした。冒険者としては地味だが、納税者としては満点の対応だったかもしれない。',
        'マルサの視線が、去り際に一瞬だけ、羨ましそうに書類の山を見ていた気がした。',
      ],
      choices: [],
    },
    E_forced: {
      kicker: '申述書 ・ 結審', title: '強制調査（物理）', pct: 100, end: true, fx: { tai: -6, shinyo: -300 },
      text: [
        '嘘の上塗りは、マルサには通じなかった。「任意調査は、終了です」次の瞬間、庁舎の床が消え、一行は物理的に地下へと落とされる。強制調査（物理）フェイズ、開幕。',
        '（体力 −6 ・ 信用 −300。信用スコアはEランクに転落。事案087、強制継続）',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '申述書 ・ 結審', title: '窓口で力尽きる', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '書類の重圧と徹夜の申告作業が、ついに体力を奪い切った。長椅子で目を覚ますと、ヴェルが心配そうに顔を覗き込んでいる。「意外と根性なしだな、リーダー」',
        '事案087は、しばらく保留扱いとなった。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_shinyoZero: {
      kicker: '申述書 ・ 結審', title: 'ブラックリスト入り', pct: 100, end: true, fx: { shinyoSet: 50 },
      text: [
        '信用スコアが底を打った瞬間、窓口の呼び出しランプが一斉に赤く点滅した。「要指導対象」の判が、申告書の表紙に大きく押される。',
        '来年からは、毎月の面談が義務付けられるだろう。それでも——追い出されなかっただけ、まだましだ。（信用スコア 50 まで底上げされ再開）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '申述書を最初から書き直す', restart: true },
    { pre: '受付の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 0, diceDc: 14,
      lastRoll: { kind: 'check', die: 14, mod: 5, total: 19, dc: 14, outcome: 'success', skillName: '剣術' },
      rollLog: [
        { left: 'アリエル ・ ポーション代の経費計上', right: '19 ／ 承認', color: '#1f6e50' },
        { left: 'ヴェル ・ 「拾った」金貨の出所説明', right: '3 ／ 差戻・重加算税', color: '#bf3a2b' },
        { left: 'モルガ ・ 使い魔の飼育費は研究費か', right: '23 ／ 承認（判例となる）', color: '#1f6e50' },
      ],
      tai: 34, mp: 12, shinyo: 742,
      seiAriel: 28, seiMorga: 22, seiVeru: 7, choutei: 186000,
      kai: 2, turnIdx: 0,
      decGold: 4200, undecGold: 820,
      items: { scale: 0, jar: 0, blank: 5, stamp: 0 },
      receiptState: {},
      flags: {},
      storyNode: 't1', storyNote: null, storyNoteColor: '#5b6472',
      gmScene: 0, depth: 58, gmTable: null,
    };
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.tai) patch.tai = eng().clamp(get('tai') + fx.tai, 0, TAI_MAX);
    if (fx.taiSet != null) patch.tai = fx.taiSet;
    if (fx.mp) patch.mp = eng().clamp(get('mp') + fx.mp, 0, MP_MAX);
    if (fx.shinyo) patch.shinyo = eng().clamp(get('shinyo') + fx.shinyo, 0, SHINYO_MAX);
    if (fx.shinyoSet != null) patch.shinyo = fx.shinyoSet;
    if (fx.gold) patch.decGold = Math.max(0, get('decGold') + fx.gold);
    if (fx.items) {
      var items = Object.assign({}, get('items'));
      for (var k in fx.items) items[k] = Math.max(0, (items[k] || 0) + fx.items[k]);
      patch.items = items;
    }
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1d',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'mp', 'shinyo', 'seiAriel', 'seiMorga', 'seiVeru', 'choutei', 'kai', 'turnIdx',
      'decGold', 'undecGold', 'items', 'receiptState', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'depth', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 't1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.receiptState = st.receiptState || {};
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 受付 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 納税者票 ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.mp = st.mp;
      out.mpPct = Math.round((st.mp / MP_MAX) * 100);
      var sInfo = shinyoInfo(st.shinyo);
      out.shinyo = st.shinyo;
      out.shinyoRank = sInfo.rank;
      out.shinyoColor = sInfo.color;
      out.shinyoPct = Math.round((E.clamp(st.shinyo, 0, SHINYO_MAX) / SHINYO_MAX) * 100);
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.mpUp = function () { app.setState({ mp: E.clamp(st.mp + 1, 0, MP_MAX) }); };
      out.mpDown = function () { app.setState({ mp: E.clamp(st.mp - 1, 0, MP_MAX) }); };
      out.shinyoUp = function () { app.setState({ shinyo: E.clamp(st.shinyo + 10, 0, SHINYO_MAX) }); };
      out.shinyoDown = function () { app.setState({ shinyo: E.clamp(st.shinyo - 10, 0, SHINYO_MAX) }); };

      // ── 税額査定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ ' + skill.name + 'の査定 ・ 認定基準 ' + st.diceDc : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ査定印は押していない'; out.diceVerdict = ''; out.diceVerdictColor = '#5b6472';
      } else if (lr.kind === 'check') {
        var si = stampInfo(lr);
        out.diceFace = lr.die;
        out.stampWord = si.word;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ 控除修正 ' + lr.mod;
        out.diceVerdict = si.verdict;
        out.diceVerdictColor = si.color;
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.diceVerdictColor = '#5b6472';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #23324a' : '1px solid rgba(35,50,74,.3)',
          color: sel ? '#23324a' : '#5b6472',
          bg: sel ? 'rgba(35,50,74,.06)' : 'transparent',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #23324a' : '1px solid rgba(35,50,74,.3)',
          color: sel ? '#23324a' : '#5b6472',
          bg: sel ? 'rgba(35,50,74,.06)' : 'transparent',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var si = stampInfo(r);
          pushLog(st, 'アリエル ・ ' + skill.name, r.total + ' ／ ' + si.word, si.color);
          var patch = { lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog };
          if (si.refund) patch.decGold = Math.max(0, st.decGold + si.refund);
          app.setState(patch);
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'アリエル ・ d' + st.diceSides, v + ' ／ 出目', '#5b6472');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 税務調査 ──
      out.kaiTitle = '税務調査 ・ 第' + st.kai + '回 質問検査';
      function aliveIdx(from) {
        for (var i = 1; i <= COMBATANTS.length; i++) {
          var idx = (from + i) % COMBATANTS.length;
          if (st[COMBATANTS[idx].key] > 0) return idx;
        }
        return from;
      }
      out.nextTurn = function () {
        var next = aliveIdx(st.turnIdx);
        var patch = { turnIdx: next };
        if (next <= st.turnIdx) patch.kai = st.kai + 1;
        app.setState(patch);
      };
      out.takeBreak = function () {
        var patch = {};
        COMBATANTS.forEach(function (c) {
          if (!c.boss && st[c.key] > 0) patch[c.key] = E.clamp(st[c.key] + 2, 0, c.max);
        });
        app.setState(patch);
      };
      out.combatants = COMBATANTS.map(function (c, i) {
        var hp = st[c.key];
        var dead = hp <= 0;
        var active = i === st.turnIdx && !dead;
        var tags = dead
          ? [{ t: c.deadTag, bg: c.boss ? 'rgba(31,110,80,.14)' : 'rgba(191,58,43,.14)', color: c.boss ? '#1f6e50' : '#bf3a2b' }]
          : c.tags;
        function adj(d) {
          return function () {
            var patch = {};
            patch[c.key] = E.clamp(hp + d, 0, c.max);
            app.setState(patch);
          };
        }
        var btns = c.boss
          ? [
              { t: '−3万', color: '#1f6e50', go: adj(-30000) },
              { t: '−1万', color: '#1f6e50', go: adj(-10000) },
              { t: '+1万', color: '#bf3a2b', go: adj(10000) },
              { t: '+3万', color: '#bf3a2b', go: adj(30000) },
            ]
          : [
              { t: '−5', color: '#bf3a2b', go: adj(-5) },
              { t: '−1', color: '#bf3a2b', go: adj(-1) },
              { t: '+1', color: '#2c5f8a', go: adj(1) },
              { t: '+5', color: '#2c5f8a', go: adj(5) },
            ];
        return {
          name: c.name, init: c.init, gauge: c.boss ? '追徴予定額' : '精神力',
          valLabel: c.boss ? commaG(hp) : hp + '/' + c.max,
          pct: Math.round((hp / c.max) * 100),
          side: active ? '答弁中' : c.boss ? '査察官' : '',
          sideColor: c.boss ? '#8a8264' : '#bf3a2b',
          isBoss: c.boss,
          pad: c.boss ? '12px 14px' : '11px 14px',
          mb: c.boss ? '14px' : '8px',
          border: active ? '2px solid #bf3a2b' : c.boss ? '2px solid #bf3a2b' : '1px solid rgba(35,50,74,.25)',
          bg: active ? 'rgba(191,58,43,.05)' : c.boss ? 'rgba(191,58,43,.05)' : i % 2 ? '#fdfcf7' : 'rgba(35,50,74,.05)',
          op: dead ? '.55' : '1',
          initBg: active || c.boss ? '#bf3a2b' : 'rgba(35,50,74,.12)',
          initColor: active || c.boss ? '#f6f3e9' : '#5b6472',
          tokenBorder: c.boss ? '#bf3a2b' : '#23324a',
          tokenPat: c.boss ? 'rgba(191,58,43,.14)' : 'rgba(35,50,74,.12)',
          nameColor: c.boss ? '#bf3a2b' : '#23324a',
          barBg: c.boss ? 'linear-gradient(90deg,#b58a1f,#bf3a2b)' : '#2c5f8a',
          hasTags: tags.length > 0, tags: tags,
          btns: btns,
        };
      });

      // ── 領収書綴 ──
      out.decLabel = commaG(st.decGold);
      out.undecLabel = commaG(st.undecGold) + (st.undecGold > 0 ? ' ⚠' : '');
      out.undecColor = st.undecGold > 0 ? '#bf3a2b' : '#1f6e50';
      out.receipts = RECEIPT_DEFS.filter(function (d) {
        return !(d.hidden0 && (st.items[d.k] || 0) <= 0);
      }).map(function (d) {
        var resolved = !!st.receiptState[d.k];
        var actionable = !!d.actionable && !resolved;
        return {
          title: d.title, amt: resolved ? '計上済' : d.amt, amtColor: resolved ? '#1f6e50' : (d.amtColor || '#23324a'),
          bd: d.bd, bg: d.bg, note: resolved ? 'この件は解決済み' : d.note,
          noteColor: resolved ? '#1f6e50' : d.noteColor, mark: resolved ? '✓' : d.mark, markColor: resolved ? '#1f6e50' : d.markColor,
          op: '1', actionable: actionable, actLabel: d.actLabel,
          act: function () {
            var rs = Object.assign({}, st.receiptState);
            rs[d.k] = 1;
            var patch = { receiptState: rs };
            if (d.k === 'scale') { patch.decGold = st.decGold + 900; patch.undecGold = Math.max(0, st.undecGold - 900); pushLog(st, 'アリエル ・ ドラゴンの鱗の鑑定計上', '900G ／ 承認', '#1f6e50'); }
            if (d.k === 'jar') { patch.mp = E.clamp(st.mp - 1, 0, MP_MAX); pushLog(st, 'アリエル ・ 謎の壺を開ける', '中から声が漏れた', '#7a5a9e'); }
            if (d.k === 'blank') { patch.shinyo = E.clamp(st.shinyo + 20, 0, SHINYO_MAX); pushLog(st, '一同 ・ 白紙の領収書を廃棄', '信用 ＋20', '#1f6e50'); }
            patch.rollLog = st.rollLog;
            app.setState(patch);
          },
        };
      });

      // ── 申述書 ──
      var node = NODES[st.storyNode] || NODES.t1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#5b6472';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end ? '事案087 ・ 結審' : '事案087 ・ 審理進捗 ' + node.pct + '%';
      out.storyCanRestart = st.storyNode !== 't1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#5b6472' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 基準' + dc + ' ・ ' + (r.ok ? '承認' : '差戻');
            patch.storyNoteColor = r.ok ? '#1f6e50' : '#bf3a2b';
            pushLog(st, 'アリエル ・ ' + c.check.name + '（申述書）', r.total + ' ／ ' + (r.ok ? '承認' : '差戻'), r.ok ? '#1f6e50' : '#bf3a2b');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var shinyoNow = 'shinyo' in patch ? patch.shinyo : st.shinyo;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (shinyoNow <= 0 && !nextNode.end) {
            target = 'E_shinyoZero';
            applyFx(st, NODES.E_shinyoZero.fx, patch);
          }
          patch.storyNode = target;
          app.setState(patch);
        };
      }
      var defs = node.end ? END_CHOICES : node.choices;
      out.storyChoices = defs.filter(function (c) {
        return !c.if || c.if(st);
      }).map(function (c) {
        var dc = c.check ? (typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc) : null;
        return {
          num: c.num || '', pre: c.pre, skillText: c.skillText || '', post: c.post || '',
          dcLabel: dc != null ? '難度' + dc : '',
          go: c.restart ? function () { app._resetGame(); }
            : c.top ? function () { app.setState({ screen: 'top' }); }
            : choose(c),
        };
      });

      // ── 署長室 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #bf3a2b' : '1px solid rgba(35,50,74,.3)',
          bg: active ? 'rgba(191,58,43,.04)' : '#fdfcf7',
          color: active ? '#23324a' : '#5b6472',
          weight: active ? '700' : '400',
        };
      });
      out.depth = st.depth;
      out.depthMinus = function () { app.setState({ depth: E.clamp(st.depth - 5, 0, 100) }); };
      out.depthPlus = function () { app.setState({ depth: E.clamp(st.depth + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '署長 ・ 庁舎の異変表', d + ' ／ ' + text, '#23324a');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
