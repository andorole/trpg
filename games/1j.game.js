/*
 * 1j-転生前人間ドック のゲーム内容。
 * - 精密検査: d4〜d100。d20 判定は5段階の医療判定（A〜E）で結果を示す。出目1は判定E「魂が逃走」
 * - 検査結果報告書: 徳値 / 業値 / 未練残量 / 記憶清算率 の増減。値に応じて判定バッジ(A〜D)が自動更新
 * - 処置室: 未練3件（大きい順）を「畳む／戻す」で清算するトラッカー。最大の未練を0にするのが目標
 * - お預かり窓口: 「橋のたもとの景色」だけ審査を進められ、承認すると問診記録の終盤で贈り物にできる
 * - 問診記録: 分岐シナリオ「問診票の、最後の質問」（徳拍・記憶清算率ルール・複数エンディング）。
 *   GM 秘匿は今回参照のみ（凪マチの生死）。本筋は春日野の50年分の後悔とその清算
 * - 医局: 症例切替・院内の混雑度・院内ハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TOKUHAKU_MAX = 150;

  var SKILLS = [
    { name: '縁の濃度補正', mod: 3 },
    { name: '徳値判定', mod: 2 },
    { name: '記憶感度', mod: 1 },
    { name: '業値解析', mod: -1 },
    { name: '経過観察眼', mod: 0 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  function gradeFromDev(dev, width) {
    var ratio = width > 0 ? dev / width : 0;
    if (ratio <= 0) return { grade: 'A', bg: 'rgba(62,164,110,.12)', color: '#2f8a5c' };
    if (ratio <= 0.3) return { grade: 'B', bg: 'rgba(201,168,46,.14)', color: '#a5851f' };
    if (ratio <= 1.0) return { grade: 'C', bg: 'rgba(201,114,46,.14)', color: '#c9722e' };
    return { grade: 'D', bg: 'rgba(198,84,72,.14)', color: '#c65448' };
  }
  function gradeToku(v) { var lo = 80, hi = 160; return gradeFromDev(v < lo ? lo - v : v > hi ? v - hi : 0, hi - lo); }
  function gradeGou(v) { var hi = 50; return gradeFromDev(v > hi ? v - hi : 0, hi); }
  function gradeMiren(v) { var hi = 120; return gradeFromDev(v > hi ? v - hi : 0, hi); }
  function gradeSeisan(v) { var lo = 95; return gradeFromDev(v < lo ? lo - v : 0, lo); }

  // 検査判定: 出目1は判定E「魂が逃走」。それ以外は総合値に応じてA〜D（達成=A、原本の基準15・出目17→A に整合）
  function checkupGrade(r) {
    if (r.die === 1) return { grade: 'E', color: '#7a5a9e', bg: 'rgba(122,90,158,.14)', verdict: '＝ ' + r.total + ' ・ 判定E。魂が検査室から逃走。院内放送が入る' };
    if (r.total >= r.dc) return { grade: 'A', color: '#2f8a5c', bg: 'rgba(62,164,110,.12)', verdict: '＝ ' + r.total + ' ・ 陽性所見なし。「この所見は、悪性ではありません」' };
    if (r.total >= r.dc - 4) return { grade: 'B', color: '#a5851f', bg: 'rgba(201,168,46,.14)', verdict: '＝ ' + r.total + ' ・ 経過観察。次回の健診でも追いましょう' };
    if (r.total >= r.dc - 8) return { grade: 'C', color: '#c9722e', bg: 'rgba(201,114,46,.14)', verdict: '＝ ' + r.total + ' ・ 要精密検査。もう一度、詳しく視る必要があります' };
    return { grade: 'D', color: '#c65448', bg: 'rgba(198,84,72,.14)', verdict: '＝ ' + r.total + ' ・ 要処置。処置室へご案内します' };
  }

  var REGRET_DEFS = [
    { key: 'r1', num: 1, title: '「息子の蕎麦を、一度も褒めなかった」', max: 400, tag: '悪性化リスクあり', tagColor: '#c65448', note: '切除不可（本人が掴んで離さない）', noteBg: 'rgba(198,84,72,.1)', noteColor: '#c65448', border: '2px solid #c65448', bg: 'rgba(198,84,72,.03)', numBg: '#c65448', numColor: '#fff', barColor: '#c65448' },
    { key: 'r2', num: 2, title: '「女房の墓に、月命日の花」', max: 120, tag: '定期系未練', tagColor: '#a5851f', note: '引継ぎ可（息子が既に毎月供えている——本人未確認）', noteBg: 'rgba(201,168,46,.12)', noteColor: '#a5851f', border: '1px solid rgba(201,168,46,.5)', bg: 'rgba(201,168,46,.04)', numBg: '#a5851f', numColor: '#fff', barColor: '#a5851f' },
    { key: 'r3', num: 3, title: '「常連の傘、返しそびれた」', max: 60, tag: '軽度', tagColor: '#3a9e8c', note: '本日中に畳めます（標準処置）', noteBg: 'rgba(58,158,140,.08)', noteColor: '#3a9e8c', border: '1px solid rgba(58,158,140,.3)', bg: '#fff', numBg: 'rgba(58,158,140,.12)', numColor: '#3a9e8c', barColor: '#3a9e8c' },
  ];

  var GM_TABLE = ['院内放送「逃走魂のお知らせ」', '院内放送「逃走魂のお知らせ」', 'レントゲンに前世が写り込む', '生者の迷い込み', '転生ゲート誤作動（動物枠に行列）', '院長回診（全員直立）'];
  var GM_SCENES = ['め-042 春日野様', 'め-043 凪様（採血拒否・3回目）', 'め-044 玉のれん様（測定器 修理待ち）'];

  // ─────────────────────────────────────────────
  // シナリオ「問診票の、最後の質問」（問診記録 SOUL-1957-0042）
  // fx: tokuhaku / gou / seisan / miren / flags / tokuhakuSet / seisanSet
  // ─────────────────────────────────────────────
  var NODES = {
    j1: {
      kicker: '問診記録 ・ SOUL-1957-0042 ・ 記録者：三途 看', title: '問診票の、最後の質問', pct: 81,
      text: [
        '「最後に。思い残したことを、ひとつだけ挙げるとしたら」——マニュアル通りの質問に、春日野さんは長いこと黙っていた。魂になっても、この人は職人の顔をしている。やがて、ぽつりと言った。「せがれの蕎麦を、食ったことがない」',
        '記録係として補足する。正確には、食べたことは「ある」。息子が中学生の頃、初めて打った不格好な蕎麦を、この人は一口だけ食べて「二度と打つな」と言った。以来五十年、息子の蕎麦を口にしていない。息子が店を継いでからも、厨房には一度も立ち入らなかった。「継がせたくなかった。あんな儲からねえ店」——そう言うときの徳拍の乱れを、機械は「嘘」と記録した。',
        { q: '未練は、病ではない。ただし放置すると、来世の性格になる。' },
        '当院には「現世残留申請」という制度がある。未練の清算が困難な場合に限り、一晩だけ、現世に立ち会いを認めるものだ。ただし枠は一晩にひとつ。使えば、転生の順番は最後尾に回る。春日野さんは今、申請用紙を睨んでいる。裏の注意書きまで、三度読んだ。',
      ],
      choices: [
        { num: '①', pre: '現世残留申請を通す——今夜、息子の店の暖簾をくぐらせる ', skillText: '審査判定', check: { name: '審査', mod: 2, dc: 15 }, success: 'j2a', fail: 'j2b' },
        { num: '②', pre: '息子の側の「未練」を照会する（生者データベース・権限外アクセス） ', skillText: '', check: { name: '権限外アクセス', mod: -1, dc: 13 }, success: 'j2c_ok', fail: 'j2c_risk' },
        { num: '③', pre: '未練を畳まず、そのまま転生させる——「来世で蕎麦屋を探す性格」ごと', to: 'Et_carry' },
      ],
    },
    j2a: {
      kicker: '問診記録 ・ 残留許可', title: '一晩だけの現世', pct: 84, fx: { flags: { approved: 1 } },
      text: [
        '申請は通った。三途看が判子を押しながら言う。「転生の順番は最後尾です。それでも、行かれますか」春日野さんは迷わず頷いた。',
        '魂のまま、店の裏口に立つ。暖簾の向こうから、蕎麦を打つ音がする。五十年前と同じ、少し不格好なリズムだった。',
      ],
      choices: [{ pre: '暖簾をくぐる', to: 'j2a2' }],
    },
    j2a2: {
      kicker: '問診記録 ・ 現世残留中', title: '厨房の音', pct: 87, fx: { flags: { visitedSon: 1 } },
      text: [
        '厨房に立ち入ると、五十年ぶりの蕎麦の匂いがした。息子は、父が来ていることに気づかない。ただ、いつもより丁寧に生地を延している。壁には、あの日の不格好な蕎麦を打つ写真が、色褪せて貼られていた。',
        '「二度と打つな」と言った日から、息子は毎日、あの一言を握りしめて腕を磨いていたのだと、今、はっきりと分かった。',
      ],
      choices: [{ pre: '転生ゲートへ戻る', to: 'j3' }],
    },
    j2b: {
      kicker: '問診記録 ・ 残留却下', title: '通らなかった申請', pct: 83, fx: { tokuhaku: -8 },
      text: [
        '申請は却下された。書類上の理由は「順番待ちの過密」。三途看は申し訳なさそうに言う。「別の方法を、一緒に探しましょう」（徳拍 −8）',
        '魂電図が、少し乱れた。',
      ],
      choices: [{ pre: '転生ゲートへ向かう', to: 'j3' }],
    },
    j2c_ok: {
      kicker: '問診記録 ・ 生者データベース', title: '息子の未練', pct: 84, fx: { flags: { knowSonRegret: 1 } },
      text: [
        '権限外アクセスは、幸い見咎められなかった。息子のカルテ（生存中）の「未練予測」欄には、こうあった——「父に、一度でいいから店の蕎麦を食べてほしい。今さら言えないが」',
        '五十年間、二人はまったく同じ後悔を、それぞれ抱えていたのだ。',
      ],
      choices: [{ pre: '転生ゲートへ向かう', to: 'j3' }],
    },
    j2c_risk: {
      kicker: '問診記録 ・ 生者データベース', title: '見咎められる', pct: 83, fx: { gou: 8 },
      text: [
        '権限外アクセスの途中で、監査ログに引っかかった。業値に軽い加算がつく。（業値 +8）',
        '断片的にしか読めなかったが、何か大事なことが息子のカルテにも書いてある気配だけは感じた。確信は持てないまま、画面を閉じる。',
      ],
      choices: [{ pre: '転生ゲートへ向かう', to: 'j3' }],
    },
    j3: {
      kicker: '問診記録 ・ 転生ゲート前', title: '最後の判断', pct: 94,
      text: [
        '転生ゲートの列が、少しずつ短くなっていく。春日野さんの番が近づいていた。医療チームとして、最後にどう関わるか。',
      ],
      choices: [
        { pre: '「一緒に、暖簾をくぐろう」と誘う', to: 'Et_together', if: function (st) { return st.flags.visitedSon; } },
        { pre: '息子も同じ未練を抱えていたと、伝える', to: 'Et_mirror', if: function (st) { return st.flags.knowSonRegret; } },
        { pre: '「褒めそびれ」をそのまま抱えて送り出す', to: 'Et_asis' },
        { pre: '規定通り、記憶清算を進める ', skillText: '業務規定', check: { name: '業務規定', mod: 0, dc: 14 }, success: 'Et_forced_ok', fail: 'Et_forced_bad' },
      ],
    },
    Et_together: {
      kicker: '問診記録 ・ 結', title: '一緒に暖簾を', pct: 100, end: true, fx: { tokuhaku: 20, seisan: 30 },
      text: [
        '「一緒に、くぐろう」その一言に、春日野さんは初めて涙を見せた。もう一度、店に戻る。今度は隠れず、息子の前に立った。息子には見えないはずなのに、なぜか一瞬、顔を上げてこちらを見た。',
        '「うまい蕎麦だ」——五十年越しの一言を、ようやく口にできた。魂電図が、静かに凪いでいく。（徳拍 ＋20 ・ 記憶清算率 ＋30）',
      ],
      choices: [],
    },
    Et_mirror: {
      kicker: '問診記録 ・ 結', title: '同じ後悔', pct: 100, end: true, fx: { tokuhaku: 14, seisan: 22 },
      text: [
        '「息子さんも、同じことを思っていたそうです」伝えると、春日野さんは長いこと黙り、それから小さく笑った。「……そうか。似たもの親子だな」',
        '転生ゲートをくぐる直前、彼が残した一言は「ありがとう」だった。歴代最多の言葉に、また一つ数字が加わる。（徳拍 ＋14 ・ 記憶清算率 ＋22）',
      ],
      choices: [],
    },
    Et_asis: {
      kicker: '問診記録 ・ 結', title: '抱えたまま', pct: 100, end: true,
      text: [
        '未練は畳まず、そのまま転生させた。来世の性格に、小さな「頑固さ」として残るだろう。それが良いことなのか、まだ誰にも分からない。',
        '八周目の春日野さんが、また蕎麦屋を探し始める。',
      ],
      choices: [],
    },
    Et_forced_ok: {
      kicker: '問診記録 ・ 結', title: '規定通りの清算', pct: 100, end: true, fx: { seisan: 40, tokuhaku: -5 },
      text: [
        '本人の意志に反する形だったが、三途看の丁寧な手技により、大きな痛みもなく未練は畳まれた。「規定は、時に優しさの代わりになります」（記憶清算率 ＋40 ・ 徳拍 −5）',
        '春日野さんは少しだけ寂しそうに、それでも静かにゲートへ向かった。',
      ],
      choices: [],
    },
    Et_forced_bad: {
      kicker: '問診記録 ・ 結', title: '手技の失敗', pct: 100, end: true, fx: { tokuhaku: -15, gou: 10 },
      text: [
        '強引な清算は、魂電図を大きく乱れさせた。「畳み方を誤ると、来世で開きます」——院内掲示の警告が、現実になった。（徳拍 −15 ・ 業値 +10）',
        '八周目の春日野さんの来世には、原因不明の胸の痛みが刻まれることになるだろう。',
      ],
      choices: [],
    },
    Et_carry: {
      kicker: '問診記録 ・ 結', title: '性格ごと、次の生へ', pct: 100, end: true,
      text: [
        '未練を清算せず、そのまま送り出す選択をした。三途看は淡々と手続きを進める。「これも、当院ではよくある選択です」',
        '八周目の春日野さんは、また蕎麦屋になるだろう。今度こそ、誰かの蕎麦を褒められる人生になるかは——分からない。',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '問診記録 ・ 結', title: '魂電図フラット', pct: 100, end: true, fx: { tokuhakuSet: 1 },
      text: [
        '徳拍が限界まで下がり、魂電図がフラットに近づいた。三途看が慌てて処置にあたる。「稀にあります。魂も、疲れるんです」',
        '診察は、一旦中断された。（徳拍 1 で持ち直す）',
      ],
      choices: [],
    },
    E_erased: {
      kicker: '問診記録 ・ 結', title: '記憶、完全清算', pct: 100, end: true, fx: { seisanSet: 96 },
      text: [
        '記憶清算率が100%に達し、規定により自動的に手続きが完了した。春日野さんの表情から、迷いも後悔も、静かに消えていく。',
        '「せがれの蕎麦」という記憶さえ、もう残っていない。それが救いなのか喪失なのか、記録係の三途看にも判断がつかなかった。（記憶清算率 96% で確定）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '問診記録を最初からやり直す', restart: true },
    { pre: '受付の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 0, diceDc: 15,
      lastRoll: { kind: 'check', die: 14, mod: 3, total: 17, dc: 15, outcome: 'success', skillName: '縁の濃度補正' },
      rollLog: [
        { left: '春日野様 ・ 未練の良性/悪性 鑑別', right: '17 ／ A 良性', color: '#2f8a5c' },
        { left: '凪様 ・ 死因の開示同意 取得', right: '11 ／ B 保留', color: '#a5851f' },
        { left: '玉のれん様 ・ 付喪神格の測定', right: '3 ／ D 測定器が敬礼して停止', color: '#c65448' },
      ],
      toku: 142, gou: 61, miren: 388, seisan: 12,
      tokuhaku: 62, shuchu: 84,
      regretVals: { r1: 302, r2: 60, r3: 26 },
      items: { sceneryStatus: 'pending' },
      flags: {},
      storyNode: 'j1', storyNote: null, storyNoteColor: '#7e948f',
      gmScene: 0, konzatsu: 66, gmTable: null,
    };
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.tokuhaku) patch.tokuhaku = eng().clamp(get('tokuhaku') + fx.tokuhaku, 0, TOKUHAKU_MAX);
    if (fx.tokuhakuSet != null) patch.tokuhaku = fx.tokuhakuSet;
    if (fx.gou) patch.gou = Math.max(0, get('gou') + fx.gou);
    if (fx.seisan) patch.seisan = eng().clamp(get('seisan') + fx.seisan, 0, 100);
    if (fx.seisanSet != null) patch.seisan = fx.seisanSet;
    if (fx.miren) patch.miren = Math.max(0, get('miren') + fx.miren);
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1j',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'toku', 'gou', 'miren', 'seisan', 'tokuhaku', 'shuchu', 'regretVals',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'konzatsu', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'j1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.regretVals = Object.assign({}, init.regretVals, st.regretVals || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 受付 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 検査結果報告書 ──
      var gToku = gradeToku(st.toku), gGou = gradeGou(st.gou), gMiren = gradeMiren(st.miren), gSeisan = gradeSeisan(st.seisan);
      out.toku = st.toku; out.tokuGrade = gToku.grade; out.tokuGradeBg = gToku.bg; out.tokuGradeColor = gToku.color;
      out.gou = st.gou; out.gouGrade = gGou.grade; out.gouGradeBg = gGou.bg; out.gouGradeColor = gGou.color;
      out.miren = st.miren; out.mirenGrade = gMiren.grade; out.mirenGradeBg = gMiren.bg; out.mirenGradeColor = gMiren.color;
      out.seisan = st.seisan; out.seisanGrade = gSeisan.grade; out.seisanGradeBg = gSeisan.bg; out.seisanGradeColor = gSeisan.color;
      out.tokuUp = function () { app.setState({ toku: E.clamp(st.toku + 5, 0, 300) }); };
      out.tokuDown = function () { app.setState({ toku: E.clamp(st.toku - 5, 0, 300) }); };
      out.gouUp = function () { app.setState({ gou: E.clamp(st.gou + 5, 0, 200) }); };
      out.gouDown = function () { app.setState({ gou: E.clamp(st.gou - 5, 0, 200) }); };
      out.mirenUp = function () { app.setState({ miren: E.clamp(st.miren + 10, 0, 500) }); };
      out.mirenDown = function () { app.setState({ miren: E.clamp(st.miren - 10, 0, 500) }); };
      out.seisanUp = function () { app.setState({ seisan: E.clamp(st.seisan + 5, 0, 100) }); };
      out.seisanDown = function () { app.setState({ seisan: E.clamp(st.seisan - 5, 0, 100) }); };

      // ── 精密検査 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ 精密検査判定 ・ 基準 ' + st.diceDc + ' ・ 検体：未練（採取済）' : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ検体を分析していない'; out.diceVerdict = ''; out.gradeColor = '#7e948f'; out.gradeBg = '#fff';
      } else if (lr.kind === 'check') {
        var ci = checkupGrade(lr);
        out.diceFace = lr.die;
        out.stampWord = ci.grade;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = ci.verdict;
        out.gradeColor = ci.color;
        out.gradeBg = ci.bg;
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.gradeColor = '#7e948f';
        out.gradeBg = '#fff';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #3a9e8c' : '1px solid rgba(58,158,140,.3)',
          color: sel ? '#3a9e8c' : '#7e948f',
          bg: sel ? 'rgba(58,158,140,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #3a9e8c' : '1px solid rgba(58,158,140,.3)',
          color: sel ? '#3a9e8c' : '#7e948f',
          bg: sel ? 'rgba(58,158,140,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var ci = checkupGrade(r);
          pushLog(st, '春日野様 ・ ' + skill.name, r.total + ' ／ ' + ci.grade + ' 判定', ci.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, '春日野様 ・ d' + st.diceSides, v + ' ／ 出目', '#7e948f');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 処置室 ──
      out.tokuhaku = st.tokuhaku;
      out.tokuhakuUp = function () { app.setState({ tokuhaku: E.clamp(st.tokuhaku + 5, 0, TOKUHAKU_MAX) }); };
      out.tokuhakuDown = function () { app.setState({ tokuhaku: E.clamp(st.tokuhaku - 5, 0, TOKUHAKU_MAX) }); };
      out.checkVital = function () { app.setState({ shuchu: E.clamp(st.shuchu + 3, 0, 100) }); };
      out.shuchu = st.shuchu;
      out.nextOp = function () {
        var vals = Object.assign({}, st.regretVals);
        REGRET_DEFS.forEach(function (d) {
          var step = Math.max(1, Math.round(d.max * 0.15));
          vals[d.key] = E.clamp(vals[d.key] - Math.round(step / 2), 0, d.max);
        });
        app.setState({ regretVals: vals, shuchu: E.clamp(st.shuchu - 2, 0, 100) });
      };
      out.regrets = REGRET_DEFS.map(function (d) {
        var v = st.regretVals[d.key];
        var done = v <= 0;
        var step = Math.max(1, Math.round(d.max * 0.15));
        function adj(delta) {
          return function () {
            var vals = Object.assign({}, st.regretVals);
            vals[d.key] = E.clamp(v + delta, 0, d.max);
            app.setState({ regretVals: vals });
          };
        }
        return {
          num: d.num, title: d.title, tag: done ? '清算済み' : d.tag, tagColor: done ? '#2f8a5c' : d.tagColor,
          note: d.note, noteBg: d.noteBg, noteColor: d.noteColor,
          border: d.border, bg: d.bg, op: done ? '.6' : '1',
          numBg: d.numBg, numColor: d.numColor, barColor: d.barColor,
          value: v, pct: Math.round((v / d.max) * 100),
          dmg: adj(-step), heal: adj(step),
        };
      });

      // ── お預かり窓口 ──
      out.sceneryPending = st.items.sceneryStatus === 'pending';
      out.sceneryStatus = st.items.sceneryStatus === 'pending' ? '審査中' : '許可';
      out.sceneryColor = st.items.sceneryStatus === 'pending' ? '#a5851f' : '#2f8a5c';
      out.approveScenery = function () {
        var items = Object.assign({}, st.items);
        items.sceneryStatus = 'approved';
        app.setState({ items: items, flags: Object.assign({}, st.flags, { sceneryApproved: 1 }) });
      };

      // ── 問診記録 ──
      var node = NODES[st.storyNode] || NODES.j1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#7e948f';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '問診記録 ・ 結審'
        : '問診進捗 ' + node.pct + '% ・ 午前の部 終了まで ' + Math.max(0, 60 - Math.round(node.pct / 2)) + '分';
      out.storyCanRestart = st.storyNode !== 'j1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#7e948f' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#2f8a5c' : '#c65448';
            pushLog(st, '春日野様 ・ ' + c.check.name + '（問診記録）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#2f8a5c' : '#c65448');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var tokuhakuNow = 'tokuhaku' in patch ? patch.tokuhaku : st.tokuhaku;
          var seisanNow = 'seisan' in patch ? patch.seisan : st.seisan;
          if (tokuhakuNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (seisanNow >= 100 && !nextNode.end) {
            target = 'E_erased';
            applyFx(st, NODES.E_erased.fx, patch);
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

      // ── 医局 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #3a9e8c' : '1px solid rgba(58,158,140,.3)',
          bg: active ? 'rgba(58,158,140,.04)' : '#fff',
          color: active ? '#28343a' : '#7e948f',
          weight: active ? '700' : '400',
        };
      });
      out.konzatsu = st.konzatsu;
      out.konzatsuMinus = function () { app.setState({ konzatsu: E.clamp(st.konzatsu - 5, 0, 100) }); };
      out.konzatsuPlus = function () { app.setState({ konzatsu: E.clamp(st.konzatsu + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '医局 ・ 院内ハプニング表', d + ' ／ ' + text, '#3a9e8c');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
