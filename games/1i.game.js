/*
 * 1i-洗濯龍 のゲーム内容。
 * - 洗い判定: d4〜d100。専用の「2d10」判定は洗濯表示（〇成功／△部分成功／✕失敗）で結果を示す
 * - 従業員名札: 体力 / 清潔感（心の） / 龍との信頼 の増減
 * - 洗い工程: 予洗い〜乾燥の5段階プロセスバー。呪いの「汚れ残り」を0にすれば洗い上がり（勝利）。
 *   龍の「機嫌」が30未満だと回転拒否（おやつで+15）
 * - 洗剤棚: 「龍のおやつ」だけ「あげる」操作ができ、洗い工程の龍の機嫌に反映される
 * - 夜番日誌: 分岐シナリオ「すすぎの水は、少し塩辛い」（清潔感ルール・複数エンディング）。
 *   GM 秘匿（ドレスの染みの声＝6号機の中の声と同一人物）を発見する真ルートあり
 * - 店長ノート: 案件切替・排水口の圧・深夜ハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 16, SEIKETSU_MAX = 10;

  var SKILLS = [
    { name: '洗濯表示の解読（呪物対応版）', mod: 6 },
    { name: 'しみ抜き（物理・因果両対応）', mod: 5 },
    { name: '両替機の説得（叩かずに直す）', mod: 4 },
    { name: '深夜の客への声かけ', mod: -2 },
    { name: '観察', mod: 1 },
  ];
  var DICE_SIDES = [4, 6, 8, '2d10', 12, 20, 100];
  var STAGE_LABELS = ['予洗い', '本洗い', 'すすぎ', '脱水', '乾燥'];

  // 洗濯表示: 2d10 判定の結果を 〇（成功）／△（部分成功）／✕（失敗・イベント発生）で示す
  function washInfo(total, dc, dice) {
    var isDouble = dice[0] === dice[1];
    if (total >= dc + 5) return { word: 'スッキリ', mark: 'O', color: '#3ec98a', verdict: '＝ ' + total + ' ・ 大成功。呪いが古い記憶まで落ちた' + (isDouble ? '（ぞろ目・特別ボーナス）' : '') };
    if (total >= dc) return { word: '洗濯完了', mark: 'O', color: '#3ec98a', verdict: '＝ ' + total + ' ・ 成功' };
    if (total >= dc - 4) return { word: '部分成功', mark: 'SAN', color: '#2b9eae', verdict: '＝ ' + total + ' ・ △ 部分成功。染みがうっすら残る' };
    return { word: '洗濯不可', mark: 'BATSU', color: '#c9722e', verdict: '＝ ' + total + ' ・ ✕ 洗濯不可（イベント発生）' };
  }

  var GM_TABLE = ['停電（龍の湯だけ冷めない）', '停電（龍の湯だけ冷めない）', '酔客が呪いを誤って持ち帰る', '両替機がストライキ', '排水口から泡（虹色）', '龍が歌う（雨が降る）'];
  var GM_SCENES = ['花嫁衣装の呪い', '6号機のノック（3夜連続）', '商店街の「汚れ」の増加傾向'];

  // ─────────────────────────────────────────────
  // シナリオ「すすぎの水は、少し塩辛い」（夜番日誌 六月十七日）
  // fx: tai / seiketsu / shinrai / flags / taiSet / seiketsuSet
  // ─────────────────────────────────────────────
  var NODES = {
    i1: {
      kicker: '夜番日誌 ・ 六月十七日 ・ 午前1時20分', title: 'すすぎの水は、少し塩辛い', pct: 58,
      text: [
        '柚木さんがウェディングドレスを持ち込んだのは、日付が変わる少し前だった。「洗ってほしいの。着てないのに、汚れてるみたいだから」。畳まれたドレスは新品のままで、しかし持ち上げると、雨に濡れた犬みたいな重さがした。染みの声に耳を澄ます。——聞こえたのは、式場のキャンセル料の説明を延々と読み上げる、事務的な声だった。',
        '7号機に入れると、龍はいつもより丁寧に湯を回した。回転窓の向こうで、白い布と鱗の影が、ゆっくり円を描く。柚木さんはベンチに座って、その円をずっと見ている。乾燥機の上の時計が1時20分を指す。すすぎ工程で、水が急に塩辛くなった。龍が首を出して、こちらを見た。これは、涙の味がする案件だ。',
        { q: '汚れを落とすことと、なかったことにすることは、違う。うちの龍は、その区別だけは絶対に間違えない。' },
        '左袖の染みだけが、どうしても落ちない。近づけた耳に、今度は別の声がした。「——迎えに行けなくて、ごめん」。男の人の声だ。柚木さんは、まだ円を見ている。',
      ],
      choices: [
        { num: '①', pre: '染みの声を、柚木さんに伝える ', skillText: '接客判定', check: { name: '接客', mod: 1, dc: 14 }, success: 'i2a', fail: 'i2b' },
        { num: '②', pre: '伝えずに、染みだけそっと残して仕上げる（龍と要相談）', to: 'i2c' },
        { num: '③', pre: '「なかったコトに」を一滴——染みごと記憶を柔らかくする（取り返しがつかない）', to: 'i2d' },
      ],
    },
    i2a: {
      kicker: '夜番日誌 ・ 午前1時24分', title: '伝えた声', pct: 62, fx: { flags: { toldYuzuki: 1 } },
      text: [
        '「実は、染みから声が聞こえるんです」思い切って伝えると、柚木さんは驚くでもなく、静かに頷いた。「やっぱり。あの人、最後まで言い訳が下手だったから」',
        '涙は見せなかったが、握った拳が白くなっていた。',
      ],
      choices: [{ pre: '脱水工程へ進む', to: 'i3' }],
    },
    i2b: {
      kicker: '夜番日誌 ・ 午前1時24分', title: '言葉にできない', pct: 60, fx: { seiketsu: -1 },
      text: [
        'どう伝えればいいか分からず、結局言葉が喉で止まった。気まずい沈黙だけが残る。（清潔感 −1）',
        '柚木さんは不思議そうにこちらを見たが、何も聞いてこなかった。',
      ],
      choices: [{ pre: '脱水工程へ進む', to: 'i3' }],
    },
    i2c: {
      kicker: '夜番日誌 ・ 午前1時24分', title: '龍への相談', pct: 61, fx: { flags: { keepStain: 1 } },
      text: [
        '回転窓越しに、龍に目配せする。龍は小さく頷いたように見えた——染みは残すが、それ以上は広げない、という合図らしい。',
        '柚木さんには何も告げず、洗濯を見守ることにした。',
      ],
      choices: [{ pre: '脱水工程へ進む', to: 'i3' }],
    },
    i2d: {
      kicker: '夜番日誌 ・ 午前1時25分', title: '一滴の「なかったコトに」', pct: 61, fx: { seiketsu: -3, flags: { usedForget: 1 } },
      text: [
        '因果柔軟剤の瓶を、震える手で傾けた。一滴。染みに触れた瞬間、声がぷつりと途切れる。手のひらが、妙に冷たい。（清潔感 −3）',
        '取り返しがつかないことをした自覚だけが、胸に残った。',
      ],
      choices: [{ pre: '脱水工程へ進む', to: 'i3' }],
    },
    i3: {
      kicker: '夜番日誌 ・ 脱水工程', title: '6号機のノック', pct: 74,
      text: [
        '脱水が始まると同時に、店の奥、6号機からいつものノックの音がした。今夜はやけに、それが強く響く。',
        '確かめに行くべきか、迷う。',
      ],
      choices: [
        { pre: '6号機を、', skillText: '観察', post: 'しに行く', check: { name: '観察', mod: 1, dc: 13 }, success: 'i4a', fail: 'i4b' },
        { pre: '確かめず、このまま脱水を見守る', to: 'i4c' },
      ],
    },
    i4a: {
      kicker: '夜番日誌 ・ 6号機の前', title: '同じ声', pct: 80, fx: { flags: { know6Gou: 1 } },
      text: [
        '扉に耳を当てると、聞き覚えのある声がした——「迎えに行けなくて、ごめん」。ドレスの染みから聞こえた声と、寸分違わず同じ声だった。',
        '6号機の中の「濯ぎ忘れ」の正体が、今、はっきりと繋がった。',
      ],
      choices: [{ pre: 'すすぎ工程・脱水の続きに戻る', to: 'i5' }],
    },
    i4b: {
      kicker: '夜番日誌 ・ 6号機の前', title: '聞き取れない', pct: 78, fx: { tai: -1 },
      text: [
        '扉に耳を当てても、くぐもった音にしかならなかった。塩を持ってこなかったのを、少し後悔する。（体力 −1）',
      ],
      choices: [{ pre: '脱水の続きに戻る', to: 'i5' }],
    },
    i4c: {
      kicker: '夜番日誌 ・ カウンター', title: '見守るだけ', pct: 77,
      text: [
        '確かめには行かず、脱水の音だけを聞いていた。柚木さんも、こちらも、何も言わない時間が過ぎる。',
      ],
      choices: [{ pre: '脱水の続きを見守る', to: 'i5' }],
    },
    i5: {
      kicker: '夜番日誌 ・ 乾燥工程', title: '洗い上がり', pct: 90,
      text: [
        '脱水が終わり、ドレスは真っ白に仕上がった。龍がドラムを止め、静かにこちらを見ている。判断は、夜番に委ねられているようだった。',
      ],
      choices: [
        { pre: '6号機とドレスの声を繋げる提案を、龍にする', to: 'Et_reunite', if: function (st) { return st.flags.know6Gou; } },
        { pre: '記憶を柔らかくしたまま、静かに仕上げる', to: 'Et_forgotten', if: function (st) { return st.flags.usedForget; } },
        { pre: '柚木さんと一緒に、真実を受け止める', to: 'Et_together', if: function (st) { return st.flags.toldYuzuki; } },
        { pre: '何も言わず、ドレスを綺麗に畳んで渡す', to: 'Et_plain' },
        { pre: '判断を、龍に委ねる', to: 'Et_dragon_choice' },
      ],
    },
    Et_reunite: {
      kicker: '夜番日誌 ・ 結', title: '再会', pct: 100, end: true, fx: { shinrai: 15, seiketsu: 2 },
      text: [
        '龍に提案すると、大きく頷いて、6号機の方へ湯気をひとすじ送った。ノックの音が止み、代わりに——ドレスの奥から、小さな光がひとつ、6号機の方へ吸い込まれていった。',
        '柚木さんには何も見えなかったはずだが、なぜか涙をこぼしていた。「今、何かが、ちゃんと帰った気がした」龍の機嫌は、今夜いちばん良さそうだった。（龍との信頼 ＋15 ・ 清潔感 ＋2）',
      ],
      choices: [],
    },
    Et_forgotten: {
      kicker: '夜番日誌 ・ 結', title: '柔らかくなった記憶', pct: 100, end: true, fx: { seiketsu: -2 },
      text: [
        'ドレスは真っ白に仕上がったが、柚木さんは受け取るとき、少し不思議そうな顔をした。「あれ、私、何のために洗ってもらったんだっけ」',
        '取り返しがつかないと分かっていたことが、今、静かに現実になった。（清潔感 −2）',
      ],
      choices: [],
    },
    Et_together: {
      kicker: '夜番日誌 ・ 結', title: '受け止める', pct: 100, end: true, fx: { shinrai: 8, tai: -1 },
      text: [
        'ドレスを渡しながら、伝えた声のことをもう一度確認した。柚木さんは長いこと黙ってから、静かに笑った。「ありがとう。ちゃんと、教えてくれて」',
        '重い夜だったが、悪い夜ではなかった。龍も、心なしか満足げだった。（龍との信頼 ＋8 ・ 体力 −1）',
      ],
      choices: [],
    },
    Et_plain: {
      kicker: '夜番日誌 ・ 結', title: '何も言わずに', pct: 100, end: true,
      text: [
        '何も告げず、綺麗に畳んだドレスを渡した。柚木さんは礼を言って、店を出ていった。真夜中の商店街に、彼女の足音が遠ざかる。',
        '本当にそれで良かったのか、朝が来ても答えは出ない。',
      ],
      choices: [],
    },
    Et_dragon_choice: {
      kicker: '夜番日誌 ・ 結', title: '龍の判断', pct: 100, end: true, fx: { shinrai: 5 },
      text: [
        '判断を委ねると、龍はしばらく考え込み、それから小さく雨のような息を吐いた。ドレスの左袖に、うっすらとした跡だけが残る——完全には消えない、でも痛みだけを和らげたような跡。',
        '「昔、雨を降らせていた頃を思い出した」龍がぽつりと呟いた。理由はまだ話してくれないが、少しだけ扉が開いた気がした。（龍との信頼 ＋5）',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '夜番日誌 ・ 結', title: '店内で力尽きる', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '体力が尽き、カウンターに突っ伏してしまった。気づけば柚木さんが心配そうに顔を覗き込んでいる。「大丈夫？　龍さんが心配してたわよ」',
        '洗い上がりは、次の夜番に持ち越された。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_stained: {
      kicker: '夜番日誌 ・ 結', title: '心が汚れきる', pct: 100, end: true, fx: { seiketsuSet: 3 },
      text: [
        '呪いに触れすぎた心が、限界を迎えた。視界がぐらつき、龍が慌ててドラムから顔を出す。「予約なしだが、湯洗いしてやる」',
        '温かい湯気に包まれ、少しだけ心が軽くなる。次の夜番からは、もう少し距離感を学ばねば。（清潔感 3 まで湯洗いされ再開）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '夜番日誌を最初から書き直す', restart: true },
    { pre: '店内案内の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: '2d10', skillIdx: 1, diceDc: 15,
      lastRoll: { kind: 'check', dice: [9, 5], mod: 5, total: 19, dc: 15, skillName: 'しみ抜き（物理・因果両対応）' },
      rollLog: [
        { left: '潤 ・ しみ抜き（ウェディングドレス）', right: '19 ／ 〇 スッキリ', color: '#3ec98a' },
        { left: '柚木さん ・ 観察（6号機の声の主）', right: '11 ／ △ 「知ってる声だった」', color: '#c9722e' },
        { left: '潤 ・ 龍語（脱水の延長交渉）', right: '6 ／ ✕ 龍が拗ねた（要おやつ）', color: '#c9722e' },
      ],
      tai: 11, seiketsu: 8, shinrai: 57,
      stageIdx: 2, yogore: 34, kigen: 72, kokoro: 58,
      items: { snackQty: 7 },
      flags: {},
      storyNode: 'i1', storyNote: null, storyNoteColor: '#7d9298',
      gmScene: 0, haisui: 44, gmTable: null,
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
    if (fx.seiketsu) patch.seiketsu = eng().clamp(get('seiketsu') + fx.seiketsu, 0, SEIKETSU_MAX);
    if (fx.seiketsuSet != null) patch.seiketsu = fx.seiketsuSet;
    if (fx.shinrai) patch.shinrai = eng().clamp(get('shinrai') + fx.shinrai, 0, 100);
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1i',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'seiketsu', 'shinrai', 'stageIdx', 'yogore', 'kigen', 'kokoro',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'haisui', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'i1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 店内案内 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 従業員名札 ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.seiketsu = st.seiketsu;
      out.seiketsuPct = Math.round((st.seiketsu / SEIKETSU_MAX) * 100);
      out.shinrai = st.shinrai;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.seiketsuUp = function () { app.setState({ seiketsu: E.clamp(st.seiketsu + 1, 0, SEIKETSU_MAX) }); };
      out.seiketsuDown = function () { app.setState({ seiketsu: E.clamp(st.seiketsu - 1, 0, SEIKETSU_MAX) }); };
      out.shinraiUp = function () { app.setState({ shinrai: E.clamp(st.shinrai + 5, 0, 100) }); };
      out.shinraiDown = function () { app.setState({ shinrai: E.clamp(st.shinrai - 5, 0, 100) }); };

      // ── 洗い判定 ──
      var isCheck = st.diceSides === '2d10';
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ 洗い上がり判定 ・ 基準 ' + st.diceDc + ' ・ 工程：' + skill.name : (st.diceSides === '2d10' ? '2d10' : 'd' + st.diceSides) + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだボタンは押していない'; out.diceVerdict = '';
        out.stampColor = '#7d9298'; out.markOColor = '#dfe4e4'; out.markSanColor = '#dfe4e4'; out.markBatsuColor = '#dfe4e4';
      } else if (lr.kind === 'check') {
        var wi = washInfo(lr.total, lr.dc, lr.dice);
        out.diceFace = lr.total;
        out.stampWord = wi.word;
        out.diceFormula = '2d10 ＝ ' + lr.dice[0] + '+' + lr.dice[1] + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = wi.verdict;
        out.stampColor = wi.color;
        out.markOColor = wi.mark === 'O' ? '#3ec98a' : '#dfe4e4';
        out.markSanColor = wi.mark === 'SAN' ? '#2b9eae' : '#dfe4e4';
        out.markBatsuColor = wi.mark === 'BATSU' ? '#c9722e' : '#dfe4e4';
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = (lr.sides === '2d10' ? '2d10' : 'd' + lr.sides) + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.stampColor = '#7d9298';
        out.markOColor = '#dfe4e4'; out.markSanColor = '#dfe4e4'; out.markBatsuColor = '#dfe4e4';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: s === '2d10' ? '2d10' : 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #2b9eae' : '1px solid rgba(43,158,174,.3)',
          color: sel ? '#2b9eae' : '#7d9298',
          bg: sel ? 'rgba(43,158,174,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #2b9eae' : '1px solid rgba(43,158,174,.3)',
          color: sel ? '#2b9eae' : '#7d9298',
          bg: sel ? 'rgba(43,158,174,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === '2d10') {
          var d1 = E.rollDie(10), d2 = E.rollDie(10);
          var total = d1 + d2 + skill.mod;
          var wi = washInfo(total, st.diceDc, [d1, d2]);
          pushLog(st, '潤 ・ ' + skill.name, total + ' ／ ' + wi.word, wi.color);
          app.setState({ lastRoll: { kind: 'check', dice: [d1, d2], mod: skill.mod, total: total, dc: st.diceDc, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, '潤 ・ d' + st.diceSides, v + ' ／ 出目', '#7d9298');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 洗い工程 ──
      out.stages = STAGE_LABELS.map(function (label, i) {
        var done = i < st.stageIdx, active = i === st.stageIdx;
        return {
          label: label + (active ? ' ◉ 今ここ' : done ? ' ✓' : ''),
          weight: active || done ? '900' : '700',
          color: active || done ? '#fff' : '#7d9298',
          bg: done ? '#3ec98a' : active ? '#2b9eae' : '#eef6f6',
        };
      });
      out.nextStage = function () { app.setState({ stageIdx: Math.min(STAGE_LABELS.length - 1, st.stageIdx + 1) }); };
      out.pauseProcess = function () { app.setState({ kigen: E.clamp(st.kigen + 3, 0, 100) }); };
      out.yogore = st.yogore;
      out.yogoreDown5 = function () { app.setState({ yogore: E.clamp(st.yogore - 5, 0, 100) }); };
      out.yogoreDown1 = function () { app.setState({ yogore: E.clamp(st.yogore - 1, 0, 100) }); };
      out.yogoreUp1 = function () { app.setState({ yogore: E.clamp(st.yogore + 1, 0, 100) }); };
      out.kigen = st.kigen;
      out.ryuStatus = st.kigen < 30 ? '回転数：拒否中' : 'ごきげん';
      out.ryuTag = st.kigen < 30 ? '回転拒否（要おやつ）' : '龍の湯（52℃・呪い最適温）';
      out.ryuTagBg = st.kigen < 30 ? 'rgba(201,114,46,.12)' : 'rgba(43,158,174,.1)';
      out.ryuTagColor = st.kigen < 30 ? '#c9722e' : '#2b9eae';
      out.kigenDown = function () { app.setState({ kigen: E.clamp(st.kigen - 5, 0, 100) }); };
      out.kigenUp = function () { app.setState({ kigen: E.clamp(st.kigen + 5, 0, 100) }); };
      out.kokoro = st.kokoro;

      // ── 洗剤棚 ──
      out.snackQty = st.items.snackQty;
      out.snackAvailable = st.items.snackQty > 0 && st.kigen < 100;
      out.giveSnack = function () {
        var items = Object.assign({}, st.items);
        items.snackQty = Math.max(0, items.snackQty - 1);
        app.setState({ items: items, kigen: E.clamp(st.kigen + 15, 0, 100) });
      };

      // ── 夜番日誌 ──
      var node = NODES[st.storyNode] || NODES.i1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#7d9298';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '洗い上がり ・ 夜番日誌 結審'
        : node.pct + '% ・ 脱水まで ' + Math.max(0, 20 - Math.round(node.pct / 5)) + '分 ・ 龍の機嫌 ' + st.kigen;
      out.storyCanRestart = st.storyNode !== 'i1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#7d9298' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#3ec98a' : '#c9722e';
            pushLog(st, '潤 ・ ' + c.check.name + '（夜番日誌）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#3ec98a' : '#c9722e');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var seiketsuNow = 'seiketsu' in patch ? patch.seiketsu : st.seiketsu;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (seiketsuNow <= 0 && !nextNode.end) {
            target = 'E_stained';
            applyFx(st, NODES.E_stained.fx, patch);
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

      // ── 店長ノート ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #2b9eae' : '1px solid rgba(43,158,174,.3)',
          bg: active ? 'rgba(43,158,174,.04)' : '#fff',
          color: active ? '#26343a' : '#7d9298',
          weight: active ? '700' : '400',
        };
      });
      out.haisui = st.haisui;
      out.haisuiMinus = function () { app.setState({ haisui: E.clamp(st.haisui - 5, 0, 100) }); };
      out.haisuiPlus = function () { app.setState({ haisui: E.clamp(st.haisui + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '店長 ・ 深夜ハプニング表', d + ' ／ ' + text, '#2b9eae');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
