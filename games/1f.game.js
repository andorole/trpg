/*
 * 1f-左心室不動産 のゲーム内容。
 * - 入居審査: d4〜d100。d20 判定は審査印（審査通過／却下）。値下げ交渉での成功は家賃を実際に下げる
 * - 入居者カード: 体力 / 血液残量(L) / 宿主適合率(0-100%) の増減
 * - 免疫対応: パーティ共有ゲージ「抗原認識度」。異物認定タグを持つ入居者は毎手番ゲージを押し上げる。
 *   満タンで「くしゃみ」イベント（軽い巻き戻し）が発生する
 * - 契約書類: 「前の住人の日記」だけ読める。読むと内見記録の終盤に専用の対決選択肢が解禁される
 * - 内見記録: 分岐シナリオ「内見、はじまる（ドクン）」（宿主適合率ルール・複数エンディング）。
 *   GM 秘匿（営業担当カナメ＝前の住人。39日目に免疫と和解して転職した）を発見する真ルートあり
 * - 管理会社: 案件切替・宿主の体調・体内の異変表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 17;

  var SKILLS = [
    { name: '内見（見抜く目）', mod: 7 },
    { name: '値下げ交渉', mod: 5 },
    { name: '応急処置', mod: 4 },
    { name: '逃げ足', mod: 3 },
    { name: '探索', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  function bloodLabel(dl) { return (dl / 10).toFixed(1) + 'L'; }

  // 審査印: 値下げ交渉なら家賃反映。それ以外は審査通過／却下の一般判定
  function stampInfo(r, skillName, rent) {
    var ok = r.ok != null ? r.ok : (r.outcome === 'crit' || r.outcome === 'success');
    var isNego = skillName === '値下げ交渉';
    if (r.outcome === 'fumble') {
      return { word: '却下', color: '#b32e3f', bg: 'rgba(207,63,79,.05)', verdict: '＝ ' + r.total + ' ・ 却下（心室痙攣）', rentDelta: 0, hp: -2 };
    }
    if (ok && isNego) {
      var cut = (r.total - r.dc + 1) * 10;
      var bonus = r.die === 20 ? cut : 0;
      var total = cut + bonus;
      return { word: '審査通過', color: '#3d8a5f', bg: 'rgba(61,138,95,.05)', verdict: '＝ ' + r.total + ' ・ 家賃 ' + rent + '→' + Math.max(50, rent - total) + 'cc/月に成功！' + (bonus ? '（特別優遇）' : ''), rentDelta: -total, hp: 0 };
    }
    if (ok) {
      return { word: '審査通過', color: '#3d8a5f', bg: 'rgba(61,138,95,.05)', verdict: '＝ ' + r.total + ' ・ 審査通過', rentDelta: 0, hp: 0 };
    }
    return { word: '却下', color: '#b32e3f', bg: 'rgba(207,63,79,.05)', verdict: '＝ ' + r.total + ' ・ 却下', rentDelta: 0, hp: 0 };
  }

  var COMBATANTS = [
    { key: 'hpMacro', name: 'マクロファージ〈お掃除の大きい人〉', init: 19, max: 30, gauge: 'お掃除意欲', toggleable: false, tokenStyle: "width:30px;height:30px;flex:none;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff,#dfe4ee 70%);border:2px solid #8d93a0;", baseTags: [{ t: '包み込み体勢', bg: 'rgba(207,63,79,.1)', color: '#b32e3f' }, { t: '悪意なし', bg: 'rgba(58,53,46,.08)', color: '#6b6353' }] },
    { key: 'hpTsugumi', name: 'ツグミ', init: 15, max: 17, gauge: '体力', toggleable: true, tokenStyle: "width:30px;height:30px;flex:none;border-radius:50%;border:3px solid #cf3f4f;background:repeating-linear-gradient(45deg,rgba(207,63,79,.12) 0 4px,transparent 4px 8px),#fff;", identifiedDefault: false },
    { key: 'hpDozuru', name: 'ドズル', init: 12, max: 28, gauge: '体力', toggleable: true, tokenStyle: "width:30px;height:30px;flex:none;border-radius:50%;border:3px solid #cf3f4f;background:repeating-linear-gradient(45deg,rgba(207,63,79,.12) 0 4px,transparent 4px 8px),#fff;", identifiedDefault: true },
    { key: 'hpPirika', name: 'ピリカ', init: 8, max: 19, gauge: '体力', toggleable: false, tokenStyle: "width:30px;height:30px;flex:none;border-radius:50%;border:3px solid #cf3f4f;background:repeating-linear-gradient(45deg,rgba(207,63,79,.12) 0 4px,transparent 4px 8px),#fff;", baseTags: [{ t: '白血球と交渉中（前例なし）', bg: 'rgba(63,95,168,.12)', color: '#3f5fa8' }] },
  ];

  var GM_TABLE = ['心拍上昇（宿主が階段）', '心拍上昇（宿主が階段）', '胃酸逆流警報', '新しい入居希望者（ウイルス）', 'くしゃみ予報', '宿主が恋をする（全館暖房・家賃高騰）'];
  var GM_SCENES = ['左心室2LDKの内見', '39本目の爪痕の真相', 'オオヌシ様、健康診断の日'];

  var DIARY_TEXT = '最終ページ：「39日目。ついに気づいた。この部屋、心室じゃない。ここは——」以降、白紙。ページの端に胃液の染み。';
  var DIARY_TEXT_READ = '震える字で続きが読める。「——ここは、誰かの生活そのものだ。出て行けと言われている気がしていたが、違った。ただ、"住み方"を変えろと言われていただけだった。39日目、僕は営業に転職した」ページの隅に小さく、見覚えのある名前のサイン。カナメ。';

  // ─────────────────────────────────────────────
  // シナリオ「内見、はじまる（ドクン）」（内見記録 物件No.001）
  // fx: tai / blood(dL) / tekigo / flags / taiSet / tekigoSet
  // ─────────────────────────────────────────────
  var NODES = {
    f1: {
      kicker: '内見記録 ・ 物件No.001 左心室2LDK', title: '内見、はじまる（ドクン）', pct: 42,
      text: [
        '担当のカナメさん（営業スマイル・年中無休）は、弁の前で音叉を鳴らした。ラの音。ぬめる扉がゆっくり開き、体温36.8℃の風が吹き出す。「こちらが玄関です。脱ぎ履きしやすい広さ、そして——お気づきですか？　この床暖房」',
        'たしかに暖かい。暖かいというか、脈打っている。ドクン、ドクン。二拍ごとに照明（発光器官）がまたたく。ピリカが壁を撫でて言った。「この壁紙、呼吸してません？」カナメさんのスマイルは揺るがない。「換気機能です」',
        { q: '敷金は戻りません。血液も戻りません。それでも人は、住む場所を選べるだけ幸せなのです。' },
        '奥の部屋——右心房側の壁に、前の住人が残した爪痕がある。数えると、ちょうど39本。カナメさんはそこにカレンダーを掛けた。「収納も豊富です」',
      ],
      choices: [
        { num: '①', pre: '爪痕を調べる ', skillText: '内見判定', check: { name: '内見（見抜く目）', mod: 7, dc: 14 }, success: 'f2a', fail: 'f2b' },
        { num: '②', pre: '「前の入居者さんは、どちらへ？」と聞く（カナメさんの笑顔が試される） ', skillText: '', check: { name: '内見（見抜く目）', mod: 7, dc: 13 }, success: 'f2c', fail: 'f2d' },
        { num: '③', pre: '何も見なかった。日当たり（発光器官）の話をしよう', to: 'f2e' },
      ],
    },
    f2a: {
      kicker: '内見記録 ・ 物件No.001', title: '規則正しい39本', pct: 48, fx: { flags: { foundPattern: 1 } },
      text: [
        '爪痕は乱雑ではなかった。等間隔、同じ深さ、まるでカレンダーに丸をつけるように——一日一本。誰かが、日数を数えながら耐えていた跡だ。',
        'カナメさんの視線が、ほんの一瞬だけ爪痕に泳いだ。すぐに営業スマイルへ戻ったが。',
      ],
      choices: [{ pre: '契約書類の確認へ進む', to: 'f3' }],
    },
    f2b: {
      kicker: '内見記録 ・ 物件No.001', title: '数え損なう', pct: 46, fx: { tekigo: -2 },
      text: [
        '途中で数を見失った。34本か、39本か。心臓が一拍ごとにリズムを乱すせいで、集中が続かない。（宿主適合率 −2）',
        '「気にしすぎると、体に嫌われますよ」カナメさんが笑って言った。冗談には聞こえなかった。',
      ],
      choices: [{ pre: '契約書類の確認へ進む', to: 'f3' }],
    },
    f2c: {
      kicker: '内見記録 ・ 物件No.001', title: 'わずかな亀裂', pct: 48, fx: { flags: { sawCrack: 1 } },
      text: [
        '「前の入居者さんは、どちらへ？」と尋ねた瞬間、カナメさんの営業スマイルに、ほんの一瞬だけ亀裂が入った。「……お引っ越しです。とても、良いご縁で」',
        '良いご縁、という言葉の選び方が、やけに具体的だった。',
      ],
      choices: [{ pre: '契約書類の確認へ進む', to: 'f3' }],
    },
    f2d: {
      kicker: '内見記録 ・ 物件No.001', title: '崩れない笑顔', pct: 46,
      text: [
        '「前の入居者さんは、どちらへ？」カナメさんは澱みなく答えた。「守秘義務がございますので」営業スマイルは鉄壁で、そこから何も読み取れなかった。',
      ],
      choices: [{ pre: '契約書類の確認へ進む', to: 'f3' }],
    },
    f2e: {
      kicker: '内見記録 ・ 物件No.001', title: '日当たりの話', pct: 44, fx: { flags: { avoided: 1 } },
      text: [
        '爪痕からも、前の住人の話題からも、あえて目を逸らした。「発光器官の色、変えられたりします？」カナメさんは心底ほっとした様子で、間接照明のプランを語り始めた。',
        '知らないままのほうが、幸せなこともある。たぶん。',
      ],
      choices: [{ pre: 'このまま契約する', to: 'Et_naive' }],
    },
    f3: {
      kicker: '内見記録 ・ 物件No.001', title: '契約書類の確認', pct: 62,
      text: [
        'ツグミの荷物の中には、前の住人が残していったという日記が一冊。ページの隅に、胃液の染みがついている。読めば、何かが分かるかもしれない。',
        'カナメさんは契約書類を広げながら、こちらの様子を静かにうかがっている。',
      ],
      choices: [
        { pre: '日記の内容を踏まえ、カナメさんに真実を尋ねる', to: 'f4confront', if: function (st) { return st.flags.readDiary; } },
        { pre: '爪痕や態度から、それとなく核心を ', skillText: '探る', check: { name: '探索', mod: 3, dc: 14 }, success: 'f4hint', fail: 'f4deflect', if: function (st) { return st.flags.foundPattern || st.flags.sawCrack; } },
        { pre: '深入りせず、このまま契約に進む', to: 'Et_sign_blind' },
      ],
    },
    f4confront: {
      kicker: '内見記録 ・ 物件No.001', title: '日記の名前', pct: 74, fx: { flags: { knowTruth: 1 } },
      text: [
        '「この日記……あなたの字ですよね」静かに切り出すと、カナメさんの営業スマイルが、初めて完全に消えた。「……ばれちゃいましたか」',
        '彼は長い沈黙のあと、小さく笑った。今度は営業用ではない、少し疲れた本物の笑みだった。「39日目に、僕はここの住人でした。免疫システムと、直接話したんです。それから——」',
      ],
      choices: [{ pre: '続きを聞く', to: 'f5' }],
    },
    f4hint: {
      kicker: '内見記録 ・ 物件No.001', title: '崩れかけた営業スマイル', pct: 70, fx: { flags: { knowTruth: 1 } },
      text: [
        '「もしかして、あの爪痕をつけたのは……」最後まで言わないうちに、カナメさんの笑顔が音を立てそうなほど揺れた。「……鋭い方ですね。今期一番、鋭いお客様です」',
        '彼は観念したように、契約書類をテーブルに置いた。',
      ],
      choices: [{ pre: '続きを聞く', to: 'f5' }],
    },
    f4deflect: {
      kicker: '内見記録 ・ 物件No.001', title: '届かなかった探り', pct: 68, fx: { tekigo: -3 },
      text: [
        '核心に近づこうとするほど、言葉が空回りした。カナメさんは終始にこやかで、こちらの追及は虚しく壁に吸い込まれていく。（宿主適合率 −3）',
        '「さ、契約の話に戻りましょうか」笑顔の圧に押され、話題は自然と流れていった。',
      ],
      choices: [{ pre: '契約について話す', to: 'f5' }],
    },
    f5: {
      kicker: '内見記録 ・ 物件No.001', title: '契約の間', pct: 88,
      text: [
        'テーブルの上には契約書と、朱肉ならぬ血判のための針。カナメさんが、静かにこちらを見ている。',
      ],
      choices: [
        { pre: '「あなたと同じ道を、私も辿るのでしょうか」と穏やかに尋ね、契約する', to: 'Et_true', if: function (st) { return st.flags.knowTruth; } },
        { pre: '秘密を握った勢いで、営業成績のために客を欺いていないか問い詰める', to: 'Et_expose', if: function (st) { return st.flags.knowTruth; } },
        { pre: '何も言わず、契約書にサインする', to: 'Et_sign_blind' },
        { pre: '契約せず、回れ右する', to: 'Et_walkaway' },
      ],
    },
    Et_true: {
      kicker: '内見記録 ・ 結', title: '同じ道の、その先', pct: 100, end: true, fx: { tekigo: 8 },
      text: [
        'カナメさんは血判の針を置き、代わりに握手を求めてきた。「辿るかもしれません。でも、それは悪いことばかりじゃなかった。ここで暮らして、ここで働いて——僕は初めて、自分の"住み方"を選べた気がするんです」',
        '契約は成立した。家賃はそのまま、けれど敷金は「先輩からの贈り物」として免除された。宿主適合率が、じんわりと上がっていく。（宿主適合率 ＋8）',
      ],
      choices: [],
    },
    Et_expose: {
      kicker: '内見記録 ・ 結', title: '問い詰めた先', pct: 100, end: true, fx: { tekigo: -2 },
      text: [
        '「欺いてなんかいません」カナメさんの声は、初めて硬かった。「僕はただ、この物件の良さを、誰よりも知っているだけです。住んでいたから」',
        '気まずい沈黙のまま契約は成立したが、彼の営業スマイルはもう、以前と同じようには戻らなかった。物件自体に非はない。ただ、内見の後味は少し苦い。（宿主適合率 −2）',
      ],
      choices: [],
    },
    Et_naive: {
      kicker: '内見記録 ・ 結', title: '知らないままの契約', pct: 100, end: true,
      text: [
        '何も知らないまま、契約書に血判を押した。カナメさんは満面の営業スマイルで見送ってくれた。「ご入居、お待ちしております！」',
        '引っ越しの荷解きをしながら、壁の爪痕がふと目に入る。数えようとして——やめておいた。知らないほうがいいことも、きっとある。',
      ],
      choices: [],
    },
    Et_sign_blind: {
      kicker: '内見記録 ・ 結', title: '深入りしない契約', pct: 100, end: true,
      text: [
        '謎は謎のまま、契約だけを済ませた。実務的で、賢明な判断だったかもしれない。カナメさんは書類を丁寧にファイルにまとめ、深々と一礼した。',
        '新生活は、特に何事もなく始まった。たぶん。',
      ],
      choices: [],
    },
    Et_walkaway: {
      kicker: '内見記録 ・ 結', title: '回れ右', pct: 100, end: true, fx: { blood: -3 },
      text: [
        '弁の外へ、静かに引き返した。カナメさんは引き止めなかった。「またのご縁があれば」その声に、恨みがましさは欠片もなかった。（血液 −0.3L・交通費）',
        '大森林——いや、オオヌシ様の外側で、あなたはまた次の物件を探し始める。',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '内見記録 ・ 結', title: '内見中に力尽きる', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '床暖房（拍動）の心地よさに、意識が遠のいた。気づけば応急処置キットを持ったピリカが顔を覗き込んでいる。「寝るような内見の仕方、初めて見た」',
        '契約は、また今度。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_rejected: {
      kicker: '内見記録 ・ 結', title: '異物認定、退去勧告', pct: 100, end: true, fx: { tekigoSet: 10 },
      text: [
        '宿主適合率が底を打った瞬間、周囲の壁がぎゅっと収縮した。「申し訳ございません」カナメさんが青ざめる。「免疫システムが、お客様を"異物"と……！」',
        '白血球に丁重に——本当に丁重に——大動脈駅まで運ばれ、体外へ見送られた。宿主適合率は最低ラインまで底上げされ、審査はやり直しとなる。（宿主適合率 10 まで戻り再開）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '内見記録を最初からやり直す', restart: true },
    { pre: '物件一覧の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 1, diceDc: 14, rent: 800,
      lastRoll: { kind: 'check', die: 12, mod: 5, total: 17, dc: 14, outcome: 'success', skillName: '値下げ交渉' },
      rollLog: [
        { left: 'ツグミ ・ 値下げ交渉', right: '17 ／ 通過（-150cc）', color: '#3d8a5f' },
        { left: 'ドズル ・ 壁ドン耐久チェック', right: '4 ／ 却下（心室痙攣）', color: '#b32e3f' },
        { left: 'ピリカ ・ 「前の住人」を聞き出す', right: '22 ／ 大成功（聞かなきゃよかった）', color: '#3d8a5f' },
      ],
      tai: 14, bloodDL: 34, tekigo: 76,
      hpMacro: 28, hpTsugumi: 14, hpDozuru: 21, hpPirika: 16,
      identified: { hpTsugumi: false, hpDozuru: true },
      wave: 2, turnIdx: 0, ninshiki: 58, sneezeMsg: null,
      items: { diaryRead: 0 },
      flags: {},
      storyNode: 'f1', storyNote: null, storyNoteColor: '#7a7264',
      gmScene: 0, taicho: 71, gmTable: null,
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
    if (fx.blood) patch.bloodDL = Math.max(0, get('bloodDL') + fx.blood);
    if (fx.tekigo) patch.tekigo = eng().clamp(get('tekigo') + fx.tekigo, 0, 100);
    if (fx.tekigoSet != null) patch.tekigo = fx.tekigoSet;
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1f',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'rent', 'lastRoll', 'rollLog',
      'tai', 'bloodDL', 'tekigo', 'hpMacro', 'hpTsugumi', 'hpDozuru', 'hpPirika',
      'identified', 'wave', 'turnIdx', 'ninshiki', 'sneezeMsg',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'taicho', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'f1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.identified = Object.assign({}, init.identified, st.identified || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 物件一覧 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 入居者カード ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.bloodLabel = bloodLabel(st.bloodDL);
      out.bloodPct = E.clamp(Math.round((st.bloodDL / 50) * 100), 0, 100);
      out.tekigo = st.tekigo;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.bloodUp = function () { app.setState({ bloodDL: st.bloodDL + 1 }); };
      out.bloodDown = function () { app.setState({ bloodDL: Math.max(0, st.bloodDL - 1) }); };
      out.tekigoUp = function () { app.setState({ tekigo: E.clamp(st.tekigo + 1, 0, 100) }); };
      out.tekigoDown = function () { app.setState({ tekigo: E.clamp(st.tekigo - 1, 0, 100) }); };

      // ── 入居審査 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '● ' + skill.name + 'の判定 ・ 難度 ' + st.diceDc + '（大家：心臓）' : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだサイコロは振っていない'; out.diceVerdict = ''; out.stampColor = '#7a7264'; out.stampBg = '#fff';
      } else if (lr.kind === 'check') {
        var si = stampInfo(lr, lr.skillName, st.rent);
        out.diceFace = lr.die;
        out.stampWord = si.word;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = si.verdict;
        out.stampColor = si.color;
        out.stampBg = si.bg;
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.stampColor = '#7a7264';
        out.stampBg = '#fff';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #cf3f4f' : '1px solid rgba(58,53,46,.25)',
          color: sel ? '#b32e3f' : '#7a7264',
          bg: sel ? 'rgba(207,63,79,.06)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #cf3f4f' : '1px solid rgba(58,53,46,.2)',
          color: sel ? '#b32e3f' : '#7a7264',
          bg: sel ? 'rgba(207,63,79,.06)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var si = stampInfo(r, skill.name, st.rent);
          pushLog(st, 'ツグミ ・ ' + skill.name, r.total + ' ／ ' + si.word, si.color);
          var patch = {
            lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name },
            rollLog: st.rollLog,
          };
          if (si.rentDelta) patch.rent = Math.max(50, st.rent + si.rentDelta);
          if (si.hp) patch.tai = E.clamp(st.tai + si.hp, 0, TAI_MAX);
          app.setState(patch);
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'ツグミ ・ d' + st.diceSides, v + ' ／ 出目', '#7a7264');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 免疫対応 ──
      out.waveTitle = '退去勧告 ・ 第' + st.wave + '波';
      out.ninshiki = st.ninshiki;
      out.hasSneeze = !!st.sneezeMsg;
      out.sneezeMsg = st.sneezeMsg || '';
      function aliveIdx(from) {
        for (var i = 1; i <= COMBATANTS.length; i++) {
          var idx = (from + i) % COMBATANTS.length;
          if (st[COMBATANTS[idx].key] > 0) return idx;
        }
        return from;
      }
      function identifiedGrowth() {
        var total = 0;
        COMBATANTS.forEach(function (c) {
          if (c.toggleable && st.identified[c.key] && st[c.key] > 0) total += 6;
        });
        return total;
      }
      out.nextTurn = function () {
        var next = aliveIdx(st.turnIdx);
        var patch = { turnIdx: next, sneezeMsg: null };
        if (next <= st.turnIdx) {
          patch.wave = st.wave + 1;
          var grown = E.clamp(st.ninshiki + identifiedGrowth(), 0, 999);
          if (grown >= 100) {
            patch.ninshiki = 20;
            patch.sneezeMsg = '——満タンにより、全館一斉退去（くしゃみ）発生！ 認識度は20まで巻き戻り、全員に軽い衝撃（体力−1）。';
            COMBATANTS.forEach(function (c) {
              patch[c.key] = E.clamp((c.key in patch ? patch[c.key] : st[c.key]) - 1, 0, c.max);
            });
          } else {
            patch.ninshiki = grown;
          }
        }
        app.setState(patch);
      };
      out.hideBehind = function () {
        app.setState({ ninshiki: E.clamp(st.ninshiki - 5, 0, 100) });
      };
      out.combatants = COMBATANTS.map(function (c, i) {
        var hp = st[c.key];
        var dead = hp <= 0;
        var active = i === st.turnIdx && !dead;
        var tags = (c.baseTags || []).slice();
        var toggleLabel = '', toggleFn = null;
        if (c.toggleable) {
          var isId = !!st.identified[c.key];
          tags.push(isId
            ? { t: '異物認定（毎ターン認識度+6）', bg: 'rgba(207,63,79,.1)', color: '#b32e3f' }
            : { t: '消臭済み（認識度+0）', bg: 'rgba(61,138,95,.12)', color: '#3d8a5f' });
          toggleLabel = isId ? '消臭する' : '認定させる';
          toggleFn = function () {
            var identified = Object.assign({}, st.identified);
            identified[c.key] = !isId;
            app.setState({ identified: identified });
          };
        }
        if (dead) tags = [{ t: '戦線離脱', bg: 'rgba(207,63,79,.1)', color: '#b32e3f' }];
        function adj(d) {
          return function () {
            var patch = {};
            patch[c.key] = E.clamp(hp + d, 0, c.max);
            app.setState(patch);
          };
        }
        return {
          name: c.name, init: c.init, gauge: c.gauge, hp: hp, max: c.max,
          pct: Math.round((hp / c.max) * 100),
          side: active ? '行動中' : '',
          border: active ? '2px solid #cf3f4f' : '1px solid rgba(58,53,46,.16)',
          shadow: active ? '0 4px 12px rgba(207,63,79,.1)' : 'none',
          pad: '11px 14px', op: dead ? '.6' : '1',
          initBg: active ? '#cf3f4f' : 'rgba(58,53,46,.1)',
          initColor: active ? '#fff' : '#6b6353',
          tokenStyle: c.tokenStyle,
          barBg: c.key === 'hpMacro' ? '#8d93a0' : 'linear-gradient(90deg,#e0566a,#b32e3f)',
          tags: tags, toggleable: c.toggleable, toggle: toggleFn, toggleLabel: toggleLabel,
          dmg5: adj(-5), dmg1: adj(-1), heal1: adj(1), heal5: adj(5),
        };
      });

      // ── 契約書類 ──
      out.diaryUnread = !st.items.diaryRead;
      out.diaryText = st.items.diaryRead ? DIARY_TEXT_READ : DIARY_TEXT;
      out.readDiary = function () {
        var items = Object.assign({}, st.items);
        items.diaryRead = 1;
        app.setState({ items: items, flags: Object.assign({}, st.flags, { readDiary: 1 }) });
      };

      // ── 内見記録 ──
      var node = NODES[st.storyNode] || NODES.f1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#7a7264';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '内見ツアー完了 ・ 契約結審'
        : '内見ツアー進捗 ' + node.pct + '% ・ 心拍 ' + (72 + Math.round(node.pct / 4)) + 'bpm';
      out.storyCanRestart = st.storyNode !== 'f1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#7a7264' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#3d8a5f' : '#b32e3f';
            pushLog(st, 'ツグミ ・ ' + c.check.name + '（内見記録）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#3d8a5f' : '#b32e3f');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var tekigoNow = 'tekigo' in patch ? patch.tekigo : st.tekigo;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (tekigoNow <= 0 && !nextNode.end) {
            target = 'E_rejected';
            applyFx(st, NODES.E_rejected.fx, patch);
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

      // ── 管理会社 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #cf3f4f' : '1px solid rgba(58,53,46,.18)',
          bg: active ? 'rgba(207,63,79,.04)' : '#fff',
          color: active ? '#3a352e' : '#7a7264',
          weight: active ? '900' : '400',
        };
      });
      out.taicho = st.taicho;
      out.taichoMinus = function () { app.setState({ taicho: E.clamp(st.taicho - 5, 0, 100) }); };
      out.taichoPlus = function () { app.setState({ taicho: E.clamp(st.taicho + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '管理会社 ・ 体内の異変表', d + ' ／ ' + text, '#c98a2a');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
