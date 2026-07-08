/*
 * 1l-辺境コンビニ のゲーム内容。
 * - レジ判定: d4〜d100。d20 判定はレシート印字で3段階（成功／一部成功／失敗）。出目1は「レジ詰まり」
 * - 店長ファイル: 体力 / 接客スマイル / 本部からの信頼 の増減
 * - 開門ラッシュ: 行列ゲージ（共有）と4件のお客様対応（新人パーティの生存率／常連／生還者／ドラゴン）
 * - 発注端末: 「地図の切れ端（第9層）」だけ査定を進められ、進めるとGM秘匿に繋がる伏線が育つ
 * - 業務日報: 分岐シナリオ「最後の肉まんの、渡し先」（体力・信頼ルール・複数エンディング）。
 *   GM 秘匿（聖騎士ノエル＝大穴を守るため脱走・討伐隊が迫っている／おでん鍋＝境界の釜）を
 *   発見する真ルートあり
 * - バックヤード: 幕切替・大穴の異変度・来店ハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 17, SMILE_MAX = 10;

  var SKILLS = [
    { name: '会計しながら世間話', mod: 6 },
    { name: '装備の値踏み（買取査定）', mod: 5 },
    { name: 'おでんの火加減（大穴連動）', mod: 4 },
    { name: '「二度と行くな」と言う', mod: -3 },
    { name: '胆力', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  // レジ判定: 3段階（成功／一部成功／失敗）。出目1は「レジ詰まり」
  function receiptInfo(r) {
    if (r.die === 1) return { word: 'レジ詰まり', color: '#c65448', verdict: '＝ ' + r.total + ' ・ レジ詰まり。行列が1段階悪化し、魔物のお客様が舌打ちする' };
    if (r.total >= r.dc) return { word: '成功', color: '#2f8a5c', verdict: '＝ ' + r.total + ' ・ 査定・応対、共に問題なし' };
    if (r.total >= r.dc - 4) return { word: '一部成功', color: '#a5851f', verdict: '＝ ' + r.total + ' ・ お値引き交渉までは至らず' };
    return { word: '失敗', color: '#c65448', verdict: '＝ ' + r.total + ' ・ うまく手続きできなかった' };
  }

  var CUSTOMER_DEFS = [
    { key: 'newbie', num: 1, title: '新人冒険者パーティ（4名）', gauge: '推定生存率', max: 100, unit: '%', tag: '対応中', tagColor: '#2f9e5f', note: 'ポーション0本で入ろうとしている', titleColor: '#25332a', border: '2px solid #2f9e5f', bg: 'rgba(47,158,95,.04)', numBg: '#2f9e5f', numColor: '#fff', valColor: '#c65448', barColor: '#c65448', hasBtns: true },
    { key: 'slime', num: 2, title: 'スライム（常連）', gauge: '常連度', max: 100, unit: '', tag: 'かご：吸収済み', tagColor: '#7f927f', note: '会計は体内から小銭を分泌して支払う。毎朝ゼリー飲料を1本。同族疑惑には触れない約束。', titleColor: '#25332a', border: '1px solid rgba(47,158,95,.25)', bg: '#fff', numBg: 'rgba(47,158,95,.1)', numColor: '#2f9e5f', valColor: '#25332a', barColor: '#2f9e5f', hasBtns: false },
    { key: 'survivor', num: 3, title: '生還者（泥だらけ・Bランク）', gauge: '空腹度', max: 100, unit: '', tag: '肉まん希望', tagColor: '#f08c2e', note: '三日ぶりの地上。「肉まん、まだあるか」だけを言いに来た。残3。この人の分はある。', titleColor: '#25332a', border: '1px solid rgba(47,158,95,.25)', bg: '#fff', numBg: 'rgba(47,158,95,.1)', numColor: '#2f9e5f', valColor: '#25332a', barColor: '#f08c2e', hasBtns: false },
    { key: 'dragon', num: 0, title: 'ドラゴン（駐竜場から頭だけ入店）', gauge: 'ご機嫌', max: 100, unit: '/100', tag: 'ドライブスルー希望', tagColor: '#7f927f', note: '窓口はドライブスルー非対応。だが断ると店ごと咥えられる可能性。交渉判定へ。', titleColor: '#c65448', border: '1px dashed rgba(198,84,72,.5)', bg: 'rgba(198,84,72,.02)', numBg: '#c65448', numColor: '#fff', valColor: '#c65448', barColor: '#c65448', hasBtns: true, isEnemyLike: false },
  ];

  var GM_TABLE = ['大量買い（棚が空く）', '大量買い（棚が空く）', '万引き（ただし犯人は透明）', '本部の抜き打ち視察', '竜車の配送遅延', '先代の常連が「先代いる？」と来店'];
  var GM_SCENES = ['第2幕：開門ラッシュ', '第3幕：第9層の地図と、おでんの貝殻', 'エピローグ：新人くんの「帰りの肉まん」'];

  var MAP_NOTE_PENDING = '第9層は公式には「存在しない」。本部に報告するべきか。';
  var MAP_NOTE_DONE = '査定が進み、地図と貝殻の模様が一致することが分かった。第9層は——大穴の底の、さらに向こう側だ。';

  // ─────────────────────────────────────────────
  // シナリオ「最後の肉まんの、渡し先」（業務日報 六月十七日）
  // fx: tai / smile / shinrai / ihen / flags / taiSet / shinraiSet
  // ─────────────────────────────────────────────
  var NODES = {
    l1: {
      kicker: '業務日報 ・ 六月十七日（晴・大穴の風 強め） ・ 記入者：真弓', title: '最後の肉まんの、渡し先', pct: 66,
      text: [
        '閉店間際、肉まんが最後の一個になった。ショーケースの前に、客が二人。泥だらけのBランク生還者と、明日はじめて大穴に潜るという新人の男の子。生還者は三日ぶりの飯で、新人は「験担ぎに、帰ってきた人と同じものを」と言う。',
        'こういうとき、店長マニュアルは役に立たない。先代ならどうしたか——考えるより先に、生還者のほうが口を開いた。「そいつにやってくれ。俺は帰りにここで食う楽しみを、もう知ってるから。」新人の目の色が変わるのが、レジ越しにわかった。ああ、これは。これは多分、明日この子が帰ってくる理由になる。',
        { q: '売るのは商品。持たせるのは、帰ってくる理由。' },
        'なお本日、おでん指数4F。閉店後、鍋の底から覚えのない具（貝殻のような何か）が出てきた。先代のメモによれば「鍋に何か増えている日は、大穴の底で何かが減っている」。……明日の仕込み、どうするか。',
      ],
      choices: [
        { num: '①', pre: '貝殻の具を、明日のおでんに戻して煮る（先代のやり方） ', skillText: 'おでんの火加減', check: { name: 'おでんの火加減', mod: 4, dc: 13 }, success: 'l2a', fail: 'l2b' },
        { num: '②', pre: '第9層の地図と貝殻を並べて、ノエルに相談する（彼女は何か知っている）', to: 'l2c', if: function (st) { return st.items.mapStatus === 'done'; } },
        { num: '③', pre: '何も見なかったことにして、肉まんを30個発注する（験担ぎの最大手）', to: 'Et_charm' },
      ],
    },
    l2a: {
      kicker: '業務日報 ・ 閉店後', title: '先代のやり方', pct: 70, fx: { flags: { calmedPot: 1 } },
      text: [
        '先代のメモ通り、貝殻を鍋に戻して弱火で煮る。おでんの匂いが、いつもより甘く、少し潮の香りがした。鍋がひとつ、静かに息をついたような気がした。',
        '大穴の風が、心なしか穏やかになる。',
      ],
      choices: [{ pre: '閉店処理を続ける', to: 'l3' }],
    },
    l2b: {
      kicker: '業務日報 ・ 閉店後', title: '火加減を誤る', pct: 68, fx: { ihen: 8, flags: { aggravatedPot: 1 } },
      text: [
        '火加減を誤り、貝殻は半端に煮崩れてしまった。鍋の底が、一瞬だけ深い青に光った気がしたが、見間違いかもしれない。（大穴の異変度 ＋8）',
        '先代のメモには「半端が一番よくない」とだけ書いてある。もっと早く読んでおくべきだった。',
      ],
      choices: [{ pre: '閉店処理を続ける', to: 'l3' }],
    },
    l2c: {
      kicker: '業務日報 ・ 閉店後', title: 'ノエルの沈黙', pct: 69, fx: { flags: { knowNoel: 1 } },
      text: [
        '地図の切れ端と貝殻を並べて見せると、ノエルの顔から、いつもの飄々とした表情が消えた。「……これ、どこで」声が固い。「大穴の底に、還るべき場所がある印です。あなたが思っているより、ずっと大きな話です」',
        'それ以上は言わず、彼女はマントの端を握りしめた。',
      ],
      choices: [{ pre: '閉店処理を続ける', to: 'l3' }],
    },
    l3: {
      kicker: '業務日報 ・ 閉店処理', title: '静かな店内', pct: 80,
      text: [
        '客足が絶え、店内には冷蔵ケースの唸りだけが響く。ノエルがレジ裏で、いつになく静かに制服を畳んでいた。',
      ],
      choices: [
        { pre: '討伐隊の噂を、それとなく確かめる', to: 'l4a', if: function (st) { return st.flags.knowNoel; } },
        { pre: '何も聞かず、閉店処理を進める', to: 'l4b' },
      ],
    },
    l4a: {
      kicker: '業務日報 ・ 閉店処理', title: '討伐隊の噂', pct: 84, fx: { flags: { knowInvasion: 1 } },
      text: [
        '「聞いてしまったんですが」と切り出すと、ノエルは観念したように話し始めた。「騎士団が、近くこの店の前に討伐隊を集結させます。大穴を——底から焼く作戦だそうです」',
        '「私はもう騎士団の人間じゃない。でも、黙って見過ごせなくて」彼女の手が、小さく震えていた。',
      ],
      choices: [{ pre: '店じまいをする', to: 'l5' }],
    },
    l4b: {
      kicker: '業務日報 ・ 閉店処理', title: 'いつも通りに', pct: 82,
      text: [
        '何も聞かず、いつも通りにレジを締めた。ノエルは、いつもより少しだけ長く、駐竜場の方を見ていた。',
      ],
      choices: [{ pre: '店じまいをする', to: 'l5' }],
    },
    l5: {
      kicker: '業務日報 ・ 店じまい', title: '明日への仕込み', pct: 92,
      text: [
        'シャッターを下ろす前、大穴の方角から、いつもより強い風が吹いた。店長として、この夜をどう締めくくるか。',
      ],
      choices: [
        { pre: '討伐隊が来る前に、ノエルと一緒に大穴側へ手を打つ', to: 'Et_protect', if: function (st) { return st.flags.knowInvasion; } },
        { pre: '境界の釜を守り続けることを、店の使命として再確認する', to: 'Et_guardian', if: function (st) { return st.flags.calmedPot; } },
        { pre: '経営判断として、本部に第9層のことを正直に報告する ', skillText: '経営', check: { name: '経営', mod: -1, dc: 14 }, success: 'Et_honest_report', fail: 'Et_report_backfire' },
        { pre: '何も考えず、明日の仕込みだけを考えて眠る', to: 'Et_ordinary' },
      ],
    },
    Et_charm: {
      kicker: '業務日報 ・ 結', title: '験担ぎの最大手', pct: 100, end: true, fx: { shinrai: 4 },
      text: [
        '深く考えず、肉まんを30個発注した。翌朝、届いた大量の肉まんに、ギギが目を丸くする。「店長、正気ですか」正気ではないかもしれないが、験は担いだ。',
        '本部からは「発注量、統計的に異常値」という警告が届いたが、なぜかその週の生還率は例年より高かった。（本部からの信頼 ＋4）',
      ],
      choices: [],
    },
    Et_protect: {
      kicker: '業務日報 ・ 結', title: '境界を守る側で', pct: 100, end: true, fx: { shinrai: -10, ihen: -15 },
      text: [
        'ノエルと二人、討伐隊が来る前に大穴側へ「良い隣人でいる」証を届けに行くことにした。本部的には完全に規定違反だが、先代なら同じことをしただろう。（本部からの信頼 −10）',
        '討伐隊が来た日、大穴は不思議なほど静かだった。焼くべき「脅威」が見当たらなかったのだ。ノエルが、久しぶりに笑った。（大穴の異変度 −15）',
      ],
      choices: [],
    },
    Et_guardian: {
      kicker: '業務日報 ・ 結', title: '境界の釜を継ぐ', pct: 100, end: true, fx: { smile: 2 },
      text: [
        '先代から受け継いだ鍋の火を、今夜も絶やさなかった。それだけのことが、実はこの店にとって一番大事な仕事なのだと、あらためて分かった気がする。',
        '接客スマイルが、少し自然になった。（接客スマイル ＋2）',
      ],
      choices: [],
    },
    Et_honest_report: {
      kicker: '業務日報 ・ 結', title: '正直な報告', pct: 100, end: true, fx: { shinrai: 15 },
      text: [
        '本部に第9層のことを正直に報告した。返ってきたのは意外にも「引き続き注視し、現状維持を推奨」という淡白な一文だった。本部も、知らないふりが得意らしい。（本部からの信頼 ＋15）',
        '面倒な調査は来なかった。店の日常は、変わらず続く。',
      ],
      choices: [],
    },
    Et_report_backfire: {
      kicker: '業務日報 ・ 結', title: '藪蛇の報告', pct: 100, end: true, fx: { shinrai: -12, tai: -3 },
      text: [
        '正直に報告した結果、本部から「詳細な調査団」が派遣されることになった。対応に追われ、その週はまともに眠れなかった。（本部からの信頼 −12 ・ 体力 −3）',
        '先代のメモに、初めて赤字で追記があるのを見つけた。「本部には、半分だけ話せ」。もっと早く読むべきだった。',
      ],
      choices: [],
    },
    Et_ordinary: {
      kicker: '業務日報 ・ 結', title: 'いつも通りの朝', pct: 100, end: true,
      text: [
        '深く考えず、明日の仕込みだけを考えて眠った。大穴も、店も、明日も変わらずそこにある——そう信じられるだけで、十分な夜だった。',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '業務日報 ・ 結', title: 'バックヤードで力尽きる', pct: 100, end: true, fx: { taiSet: 1 },
      text: [
        '体力が尽き、バックヤードの段ボールに埋もれるように眠ってしまった。ギギが心配そうに顔を覗き込む。「店長、休みも取ってください」',
        '閉店処理は、翌朝に持ち越された。（体力 1 で目覚める）',
      ],
      choices: [],
    },
    E_abandoned: {
      kicker: '業務日報 ・ 結', title: '本部に見放される', pct: 100, end: true, fx: { shinraiSet: 5 },
      text: [
        '本部からの信頼が底を尽き、辺境1号店は「経営改善指導」の対象に指定された。それでも、店の常連たちは変わらず通ってくる。信頼を測る基準は、本部と客とで、たぶん違う。',
        '（本部からの信頼 5 まで底上げされ、指導対象として再開）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '業務日報を最初から書き直す', restart: true },
    { pre: '店内モニターの間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 1, diceDc: 15,
      lastRoll: { kind: 'check', die: 13, mod: 5, total: 18, dc: 15, outcome: 'success', skillName: '装備の値踏み（買取査定）' },
      rollLog: [
        { left: 'タケル ・ 魔剣の買取査定', right: '18 ／ 成功', color: '#2f8a5c' },
        { left: 'ギギ ・ 品出し（最上段）', right: '11 ／ 脚立ごと転倒（無傷）', color: '#a5851f' },
        { left: 'ノエル ・ 接客スマイル', right: '4 ／ 客を祝福してしまう', color: '#c65448' },
      ],
      tai: 13, smile: 6, shinrai: 71,
      queue: 64, custVals: { newbie: 31, slime: 88, survivor: 97, dragon: 55 },
      items: { mapStatus: 'pending' },
      flags: {},
      storyNode: 'l1', storyNote: null, storyNoteColor: '#7f927f',
      gmScene: 0, ihen: 44, gmTable: null,
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
    if (fx.smile) patch.smile = eng().clamp(get('smile') + fx.smile, 0, SMILE_MAX);
    if (fx.shinrai) patch.shinrai = eng().clamp(get('shinrai') + fx.shinrai, 0, 100);
    if (fx.shinraiSet != null) patch.shinrai = fx.shinraiSet;
    if (fx.ihen) patch.ihen = eng().clamp(get('ihen') + fx.ihen, 0, 100);
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1l',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'smile', 'shinrai', 'queue', 'custVals',
      'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'ihen', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'l1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.custVals = Object.assign({}, init.custVals, st.custVals || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 店内モニター ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 店長ファイル ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.smile = st.smile;
      out.smilePct = Math.round((st.smile / SMILE_MAX) * 100);
      out.shinrai = st.shinrai;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.smileUp = function () { app.setState({ smile: E.clamp(st.smile + 1, 0, SMILE_MAX) }); };
      out.smileDown = function () { app.setState({ smile: E.clamp(st.smile - 1, 0, SMILE_MAX) }); };
      out.shinraiUp = function () { app.setState({ shinrai: E.clamp(st.shinrai + 5, 0, 100) }); };
      out.shinraiDown = function () { app.setState({ shinrai: E.clamp(st.shinrai - 5, 0, 100) }); };

      // ── レジ判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? '■ レジ判定 ・ 目標 ' + st.diceDc + ' ・ 技能：' + skill.name : 'd' + st.diceSides + ' を振る';
      out.skillLabel = isCheck ? skill.name.replace(/（.*?）/, '') : 'ー';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだスキャンしていない'; out.diceVerdict = ''; out.stampColor = '#7f927f'; out.modLabel = ''; out.totalLabel = '';
      } else if (lr.kind === 'check') {
        var ri = receiptInfo(lr);
        out.diceFace = lr.die;
        out.stampWord = ri.word;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = ri.verdict;
        out.stampColor = ri.color;
        out.modLabel = (lr.mod >= 0 ? '+' : '') + lr.mod;
        out.totalLabel = String(lr.total);
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.stampColor = '#7f927f';
        out.modLabel = '—';
        out.totalLabel = String(lr.value);
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #2f9e5f' : '1px solid rgba(47,158,95,.3)',
          color: sel ? '#2f9e5f' : '#7f927f',
          bg: sel ? 'rgba(47,158,95,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #2f9e5f' : '1px solid rgba(47,158,95,.3)',
          color: sel ? '#2f9e5f' : '#7f927f',
          bg: sel ? 'rgba(47,158,95,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var ri = receiptInfo(r);
          pushLog(st, 'タケル ・ ' + skill.name, r.total + ' ／ ' + ri.word, ri.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'タケル ・ d' + st.diceSides, v + ' ／ 出目', '#7f927f');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 開門ラッシュ ──
      out.queue = st.queue;
      out.queueGroups = Math.max(0, Math.round(st.queue / 8));
      out.callHelp = function () { app.setState({ queue: E.clamp(st.queue - 8, 0, 100) }); };
      out.nextCustomer = function () { app.setState({ queue: E.clamp(st.queue + 3, 0, 100) }); };
      out.customers = CUSTOMER_DEFS.map(function (d) {
        var v = st.custVals[d.key];
        function adj(delta) {
          return function () {
            var vals = Object.assign({}, st.custVals);
            vals[d.key] = E.clamp(v + delta, 0, d.max);
            app.setState({ custVals: vals });
          };
        }
        return {
          num: d.isEnemyLike ? '!' : d.num, title: d.title, titleColor: d.titleColor,
          tag: d.tag, tagColor: d.tagColor, note: d.note,
          border: d.border, bg: d.bg,
          numBg: d.numBg, numColor: d.numColor,
          gauge: d.gauge, value: v + d.unit, valColor: d.valColor, pct: Math.round((v / d.max) * 100), barColor: d.barColor,
          hasBtns: d.hasBtns, dec: adj(-5), inc: adj(5),
        };
      });

      // ── 発注端末 ──
      out.mapPending = st.items.mapStatus === 'pending';
      out.mapStatus = st.items.mapStatus === 'pending' ? '査定中' : '照合済';
      out.mapColor = st.items.mapStatus === 'pending' ? '#a5851f' : '#2f5d9e';
      out.mapNote = st.items.mapStatus === 'pending' ? MAP_NOTE_PENDING : MAP_NOTE_DONE;
      out.appraiseMap = function () {
        var items = Object.assign({}, st.items);
        items.mapStatus = 'done';
        app.setState({ items: items });
      };

      // ── 業務日報 ──
      var node = NODES[st.storyNode] || NODES.l1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      out.storyBlocks = node.text.map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#7f927f';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end
        ? '日報 提出完了 ・ 結審'
        : '日報 ' + node.pct + '% ・ 閉店処理まで ' + Math.max(0, 60 - Math.round(node.pct / 2)) + '分 ・ おでん指数 ' + Math.min(6, Math.round(st.ihen / 16)) + 'F';
      out.storyCanRestart = st.storyNode !== 'l1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#7f927f' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + (r.ok ? '成功' : '失敗');
            patch.storyNoteColor = r.ok ? '#2f8a5c' : '#c65448';
            pushLog(st, 'タケル ・ ' + c.check.name + '（業務日報）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#2f8a5c' : '#c65448');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var shinraiNow = 'shinrai' in patch ? patch.shinrai : st.shinrai;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (shinraiNow <= 0 && !nextNode.end) {
            target = 'E_abandoned';
            applyFx(st, NODES.E_abandoned.fx, patch);
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

      // ── バックヤード ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #2f9e5f' : '1px solid rgba(47,158,95,.3)',
          bg: active ? 'rgba(47,158,95,.04)' : '#fff',
          color: active ? '#25332a' : '#7f927f',
          weight: active ? '700' : '400',
        };
      });
      out.ihen = st.ihen;
      out.ihenMinus = function () { app.setState({ ihen: E.clamp(st.ihen - 5, 0, 100) }); };
      out.ihenPlus = function () { app.setState({ ihen: E.clamp(st.ihen + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, 'バックヤード ・ 来店ハプニング表', d + ' ／ ' + text, '#2f9e5f');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
