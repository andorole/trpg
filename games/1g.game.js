/*
 * 1g-反省文ドラゴン のゲーム内容。
 * - 決裁判定: d4〜d100。d20 判定は決裁印を3段階（承認／条件付差戻／差戻）で判定する
 * - 人事ファイル: 体力（竜格）/ 社会性（人間界適応）/ 上司からの信頼(0-100、閾値でラベルが変わる) の増減
 * - 査問会議: ボス「呆れゲージ」（0で和解・100で「もういい」）を0まで下げるトラッカー。竜たちは平常心ゲージ
 * - 添付資料: 「下書き47枚目（本音）」に印をつけられる。印をつけると経緯書終盤の選択肢が変化する
 * - 経緯書: 分岐シナリオ「会議室Cが全焼するまでの経緯」（社会性ルール・複数エンディング）。
 *   GM 秘匿（ユーリ課長代理＝竜たちのリストラを止めようとしている）を発見する真ルートあり
 * - 人事部長室: 案件切替・全社「うっかり」警戒度・社内ハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 92, SHAKAI_MAX = 20;

  var SKILLS = [
    { name: '謝罪文の口述', mod: 4 },
    { name: '菓子折り選定', mod: 6 },
    { name: 'ハンコをまっすぐ押す', mod: -3 },
    { name: '誠意', mod: 3 },
    { name: '堪忍袋', mod: -2 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  // 決裁印: 3段階（承認／条件付差戻／差戻）。出目20は特別評価、出目1は大目玉
  function stampInfo(r) {
    if (r.die === 20) return { word: '承認', color: '#2f7a4f', bg: 'rgba(47,122,79,.05)', verdict: '＝ ' + r.total + ' ・ 承認（再発防止策が具体的、と評判に）' };
    if (r.outcome === 'fumble') return { word: '差戻', color: '#c43c3c', bg: 'rgba(196,60,60,.04)', verdict: '＝ ' + r.total + ' ・ 差戻（大目玉つき）' };
    if (r.total >= r.dc) return { word: '承認', color: '#2f7a4f', bg: 'rgba(47,122,79,.05)', verdict: '＝ ' + r.total + ' ・ 承認' };
    if (r.total >= r.dc - 3) return { word: '条件付差戻', color: '#b58a1f', bg: 'rgba(181,138,31,.04)', verdict: '＝ ' + r.total + ' ・ 惜しい。「反省の具体性が不足」との付箋つき' };
    return { word: '差戻', color: '#c43c3c', bg: 'rgba(196,60,60,.04)', verdict: '＝ ' + r.total + ' ・ 差戻' };
  }

  function trustInfo(v) {
    if (v >= 67) return { label: '良好', color: '#2f7a4f' };
    if (v >= 34) return { label: '回復中', color: '#b58a1f' };
    return { label: '低下中', color: '#c43c3c' };
  }

  var COMBATANTS = [
    { key: 'hpVoruga', name: 'ヴォルガ', init: 18, max: 30, tokenBorder: '#c45a2a', tokenPat: 'rgba(196,90,42,.14)', tags: [{ t: '菓子折り所持（虎屋）', bg: 'rgba(61,138,95,.12)', color: '#3d8a5f', anim: '' }, { t: '鼻から微煙', bg: 'rgba(196,60,60,.1)', color: '#c43c3c', anim: 'animation:smolder 2s ease-in-out infinite;' }] },
    { key: 'hpGlacie', name: 'グラキエ', init: 14, max: 28, tokenBorder: '#5b7fa8', tokenPat: 'rgba(91,127,168,.14)', tags: [{ t: '議事録係（正確無比）', bg: 'rgba(91,127,168,.12)', color: '#5b7fa8', anim: '' }] },
    { key: 'hpNoir', name: 'ノワール', init: 9, max: 24, tokenBorder: '#5b3a8f', tokenPat: 'rgba(91,58,143,.14)', tags: [{ t: '緊張で実体化が不安定', bg: 'rgba(196,60,60,.1)', color: '#c43c3c', anim: '' }] },
  ];

  var GM_TABLE = ['火災報知器の誤作動（誤りとは限らない）', '火災報知器の誤作動（誤りとは限らない）', '複合機が呪いを吐く', '取締役の抜き打ち視察', '差入れの到着（士気+1）', 'くしゃみの予感'];
  var GM_SCENES = ['会議室C全焼の査問', 'ノワールの試用期間 面談', '期末考課 ・ ボーナス査定'];

  var HONNE_TEXT = '最後の一枚にだけ、本音が書かれている。「本当は、皆で使うあの会議室が、嫌いではなかった」——提出用には使えない。しかし、これがいちばん誠意かもしれない。';
  var HONNE_TEXT_MARKED = '角に小さく付箋が貼られた。「提出候補」。本音を正式な書類として出すかどうかは、まだ決めていない。それでも、その選択肢は確かにここにある。';

  // ─────────────────────────────────────────────
  // シナリオ「会議室Cが全焼するまでの経緯」（経緯書 様式第9号 別紙）
  // fx: tai / shakai / trust / flags / taiSet / shakaiSet
  // ─────────────────────────────────────────────
  var NODES = {
    g1: {
      kicker: '経緯書 ・ 様式第9号 別紙', title: '会議室Cが全焼するまでの経緯', pct: 78,
      text: [
        '一、当日午後二時、私は会議室Cにて「コスト削減施策」の説明を受けておりました。二、資料は42ページに及び、私は誠実に聞いておりました。三、38ページ目「暖房費の削減について——冬期は各自の吐息で暖を取ること」の項に至り、私は深く感銘を受け、実演を試みました。',
        '四、私の吐息は摂氏千二百度でした。五、以後の記憶は煙とともにあります。六、なお、スプリンクラーは正常に作動しましたが、私の火は水で消えるものではございません。七、消火はグラキエ主任の吹雪により完了しました（同主任の給湯室凍結は、この際の余波です。彼女に非はありません）。',
        { q: '反省とは、燃やした事実を認めることではない。燃やさずに済んだ未来を、具体的に書くことである。' },
        '八、再発防止策として、以下のいずれかを誓約いたします。',
      ],
      choices: [
        { num: '①', pre: '感銘を受けても実演しない ', skillText: '堪忍袋判定', check: { name: '堪忍袋', mod: -2, dc: 16 }, success: 'g2a', fail: 'g2b' },
        { num: '②', pre: '会議はすべて屋外（採石場）で行うことを提案する', to: 'g2c' },
        { num: '③', pre: '下書き47枚目（本音）を、そのまま提出する', to: 'g2d' },
      ],
    },
    g2a: {
      kicker: '経緯書 ・ 別紙二', title: '自制の誓い', pct: 82, fx: { flags: { selfControl: 1 } },
      text: [
        '感銘を受けても実演しない——書きながら、自分でも笑ってしまいそうになった。だが誓約は誓約だ。ペンを握る手（正確には爪）に、いつもより力がこもる。',
        'グラキエが議事録の隅に、小さく花丸をつけてくれた。',
      ],
      choices: [{ pre: '決裁を待つ', to: 'g3' }],
    },
    g2b: {
      kicker: '経緯書 ・ 別紙二', title: '抑えきれない衝動', pct: 80, fx: { shakai: -1 },
      text: [
        '誓約を書こうとした瞬間、また38ページ目の暖房費削減案を思い出し、鼻先が熱くなった。すんでのところで隣のノワールが影で覆って事なきを得た。（社会性 −1）',
        '「先輩、息を止めてください、息を」後輩に窘められる元・四天王。',
      ],
      choices: [{ pre: '決裁を待つ', to: 'g3' }],
    },
    g2c: {
      kicker: '経緯書 ・ 別紙二', title: '採石場提案', pct: 81, fx: { flags: { proposedOutdoor: 1 } },
      text: [
        '「会議はすべて採石場で」——我ながら名案だと思ったが、書きながら人事部の反応が想像できてしまい、少し恥ずかしくなった。それでも消さずに提出することにする。',
        '実現すれば、火を吹いても誰も困らない。理屈は通っている、はずだ。',
      ],
      choices: [{ pre: '決裁を待つ', to: 'g3' }],
    },
    g2d: {
      kicker: '経緯書 ・ 別紙二', title: '本音のまま', pct: 83, fx: { flags: { honneSubmitted: 1 } },
      text: [
        '型通りの反省文をやめ、47枚目の本音——「本当は、皆で使うあの会議室が、嫌いではなかった」——を、そのまま清書することにした。手が震える。これは、提出用の文体ではない。',
        'それでも、いちばん本当のことだった。',
      ],
      choices: [{ pre: '決裁を待つ', to: 'g3' }],
    },
    g3: {
      kicker: '経緯書 ・ 別紙三', title: '決裁を待つ間', pct: 85,
      text: [
        '始末書は総務部の窓口を通り、査問会議の議題として上がった。控室で待つ間、ぷに男がそっとお茶を置いていってくれる。',
        'ユーリ課長代理の机の上、書類の山がやけに高いことに、ふと気づいた。',
      ],
      choices: [
        { pre: '本音の下書きにも印をつけていたなら、参考資料として添える', to: 'g4a', if: function (st) { return st.flags.honneMarked; } },
        { pre: 'ユーリ課長代理の様子を、それとなく ', skillText: '探る', check: { name: '誠意', mod: 3, dc: 13 }, success: 'g4hint', fail: 'g4blocked' },
        { pre: '何も詮索せず、このまま決裁を待つ', to: 'g4wait' },
      ],
    },
    g4a: {
      kicker: '経緯書 ・ 別紙三', title: '添えられた本音', pct: 88, fx: { flags: { addedHonne: 1 } },
      text: [
        '本音の下書きを、参考資料として添えた。ユーリ課長代理はそれをゆっくりと読み、机の書類の山を——普段は見せない角度で——少しだけ隠すように動かした。',
        '「……いいものを、添えてくれた」その声に、いつもの厳しさとは違う響きがあった。',
      ],
      choices: [{ pre: '査問会議へ向かう', to: 'g5' }],
    },
    g4hint: {
      kicker: '経緯書 ・ 別紙三', title: '書類の山', pct: 87, fx: { flags: { sensedBurden: 1 } },
      text: [
        '何気なく机を見ると、見覚えのある書式——始末書ではなく、上申書の束——が高く積まれている。表題には「配置転換の是非について」。付箋には「却下」の判が、繰り返し押されていた。',
        'それ以上は聞けなかったが、何かを抱えているのだと、はっきり分かった。',
      ],
      choices: [{ pre: '査問会議へ向かう', to: 'g5' }],
    },
    g4blocked: {
      kicker: '経緯書 ・ 別紙三', title: '踏み込めない', pct: 86, fx: { shakai: -1 },
      text: [
        '探ろうとしたが、ユーリ課長代理はさっと書類を伏せ、いつもの表情に戻ってしまった。「査問は3時からです」壁は厚い。（社会性 −1）',
      ],
      choices: [{ pre: '査問会議へ向かう', to: 'g5' }],
    },
    g4wait: {
      kicker: '経緯書 ・ 別紙三', title: '静かに待つ', pct: 86,
      text: [
        '詮索せず、大人しくお茶を飲んで待った。ぷに男が横で、うんうんと相槌を打ってくれる。それだけで少し、心が落ち着いた。',
      ],
      choices: [{ pre: '査問会議へ向かう', to: 'g5' }],
    },
    g5: {
      kicker: '経緯書 ・ 別紙四', title: '査問会議、最終弁明', pct: 95,
      text: [
        'ユーリ課長代理が始末書を閉じ、こちらをまっすぐ見た。「では、最後に一言どうぞ」呆れゲージの針が、判断を待つように揺れている。',
      ],
      choices: [
        { pre: '「課長代理も、大変なんですね」と、初めて労いの言葉をかける', to: 'Et_true', if: function (st) { return st.flags.sensedBurden || st.flags.addedHonne; } },
        { pre: '本音を貫き通し、飾らない言葉で気持ちを伝える', to: 'Et_honest', if: function (st) { return st.flags.honneSubmitted; } },
        { pre: '型通り、深く頭を下げて反省の意を示す', to: 'Et_standard' },
        { pre: '開き直り、「四天王だったのだから多少はね」と啖呵を切る ', skillText: '堪忍袋', check: { name: '堪忍袋', mod: -2, dc: 15 }, success: 'Et_defiant_win', fail: 'Et_fired_risk' },
      ],
    },
    Et_true: {
      kicker: '経緯書 ・ 結', title: '労いの一言', pct: 100, end: true, fx: { trust: 20, shakai: 2 },
      text: [
        'ユーリ課長代理の手が止まった。「……分かってしまいましたか」彼は苦笑して、判子を「承認」の位置で止めた。「君たちの雇用を守るための書類仕事も、また別の始末書のようなものです」',
        '呆れゲージがすっと下がっていく。査問会議は、いつもより少しだけ、あたたかい空気で終わった。（上司からの信頼 ＋20 ・ 社会性 ＋2）',
      ],
      choices: [],
    },
    Et_honest: {
      kicker: '経緯書 ・ 結', title: '飾らない言葉', pct: 100, end: true, fx: { trust: 12, shakai: 1 },
      text: [
        '「会議室が、嫌いじゃなかった」その一言に、査問会議の空気が緩んだ。ユーリ課長代理は珍しく声を出して笑った。「始末書にそれを書く勇気があるなら、次はもう少し器物損壊を控えてくれると助かります」',
        '型は破ったが、心証はむしろ良かったらしい。（上司からの信頼 ＋12 ・ 社会性 ＋1）',
      ],
      choices: [],
    },
    Et_standard: {
      kicker: '経緯書 ・ 結', title: '型通りの反省', pct: 100, end: true, fx: { trust: 6 },
      text: [
        '深く頭を下げ、型通りの反省の意を示した。無難で、手堅い。ユーリ課長代理は静かに頷き、判子を押した。「今回は、これで良しとします」',
        '劇的な進展はないが、着実な一歩ではあった。（上司からの信頼 ＋6）',
      ],
      choices: [],
    },
    Et_defiant_win: {
      kicker: '経緯書 ・ 結', title: '啖呵が通った', pct: 100, end: true, fx: { trust: 4, shakai: -2 },
      text: [
        '「四天王だったのだから多少はね」——場が凍りつく中、なぜかぷに男が「たしかに」と頷いたことで、空気が笑いに変わった。ユーリ課長代理も呆れ半分で判子を押す。',
        '社会性は明らかに損なわれたが、妙な貫禄だけは示せた夜だった。（上司からの信頼 ＋4 ・ 社会性 −2）',
      ],
      choices: [],
    },
    Et_fired_risk: {
      kicker: '経緯書 ・ 結', title: '啖呵が滑った', pct: 100, end: true, fx: { trust: -15, shakai: -3 },
      text: [
        '啖呵は静まり返った会議室に、虚しく響いた。ユーリ課長代理はこめかみを押さえ、無言で「差戻」の判を押した。呆れゲージが跳ね上がる。',
        '「会議室Dの予約、念のため確認しておきます」総務の誰かが呟いた。（上司からの信頼 −15 ・ 社会性 −3）',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '経緯書 ・ 結', title: '査問会議で気絶', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '緊張と疲労で、ついに意識を失った。目覚めるとグラキエの氷嚢が額に乗っている。「体力（竜格）にも限度があるのよ」',
        '始末書は、後日改めて提出することになった。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_feral: {
      kicker: '経緯書 ・ 結', title: '人間界不適合、判定', pct: 100, end: true, fx: { shakaiSet: 5 },
      text: [
        '社会性が底を尽き、思わず本性のまま吼えてしまった。会議室の窓ガラスが震える。ユーリ課長代理は慌てず、静かに窓を開けた。「深呼吸を。人間界研修、また受け直しましょうか」',
        '始末書どころではなくなったが、見捨てられはしなかった。（社会性 5 まで底上げされ再開）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '経緯書を最初から書き直す', restart: true },
    { pre: '総務受付の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 3, diceDc: 14,
      lastRoll: { kind: 'check', die: 9, mod: 4, total: 13, dc: 14, outcome: 'fail', skillName: '誠意' },
      rollLog: [
        { left: 'ヴォルガ ・ 会議室焼失の件（3度目）', right: '13 ／ 条件付差戻', color: '#b58a1f' },
        { left: 'グラキエ ・ 給湯室を凍結させた件', right: '18 ／ 承認（再発防止策が具体的）', color: '#2f7a4f' },
        { left: 'ノワール ・ 影で先輩を驚かせた件', right: '2 ／ 差戻（反省文が呪文で書かれていた）', color: '#c43c3c' },
      ],
      tai: 88, shakai: 6, trust: 41,
      hpVoruga: 22, hpGlacie: 26, hpNoir: 11, akire: 64,
      kai: 1, turnIdx: 0,
      items: { honneMarked: 0 },
      flags: {},
      storyNode: 'g1', storyNote: null, storyNoteColor: '#7a7668',
      gmScene: 0, keikai: 52, gmTable: null,
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
    if (fx.shakai) patch.shakai = eng().clamp(get('shakai') + fx.shakai, 0, SHAKAI_MAX);
    if (fx.shakaiSet != null) patch.shakai = fx.shakaiSet;
    if (fx.trust) patch.trust = eng().clamp(get('trust') + fx.trust, 0, 100);
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1g',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'shakai', 'trust', 'hpVoruga', 'hpGlacie', 'hpNoir', 'akire', 'kai', 'turnIdx',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'keikai', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'g1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 総務受付 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 人事ファイル ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.shakai = st.shakai;
      out.shakaiPct = Math.round((st.shakai / SHAKAI_MAX) * 100);
      var ti = trustInfo(st.trust);
      out.trust = st.trust;
      out.trustLabel = ti.label;
      out.trustColor = ti.color;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.shakaiUp = function () { app.setState({ shakai: E.clamp(st.shakai + 1, 0, SHAKAI_MAX) }); };
      out.shakaiDown = function () { app.setState({ shakai: E.clamp(st.shakai - 1, 0, SHAKAI_MAX) }); };
      out.trustUp = function () { app.setState({ trust: E.clamp(st.trust + 5, 0, 100) }); };
      out.trustDown = function () { app.setState({ trust: E.clamp(st.trust - 5, 0, 100) }); };

      // ── 決裁判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ ' + skill.name + '判定 ・ 決裁基準 ' + st.diceDc : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ決裁に回していない'; out.diceVerdict = ''; out.stampColor = '#7a7668'; out.stampBg = '#fff';
      } else if (lr.kind === 'check') {
        var si = stampInfo(lr);
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
        out.stampColor = '#7a7668';
        out.stampBg = '#fff';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #5b3a8f' : '1px solid rgba(43,43,51,.25)',
          color: sel ? '#5b3a8f' : '#7a7668',
          bg: sel ? 'rgba(91,58,143,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #5b3a8f' : '1px solid rgba(43,43,51,.25)',
          color: sel ? '#5b3a8f' : '#7a7668',
          bg: sel ? 'rgba(91,58,143,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var si = stampInfo(r);
          pushLog(st, 'ヴォルガ ・ ' + skill.name, r.total + ' ／ ' + si.word, si.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'ヴォルガ ・ d' + st.diceSides, v + ' ／ 出目', '#7a7668');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 査問会議 ──
      out.kaiTitle = '査問会議 ・ 第' + st.kai + '回 弁明';
      out.akire = st.akire;
      out.akireUp1 = function () { app.setState({ akire: E.clamp(st.akire + 1, 0, 100) }); };
      out.akireUp5 = function () { app.setState({ akire: E.clamp(st.akire + 5, 0, 100) }); };
      out.akireDown1 = function () { app.setState({ akire: E.clamp(st.akire - 1, 0, 100) }); };
      out.akireDown5 = function () { app.setState({ akire: E.clamp(st.akire - 5, 0, 100) }); };
      out.retea = function () {
        var patch = {};
        COMBATANTS.forEach(function (c) { patch[c.key] = E.clamp(st[c.key] + 2, 0, c.max); });
        app.setState(patch);
      };
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
      out.combatants = COMBATANTS.map(function (c, i) {
        var hp = st[c.key];
        var dead = hp <= 0;
        var active = i === st.turnIdx && !dead;
        var tags = dead ? [{ t: '退室（休憩室へ）', bg: 'rgba(196,60,60,.1)', color: '#c43c3c', anim: '' }] : c.tags;
        function adj(d) {
          return function () {
            var patch = {};
            patch[c.key] = E.clamp(hp + d, 0, c.max);
            app.setState(patch);
          };
        }
        return {
          name: c.name, init: c.init, hp: hp, max: c.max,
          pct: Math.round((hp / c.max) * 100),
          side: active ? '弁明中' : '',
          border: active ? '2px solid #c45a2a' : '1px solid rgba(43,43,51,.2)',
          bg: active ? 'rgba(196,90,42,.04)' : '#faf8f3',
          op: dead ? '.6' : '1',
          initBg: active ? '#c45a2a' : 'rgba(43,43,51,.1)',
          initColor: active ? '#fff' : '#4a4a52',
          tokenBorder: c.tokenBorder, tokenPat: c.tokenPat,
          hasTags: tags.length > 0, tags: tags,
          dmg5: adj(-5), dmg1: adj(-1), heal1: adj(1), heal5: adj(5),
        };
      });

      // ── 添付資料 ──
      out.honneUnmarked = !st.items.honneMarked;
      out.honneText = st.items.honneMarked ? HONNE_TEXT_MARKED : HONNE_TEXT;
      out.markHonne = function () {
        var items = Object.assign({}, st.items);
        items.honneMarked = 1;
        app.setState({ items: items, flags: Object.assign({}, st.flags, { honneMarked: 1 }) });
      };

      // ── 経緯書 ──
      var node = NODES[st.storyNode] || NODES.g1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#7a7668';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '経緯書 提出完了 ・ 査問結審'
        : '経緯書 進捗' + node.pct + '% ・ 提出期限まで あと' + Math.max(0, Math.round((100 - node.pct) / 10)) + '0分';
      out.storyCanRestart = st.storyNode !== 'g1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#7a7668' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#2f7a4f' : '#c43c3c';
            pushLog(st, 'ヴォルガ ・ ' + c.check.name + '（経緯書）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#2f7a4f' : '#c43c3c');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var shakaiNow = 'shakai' in patch ? patch.shakai : st.shakai;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (shakaiNow <= 0 && !nextNode.end) {
            target = 'E_feral';
            applyFx(st, NODES.E_feral.fx, patch);
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

      // ── 人事部長室 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #5b3a8f' : '1px solid rgba(43,43,51,.25)',
          bg: active ? 'rgba(91,58,143,.04)' : '#faf8f3',
          color: active ? '#2b2b33' : '#7a7668',
          weight: active ? '700' : '400',
        };
      });
      out.keikai = st.keikai;
      out.keikaiMinus = function () { app.setState({ keikai: E.clamp(st.keikai - 5, 0, 100) }); };
      out.keikaiPlus = function () { app.setState({ keikai: E.clamp(st.keikai + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '人事部長 ・ 社内ハプニング表', d + ' ／ ' + text, '#5b3a8f');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
