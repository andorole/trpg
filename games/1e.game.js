/*
 * 1e-存在しない国の入国審査 のゲーム内容。
 * - 照合判定: d4〜d100。d20 判定は審査印（許可／拒否）。大失敗は印が「入れ替わる」不穏な誤審
 * - 審査官手帳: 体力 / 覚醒度 / 実在感(0-100%) の増減。判定を下すたび実在感が自動で1%減る
 * - 検問の列: 各旅行者の「発見した矛盾」を実際に数えるトラッカー。次の窓口／保留室送りで列を捌く
 * - 押収品保管庫: 「手紙（宛先：あなた）」だけ開封可能。開封が審査記録の特殊選択肢を解禁する
 * - 審査記録: 分岐シナリオ「「アンナ・ヴェイル」の審査」（実在感ルール・複数エンディング）。
 *   原本にあった「書類を再確認する」トグルはそのまま維持（GameEngine が上書きしない）
 *   GM 秘匿（アルカディアは彼女が眠るたびに作り直される国）を発見する真ルートあり
 * - 上級審問室: 場面切替・国境の揺らぎ・夜の異変表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 16, KAKU_MAX = 10;

  var SKILLS = [
    { name: '印影鑑定', mod: 7 },
    { name: '虚偽看破', mod: 6 },
    { name: '書類整理', mod: 4 },
    { name: '夢語り', mod: -2 },
    { name: '観察', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  // 審査印: 出目20=迷いなく許可 / 大失敗=印が入れ替わる誤審 / 通常成功=許可 / 失敗=拒否
  function stampInfo(r) {
    var ok = r.ok != null ? r.ok : (r.outcome === 'crit' || r.outcome === 'success');
    if (r.die === 20) return { word: '許可', verdict: '＝ ' + r.total + ' ・ 迷いなく許可 ・ 通過を認める', color: '#4fae7d', border: '#3f9268', bg: 'rgba(63,146,104,.05)', aside: '……いま、一瞬「拒否」と読めなかったか？', ok: true };
    if (r.outcome === 'fumble') return { word: '拒否', verdict: '＝ ' + r.total + ' ・ 誤審 ・ 印が入れ替わっていた', color: '#c04a3a', border: '#8a3a30', bg: 'rgba(192,74,58,.06)', aside: '押した瞬間の記憶が、ない。', ok: false };
    if (ok) return { word: '許可', verdict: '＝ ' + r.total + ' ・ 照合成立 ・ 通過を認める', color: '#4fae7d', border: '#3f9268', bg: 'rgba(63,146,104,.05)', aside: '……いま、一瞬「拒否」と読めなかったか？', ok: true };
    return { word: '拒否', verdict: '＝ ' + r.total + ' ・ 照合不成立 ・ 通過を拒む', color: '#c04a3a', border: '#8a3a30', bg: 'rgba(192,74,58,.05)', aside: '……いま、一瞬「許可」と読めなかったか？', ok: false };
  }

  var TOKEN_NORMAL = "border:2px solid #d9a441;background:repeating-linear-gradient(45deg,rgba(217,164,65,.16) 0 4px,transparent 4px 8px),rgba(23,29,40,.7);";
  var TOKEN_FACELESS = "border:2px solid #c04a3a;background:rgba(23,29,40,.9);";
  var TOKEN_PALE = "border:2px solid rgba(217,164,65,.5);background:repeating-linear-gradient(45deg,rgba(217,164,65,.1) 0 4px,transparent 4px 8px),rgba(23,29,40,.7);";

  var TRAVELER_DEFS = [
    { key: 'anna', name: '「アンナ・ヴェイル」', num: 3, max: 3, tokenStyle: TOKEN_NORMAL, nameColor: '#e8e0cc', tags: [{ t: '旅券が温かい', bg: 'rgba(217,164,65,.12)', color: '#d9a441' }, { t: '帰郷と主張', bg: 'rgba(111,211,216,.12)', color: '#6fd3d8' }] },
    { key: 'diplomat', name: '顔のない外交官', num: 4, unknown: true, tokenStyle: TOKEN_FACELESS, nameColor: '#c96a52', tags: [{ t: '通達第一項の対象', bg: 'rgba(192,74,58,.12)', color: '#c96a52' }, { t: '周囲の気温−3℃', bg: 'rgba(255,255,255,.06)', color: '#8d93a0' }] },
    { key: 'girl', name: '少女（名乗らない）', num: 5, max: 1, tokenStyle: TOKEN_PALE, nameColor: '#e8e0cc', tags: [{ t: '旅券が白紙', bg: 'rgba(111,211,216,.12)', color: '#6fd3d8' }], note: '「おじいちゃんに会いに行くの」' },
  ];

  var GM_TABLE = ['列が一人増えている', '列が一人増えている', 'ランプが瞬く', '印章の位置が変わっている', '犬が誰もいない方を見る', '夜が明けない'];
  var GM_SCENES = ['三人目の審査', '顔のない外交官の順番', '夜明け（来るとは限らない）'];

  // ─────────────────────────────────────────────
  // シナリオ「「アンナ・ヴェイル」の審査」
  // fx: tai / kaku / jitsu / flags / taiSet / jitsuSet
  // ─────────────────────────────────────────────
  var NODES = {
    n1: {
      kicker: '審査記録 ・ 今夜の三人目', pct: 33,
      text: [
        '窓口に置かれた旅券は、革ではなく、何かもっと柔らかいものでできていた。持ち上げると、かすかに温かい。「帰るんです」と彼女は言った。「アルカディアへ。生まれた町へ」。その目は嘘をついていない。目は。',
        'セロは吠えなかった。ただ、彼女の影を——彼女より少し遅れて動く影を、じっと見ていた。',
      ],
      choices: [
        { num: '①', pre: '矛盾を指摘する ', skillText: '虚偽看破', check: { name: '虚偽看破', mod: 6, dc: 15 }, success: 'n2a', fail: 'n2b' },
        { num: '②', pre: '見なかったことにして、許可印を押す', to: 'n2c' },
        { num: '③', pre: '「アルカディアは、どんな国ですか」と尋ねる', to: 'n2d' },
      ],
    },
    n2a: {
      kicker: '審査記録 ・ 今夜の三人目', pct: 40, fx: { flags: { annaAdmits: 1 } },
      text: [
        '「影の遅れについて、説明していただけますか」静かに問うと、彼女の笑顔が初めて揺れた。「……ああ。それは、まだ、慣れていないの。生まれたばかりだから」',
        '生まれたばかり。彼女は、二十歳は超えて見える。',
        { a: '手帳の余白に、勝手に文字が浮かぶ。「疑うのが、仕事だ」' },
      ],
      choices: [
        { pre: '保留室へ送り、詳しく調べる', to: 'n3hold' },
        { pre: 'このまま、情に免じて通す', to: 'Er_mercy_partial' },
      ],
    },
    n2b: {
      kicker: '審査記録 ・ 今夜の三人目', pct: 38, fx: { jitsu: -3 },
      text: [
        '指摘の言葉は、口に出す前に溶けて消えた。彼女の笑顔があまりに自然で、疑いそのものが不自然に思えてくる。（実在感 −3）',
        '手のひらの中で、審査印がわずかに重くなった気がした。',
      ],
      choices: [
        { pre: '特性「二度見」で、旅券の本当の姿を見る', to: 'n3nidome', if: function (st) { return !st.flags.usedNidome; } },
        { pre: '疑いを飲み込み、このまま通す', to: 'Er_pass_blind' },
      ],
    },
    n2c: {
      kicker: '審査記録 ・ 今夜の三人目', pct: 40, fx: { flags: { passedBlind: 1 } },
      text: [
        '深く考えず、許可の面を押した。彼女は深々と頭を下げ、霧の向こうへ足早に消えていく。窓口の老人が、初めて声をかけてきた。「若いの。今夜のことは、覚えておいたほうがいい」',
        'なぜそう思うのか、老人自身も分かっていない様子だった。',
      ],
      choices: [{ pre: '老人の言葉を、記録に留めておく', to: 'Er_easy' }],
    },
    n2d: {
      kicker: '審査記録 ・ 今夜の三人目', pct: 40, fx: { flags: { heardDream: 1 } },
      text: [
        '「アルカディアは、どんな国ですか」彼女は目を細め、遠くを見るように答えた。「毎朝、少しずつ違う国よ。港の位置が変わったり、母の家の色が変わったり。でも、目が覚めるといつも——帰りたくなる」',
        '毎朝、少しずつ違う。それは国の説明ではなく、夢の説明に聞こえた。',
      ],
      choices: [{ pre: 'さらに踏み込んで尋ねる', to: 'n3hold' }],
    },
    n3hold: {
      kicker: '審査記録 ・ 保留室にて', pct: 55,
      text: [
        '保留室の中では、時間が流れない。お茶だけが湯気を立て続けている。ヴェスパーが記録簿を繰りながら言う。「彼女のような申請者は、これで七人目です。全員、行き先はアルカディア」',
        '威厳を持って、核心に踏み込むべきだ。',
      ],
      choices: [
        { pre: '威厳をもって、核心を問い質す ', skillText: '威厳', check: { name: '威厳', mod: 1, dc: 13 }, success: 'n4truth', fail: 'n4evade' },
      ],
    },
    n3nidome: {
      kicker: '審査記録 ・ 二度見', pct: 60, fx: { kaku: -2, flags: { usedNidome: 1, knowTruth: 1 } },
      text: [
        '一晩に一度きりの力を使う。瞬きの間、旅券が透けて見えた——紙の裏側で、小さな町がまだ「描かれている途中」だった。桟橋の線が、いま引かれたばかりのインクのように濡れている。（覚醒度 −2）',
        'アルカディアは、記載された国ではない。今なお、誰かの手で——あるいは彼女自身の眠りの中で——描き足されている国だ。',
      ],
      choices: [{ pre: '見たものを、胸に納めて向き直る', to: 'n5final' }],
    },
    n4truth: {
      kicker: '審査記録 ・ 保留室にて', pct: 70, fx: { flags: { knowTruth: 1 } },
      text: [
        '「アルカディアは、地図に載っていない国です。ですが、彼女が眠るたびに、少しずつ形を変えて存在し続けている——そうですね」',
        '彼女は答えなかった。ただ、旅券を持つ手にほんの少し力がこもり、革ではない何かが、確かに脈打つのを感じた。',
      ],
      choices: [{ pre: '窓口へ戻り、最後の判断を下す', to: 'n5final' }],
    },
    n4evade: {
      kicker: '審査記録 ・ 保留室にて', pct: 65, fx: { jitsu: -4 },
      text: [
        '踏み込もうとするほど、言葉が空を切った。彼女は困ったように微笑むばかりで、核心は霧の向こうへ退いていく。（実在感 −4）',
        'ヴェスパーが記録簿を閉じた。「時間切れです、審査官」',
      ],
      choices: [{ pre: '窓口へ戻り、最後の判断を下す', to: 'n5final' }],
    },
    n5final: {
      kicker: '審査記録 ・ 最後の判断', pct: 85,
      text: [
        '窓口に戻ると、彼女はまだそこにいた。旅券を両手で包み、ただ静かに、審査印の音を待っている。',
      ],
      choices: [
        { pre: '真実を悟った上で、心を込めて許可印を押す', to: 'Et_true', if: function (st) { return st.flags.knowTruth; } },
        { pre: '手紙の内容を踏まえ、彼女に問う', to: 'Et_letter', if: function (st) { return st.flags.openedLetter; } },
        { pre: '規定通り、許可する', to: 'Et_approve' },
        { pre: '規定通り、拒否する', to: 'Et_deny' },
      ],
    },
    Et_true: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { jitsu: 5 },
      text: [
        '許可の面が紙に触れた瞬間、旅券がひときわ強く脈打ち、窓口いっぱいに港町の匂いがした。彼女は涙ぐみ、深く一礼する。「ありがとう。ちゃんと——見てくれて」',
        '霧の向こうに消える背中を、セロが初めて尻尾を振って見送った。あなたの実在感は、なぜかわずかに戻っている。誰かを正しく見ることは、自分を保つことでもあるらしい。（実在感 ＋5）',
      ],
      choices: [],
    },
    Et_letter: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { flags: { metaEnding: 1 } },
      text: [
        '「一つだけ、伺っても？」あなたは手紙の一節を、記憶のまま口にする。彼女は目を見開き——それから、あなたと同じ顔で微笑んだ。「その手紙、まだ読み終えていなかったのね。続きは、あなたが審査官を辞める夜に読めるわ」',
        '彼女は霧に消え、あなたは手の中の審査印を見つめる。これを書いたのは、本当に「先代」だったのか。それとも——。事案は、来夜へ持ち越された。',
      ],
      choices: [],
    },
    Et_approve: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { jitsu: -2 },
      text: [
        '規定通りに許可を与えた。彼女は礼を言い、霧の向こうへ消えていく。何も暴かず、何も知らないまま。仕事としては、模範的な一夜だった。（実在感 −2）',
        '手帳に「異常なし」と記す指先が、少しだけ、他人のものに見えた。',
      ],
      choices: [],
    },
    Et_deny: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { jitsu: -6 },
      text: [
        '拒否の面を押した。彼女は静かに頷き、何も言わずに窓口を離れる。振り返らなかった。旅券に残っていた温もりだけが、しばらく手のひらに残った。（実在感 −6）',
        'アルカディアという国は、たぶん今夜、彼女の眠りの中で少しだけ小さくなった。あなたは、それを知る術を持たない。',
      ],
      choices: [],
    },
    Er_mercy_partial: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { jitsu: 2 },
      text: [
        '矛盾を知りながら、あなたは情のほうを選んだ。「行きなさい」彼女は驚いた顔をしてから、涙を堪えて一礼した。老人がどこかで小さく頷いた気がした。（実在感 ＋2）',
        '正しい審査ではなかったかもしれない。それでも、悪い夜ではなかった。',
      ],
      choices: [],
    },
    Er_pass_blind: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { jitsu: -4 },
      text: [
        '疑いを飲み込んだまま、印を押した。彼女は微笑んで去っていったが、その微笑みの形を、あなたはもう正確に思い出せない。（実在感 −4）',
        '今夜見たものと見なかったものの境目が、少しずつ曖昧になっていく。',
      ],
      choices: [],
    },
    Er_easy: {
      kicker: '審査記録 ・ 結', pct: 100, end: true,
      text: [
        '何も疑わず、何も知らず、窓口を閉じた。老人の忠告だけが、理由もわからないまま手帳の隅に記されている。「今夜のことは、覚えておいたほうがいい」',
        '穏当な一夜。だが、なぜか朝が来ても、よく眠れた気がしなかった。',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '窓口に突っ伏し、そのまま眠りに落ちた。目を覚ますと、ヴェスパーが毛布をかけてくれていた。「誰も、あなたを責めていません。夜勤は、そういうものです」',
        '審査記録は、途中で途切れている。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_fade: {
      kicker: '審査記録 ・ 結', pct: 100, end: true, fx: { jitsuSet: 10 },
      text: [
        '気づけば、窓口の老人の顔が、以前よりほんの少し、自分に似ている気がした。実在感は底を打ち、輪郭がひどく曖昧になっている。',
        '「大丈夫」と老人が言う。「わしも最初は、そうだった。ここで働くほど、外側の世界での自分は薄くなる。でも——窓口の中では、誰よりも実在できる」それが慰めなのか、警告なのかは分からない。（実在感 10 まで戻り、勤務を続ける）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '審査記録を最初から書き直す', restart: true },
    { pre: '検問所の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 0, diceDc: 15,
      lastRoll: { kind: 'check', die: 13, mod: 5, total: 18, dc: 15, outcome: 'success', skillName: '印影鑑定' },
      rollLog: [
        { left: '一人目 ・ 商人フェン ・ 印影鑑定', right: '18 ／ 許可', color: '#4fae7d' },
        { left: '二人目 ・ 名を思い出せない男 ・ 虚偽看破', right: '6 ／ 失敗——通してしまった', color: '#c04a3a' },
        { left: '犬のセロ ・ 吠えるべきか ・ 直感', right: '20 ／ 大成功（吠えなかった）', color: '#4fae7d' },
      ],
      tai: 12, kaku: 7, jitsu: 63,
      queueIdx: 0, heldSet: {}, counts: { anna: 2, diplomat: 0, girl: 0 }, fogCount: 6,
      items: { letterOpened: 0 },
      flags: {},
      storyNode: 'n1', storyNote: null, storyNoteColor: '#8d93a0',
      gmScene: 0, yuragi: 44, gmTable: null,
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
    if (fx.kaku) patch.kaku = eng().clamp(get('kaku') + fx.kaku, 0, KAKU_MAX);
    if (fx.jitsu) patch.jitsu = eng().clamp(get('jitsu') + fx.jitsu, 0, 100);
    if (fx.jitsuSet != null) patch.jitsu = fx.jitsuSet;
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1e',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'kaku', 'jitsu', 'queueIdx', 'heldSet', 'counts', 'fogCount',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'yuragi', 'gmTable', 'rechecked',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'n1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.counts = Object.assign({}, init.counts, st.counts || {});
      st.heldSet = st.heldSet || {};
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 検問所 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 審査官手帳 ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.kaku = st.kaku;
      out.kakuPct = Math.round((st.kaku / KAKU_MAX) * 100);
      out.jitsu = st.jitsu;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.kakuUp = function () { app.setState({ kaku: E.clamp(st.kaku + 1, 0, KAKU_MAX) }); };
      out.kakuDown = function () { app.setState({ kaku: E.clamp(st.kaku - 1, 0, KAKU_MAX) }); };
      out.jitsuUp = function () { app.setState({ jitsu: E.clamp(st.jitsu + 1, 0, 100) }); };
      out.jitsuDown = function () { app.setState({ jitsu: E.clamp(st.jitsu - 1, 0, 100) }); };

      // ── 照合判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ ' + skill.name + '判定 ・ 難度 ' + st.diceDc : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ審査印は押していない'; out.diceVerdict = ''; out.diceVerdictColor = '#8d93a0'; out.stampBorder = 'rgba(217,164,65,.3)'; out.stampBg = 'rgba(255,255,255,.02)'; out.diceAside = '';
      } else if (lr.kind === 'check') {
        var si = stampInfo(lr);
        out.diceFace = lr.die;
        out.stampWord = si.word;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = si.verdict;
        out.diceVerdictColor = si.color;
        out.stampBorder = si.border;
        out.stampBg = si.bg;
        out.diceAside = si.aside;
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.diceVerdictColor = '#8d93a0';
        out.stampBorder = 'rgba(217,164,65,.3)';
        out.stampBg = 'rgba(255,255,255,.02)';
        out.diceAside = '';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #d9a441' : '1px solid rgba(217,164,65,.3)',
          color: sel ? '#e8e0cc' : '#8d93a0',
          bg: sel ? 'rgba(217,164,65,.1)' : 'transparent',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #d9a441' : '1px solid rgba(217,164,65,.3)',
          color: sel ? '#e8e0cc' : '#8d93a0',
          bg: sel ? 'rgba(217,164,65,.1)' : 'transparent',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var si = stampInfo(r);
          pushLog(st, 'ノクト ・ ' + skill.name, r.total + ' ／ ' + si.word, si.color);
          app.setState({
            lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name },
            rollLog: st.rollLog,
            jitsu: E.clamp(st.jitsu - 1, 0, 100),
          });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'ノクト ・ d' + st.diceSides, v + ' ／ 出目', '#8d93a0');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 検問の列 ──
      var order = TRAVELER_DEFS.map(function (d) { return d.key; });
      function nextUnheld(from) {
        for (var i = 1; i <= order.length; i++) {
          var idx = (from + i) % order.length;
          if (!st.heldSet[order[idx]]) return idx;
        }
        return from;
      }
      var currentKey = order[st.queueIdx];
      out.queueTitle = '検問の列 ・ ' + (TRAVELER_DEFS[st.queueIdx] ? TRAVELER_DEFS[st.queueIdx].num : '?') + '人目を審査中';
      out.nextWindow = function () { app.setState({ queueIdx: nextUnheld(st.queueIdx) }); };
      out.sendHolding = function () {
        var held = Object.assign({}, st.heldSet);
        held[currentKey] = 1;
        app.setState({ heldSet: held, queueIdx: nextUnheld(st.queueIdx) });
      };
      out.travelers = TRAVELER_DEFS.map(function (d, i) {
        var held = !!st.heldSet[d.key];
        var active = i === st.queueIdx && !held;
        var count = st.counts[d.key] || 0;
        function adjust(delta) {
          return function () {
            var counts = Object.assign({}, st.counts);
            counts[d.key] = E.clamp(count + delta, 0, d.max || 99);
            app.setState({ counts: counts });
          };
        }
        var tags = d.tags.slice();
        if (held) tags = tags.concat([{ t: '保留中', bg: 'rgba(217,164,65,.12)', color: '#d9a441' }]);
        return {
          num: d.num, name: d.name, nameColor: d.nameColor,
          side: active ? '審査中' : held ? '保留中' : '',
          sideColor: held ? '#d9a441' : '#d9a441',
          tokenStyle: d.tokenStyle,
          numBg: active ? '#d9a441' : 'rgba(255,255,255,.08)',
          numColor: active ? '#191104' : '#8d93a0',
          border: active ? '2px solid #d9a441' : held ? '1px dashed rgba(217,164,65,.3)' : d.unknown ? '1px solid rgba(192,74,58,.5)' : '1px solid rgba(217,164,65,.2)',
          bg: active ? 'rgba(217,164,65,.06)' : d.unknown ? 'rgba(192,74,58,.04)' : 'rgba(255,255,255,.02)',
          pad: '11px 14px', op: held ? '.65' : '1',
          hasTags: tags.length > 0, tags: tags,
          hasNote: !!d.note, note: d.note || '',
          trackable: !d.unknown, unknown: !!d.unknown, isFog: false,
          count: count, max: d.max, pct: d.max ? Math.round((count / d.max) * 100) : 0,
          ready: !d.unknown && count >= (d.max || 99),
          inc: adjust(1), dec: adjust(-1),
        };
      }).concat([{
        num: '6+', name: '以降の列は霧の中', nameColor: '#8d93a0',
        side: '', sideColor: '#8d93a0',
        tokenStyle: 'border:1px dashed rgba(217,164,65,.4);background:transparent;',
        numBg: 'transparent', numColor: '#7d8492',
        border: '1px dashed rgba(217,164,65,.3)', bg: 'transparent', pad: '11px 14px', op: '.7',
        hasTags: false, tags: [],
        hasNote: true, note: '——数えるたびに、推定 ' + st.fogCount + ' 人に増えている',
        trackable: false, unknown: false, isFog: true,
        peek: function () { app.setState({ fogCount: st.fogCount + 1 }); },
      }]);

      // ── 押収品保管庫 ──
      out.letterUnopened = !st.items.letterOpened;
      out.letterNote = st.items.letterOpened
        ? '開封済み。中身は、あなた自身の筆跡で書かれた一文だけだった。審査記録の場で、思い出せるかもしれない。'
        : '未開封。差出人欄の筆跡は、あなた自身のもの。開封は推奨されない。';
      out.openLetter = function () {
        var items = Object.assign({}, st.items);
        items.letterOpened = 1;
        app.setState({ items: items, jitsu: E.clamp(st.jitsu - 5, 0, 100), flags: Object.assign({}, st.flags, { openedLetter: 1 }) });
      };

      // ── 審査記録（story） ──
      var node = NODES[st.storyNode] || NODES.n1;
      out.storyKicker = node.kicker;
      out.storyBlocks = node.text.map(function (b) {
        if (typeof b === 'string') return { isP: true, isQ: false, isA: false, t: b };
        if (b.q) return { isP: false, isQ: true, isA: false, t: b.q };
        return { isP: false, isQ: false, isA: true, t: b.a };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#8d93a0';
      out.storyPct = node.pct;
      var caseNum = E.clamp(Math.round(3 + ((node.pct - 33) / 67) * 6), 3, 9);
      var hoursLeft = E.clamp(Math.round(3 * (1 - (node.pct - 33) / 67)), 0, 3);
      out.storyPctLabel = node.end
        ? '今夜の審査 ' + caseNum + '/9件 ・ 結審'
        : '今夜の審査 ' + caseNum + '/9件 ・ 夜明けまで あと' + hoursLeft + '時間（推定）';
      out.storyCanRestart = st.storyNode !== 'n1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#8d93a0' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#4fae7d' : '#c04a3a';
            pushLog(st, 'ノクト ・ ' + c.check.name + '（審査記録）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#4fae7d' : '#c04a3a');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var jitsuNow = 'jitsu' in patch ? patch.jitsu : st.jitsu;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (jitsuNow <= 0 && !nextNode.end) {
            target = 'E_fade';
            applyFx(st, NODES.E_fade.fx, patch);
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

      // ── 上級審問室 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #d9a441' : '1px solid rgba(217,164,65,.25)',
          bg: active ? 'rgba(217,164,65,.06)' : 'rgba(255,255,255,.02)',
          color: active ? '#e8e0cc' : '#8d93a0',
          weight: active ? '700' : '400',
        };
      });
      out.yuragi = st.yuragi;
      out.yuragiMinus = function () { app.setState({ yuragi: E.clamp(st.yuragi - 5, 0, 100) }); };
      out.yuragiPlus = function () { app.setState({ yuragi: E.clamp(st.yuragi + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '管理官 ・ 夜の異変表', d + ' ／ ' + text, '#e8c876');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
