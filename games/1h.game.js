/*
 * 1h-宛先不明郵便局 のゲーム内容。
 * - 消印判定: d4〜d100。d20 判定は消印を3段階（配達可／保留／返送）で判定する
 * - 局員手帳: 体力 / 想い容量 / 現世との縁(0-100、0で「帰ってこない」) の増減
 * - 配達行路: 迷い霧（晴れるまでのカウントダウン）・未練の犬（なつき度、100で局の犬に）・
 *   時空の踏切（次の「明日」までのカウントダウン、0で昨日⇄明日が切り替わる）・夜明けまでの時計
 * - 郵袋: 「犬用ビスケット」だけ「あげる」操作ができ、配達行路のなつき度に反映される
 * - 配達記録: 分岐シナリオ「渡し場、最終便」（現世との縁ルール・複数エンディング）。
 *   GM 秘匿（XX-0000-00の差出人＝帰り道を忘れた先代の配達員）を発見する真ルートあり
 * - 局長室: 配達切替・局全体の「未達」圧・夜のハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 18, OMOI_MAX = 10;

  var SKILLS = [
    { name: '宛先を推理する（透かし読み）', mod: 5 },
    { name: '雨に濡らさない', mod: 6 },
    { name: '死者と世間話', mod: 4 },
    { name: '断る（配達不能の宣告）', mod: -3 },
    { name: '道探し', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  // 消印: 3段階（配達可／保留／返送）。出目20は灯籠が導く特別演出、出目1は誤配
  function stampInfo(r) {
    if (r.die === 20) return { word: '配達可', color: '#2f7a4f', bg: 'rgba(47,122,79,.03)', verdict: '＝ ' + r.total + ' ・ 配達経路 発見。灯籠が最短の道を教えてくれた' };
    if (r.outcome === 'fumble') return { word: '返送', color: '#c9382e', bg: 'rgba(201,56,46,.03)', verdict: '＝ ' + r.total + ' ・ 誤配（住所が消えた・返送）' };
    if (r.total >= r.dc) return { word: '配達可', color: '#2f7a4f', bg: 'rgba(47,122,79,.03)', verdict: '＝ ' + r.total + ' ・ 配達経路 発見' };
    if (r.total >= r.dc - 3) return { word: '保留', color: '#b58a1f', bg: 'rgba(181,138,31,.04)', verdict: '＝ ' + r.total + ' ・ 保留（もう一晩預かる）' };
    return { word: '返送', color: '#c9382e', bg: 'rgba(201,56,46,.03)', verdict: '＝ ' + r.total + ' ・ 返送（涙の跡つき）' };
  }

  var GM_TABLE = ['にわか雨（油紙の出番）', 'にわか雨（油紙の出番）', '追跡番号が二通で入れ替わる', '受取人がすでに引っ越し（転居先：黄泉）', '未練の犬が増える', '局長の点呼（全員、声だけで返事）'];
  var GM_SCENES = ['YM-0470-77 黄泉行き', 'FT-2056-04 未来行き（踏切待ち）', 'PW-0002-13 平行町行き（未着手）'];

  // ─────────────────────────────────────────────
  // シナリオ「渡し場、最終便」（配達記録 第七夜 YM-0470-77）
  // fx: tai / omoi / enk / flags / taiSet / enkSet
  // ─────────────────────────────────────────────
  var NODES = {
    h1: {
      kicker: '配達記録 ・ 第七夜 ・ 追跡番号 YM-0470-77', title: '渡し場、最終便', pct: 64,
      text: [
        '渡し場の桟橋は、夜霧の中で灯籠だけが順番に灯っていた。船頭が手を出す。「手形と、それから——重いのを持ってるね」。ツグミは頷いて、クレヨンの宛名の手紙を胸ポケットから出した。3.2kg。持っているだけで、肩ではなく胸が重くなる種類の重さだ。',
        '「黄泉の住所は生前の思い出でできてる」と船頭は言った。「おばあちゃんの家、知ってるかい。縁側の匂いとか、時計の音とか」。ツグミは手紙の重さの中から、それを探す。夕方の味噌汁。テレビの相撲。仏壇の鈴の音——あった。道が、灯った。',
        { q: '配達員は手紙を読んではならない。だが手紙の重さを預かることは、読むことより深く読むことだ。' },
        '船が岸を離れる。振り返ると、桟橋に犬が一匹、座ってこちらを見ていた。ついて来ない。渡し場から先は、未練は入れないのだ。犬は一度だけ吠えて——それは「追伸」の続きのような、短い声だった。',
      ],
      choices: [
        { num: '①', pre: 'このまま黄泉へ渡る（現世との縁 −5）', to: 'h2a' },
        { num: '②', pre: '犬の「追伸」を聞き取ってから渡る ', skillText: '読心判定', check: { name: '読心', mod: 1, dc: 14 }, success: 'h2b', fail: 'h2b2' },
        { num: '③', pre: '船頭に「例の変わる宛名の手紙」を見せてみる（何かが起きる）', to: 'h2c' },
      ],
    },
    h2a: {
      kicker: '配達記録 ・ 渡し場', title: '縁を削って渡る', pct: 68, fx: { enk: -5 },
      text: [
        '深く考えず、船に乗り込んだ。現世との縁が、するりと軽くなる感覚がある。（現世との縁 −5）',
        '船頭は何も言わず、櫂を漕ぎ始めた。',
      ],
      choices: [{ pre: '対岸へ渡る', to: 'h3' }],
    },
    h2b: {
      kicker: '配達記録 ・ 渡し場', title: '追伸の意味', pct: 70, fx: { flags: { heardPostscript: 1 } },
      text: [
        '犬の吠え声に耳を澄ませると、言葉のようなものが滲んで聞こえた。「ま、た、ね」——飼い主が書き忘れた、たった三文字の追伸。',
        '犬はそれを言うためだけに、ずっとここで待っていたのかもしれない。',
      ],
      choices: [{ pre: '対岸へ渡る', to: 'h3' }],
    },
    h2b2: {
      kicker: '配達記録 ・ 渡し場', title: 'ただの鳴き声', pct: 68, fx: { enk: -1 },
      text: [
        '耳を澄ませても、犬の声はただの鳴き声にしか聞こえなかった。意味を汲み取ろうとするほど、こちらの輪郭が少し薄れる気がする。（現世との縁 −1）',
      ],
      choices: [{ pre: '対岸へ渡る', to: 'h3' }],
    },
    h2c: {
      kicker: '配達記録 ・ 渡し場', title: '船頭の顔色', pct: 69, fx: { flags: { boatmanReacts: 1 } },
      text: [
        '郵袋の底から、XX-0000-00の手紙を出して見せた。船頭の顔から、初めて営業用の無表情が消えた。「……これを、まだ運んでいるのか」',
        '「その手紙の差出人を、儂は知っておる。もう何十年も、配達の途中のままの——」船頭はそこで言葉を切り、代わりに深く息を吐いた。',
      ],
      choices: [{ pre: '続きを聞く', to: 'h2c2' }],
    },
    h2c2: {
      kicker: '配達記録 ・ 渡し場', title: '先代の話', pct: 71, fx: { flags: { knowPredecessor: 1 } },
      text: [
        '「先代の配達員だ。誰よりも道に詳しかったのに、ある夜、自分の帰り道だけを忘れてしもうた。それ以来、あの手紙は誰の手にも渡らず、読む者ごとに違う顔を見せる」',
        '「もし届けられるものなら——儂からも、頼む」船頭は深く頭を下げた。',
      ],
      choices: [{ pre: '対岸へ渡る', to: 'h3' }],
    },
    h3: {
      kicker: '配達記録 ・ 黄泉の街', title: '対岸、黄泉の街', pct: 78,
      text: [
        '対岸は、生前どこかで見たような、けれどどこでもない街並みだった。提灯の灯る路地。夕餉の匂いだけがして、人影はまばら。',
        'おばあちゃんの家を探さねばならない。',
      ],
      choices: [
        { pre: '聞き取った「追伸」を手がかりに探す', to: 'h4c', if: function (st) { return st.flags.heardPostscript || st.flags.knowPredecessor; } },
        { pre: '手紙の重さの記憶を頼りに、', skillText: '道探し', post: 'で進む', check: { name: '道探し', mod: 3, dc: 14 }, success: 'h4a', fail: 'h4b' },
        { pre: '誰にも聞かず、想いの重さだけを頼りに進む', to: 'h4d' },
      ],
    },
    h4a: {
      kicker: '配達記録 ・ 黄泉の街', title: '見つけた縁側', pct: 82,
      text: [
        '味噌汁の匂いと、時計の音。記憶の通りの縁側が、路地の奥にあった。案外あっさりと、目的の家にたどり着く。',
      ],
      choices: [{ pre: '玄関先へ回る', to: 'h5' }],
    },
    h4b: {
      kicker: '配達記録 ・ 黄泉の街', title: '迷い道', pct: 80, fx: { enk: -2 },
      text: [
        '似たような路地が何度も現れ、方向感覚が薄れていく。（現世との縁 −2）',
        'それでも味噌汁の匂いを頼りに、なんとか一軒の家にたどり着いた。',
      ],
      choices: [{ pre: '玄関先へ回る', to: 'h5' }],
    },
    h4c: {
      kicker: '配達記録 ・ 黄泉の街', title: '導かれる道', pct: 84,
      text: [
        '聞き取った言葉を胸に歩くと、道は迷うことなくまっすぐに開けた。まるで誰かが先回りして、灯りを点けてくれているようだった。',
      ],
      choices: [{ pre: '玄関先へ回る', to: 'h5' }],
    },
    h4d: {
      kicker: '配達記録 ・ 黄泉の街', title: '住所より人を見る', pct: 81, fx: { flags: { forgotHome: 1 } },
      text: [
        '特性が発動する。おばあちゃんの顔さえ思い描けば、道は自然と足元に現れた。その代わり——今夜、ツグミは自分の家の場所を忘れる。（明日、局の誰かに聞かねばならない）',
      ],
      choices: [{ pre: '玄関先へ回る', to: 'h5' }],
    },
    h5: {
      kicker: '配達記録 ・ 縁側にて', title: '最後の配達', pct: 92,
      text: [
        '縁側に、灯りをつけたまま座っているおばあちゃんがいた。「誰かしら、こんな夜更けに」その声に、驚きより先に懐かしさがある。',
      ],
      choices: [
        { pre: '手紙を、そのまま静かに渡す', to: 'Et_plain' },
        { pre: '先代配達員のことも、あわせて伝える', to: 'Et_truth', if: function (st) { return st.flags.knowPredecessor; } },
        { pre: '犬の「追伸」の意味を、伝える', to: 'Et_postscript', if: function (st) { return st.flags.heardPostscript; } },
        { pre: '局則違反を承知で、先に自分で中身を確かめる ', skillText: '胆力', check: { name: '胆力', mod: 0, dc: 15 }, success: 'Et_peek_ok', fail: 'Et_peek_bad' },
      ],
    },
    Et_plain: {
      kicker: '配達記録 ・ 結', title: '静かな配達', pct: 100, end: true, fx: { enk: 3 },
      text: [
        'おばあちゃんは手紙を受け取り、クレヨンの宛名をなぞって、長いこと黙っていた。「ありがとうね」それだけ言って、微笑んだ。',
        '配達は、無事完了。局に戻る足取りが、少しだけ軽い。（現世との縁 ＋3）',
      ],
      choices: [],
    },
    Et_truth: {
      kicker: '配達記録 ・ 結', title: '帰り道を、教える', pct: 100, end: true, fx: { enk: 10 },
      text: [
        '手紙を渡したあと、ツグミは先代配達員のことも伝えた。おばあちゃんは驚いた顔をして、それから静かに言った。「その人になら、うちの縁側の匂いを教えてあげて。帰り道は、案外近くにあるものよ」',
        '船頭への言伝を胸に、局への帰路につく。渡し場では、船頭が初めて笑った気がした。（現世との縁 ＋10）',
      ],
      choices: [],
    },
    Et_postscript: {
      kicker: '配達記録 ・ 結', title: '追伸を届ける', pct: 100, end: true, fx: { enk: 6 },
      text: [
        '「また、ね」——犬の追伸を伝えると、おばあちゃんの目に涙が浮かんだ。「あの子ったら、最後まで言えなかったのね」',
        '手紙とは別の想いも、確かに届いた夜だった。（現世との縁 ＋6）',
      ],
      choices: [],
    },
    Et_peek_ok: {
      kicker: '配達記録 ・ 結', title: '局則違反、されど', pct: 100, end: true, fx: { omoi: -2, enk: 2 },
      text: [
        '封を開ける前に、そっと中身の重さだけを確かめた——局則違反だが、渡す前にどうしても知りたかった。中身は、ただの「ありがとう」の三文字。想い容量が軽く軋む。（想い容量 −2）',
        'それでも渡した瞬間の、おばあちゃんの笑顔は本物だった。（現世との縁 ＋2）',
      ],
      choices: [],
    },
    Et_peek_bad: {
      kicker: '配達記録 ・ 結', title: '重すぎた確認', pct: 100, end: true, fx: { omoi: -5, enk: -3 },
      text: [
        '封筒に触れた瞬間、想いが堰を切ったように流れ込んできた。涙が止まらなくなる。（想い容量 −5 ・ 現世との縁 −3）',
        '結局、涙目のまま手紙を渡した。おばあちゃんが逆に心配して、背中をさすってくれた。局則を破った報いは、思ったより優しい形でやってきた。',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '配達記録 ・ 結', title: '対岸で力尽きる', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '体力が尽き、その場に座り込んでしまった。気づけば局のベッドの上。戸川が心配そうに顔を覗き込んでいる。「無理するなよ、夜勤は長いんだから」',
        '配達は、また次の夜に持ち越しとなった。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_lost: {
      kicker: '配達記録 ・ 結', title: '帰ってこない', pct: 100, end: true, fx: { enkSet: 10 },
      text: [
        '現世との縁が、糸のように細くなっていく。局に戻れたのかどうか、ツグミ自身にも分からなくなった。窓口のユキだけが、寂しそうに微笑んでいる。',
        '「大丈夫。ここにも、居場所はあるから」——それは、慰めなのか、宣告なのか。縁は10まで底上げされ、辛うじて現世に踏みとどまった。（現世との縁 10 まで戻り継続）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '配達記録を最初からやり直す', restart: true },
    { pre: '夜間窓口の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 4, diceDc: 15,
      lastRoll: { kind: 'check', die: 15, mod: 3, total: 18, dc: 15, outcome: 'success', skillName: '道探し' },
      rollLog: [
        { left: 'ツグミ ・ 道探し（渡し場）', right: '18 ／ 配達可', color: '#2f7a4f' },
        { left: 'ユキ ・ 読心（宛名の滲み）', right: '13 ／ 保留（もう一晩預かる）', color: '#b58a1f' },
        { left: '戸川 ・ 口才（受取拒否の説得）', right: '4 ／ 返送（涙の跡つき）', color: '#c9382e' },
      ],
      tai: 14, omoi: 7, enk: 61,
      kiriTurns: 3, inuNatsuki: 72, fumikiriTurns: 2, fumikiriIsTomorrow: false,
      dawnMinutes: 252, dawnPenaltyApplied: false,
      items: { biscuitGiven: 0 },
      flags: {},
      storyNode: 'h1', storyNote: null, storyNoteColor: '#8a8272',
      gmScene: 0, mitatsu: 47, gmTable: null,
    };
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  function fmtDawn(min) {
    var h = Math.floor(min / 60), m = min % 60;
    return h + ':' + (m < 10 ? '0' : '') + m;
  }

  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.tai) patch.tai = eng().clamp(get('tai') + fx.tai, 0, TAI_MAX);
    if (fx.taiSet != null) patch.tai = fx.taiSet;
    if (fx.omoi) patch.omoi = eng().clamp(get('omoi') + fx.omoi, 0, OMOI_MAX);
    if (fx.enk) patch.enk = eng().clamp(get('enk') + fx.enk, 0, 100);
    if (fx.enkSet != null) patch.enk = fx.enkSet;
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1h',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'omoi', 'enk', 'kiriTurns', 'inuNatsuki', 'fumikiriTurns', 'fumikiriIsTomorrow',
      'dawnMinutes', 'dawnPenaltyApplied', 'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'mitatsu', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'h1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 夜間窓口 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 局員手帳 ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.omoi = st.omoi;
      out.omoiPct = Math.round((st.omoi / OMOI_MAX) * 100);
      out.enk = st.enk;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.omoiUp = function () { app.setState({ omoi: E.clamp(st.omoi + 1, 0, OMOI_MAX) }); };
      out.omoiDown = function () { app.setState({ omoi: E.clamp(st.omoi - 1, 0, OMOI_MAX) }); };
      out.enkUp = function () { app.setState({ enk: E.clamp(st.enk + 1, 0, 100) }); };
      out.enkDown = function () { app.setState({ enk: E.clamp(st.enk - 1, 0, 100) }); };

      // ── 消印判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ ' + skill.name + '判定 ・ 配達基準 ' + st.diceDc + ' ・ 検印：' + skill.name : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ消印は押していない'; out.diceVerdict = ''; out.stampColor = '#8a8272'; out.stampBg = '#fff';
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
        out.stampColor = '#8a8272';
        out.stampBg = '#fff';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #c9382e' : '1px solid rgba(58,54,48,.25)',
          color: sel ? '#c9382e' : '#8a8272',
          bg: sel ? 'rgba(201,56,46,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #c9382e' : '1px solid rgba(58,54,48,.25)',
          color: sel ? '#c9382e' : '#8a8272',
          bg: sel ? 'rgba(201,56,46,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var si = stampInfo(r);
          pushLog(st, 'ツグミ ・ ' + skill.name, r.total + ' ／ ' + si.word, si.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'ツグミ ・ d' + st.diceSides, v + ' ／ 出目', '#8a8272');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 配達行路 ──
      out.dawnLabel = fmtDawn(st.dawnMinutes);
      out.dawnPct = E.clamp(Math.round((st.dawnMinutes / 252) * 100), 0, 100);
      out.hasDawnWarn = st.dawnMinutes <= 0;
      out.dawnWarnMsg = '——夜明けが来てしまった。帰局が間に合わず「現世との縁」が10減る。';
      out.kiriTurns = st.kiriTurns;
      out.kiriPct = E.clamp(Math.round((st.kiriTurns / 3) * 100), 0, 100);
      out.kiriDesc = st.kiriTurns <= 0 ? '濃度：晴れ' : '濃度：中';
      out.kiriMinus = function () { app.setState({ kiriTurns: Math.max(0, st.kiriTurns - 1) }); };
      out.kiriPlus = function () { app.setState({ kiriTurns: st.kiriTurns + 1 }); };
      out.inuNatsuki = st.inuNatsuki;
      out.inuDesc = st.inuNatsuki >= 100 ? 'しっぽ：正式採用' : 'しっぽ：振っている';
      out.inuMinus = function () { app.setState({ inuNatsuki: E.clamp(st.inuNatsuki - 5, 0, 100) }); };
      out.inuPlus = function () { app.setState({ inuNatsuki: E.clamp(st.inuNatsuki + 5, 0, 100) }); };
      out.fumikiriTurns = st.fumikiriTurns;
      out.fumikiriPct = E.clamp(Math.round((st.fumikiriTurns / 2) * 100), 0, 100);
      out.fumikiriState = st.fumikiriIsTomorrow ? '警報：「明日」通過中' : '警報：鳴動中';
      out.tickerAnim = 'animation:ticker 1.2s ease-in-out infinite;';
      out.advance = function () {
        var patch = {
          dawnMinutes: Math.max(0, st.dawnMinutes - 12),
          kiriTurns: Math.max(0, st.kiriTurns - 1),
        };
        var fumi = st.fumikiriTurns - 1;
        if (fumi <= 0) {
          patch.fumikiriIsTomorrow = !st.fumikiriIsTomorrow;
          patch.fumikiriTurns = 2;
        } else {
          patch.fumikiriTurns = fumi;
        }
        if (st.dawnMinutes > 0 && patch.dawnMinutes <= 0 && !st.dawnPenaltyApplied) {
          patch.enk = E.clamp(st.enk - 10, 0, 100);
          patch.dawnPenaltyApplied = true;
        }
        app.setState(patch);
      };
      out.restBreak = function () {
        app.setState({ tai: E.clamp(st.tai + 2, 0, TAI_MAX), dawnMinutes: Math.max(0, st.dawnMinutes - 12) });
      };

      // ── 郵袋 ──
      out.biscuitLabel = st.items.biscuitGiven ? '（あげた回数 ' + st.items.biscuitGiven + '）' : '';
      out.biscuitAvailable = st.inuNatsuki < 100;
      out.giveBiscuit = function () {
        var items = Object.assign({}, st.items);
        items.biscuitGiven = (items.biscuitGiven || 0) + 1;
        app.setState({ items: items, inuNatsuki: E.clamp(st.inuNatsuki + 15, 0, 100) });
      };

      // ── 配達記録 ──
      var node = NODES[st.storyNode] || NODES.h1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#8a8272';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '配達完了 ・ 結審'
        : '配達進捗 ' + node.pct + '% ・ 夜明けまで ' + fmtDawn(st.dawnMinutes);
      out.storyCanRestart = st.storyNode !== 'h1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#8a8272' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#2f7a4f' : '#c9382e';
            pushLog(st, 'ツグミ ・ ' + c.check.name + '（配達記録）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#2f7a4f' : '#c9382e');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var enkNow = 'enk' in patch ? patch.enk : st.enk;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (enkNow <= 0 && !nextNode.end) {
            target = 'E_lost';
            applyFx(st, NODES.E_lost.fx, patch);
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

      // ── 局長室 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #c9382e' : '1px solid rgba(58,54,48,.25)',
          bg: active ? 'rgba(201,56,46,.03)' : '#fdfaf2',
          color: active ? '#3a3630' : '#8a8272',
          weight: active ? '700' : '400',
        };
      });
      out.mitatsu = st.mitatsu;
      out.mitatsuMinus = function () { app.setState({ mitatsu: E.clamp(st.mitatsu - 5, 0, 100) }); };
      out.mitatsuPlus = function () { app.setState({ mitatsu: E.clamp(st.mitatsu + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '局長 ・ 夜のハプニング表', d + ' ／ ' + text, '#c9382e');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
