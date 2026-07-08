/*
 * 1m-末期ゴミ収集車 のゲーム内容。
 * - 分別判定: d4〜d100。d20判定はレシート印字ならぬ「判定値スタンプ」で3段階（正しく分別／
 *   保留・要再確認／誤分別）。出目1は特殊な「誤分別・大化け」
 * - 隊員手帳: 体力 / 心の積載量 / 街の清浄度 の増減
 * - 収集ルート: 日没までの共有カウントダウン＋荷台積載＋4件の集積所トラッカー
 *   （桜通り／第二小学校／灰田家／昨夜の誤分別＝追跡してくる化けたマット）
 * - 荷台マニフェスト: 「婚約指輪」だけ照会端末（電池2本）にかざして持ち主を照会でき、
 *   結果が業務日報の選択肢を左右する
 * - 収集記録: 分岐シナリオ「整然と出された、燃えないもの」。GM秘匿2件
 *   （桜通りのゴミ出し主＝ジジ本人／ジチタイちゃん＝市民の思い出のバックアップ保管者）を
 *   条件付きで発見する真ルートあり
 * - 事業課端末: 幕切替・街の清浄度±・収集ハプニング表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var TAI_MAX = 15, KOKORO_MAX = 10;

  var SKILLS = [
    { name: '思い出の持ち主を推定する', mod: 5 },
    { name: '「これは資源です」と言い張る', mod: 4 },
    { name: '重いものを丁寧に持つ', mod: 4 },
    { name: '自分の思い出を捨てる', mod: -4 },
    { name: '分別眼（能力値）', mod: 3 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  function sortInfo(r) {
    if (r.die === 1) return { word: '誤分別・大化け', color: '#c65448', verdict: '＝ ' + r.total + ' ・ 明らかな誤分別。今夜、思い出が化けて出ます' };
    if (r.total >= r.dc) return { word: '正しく分別', color: '#2f8a5c', verdict: '＝ ' + r.total + ' ・ 正しく分別。安らかに送り出せた' };
    if (r.total >= r.dc - 4) return { word: '保留（要再確認）', color: '#a5851f', verdict: '＝ ' + r.total + ' ・ 判断がつかず、荷台で保留に' };
    return { word: '誤分別', color: '#c65448', verdict: '＝ ' + r.total + ' ・ 誤分別。今夜、化けて出るかもしれない' };
  }

  var STOP_DEFS = [
    { key: 'sakura', num: 1, title: '桜通り集積所', gauge: '回収進捗', unit: '%', max: 100, step: 5, tag: '対応中', tagColor: '#3a7ba8', note: 'ネット下に婚約指輪、鍵束×7、「またね」×大量。整然と出されている。誰が？', titleColor: '#2c3440', border: '2px solid #3a7ba8', bg: 'rgba(58,123,168,.04)', numBg: '#3a7ba8', numColor: '#fff', barColor: '#3a7ba8' },
    { key: 'daisho', num: 2, title: '旧・第二小学校', gauge: '後悔の密度', unit: '%', max: 100, step: 5, tag: '粗大（後悔）・要注意', tagColor: '#c65448', note: '「言えなかった卒業式の言葉」が体育館一杯分。予約シールなし。持ち主：全卒業生。', titleColor: '#7a5a9e', border: '1px solid rgba(122,90,158,.5)', bg: 'rgba(122,90,158,.04)', numBg: '#7a5a9e', numColor: '#fff', barColor: '#7a5a9e' },
    { key: 'haneda', num: 3, title: '灰田家（ソラの実家）', gauge: '心の準備', unit: '%', max: 100, step: 5, tag: '3年連続スキップ中', tagColor: '#a5851f', note: 'ルート上にある。ジジは毎回、黙って通過してくれる。今日も通過でいいか、ソラ。', titleColor: '#2c3440', border: '1px solid rgba(58,123,168,.25)', bg: '#fff', numBg: 'rgba(58,123,168,.1)', numColor: '#3a7ba8', barColor: '#e8b432' },
    { key: 'obake', num: '!', title: '昨夜の誤分別（玄関マットの化け）', gauge: '距離', unit: 'm', max: 500, step: 20, tag: '1号車を追跡中', tagColor: '#84919c', note: '「おかえり」を言う相手を探して車を追ってくる。敵ではない。ただ、行き先がない。', titleColor: '#c65448', border: '1px dashed rgba(198,84,72,.5)', bg: 'rgba(198,84,72,.02)', numBg: '#c65448', numColor: '#fff', barColor: '#c65448' },
  ];

  var GM_TABLE = ['パンク（スペアと世間話）', 'パンク（スペアと世間話）', '野良の思い出が荷台に飛び乗る', '回転板に「まだ言えてないただいま」が絡まる', 'にわか雨（思い出は濡れると重い）', 'ジチタイちゃんの臨時放送（3年ぶりの新着）'];
  var GM_SCENES = ['第2幕：桜通りのゴミ出し主', '第3幕：灰田家の玄関の袋', '最終幕：満載の日——処分場への同乗'];

  function fmtClock(sec) {
    sec = Math.max(0, sec);
    var m = Math.floor(sec / 60), s = sec % 60;
    return m + ':' + (s < 10 ? '0' : '') + s;
  }

  // ─────────────────────────────────────────────
  // シナリオ「整然と出された、燃えないもの」
  // ─────────────────────────────────────────────
  var NODES = {
    m1: {
      kicker: '収集記録 ・ 滅亡後1247日 ・ 記録者：灰田', title: '整然と出された、燃えないもの', pct: 58,
      text: [
        '桜通りの集積所は、今朝もきちんとしていた。ネットが掛けられ、指輪は小箱に、鍵は束に、「またね」は輪ゴムで留めて。三年前に人がいなくなった街で、誰かが収集日を守って、ゴミを出している。',
        'ジジは何も言わずに回転板を回す。ポリ助が指輪の小箱を持ち上げたとき、照会端末が鳴った。「該当者なし」。持ち主が、まだ生きている。この街の、どこかに。わたしの聞く「夜の泣き声」が、いつも同じ方角から聞こえることと、たぶん無関係じゃない。',
        { q: 'ゴミ出しのルールを守る者がいる限り、その街はまだ、暮らしている。 ——清掃事業課 心得 第一条（ジジの暗唱による。原本は滅亡時に焼失）' },
        '帰り道、ルートは灰田家の前を通る。三年間スキップし続けた、わたしの家。今日、玄関の前に、小さな袋がひとつ出ているのが見えた。誰が出した？　うちの家族は、あの日、全員で——いや。考えるのは、車を停めてからでいい。',
      ],
      choices: [
        { num: '①', pre: '車を停めて、玄関の袋を確認する ', skillText: '胆力', check: { name: '胆力', mod: 0, dc: 14 }, success: 'm2a', fail: 'm2b' },
        { num: '②', pre: '今日は通過して、夜の泣き声の方角を先に調べる（生存者の可能性） ', skillText: '傾聴', check: { name: '傾聴', mod: 2, dc: 13 }, success: 'm3a', fail: 'm3b' },
        { num: '③', pre: 'ジジに「先に降りてもらえますか」と頼む——彼は42年、こういう日の作法を知っている', to: 'm4' },
      ],
    },
    m2a: {
      kicker: '収集記録 ・ 灰田家前', title: '母の字、迷いのない字', pct: 63, fx: { flags: { foundNote: 1 }, tai: -1 },
      text: [
        'ジジに視線で合図をもらい、車を停めた。玄関の袋は、他の家のゴミと同じように几帳面にまとめられていた。開けると、一番上に折りたたまれた紙が一枚。「ソラへ　先に行きます　追いかけないで　――母より」',
        '筆跡に迷いがない。三年間、迷わず書けるようになるまでの時間を想像して、うまく息ができなくなる。',
      ],
      choices: [{ pre: '動揺を抑えて、収集を続ける', to: 'm5' }],
    },
    m2b: {
      kicker: '収集記録 ・ 灰田家前', title: '開けられなかった袋', pct: 63, fx: { flags: { postponedBag: 1 } },
      text: [
        '手が、袋の口に触れたところで止まった。指が動かない。ジジが横から、何も聞かずに袋を持ち上げ、予約シールを貼った。「後で、一緒に開けよう。今日じゃなくていい」',
      ],
      choices: [{ pre: '頷いて、収集を続ける', to: 'm5' }],
    },
    m3a: {
      kicker: '収集記録 ・ 車内', title: '声のする方角', pct: 63, fx: { flags: { knowDirection: 1 } },
      text: [
        '耳を澄ませると、いつもよりはっきり分かった。方角は——北。旧市街のさらに奥、地図の空白部分。今夜また泣くなら、今度こそ数えられる。',
      ],
      choices: [{ pre: '収集を続ける', to: 'm5' }],
    },
    m3b: {
      kicker: '収集記録 ・ 車内', title: '滲む声', pct: 63, fx: { kokoro: 1 },
      text: [
        '耳を澄ませたが、方角は掴めなかった。ただ一瞬、声の中に自分の名前が混じった気がして、鳥肌が立つ。空耳だと思うことにする。',
      ],
      choices: [{ pre: '収集を続ける', to: 'm5' }],
    },
    m4: {
      kicker: '収集記録 ・ 灰田家前', title: 'ジジの背中', pct: 63, fx: { flags: { suspectJiji: 1 } },
      text: [
        '「先に降りてもらえますか」と言うと、ジジは一瞬だけ驚いた顔をして、それから頷いた。「……そうか。そういう日か」　その一言に、42年分の何かが滲んでいた気がした。',
      ],
      choices: [{ pre: '収集を続ける', to: 'm5' }],
    },
    m5: {
      kicker: '収集記録 ・ 移動中', title: '第二小学校への道', pct: 72,
      text: ['灰田家を過ぎ、車は次の集積所へ向かう。窓の外、街はいつも通り静かだ。'],
      choices: [
        { pre: 'ジチタイちゃんに、指輪の持ち主について尋ねる', to: 'm5b', if: function (st) { return st.items.ringStatus === 'done'; } },
        { pre: 'そのまま第二小学校へ向かう', to: 'm6' },
      ],
    },
    m5b: {
      kicker: '収集記録 ・ 車内', title: 'ジチタイちゃんの答え', pct: 75, fx: { flags: { knowBackup: 1 } },
      text: [
        '「該当者なし、というのは正確には『まだ引き取りに来ていない』って意味なんです♪」ジチタイちゃんは相変わらず明るい。「わたし、みなさんの『捨てられなかった思い出』、預かってるので。いつか、ちゃんと」　その先は、音声が乱れて聞こえなかった。',
      ],
      choices: [{ pre: '第二小学校へ向かう', to: 'm6' }],
    },
    m6: {
      kicker: '収集記録 ・ 旧・第二小学校', title: '言えなかった言葉の山', pct: 80,
      text: [
        '旧・第二小学校の体育館は、言葉でいっぱいだった。「言えなかった卒業式の言葉」——誰も彼もが、最後の日に言えなかった一言。持ち主は、全卒業生。回収するには、持ち方が要る。',
      ],
      choices: [
        { pre: '一つひとつ、丁寧に運び出す ', skillText: '重いものを丁寧に持つ', check: { name: '重いものを丁寧に持つ', mod: 4, dc: 15 }, success: 'm6a', fail: 'm6b' },
      ],
    },
    m6a: {
      kicker: '収集記録 ・ 体育館', title: '静かな体育館', pct: 85, fx: { seijou: 3 },
      text: ['丁寧に運び出すと、言葉たちは静かに、荷台に収まった。誰かがようやく、卒業できたような気がした。'],
      choices: [{ pre: '次へ向かう', to: 'm7' }],
    },
    m6b: {
      kicker: '収集記録 ・ 体育館', title: '崩れた山', pct: 85, fx: { kokoro: 2 },
      text: ['抱えた瞬間、山が崩れた。何百もの「ありがとう」「ごめん」「好きでした」が、一斉に降ってくる。全部は受け止めきれない。'],
      choices: [{ pre: '次へ向かう', to: 'm7' }],
    },
    m7: {
      kicker: '収集記録 ・ 帰路', title: '追いついてきたもの', pct: 88,
      text: [
        '車庫まであと少し、というところで、後ろに気配がした。振り返ると、昨夜の「おかえりマット」が、走って追いついてきていた。息を切らして——マットに息はないはずなのに。',
      ],
      choices: [
        { pre: '「これは資源です」と言い張る、と自分に言い聞かせて、正面から話しかける ', skillText: '「これは資源です」と言い張る', check: { name: '「これは資源です」と言い張る', mod: 4, dc: 15 }, success: 'm8a', fail: 'm8b' },
        { pre: 'ジジに任せる（彼を信じる）', to: 'm8c' },
      ],
    },
    m8a: {
      kicker: '収集記録 ・ 路上', title: '「おかえり」の行き先', pct: 92, fx: { flags: { calmedGhost: 1 } },
      text: ['落ち着いて話しかけると、マットの震えが止まった。ただ「おかえり」を言いたいだけらしい。相手はもう決まっていて、でも、まだ帰ってきていないのだと言う。'],
      choices: [{ pre: '車庫へ戻る', to: 'm9' }],
    },
    m8b: {
      kicker: '収集記録 ・ 路上', title: '受け止めきれない震え', pct: 92, fx: { kokoro: 3, tai: -2 },
      text: ['話しかけようとした瞬間、マットの震えが伝染するように胸に来た。うまく息ができない。ジジが背中をさすってくれて、ようやく落ち着く。'],
      choices: [{ pre: '車庫へ戻る', to: 'm9' }],
    },
    m8c: {
      kicker: '収集記録 ・ 路上', title: 'ジジの言葉', pct: 92, fx: { seijou: 1 },
      text: ['ジジが一人で降りて、マットの前にしゃがみこんだ。何を言ったのかは聞こえなかったが、マットは静かになって、道端にきちんと畳まれて残った。「明日、収集する」とだけ、ジジは言った。'],
      choices: [{ pre: '車庫へ戻る', to: 'm9' }],
    },
    m9: {
      kicker: '収集記録 ・ 車庫', title: '車庫にて', pct: 96,
      text: ['1号車を車庫に入れる。今日の分別は、終わった。荷台には、まだ持ち主のわからない思い出が幾つか残っている。'],
      choices: [
        { pre: '母の手紙と、指輪の「該当者なし」を重ねて、母を探すと決める', to: 'Et_search', if: function (st) { return st.flags.foundNote && st.items.ringStatus === 'done'; } },
        { pre: '母の言葉を胸に、明日も同じ道を通ると決める', to: 'Et_family', if: function (st) { return st.flags.foundNote && st.items.ringStatus !== 'done'; } },
        { pre: 'ジジに、桜通りの集積所のことを直接尋ねる', to: 'Et_jiji_secret', if: function (st) { return st.flags.suspectJiji; } },
        { pre: 'ジジと約束した通り、後日一緒に袋を開ける準備をする', to: 'Et_together', if: function (st) { return st.flags.postponedBag; } },
        { pre: 'ジチタイちゃんに、預かった思い出を「いつか取りに来る」と伝える', to: 'Et_promise', if: function (st) { return st.flags.knowBackup; } },
        { pre: 'この街を出て、まだ人が住む場所を探そうと提案する ', skillText: '胆力', check: { name: '胆力', mod: 0, dc: 16 }, success: 'Et_leave', fail: 'Et_stay_together' },
        { pre: '今日の分別を終え、明日もまた収集車を出す', to: 'Et_daily' },
      ],
    },
    Et_search: {
      kicker: '収集記録 ・ 結', title: '追いかける、と決めた夜', pct: 100, end: true, fx: { seijou: 5 },
      text: [
        '「追いかけないで」の意味を、何度も読み返した。でも、指輪の「該当者なし」は本物だ。母は、まだどこかにいる。言葉の意味を、ちゃんと確かめてから受け取ることにする。明日、北へ向かうルートを申請しよう。',
      ],
      choices: [],
    },
    Et_family: {
      kicker: '収集記録 ・ 結', title: '通い続ける、という選択', pct: 100, end: true,
      text: [
        '母の字を、まだ誰にも見せていない。追いかける勇気はまだない。でも、この道を通い続けることが、今の自分にできる精一杯の返事な気がする。明日も、灰田家の前を通る。',
      ],
      choices: [],
    },
    Et_jiji_secret: {
      kicker: '収集記録 ・ 結', title: '42年分の、答え合わせ', pct: 100, end: true, fx: { kokoro: -1 },
      text: [
        '「桜通りの集積所、あれは……」と切り出すと、ジジは長い沈黙のあと、ぽつりと言った。「わしだ。回収する側のままでいる方が、まだ生きていられる気がしてな」　42年分の、彼自身の思い出を、少しずつ手放してきたのだと。ただし婚約指輪だけは違う、と念を押された。',
      ],
      choices: [],
    },
    Et_together: {
      kicker: '収集記録 ・ 結', title: '一緒に開ける、約束', pct: 100, end: true, fx: { tai: 1 },
      text: ['「後で、一緒に」というジジの言葉を、ちゃんと約束にする。今日じゃなくていい。でも、いつかは。それだけで、少し息がしやすくなった。'],
      choices: [],
    },
    Et_promise: {
      kicker: '収集記録 ・ 結', title: '取りに来る日まで', pct: 100, end: true, fx: { seijou: 2 },
      text: ['ジチタイちゃんに「いつか取りに来る人のために、ちゃんと預かっておいて」と伝えると、彼女は珍しく黙って、それから「はい♪」とだけ答えた。街の清浄度が、少しだけ上がった気がした。'],
      choices: [],
    },
    Et_leave: {
      kicker: '収集記録 ・ 結', title: 'まだ見ぬ場所へ', pct: 100, end: true, fx: { seijou: 4 },
      text: ['「この街を出て、まだ人が住む場所を探しませんか」　提案は、思ったより静かに受け入れられた。ジジもポリ助も、驚くほどあっさり頷く。もしかしたら、みんなずっと、誰かが言い出すのを待っていたのかもしれない。'],
      choices: [],
    },
    Et_stay_together: {
      kicker: '収集記録 ・ 結', title: 'ここにいる、という答え', pct: 100, end: true, fx: { kokoro: -1 },
      text: ['提案は、やんわりと退けられた。「まだこの街には、回収し終わってないものがある」とジジ。それもそうだと思う。今日のところは、みんなでここにいることにする。'],
      choices: [],
    },
    Et_daily: {
      kicker: '収集記録 ・ 結', title: '明日もまた、収集車は出る', pct: 100, end: true,
      text: ['特別なことは何も決めなかった。ただ、今日の分別を終え、明日もまた同じ時間に収集車を出す。それだけのことが、この街ではいちばん難しくて、いちばん大事なことだと知っている。'],
      choices: [],
    },
    E_collapse: {
      kicker: '収集記録 ・ 結', title: '荷台で力尽きる', pct: 100, end: true, fx: { taiSet: 1 },
      text: ['体力が尽き、荷台の縁にもたれて眠ってしまった。ポリ助が毛布代わりに古いネットをかけてくれる。「休むのも仕事のうちです」とジチタイちゃんの合成音声。'],
      choices: [],
    },
    E_overload: {
      kicker: '収集記録 ・ 結', title: '心の積載量、振り切れる', pct: 100, end: true, fx: { kokoroSet: 5 },
      text: ['積みすぎた。他人の思い出と自分の記憶の境目が、わからなくなる。誰の「ごめん」で、誰の「ただいま」だったか。しばらく座り込んで、息をするしかなかった。'],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '収集記録を最初から書き直す', restart: true },
    { pre: '収集カレンダーへ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 4, diceDc: 15,
      lastRoll: { kind: 'check', die: 16, mod: 3, total: 19, dc: 15, outcome: 'success', ok: true, skillName: '分別眼（能力値）' },
      rollLog: [
        { left: 'ソラ ・ 分別眼（能力値）', right: '19 ／ 正しく分別', color: '#2f8a5c' },
        { left: 'ジジ ・ 重いものを丁寧に持つ', right: '13 ／ 保留（要再確認）', color: '#a5851f' },
        { left: 'ポリ助 ・ 分別眼（能力値）', right: '6 ／ 誤分別', color: '#c65448' },
      ],
      tai: 12, kokoro: 6, seijou: 37,
      duskSec: 200, fuel: 55, wheel: 78, truckLoad: 62,
      stopVals: { sakura: 70, daisho: 82, haneda: 37, obake: 200 },
      items: { ringStatus: 'pending', battery: 2 },
      flags: {},
      storyNode: 'm1', storyNote: null, storyNoteColor: '#7f927f',
      gmScene: 0, gmTable: null,
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
    if (fx.kokoro) patch.kokoro = eng().clamp(get('kokoro') + fx.kokoro, 0, KOKORO_MAX);
    if (fx.kokoroSet != null) patch.kokoro = fx.kokoroSet;
    if (fx.seijou) patch.seijou = eng().clamp(get('seijou') + fx.seijou, 0, 100);
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1m',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'tai', 'kokoro', 'seijou', 'duskSec', 'fuel', 'wheel', 'truckLoad',
      'stopVals', 'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'm1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.stopVals = Object.assign({}, init.stopVals, st.stopVals || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── top ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 隊員手帳 ──
      out.tai = st.tai;
      out.taiPct = Math.round((st.tai / TAI_MAX) * 100);
      out.kokoro = st.kokoro;
      out.kokoroPct = Math.round((st.kokoro / KOKORO_MAX) * 100);
      out.seijou = st.seijou;
      out.taiUp = function () { app.setState({ tai: E.clamp(st.tai + 1, 0, TAI_MAX) }); };
      out.taiDown = function () { app.setState({ tai: E.clamp(st.tai - 1, 0, TAI_MAX) }); };
      out.kokoroUp = function () { app.setState({ kokoro: E.clamp(st.kokoro + 1, 0, KOKORO_MAX) }); };
      out.kokoroDown = function () { app.setState({ kokoro: E.clamp(st.kokoro - 1, 0, KOKORO_MAX) }); };
      out.seijouUp = function () { app.setState({ seijou: E.clamp(st.seijou + 5, 0, 100) }); };
      out.seijouDown = function () { app.setState({ seijou: E.clamp(st.seijou - 5, 0, 100) }); };

      // ── 分別判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[4];
      out.diceDc = st.diceDc;
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      out.skillLabel = isCheck ? skill.name : 'ー';
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.stampWord = ''; out.diceFormula = 'まだ分別していない'; out.diceVerdict = ''; out.stampColor = '#84919c';
      } else if (lr.kind === 'check') {
        var si = sortInfo(lr);
        out.diceFace = lr.die;
        out.stampWord = si.word;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ ' + lr.skillName + ' ' + lr.mod;
        out.diceVerdict = si.verdict;
        out.stampColor = si.color;
      } else {
        out.diceFace = lr.value;
        out.stampWord = '出目';
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.stampColor = '#84919c';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '2px solid #3a7ba8' : '1px solid rgba(58,123,168,.3)',
          color: sel ? '#3a7ba8' : '#84919c',
          bg: sel ? 'rgba(58,123,168,.05)' : '#fff',
          weight: sel ? '600' : '400',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '+' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #3a7ba8' : '1px solid rgba(58,123,168,.3)',
          color: sel ? '#3a7ba8' : '#84919c',
          bg: sel ? 'rgba(58,123,168,.05)' : '#fff',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var si = sortInfo(r);
          pushLog(st, 'ソラ ・ ' + skill.name, r.total + ' ／ ' + si.word, si.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'ソラ ・ d' + st.diceSides, v + ' ／ 出目', '#84919c');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 収集ルート ──
      out.truckLoad = st.truckLoad;
      out.duskLabel = fmtClock(st.duskSec);
      out.fuel = st.fuel;
      out.wheel = st.wheel;
      out.wheelLabel = st.wheel >= 60 ? '良' : st.wheel >= 30 ? '普通' : '不機嫌';
      out.shortRest = function () {
        app.setState({ fuel: E.clamp(st.fuel + 10, 0, 100), tai: E.clamp(st.tai + 1, 0, TAI_MAX), duskSec: E.clamp(st.duskSec - 15, 0, 999) });
      };
      out.nextStop = function () {
        app.setState({ duskSec: E.clamp(st.duskSec - 40, 0, 999), truckLoad: E.clamp(st.truckLoad + 8, 0, 100) });
      };
      out.stops = STOP_DEFS.map(function (d) {
        var v = st.stopVals[d.key];
        function adj(delta) {
          return function () {
            var vals = Object.assign({}, st.stopVals);
            vals[d.key] = E.clamp(v + delta, 0, d.max);
            app.setState({ stopVals: vals });
          };
        }
        return {
          num: d.num, title: d.title, titleColor: d.titleColor, tag: d.tag, tagColor: d.tagColor, note: d.note,
          border: d.border, bg: d.bg, numBg: d.numBg, numColor: d.numColor,
          gauge: d.gauge, value: v + d.unit, pct: Math.round((v / d.max) * 100), barColor: d.barColor,
          hasBtns: true, dec: adj(-d.step), inc: adj(d.step),
        };
      });

      // ── 荷台マニフェスト ──
      out.ringPending = st.items.ringStatus === 'pending';
      out.battery = st.items.battery;
      out.ringColor = st.items.ringStatus === 'pending' ? '#84919c' : '#3a7ba8';
      out.ringNote = st.items.ringStatus === 'pending'
        ? '照会前。照会端末にかざせば持ち主がわかるかもしれない。'
        : '照会結果：持ち主「該当者なし」。——つまり、渡すはずだった人がまだどこかに。';
      out.lookupRing = function () {
        if (st.items.ringStatus !== 'pending' || st.items.battery <= 0) return;
        var items = Object.assign({}, st.items);
        items.ringStatus = 'done';
        items.battery -= 1;
        app.setState({ items: items });
      };

      // ── 収集記録 ──
      var node = NODES[st.storyNode] || NODES.m1;
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
        ? '収集記録 提出完了 ・ 結'
        : '収集記録 ' + node.pct + '% ・ 日没まで ' + fmtClock(st.duskSec) + ' ・ 心の積載 ' + st.kokoro + '/10';
      out.storyCanRestart = st.storyNode !== 'm1';
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
            pushLog(st, 'ソラ ・ ' + c.check.name + '（収集記録）', r.total + ' ／ ' + (r.ok ? '成功' : '失敗'), r.ok ? '#2f8a5c' : '#c65448');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          var taiNow = 'tai' in patch ? patch.tai : st.tai;
          var kokoroNow = 'kokoro' in patch ? patch.kokoro : st.kokoro;
          if (taiNow <= 0 && !nextNode.end) {
            target = 'E_collapse';
            applyFx(st, NODES.E_collapse.fx, patch);
          } else if (kokoroNow >= KOKORO_MAX && !nextNode.end) {
            target = 'E_overload';
            applyFx(st, NODES.E_overload.fx, patch);
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

      // ── 事業課端末 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '2px solid #3a7ba8' : '1px solid rgba(58,123,168,.3)',
          bg: active ? 'rgba(58,123,168,.04)' : '#fff',
          color: active ? '#2c3440' : '#84919c',
          weight: active ? '700' : '400',
        };
      });
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '事業課端末 ・ 収集ハプニング表', d + ' ／ ' + text, '#3a7ba8');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
