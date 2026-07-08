/*
 * 1k-魔法少女コールセンター のゲーム内容。
 * - 応対判定: d4〜d100。d20 判定はCSAT（大変満足〜切電）で結果を示す。出目1は特殊な「切電」
 * - オペレーター名鑑: 声量（体力） / 共感ゲージ / 魔力残量 の増減
 * - 入電の嵐: 4本の回線を並行して「進める／戻す」トラッカー。共有の街のパニック度も表示
 * - ナレッジ: 「私物のマグカップ」だけ話しかけられ、応じると隠しダイアログが読める
 * - 通話ログ: 分岐シナリオ「必殺技の名前が、決められない」（声量・共感ゲージルール・複数エンディング）。
 *   GM 秘匿（敵幹部の正体＝初代魔法少女）とすず自身の過去（技名「また明日」）を回収する真ルートあり
 * - SV席: 幕切替・世界の平和度・入電ハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var SEIRYO_MAX = 15, KYOKAN_MAX = 10;

  var SKILLS = [
    { name: '怒りの初期消火（最初の15秒）', mod: 6 },
    { name: '魔法用語の平易な言い換え', mod: 5 },
    { name: '保留にしない勇気', mod: 4 },
    { name: '自分の過去を話す', mod: -3 },
    { name: '傾聴', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  // CSAT: 出目1は「切電」。それ以外は総合値に応じて満足度が変化
  function csatInfo(r) {
    if (r.die === 1) return { word: '切電', color: '#c65448', bg: 'rgba(198,84,72,.14)', verdict: '＝ ' + r.total + ' ・ ガチャ切りされた。世界の平和度が0.3%下がる' };
    if (r.total >= r.dc + 6) return { word: '大変満足', color: '#2f8a5c', bg: 'rgba(47,138,92,.12)', verdict: '＝ ' + r.total + ' ・ 相手の心が、電話越しでも動いた' };
    if (r.total >= r.dc) return { word: '満足', color: '#2f8a5c', bg: 'rgba(47,138,92,.12)', verdict: '＝ ' + r.total + ' ・ 無事に着地。良い応対だった' };
    if (r.total >= r.dc - 4) return { word: '「もう少し考える」', color: '#a5851f', bg: 'rgba(201,168,46,.14)', verdict: '＝ ' + r.total + ' ・ 結論は持ち越し。次のコールへ' };
    return { word: '不満', color: '#c65448', bg: 'rgba(198,84,72,.14)', verdict: '＝ ' + r.total + ' ・ 手応えのないまま通話終了' };
  }

  var LINE_DEFS = [
    { key: 'novaLine', num: 1, title: 'すず ⇄ プリズム・ノヴァ（現地から入電）', gauge: '共感ゲージ', max: 10, unit: '', tag: '通話中 04:22', tagColor: '#e0447c', note: '「弱点がわからない、調べて」', noteBg: 'rgba(122,90,158,.1)', noteColor: '#7a5a9e', titleColor: '#2d2438', border: '2px solid #e0447c', bg: 'rgba(224,68,124,.04)', numBg: '#e0447c', numColor: '#fff', barColor: '#7a5a9e' },
    { key: 'kiteiLine', num: 2, title: '戸山 ⇄ 規程課の当直（弱点データベース照会）', gauge: '照会進捗', max: 100, unit: '%', tag: '', tagColor: '#93829b', note: '「シメキリの獣」＝該当3件、絞り込み中', noteBg: 'rgba(201,168,46,.12)', noteColor: '#a5851f', titleColor: '#2d2438', border: '1px solid rgba(224,68,124,.25)', bg: '#fff', numBg: 'rgba(224,68,124,.1)', numColor: '#e0447c', barColor: '#e0447c' },
    { key: 'hinanLine', num: 3, title: '新人・小巻 ⇄ 避難誘導の実況（拡声モード）', gauge: '避難完了', max: 100, unit: '%', tag: '', tagColor: '#93829b', note: '声が意外と通る。天職かもしれない', noteBg: 'rgba(47,138,92,.1)', noteColor: '#2f8a5c', titleColor: '#2d2438', border: '1px solid rgba(224,68,124,.25)', bg: '#fff', numBg: 'rgba(224,68,124,.1)', numColor: '#e0447c', barColor: '#2f8a5c' },
    { key: 'tekiLine', num: 0, title: '#4474 敵幹部（まだ保留中）', gauge: '敵意', max: 100, unit: '/100', tag: '保留 22:40', tagColor: '#93829b', note: '保留音を3周聴いた敵幹部の敵意が、なぜか2%ずつ下がっている。すずの作曲した保留音である。', noteBg: 'transparent', noteColor: '#93829b', titleColor: '#c65448', border: '1px dashed rgba(198,84,72,.5)', bg: 'rgba(198,84,72,.02)', numBg: '#c65448', numColor: '#fff', barColor: '#c65448', isEnemy: true },
  ];

  var GM_TABLE = ['間違い電話（ピザの注文）', '間違い電話（ピザの注文）', 'マスコミからの取材申込', '妖精語の入電（翻訳機必須）', '全回線に同時入電（怪人の仕業）', '未来の自分から着信'];
  var GM_SCENES = ['第2幕：入電の嵐', '第3幕：ノヴァの最後の技（命名の夜）', 'エピローグ：保留中の敵幹部が電話を切る前に'];

  var MUG_TEXT = '現役時代の相棒（妖精）が、今は普通のマグカップのふりをして住んでいる。すずはまだ気づいていないふりをしている。';
  var MUG_TEXT_TALK = '小声で「まだ、そこにいるの」と話しかけると、マグカップの水面がほんの少し揺れた。返事はない。それでも、いなくなってはいなかった。';

  // ─────────────────────────────────────────────
  // シナリオ「必殺技の名前が、決められない」（通話ログ #4472）
  // fx: seiryo / kyokan / maryoku / flags / seiryoSet / kyokanSet
  // ─────────────────────────────────────────────
  var NODES = {
    k1: {
      kicker: '通話記録 ・ #4472 ・ 22:47–23:15 ・ 担当:OP-0093', title: '必殺技の名前が、決められない', pct: 72,
      text: [
        '「三年目になるんです」と、電話の向こうの声は言った。プリズム・ノヴァ。駅前を守って三年、市民満足度92%のベテランだ。「新しい技ができたのに、名前が決められなくて。名前を叫ばないと、技が出ないんです。うちの魔法、そういう仕様で」',
        'すずはメモ帳に候補を書き出していく。輝きなんとか。なんとかレイ。途中で気づく。この子が決められないのは、語彙の問題じゃない。「その技、誰かを守る技？　それとも——終わらせる技？」電話の向こうで、息を呑む音がした。長い沈黙。コールセンターの規程では、沈黙は7秒で声をかけることになっている。すずは、規程を破って待った。',
        { q: '技の名前は、その子が魔法に付ける「約束」だ。だから代わりに考えてはいけない。一緒に考えることしか、できない。' },
        '「……最後の技、なんです」と声は言った。「これを使ったら、私、魔力を使い切って引退なんです。だから、ちゃんとした名前じゃないと嫌で」。すずの手が止まる。マグカップが、デスクの上で小さく震えた。三年前、自分が最後の技の名前を決めた夜のことを、すずはまだ誰にも話していない。',
      ],
      choices: [
        { num: '①', pre: '自分の「最後の技」の名前と、その夜の話をする ', skillText: '自分の過去を話す', post: ' ・ −3補正', check: { name: '自分の過去を話す', mod: -3, dc: 12 }, success: 'k2a', fail: 'k2b' },
        { num: '②', pre: '「引退しない技」の可能性を、規程課と一緒に探す（前例なし）', to: 'k2c' },
        { num: '③', pre: '黙って聴き続ける——名前は、この子の中にもうある気がする ', skillText: '傾聴判定', check: { name: '傾聴', mod: 3, dc: 12 }, success: 'k2d', fail: 'k2e' },
      ],
    },
    k2a: {
      kicker: '通話記録 ・ #4472', title: '「また明日」の夜', pct: 76, fx: { flags: { sharedPast: 1 }, kyokan: 2 },
      text: [
        '「私の最後の技は……『また明日』、でした」初めて誰かに話す。声が震えた。「あの日、街を守って、力を全部使って、それでも『また明日』って叫んだんです。次がないのに」',
        'ノヴァが小さく息を呑んだ。「それ、すごく……すずさんらしいです」誰かに、初めて名前で呼ばれた気がした。（共感ゲージ ＋2）',
      ],
      choices: [{ pre: '続きを聴く', to: 'k3' }],
    },
    k2b: {
      kicker: '通話記録 ・ #4472', title: '言葉にならない', pct: 74, fx: { kyokan: -2 },
      text: [
        '話そうとしたが、喉の奥で言葉が固まった。三年経っても、まだ話せないことがある。（共感ゲージ −2）',
        '「……すみません、大丈夫です」ノヴァが逆に気を遣ってくれた。立場が、少し逆転する。',
      ],
      choices: [{ pre: '続きを聴く', to: 'k3' }],
    },
    k2c: {
      kicker: '通話記録 ・ #4472', title: '前例のない照会', pct: 75, fx: { flags: { exploredAlt: 1 } },
      text: [
        '保留にして、規程課の戸山に「引退しない型」の前例を尋ねた。「ちょっと待ってください……正式な回答には時間がかかりますが」歯切れの悪い返事の奥に、微かな可能性が見えた気がした。',
      ],
      choices: [{ pre: 'ノヴァの元へ戻る', to: 'k3' }],
    },
    k2d: {
      kicker: '通話記録 ・ #4472', title: '沈黙の先', pct: 77, fx: { flags: { novaRealizes: 1 }, kyokan: 3 },
      text: [
        '何も言わず、ただ聴き続けた。ノヴァの息遣いが、少しずつ落ち着いていく。「……守る技、なんだと思います。終わらせるためじゃなくて」自分で、答えにたどり着いていく声だった。（共感ゲージ ＋3）',
      ],
      choices: [{ pre: '続きを聴く', to: 'k3' }],
    },
    k2e: {
      kicker: '通話記録 ・ #4472', title: '重すぎた沈黙', pct: 74, fx: { seiryo: -1 },
      text: [
        '沈黙が長引きすぎ、ノヴァの不安が募っていくのが伝わってくる。「もしもし……聞こえてます？」声を失いかけた喉に、少し力を込め直す。（声量 −1）',
      ],
      choices: [{ pre: '声をかけ直す', to: 'k3' }],
    },
    k3: {
      kicker: '通話記録 ・ #4472', title: '名前を決める時間', pct: 88,
      text: [
        '通話開始から28分。ノヴァが、決心したように息を吸った。「決めても、いいですか」',
      ],
      choices: [
        { pre: '「また明日」という言葉に、そっとヒントを添える', to: 'Et_own_name', if: function (st) { return st.flags.sharedPast; } },
        { pre: '見守る——名前は、もう彼女の中にある', to: 'Et_self_found', if: function (st) { return st.flags.novaRealizes; } },
        { pre: '「引退しない型」の可能性を、思い切って伝える', to: 'Et_no_retire', if: function (st) { return st.flags.exploredAlt; } },
        { pre: '魔力残量3%を使い、電話越しに小さな魔法を送る', to: 'Et_magic_gift', if: function (st) { return st.maryoku >= 3 && !st.flags.usedMagic; } },
        { pre: '一緒に、最後まで名前を考え続ける', to: 'Et_together_naming' },
      ],
    },
    Et_own_name: {
      kicker: '通話記録 ・ 結', title: '託された言葉', pct: 100, end: true, fx: { kyokan: 3, maryoku: 0 },
      text: [
        '「『また明日』……借りても、いいですか」ノヴァの声が、初めて笑った。「私の技は——『また、あした』。終わらせないための、約束の技にします」',
        '三年前、すず自身が叫べなかった続きを、誰かが代わりに叫んでくれる。受話器を置いたあと、すずは少しだけ泣いた。マグカップが、そっと湯気を立てた。（共感ゲージ ＋3）',
      ],
      choices: [],
    },
    Et_self_found: {
      kicker: '通話記録 ・ 結', title: '自分で見つけた名前', pct: 100, end: true, fx: { kyokan: 2 },
      text: [
        '長い沈黙の末、ノヴァは静かに言った。「『まもりびの最終章』——これにします。誰にも決めてもらわず、自分で」',
        'すずは何も言わず、ただ「いい名前だと思います」とだけ伝えた。電話の向こうで、確かな決意の音がした。（共感ゲージ ＋2）',
      ],
      choices: [],
    },
    Et_no_retire: {
      kicker: '通話記録 ・ 結', title: '引退しない選択肢', pct: 100, end: true, fx: { kyokan: 4 },
      text: [
        '「規程課によると——引退しない型の前例が、実は一件だけあるそうです」伝えた瞬間、電話の向こうで小さな悲鳴が上がった。「それ、早く言ってください！」',
        '技の名前を考える理由が、そもそも変わった。ノヴァはまだ、駅前を守り続けられる。（共感ゲージ ＋4）',
      ],
      choices: [],
    },
    Et_magic_gift: {
      kicker: '通話記録 ・ 結', title: '最後の3%', pct: 100, end: true, fx: { maryoku: -3, flags: { usedMagic: 1 }, kyokan: 5 },
      text: [
        '受話器に向かって、残り3%の魔力をそっと込めた。ただの子守唄程度の、小さな魔法。電話の向こうで、ノヴァが息を呑む。「……あったかい声がした気がします」',
        '魔力は0%になった。もう二度と使えない。それでも、後悔はなかった。（共感ゲージ ＋5 ・ 魔力残量 −3）',
      ],
      choices: [],
    },
    Et_together_naming: {
      kicker: '通話記録 ・ 結', title: '一緒に考えた夜', pct: 100, end: true, fx: { kyokan: 2 },
      text: [
        '結局、特別なことは何もせず、二人で夜通し候補を出し合った。「輝きの誓い」「あしたの盾」……決まったのは、意外と地味な名前だった。それでいいのだと、二人とも思った。（共感ゲージ ＋2）',
      ],
      choices: [],
    },
    E_voice_gone: {
      kicker: '通話記録 ・ 結', title: '声が、出なくなる', pct: 100, end: true, fx: { seiryoSet: 1 },
      text: [
        '声量が限界を超え、掠れて出なくなった。戸山が代わって電話を引き継いでくれる。「すずさん、少し休んでください」',
        '応対は、次のオペレーターに託された。（声量 1 で持ち直す）',
      ],
      choices: [],
    },
    E_shutdown: {
      kicker: '通話記録 ・ 結', title: '感情を閉ざす', pct: 100, end: true, fx: { kyokanSet: 3 },
      text: [
        '共感ゲージが底を尽き、気づけば機械的な相槌しか打てなくなっていた。マグカップが、心配そうに（ふりを止めて）そっと湯気を立てる。',
        '「休憩、取ってきます」すずは静かにヘッドセットを外した。（共感ゲージ 3 まで持ち直して復帰）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '通話ログを最初からやり直す', restart: true },
    { pre: '受電状況の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 0, diceDc: 15,
      lastRoll: { kind: 'check', die: 15, mod: 6, total: 21, dc: 15, outcome: 'success', skillName: '怒りの初期消火（最初の15秒）' },
      rollLog: [
        { left: 'すず ・ #4471 商店会長の苦情', right: '21 ／ 大変満足', color: '#2f8a5c' },
        { left: '戸山 ・ #4472 必殺技の命名相談', right: '12 ／ 「もう少し考える」', color: '#a5851f' },
        { left: '新人・小巻 ・ #4474 敵幹部の長話', right: '5 ／ 誤って世界滅亡を承諾', color: '#c65448' },
      ],
      seiryo: 12, kyokan: 7, maryoku: 3, panic: 42,
      lineVals: { novaLine: 7, kiteiLine: 64, hinanLine: 81, tekiLine: 86 },
      items: { mugTalked: 0 },
      flags: {},
      storyNode: 'k1', storyNote: null, storyNoteColor: '#93829b',
      gmScene: 0, heiwa: 74, gmTable: null,
    };
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.seiryo) patch.seiryo = eng().clamp(get('seiryo') + fx.seiryo, 0, SEIRYO_MAX);
    if (fx.seiryoSet != null) patch.seiryo = fx.seiryoSet;
    if (fx.kyokan) patch.kyokan = eng().clamp(get('kyokan') + fx.kyokan, 0, KYOKAN_MAX);
    if (fx.kyokanSet != null) patch.kyokan = fx.kyokanSet;
    if (fx.maryoku) patch.maryoku = Math.max(0, get('maryoku') + fx.maryoku);
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1k',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'seiryo', 'kyokan', 'maryoku', 'panic', 'lineVals',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'heiwa', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'k1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.lineVals = Object.assign({}, init.lineVals, st.lineVals || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 受電状況 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── オペレーター名鑑 ──
      out.seiryo = st.seiryo;
      out.seiryoPct = Math.round((st.seiryo / SEIRYO_MAX) * 100);
      out.kyokan = st.kyokan;
      out.kyokanPct = Math.round((st.kyokan / KYOKAN_MAX) * 100);
      out.maryoku = st.maryoku;
      out.seiryoUp = function () { app.setState({ seiryo: E.clamp(st.seiryo + 1, 0, SEIRYO_MAX) }); };
      out.seiryoDown = function () { app.setState({ seiryo: E.clamp(st.seiryo - 1, 0, SEIRYO_MAX) }); };
      out.kyokanUp = function () { app.setState({ kyokan: E.clamp(st.kyokan + 1, 0, KYOKAN_MAX) }); };
      out.kyokanDown = function () { app.setState({ kyokan: E.clamp(st.kyokan - 1, 0, KYOKAN_MAX) }); };

      // ── 応対判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ 応対品質判定 ・ 目標 ' + st.diceDc + ' ・ 技能:' + skill.name : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ応対を開始していない'; out.diceVerdict = ''; out.stampColor = '#93829b'; out.stampBg = '#fff';
      } else if (lr.kind === 'check') {
        var ci = csatInfo(lr);
        out.diceFace = lr.die;
        out.stampWord = ci.word;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = ci.verdict;
        out.stampColor = ci.color;
        out.stampBg = ci.bg;
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.stampColor = '#93829b';
        out.stampBg = '#fff';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #e0447c' : '1px solid rgba(224,68,124,.3)',
          color: sel ? '#e0447c' : '#93829b',
          bg: sel ? 'rgba(224,68,124,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #e0447c' : '1px solid rgba(224,68,124,.3)',
          color: sel ? '#e0447c' : '#93829b',
          bg: sel ? 'rgba(224,68,124,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var ci = csatInfo(r);
          pushLog(st, 'すず ・ ' + skill.name, r.total + ' ／ ' + ci.word, ci.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'すず ・ d' + st.diceSides, v + ' ／ 出目', '#93829b');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 入電の嵐 ──
      out.panic = st.panic;
      out.machiko = Math.max(0, 12 - Math.round((st.lineVals.hinanLine || 0) / 20));
      out.machikoPct = Math.min(100, out.machiko * 8);
      out.novaMp = 67;
      out.notifyAll = function () { app.setState({ heiwa: E.clamp(st.heiwa + 1, 0, 100), panic: E.clamp(st.panic - 3, 0, 100) }); };
      out.nextCall = function () {
        var vals = Object.assign({}, st.lineVals);
        vals.hinanLine = E.clamp(vals.hinanLine + 3, 0, 100);
        app.setState({ lineVals: vals, panic: E.clamp(st.panic - 1, 0, 100) });
      };
      out.lines = LINE_DEFS.map(function (d) {
        var v = st.lineVals[d.key];
        var step = Math.max(1, Math.round(d.max * 0.1));
        function adj(delta) {
          return function () {
            var vals = Object.assign({}, st.lineVals);
            vals[d.key] = E.clamp(v + delta, 0, d.max);
            app.setState({ lineVals: vals });
          };
        }
        // 敵幹部は「敵意」が下がるほど良い（穏やかになる）ので dec/inc の意味を反転
        var goodDir = d.isEnemy ? -step : step;
        return {
          num: d.isEnemy ? '敵' : d.num, title: d.title, titleColor: d.titleColor,
          tag: v <= 0 && d.isEnemy ? '解決（電話を切った）' : v >= d.max && !d.isEnemy ? '完了' : d.tag,
          tagColor: d.tagColor, note: d.note, noteBg: d.noteBg, noteColor: d.noteColor,
          border: d.border, bg: d.bg, op: '1',
          numBg: d.numBg, numColor: d.numColor, barColor: d.barColor,
          gauge: d.gauge, value: v + d.unit, pct: Math.round((v / d.max) * 100),
          dec: adj(goodDir), inc: adj(-goodDir),
        };
      });

      // ── ナレッジ ──
      out.mugSilent = !st.items.mugTalked;
      out.mugText = st.items.mugTalked ? MUG_TEXT_TALK : MUG_TEXT;
      out.talkToMug = function () {
        var items = Object.assign({}, st.items);
        items.mugTalked = 1;
        app.setState({ items: items });
      };

      // ── 通話ログ ──
      var node = NODES[st.storyNode] || NODES.k1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#93829b';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '通話終了 ・ 通話ログ 結審'
        : '通話 ' + (28 + Math.round(node.pct / 4)) + ':11 ・ 共感ゲージ ' + st.kyokan + '/10';
      out.storyCanRestart = st.storyNode !== 'k1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#93829b' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#2f8a5c' : '#c65448';
            pushLog(st, 'すず ・ ' + c.check.name + '（通話ログ）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#2f8a5c' : '#c65448');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var seiryoNow = 'seiryo' in patch ? patch.seiryo : st.seiryo;
          var kyokanNow = 'kyokan' in patch ? patch.kyokan : st.kyokan;
          if (seiryoNow <= 0 && !nextNode.end) {
            target = 'E_voice_gone';
            applyFx(st, NODES.E_voice_gone.fx, patch);
          } else if (kyokanNow <= 0 && !nextNode.end) {
            target = 'E_shutdown';
            applyFx(st, NODES.E_shutdown.fx, patch);
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

      // ── SV席 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #e0447c' : '1px solid rgba(224,68,124,.3)',
          bg: active ? 'rgba(224,68,124,.04)' : '#fff',
          color: active ? '#2d2438' : '#93829b',
          weight: active ? '700' : '400',
        };
      });
      out.heiwa = st.heiwa;
      out.heiwaMinus = function () { app.setState({ heiwa: E.clamp(st.heiwa - 1, 0, 100) }); };
      out.heiwaPlus = function () { app.setState({ heiwa: E.clamp(st.heiwa + 1, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, 'SV ・ 入電ハプニング表', d + ' ／ ' + text, '#e0447c');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
