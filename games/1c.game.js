/*
 * 1c-深宴 のゲーム内容。
 * - 鑑定: d4〜d100。d20 判定は星評価（三つ星／二つ星／一つ星／星なし・粗相）
 * - 給仕人記録: 気力 / 品位 / 常心(0-100) の増減（進行表・給仕の書と共有）
 * - 進行表: 巡トラッカー（給仕は気力、賓客「深き沖の伯爵」は御満悦度ゲージ）
 * - 食材庫: 貝殻硬貨・数量の実データ化。深海塩は「使う」で常心+5
 * - 給仕の書: 分岐シナリオ「御客人、匙を置く」（常心ルール・複数エンディング）
 *   GM 秘匿（伯爵＝先代店主が三十年前に還さなかった客）を"名物＝お帰りの一皿"として回収する
 * - 厨長: 場面切替・御機嫌の傾き・まかない事故表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var KI_MAX = 13, HIN_MAX = 9, JO_MAX = 100;

  var SKILLS = [
    { name: '配膳', mod: 7 },
    { name: '味見', mod: 6 },
    { name: '接客話術', mod: 5 },
    { name: '悲鳴を殺す', mod: 3 },
    { name: '香りを聞く', mod: 4 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  // 0〜199 を漢数字に（鑑定の口上用）
  var KD = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  function kanjiNum(n) {
    if (n >= 100) return '百' + (n % 100 ? kanjiNum(n % 100) : '');
    if (n >= 10) {
      var t = Math.floor(n / 10), o = n % 10;
      return (t > 1 ? KD[t] : '') + '十' + (o ? KD[o] : '');
    }
    return KD[n] || String(n);
  }

  // 星評価: 出目20=三つ星 / 出目1=星なし・粗相 / 基準+8=三つ星 / +4=二つ星 / 達成=一つ星
  function starRank(r) {
    if (r.outcome === 'fumble') return { t: '星なし ・ 粗相', s: '星なし・粗相', ok: false, color: '#b25464' };
    if (r.outcome === 'crit' || r.total >= r.dc + 8) return { t: '三つ星', s: '三つ星', ok: true, color: '#e8c876' };
    if (r.total >= r.dc + 4) return { t: '二つ星', s: '二つ星', ok: true, color: '#4fd8c9' };
    if (r.ok) return { t: '一つ星', s: '一つ星', ok: true, color: '#4fd8c9' };
    return { t: '星なし', s: '星なし', ok: false, color: '#b25464' };
  }

  var ITEM_DEFS = [
    { k: 'salt', name: '深海塩', dot: '#cda44e', salt: true },
    { k: 'gall', name: '発光する胆', dot: '#4fd8c9' },
    { k: 'cream', name: '影の泡立てクリーム', dot: '#46618a' },
    { k: 'ledger', name: '客人台帳', dot: '#b25464' },
    { k: 'bell', name: '割れた呼び鈴', dot: '#8b93a0' },
    { k: 'meifuda', name: '深海の名札', dot: '#4fd8c9', hidden0: true },
  ];

  var TOKEN_HUMAN = "width:30px;height:30px;flex:none;border-radius:50%;border:2px solid #cda44e;background:repeating-linear-gradient(45deg,rgba(205,164,78,.16) 0 4px,transparent 4px 8px),rgba(20,26,34,.6);";
  var TOKEN_GUEST = "width:30px;height:30px;flex:none;border-radius:50%;background:radial-gradient(circle at 35% 30%,#4fd8c9,#0f1620 75%);box-shadow:0 0 10px rgba(79,216,201,.5);";

  var COMBATANTS = [
    { key: 'kiHaru', name: '遥', init: 18, max: KI_MAX, gauge: '気力', guest: false, deadTag: '失神', tags: [{ t: '捧げ持ち', bg: 'rgba(31,109,104,.18)', color: '#4fd8c9' }] },
    { key: 'manetsu', name: '深き沖の伯爵', init: 16, max: 40, gauge: '御満悦度', guest: true, deadTag: '御立腹', tags: [{ t: '値踏み中', bg: 'rgba(205,164,78,.14)', color: '#cda44e' }] },
    { key: 'kiAibara', name: '藍原', init: 14, max: 20, gauge: '気力', guest: false, deadTag: '失神', tags: [] },
    { key: 'kiKurose', name: '黒瀬', init: 9, max: 15, gauge: '気力', guest: false, deadTag: '失神', tags: [{ t: '冷や汗', bg: 'rgba(178,84,100,.16)', color: '#b25464' }] },
  ];

  var GM_TABLE = ['皿が割れる', '皿が割れる', '灯りが落ちる', '御客人が席を立つ', '香りが変わる', '予約外の客が来る'];
  var GM_SCENES = ['御客人の応対', '氷室の秘密', '奥座敷の主'];

  // ─────────────────────────────────────────────
  // シナリオ「御客人、匙を置く」（給仕の書 第参夜・伍から）
  // fx: ki / hin(品位) / jo(常心) / shells(貝殻硬貨) / items / flags / kiSet / joSet
  // ─────────────────────────────────────────────
  var NODES = {
    c1: {
      kicker: '給仕の書 ・ 第参夜 ・ 伍', title: '御客人、匙を置く', pct: 71,
      text: [
        '匙が皿に触れる音だけが、やけに大きく響いた。深き沖の伯爵は、顔と呼べるものを持たない。ただ皿の湯気を、長い触手の先でそっと撫でるように味わっている。遥は盆を抱えたまま、瞬きの回数を数えて気を保っていた。',
        '支配人が耳元で囁く。「本日の名物は、まだ出していない」藍原の手が、微かに震えるワイングラスを支えた。伯爵の触手が一本、すっと持ち上がる——匙の代わりに、遥の名札へ向かって。',
        { q: '客の名を呼ばれた給仕は、厨房に戻ってはならない。' },
        '厨房の奥で、氷室の扉が独りでに軋んだ。三つの"触れるな"のうち、ひとつの気配が消えている。',
      ],
      choices: [
        { pre: '伯爵の触手の意味を、', skillText: '舌識', post: ' で読み解く', check: { name: '舌識', mod: 2, dc: 15 }, success: 'c2a', fail: 'c2b' },
        { pre: '震える手のまま、次の皿を ', skillText: '配膳', post: ' する', check: { name: '配膳', mod: 7, dc: 13 }, success: 'c2c', fail: 'c2d' },
        { pre: '支配人に、名物の中身を問う', to: 'c2e' },
      ],
    },
    c2a: {
      kicker: '給仕の書 ・ 第参夜 ・ 陸', title: '触手の言い分', pct: 74, fx: { flags: { tentacleRead: 1 } },
      text: [
        '触手は威嚇ではない。湯気を読むのと同じ動きで、名札の文字を「味わって」いる。——選んでいるのだ。最後の一皿を、運ばせる給仕を。',
        'そして遥の鼻が、もうひとつの事実を拾った。氷室の方から漂う、三十年物の潮の香り。あれは食材ではない。「時間」の匂いだ。',
      ],
      choices: [
        { pre: '客人台帳の最後の頁を検める', to: 'c3' },
        { pre: '氷室へ確認に走る', to: 'c3ice' },
      ],
    },
    c2b: {
      kicker: '給仕の書 ・ 第参夜 ・ 陸', title: '読めない味', pct: 73, fx: { jo: -3 },
      text: [
        '読めない。湯気の向こうの意図は、深すぎて舌が届かない。触手は名札を、こつ、こつ、と二度叩いた。それが「催促」であることだけは、給仕の本能で分かった。（常心 −3）',
      ],
      choices: [
        { pre: '客人台帳の最後の頁を検める', to: 'c3' },
        { pre: '氷室へ確認に走る', to: 'c3ice' },
      ],
    },
    c2c: {
      kicker: '給仕の書 ・ 第参夜 ・ 陸', title: '完璧な一皿', pct: 74, fx: { flags: { calmServe: 1 } },
      text: [
        '盆の上の胆力——手だけは、震えなかった。皿は音もなく卓に降り、ソースの円は一滴も乱れていない。伯爵の触手が、初めて名札から離れ、皿の縁を一周した。満足の仕草だ、と藍原が目で言う。',
        '稼いだ時間で、調べられる。',
      ],
      choices: [
        { pre: '客人台帳の最後の頁を検める', to: 'c3' },
        { pre: '氷室へ確認に走る', to: 'c3ice' },
      ],
    },
    c2d: {
      kicker: '給仕の書 ・ 第参夜 ・ 陸', title: '皿の縁、一滴', pct: 73, fx: { ki: -2, jo: -2 },
      text: [
        '指先が、ほんの一瞬遅れた。皿は割れなかったが、ソースが一滴、卓布に落ちた。伯爵の触手がぴたりと止まり、店の水圧が一段、重くなった気がした。（気力 −2 ・ 常心 −2）',
        '支配人の視線が言っている。「次はない」',
      ],
      choices: [
        { pre: '客人台帳の最後の頁を検める', to: 'c3' },
        { pre: '氷室へ確認に走る', to: 'c3ice' },
      ],
    },
    c2e: {
      kicker: '給仕の書 ・ 第参夜 ・ 陸', title: '支配人の白状', pct: 74, fx: { flags: { askedManager: 1 } },
      text: [
        '黒瀬は長い沈黙のあと、蝶ネクタイを緩めた。「知らん。名物のレシピは先代しか知らん。ただ——」声がさらに低くなる。「台帳の最後の頁。誰の字でもないあれが、そうじゃないかと、わしは睨んでおる」',
      ],
      choices: [
        { pre: '客人台帳の最後の頁を検める', to: 'c3' },
        { pre: '氷室へ確認に走る', to: 'c3ice' },
      ],
    },
    c3: {
      kicker: '給仕の書 ・ 第参夜 ・ 漆', title: '誰の字でもない頁', pct: 79,
      text: [
        '台帳の最後の頁は、濡れてもいないのに滲んでいた。文字は水面の墨のように揺れ、読もうとすると泳いで逃げる。',
        '藍原が横から囁く。「香りで読みなさい。あなたの舌識なら、文字の"出汁"が取れるはず」',
      ],
      choices: [
        { pre: '頁の文字を ', skillText: '舌識', post: ' で読み解く', check: { name: '舌識', mod: 2, dc: 13 }, success: 'c3a', fail: 'c3b' },
      ],
    },
    c3a: {
      kicker: '給仕の書 ・ 第参夜 ・ 漆', title: 'お帰りの一皿', pct: 84, fx: { flags: { knowRecipe: 1, knowDebt: 1 } },
      text: [
        '文字は、香りごと流れ込んできた。——三十年前。閉店の晩。観測者様に「お帰りの一皿」を供さぬまま、先代は店を畳んだ。帰り道を失った御客人は、以来ずっと、海の底で最後の皿を待っている。',
        '作法も記されていた。銀のクローシュで覆うこと。名を呼ばぬこと。そして皿の芯には——氷室の「還りの真珠」を。',
      ],
      choices: [{ pre: '氷室へ、真珠を取りに走る', to: 'c3ice' }],
    },
    c3b: {
      kicker: '給仕の書 ・ 第参夜 ・ 漆', title: '一行だけ', pct: 81, fx: { jo: -2, flags: { knowDebt: 1 } },
      text: [
        '読めたのは、頁の隅の一行だけだった。「お帰りの一皿、未提供」。それだけで、この店が三十年抱えてきた借りの重さは分かった。読んでいる間じゅう、頁の向こうから視線を感じていた。（常心 −2）',
      ],
      choices: [{ pre: '氷室へ確認に走る', to: 'c3ice' }],
    },
    c3ice: {
      kicker: '給仕の書 ・ 第参夜 ・ 捌', title: '氷室', pct: 86,
      text: [
        '氷室の扉は、半分開いていた。三つの"触れるな"のうち、ふたつはまだ棚の上で静かに呼吸している。三つ目——小さな絹の座布団の上が、空だ。',
        '床に、濡れた細い跡がひとすじ。ホールへ向かっている。',
      ],
      choices: [
        { pre: '跡を追い、', skillText: '度胸', post: ' で踏み込む', check: { name: '度胸', mod: -1, dc: 12 }, success: 'c3ice_a', fail: 'c3ice_b' },
      ],
    },
    c3ice_a: {
      kicker: '給仕の書 ・ 第参夜 ・ 捌', title: '転がる真珠', pct: 89, fx: { flags: { pearlMoving: 1 } },
      text: [
        '白い息を殺して跡を辿ると、それはいた。鶏卵ほどの真珠が、ひとりでに、ころり、ころりと絨毯の上を転がっていく。目指す先は迷いなく——伯爵の卓だ。',
        '真珠は知っているのだ。自分が誰の皿に載るべきかを。三十年、氷室で待っていたのは御客人だけではなかった。',
      ],
      choices: [{ pre: '真珠とともに、ホールへ戻る', to: 'c4' }],
    },
    c3ice_b: {
      kicker: '給仕の書 ・ 第参夜 ・ 捌', title: '氷の棘', pct: 88, fx: { jo: -3, flags: { pearlMoving: 1 } },
      text: [
        '冷気が、悲鳴の形をして肺に刺さった。棚の上のふたつの"触れるな"が、一斉にこちらを「見た」気がして、遥は氷室を転がり出る。（常心 −3）',
        '廊下の先、ホールの入口を、小さな白いものが、ころりと横切った。',
      ],
      choices: [{ pre: '白いものを追って、ホールへ戻る', to: 'c4' }],
    },
    c4: {
      kicker: '給仕の書 ・ 第参夜 ・ 玖', title: '皿の上の月', pct: 92,
      text: [
        '真珠は、伯爵の卓の手前でぴたりと止まった。店内のすべての音が、水を打ったように消える。藍原がグラスを置き、黒瀬が背筋を伸ばし、焼き場の司さえ火を細めた。',
        '伯爵の触手が、静かに、皿の空白を指している。——供せよ、と。',
      ],
      choices: [
        { pre: '「お帰りの一皿」を正式の ', skillText: '作法', post: ' で供する', check: { name: '所作', mod: 3, dc: function (st) { return st.flags.calmServe ? 13 : 14; } }, success: 'c5true', fail: 'c6angry', if: function (st) { return st.flags.knowRecipe; } },
        { pre: '作法を知らぬまま、見様見真似で ', skillText: '供する', check: { name: '度胸', mod: -1, dc: 14 }, success: 'c5half', fail: 'c6angry', if: function (st) { return !st.flags.knowRecipe; } },
        { pre: '司の炎で、真珠ごと追い払う', to: 'c6expel' },
      ],
    },
    c5true: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾', title: 'お帰りの一皿', pct: 96,
      text: [
        '銀のクローシュが持ち上がる。湯気の中で、真珠がゆっくりとほどけ——皿の上に、下り階段が現れた。光でできた、深淵の間へ続く階段が。',
        '伯爵が立ち上がる。三十年ぶりに、匙を置くためではなく、席を立つために。その触手が最後にもう一度、遥の名札を指した。今度は分かる。あれは「名を教えてくれ」という、御客人の礼儀だ。',
      ],
      choices: [
        { pre: '作法の通り、名乗らずに深く一礼する', to: 'E_true' },
        { pre: '作法を破り、名乗って見送る', to: 'E_follow' },
      ],
    },
    c5half: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾', title: '見様見真似', pct: 94,
      text: [
        '見様見真似の給仕は、われながら不格好だった。クローシュは銀ではなく厨房の鍋蓋で、口上も知らない。それでも真珠を皿の真ん中に置き、両手で——大切なものとして、捧げた。',
        '伯爵は、長いこと動かなかった。やがて触手が一本、震えるように持ち上がる。',
      ],
      choices: [{ pre: '息を呑んで、御言葉を待つ', to: 'c6talk' }],
    },
    c6talk: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾', title: '水圧の声', pct: 94,
      text: [
        '声にならぬ声が、水圧のように店を満たした。「サホウハ、チガウ。ダガ、ココロザシハ、ウケトル」',
        'そして問いがひとつ、泡のように浮かぶ。「ワタシガ、ナニヲ、マッテイタカ。シッテイルカ」',
      ],
      choices: [
        { pre: '「三十年、お待たせいたしました」と頭を下げる', to: 'E_apology', if: function (st) { return st.flags.knowDebt; } },
        { pre: '答えられず、ただ皿を差し出す', to: 'E_unsated' },
      ],
    },
    c6angry: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾', title: '傾く御機嫌', pct: 93, fx: { jo: -3 },
      text: [
        '触手が、ざわりと膨らんだ。卓の上の客用ナプキンが、吸い込んだ緊張で風船のように張り詰めていく——結界が、満ちかけている。（常心 −3）',
        '黒瀬が押し殺した声で言う。「破れたら、店ごと持っていかれるぞ」',
      ],
      choices: [
        { pre: '新しいナプキンに ', skillText: '所作', post: ' で取り替える', check: { name: '所作', mod: 3, dc: 13 }, success: 'c6calm', fail: 'c6burst' },
        { pre: '作法をやり直す', skillText: '', check: { name: '所作', mod: 3, dc: 15 }, success: 'c5true', fail: 'c6burst', if: function (st) { return st.flags.knowRecipe; } },
        { pre: '司の炎で追い払う', to: 'c6expel' },
      ],
    },
    c6calm: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾', title: '取り替えの礼', pct: 94,
      text: [
        '張り詰めたナプキンを、四つ折りの新品と、流れるような所作で取り替える。緊張の器が空になり、店の水圧がすっと軽くなった。伯爵の触手が、感心したように皿の縁を一周する。',
      ],
      choices: [
        { pre: '改めて「お帰りの一皿」を供する', to: 'c5true', if: function (st) { return st.flags.knowRecipe; } },
        { pre: '心を込めて、見様見真似で供する', to: 'c5half', if: function (st) { return !st.flags.knowRecipe; } },
      ],
    },
    c6burst: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾壱', title: '破れた結界', pct: 96, fx: { ki: -4, jo: -4 },
      text: [
        '乾いた音を立てて、ナプキンが弾けた。吸い込まれていた店中の緊張が一斉に解き放たれ、グラスが鳴き、灯りが明滅する。伯爵が、席を立った——満悦のためではなく。（気力 −4 ・ 常心 −4）',
      ],
      choices: [
        { pre: '悲鳴を殺し、最後の一礼を尽くす ', skillText: '悲鳴を殺す', check: { name: '悲鳴を殺す', mod: 3, dc: 14 }, success: 'c6talk', fail: 'E_ruin' },
        { pre: '盆を抱えて、逃げる', to: 'E_flee' },
      ],
    },
    c6expel: {
      kicker: '給仕の書 ・ 第参夜 ・ 拾壱', title: '焼き場の炎', pct: 95,
      text: [
        '司が無言で火搔き棒を握った。焼き場の炎が膨れ上がり、深海に慣れた御客人の輪郭が、初めて怯むように揺れる。「本気か」と黒瀬。本気だ。だがこれは、給仕の道を外れる一手でもある。',
      ],
      choices: [
        { pre: '炎を掲げ、', skillText: '度胸', post: ' で追い払う', check: { name: '度胸', mod: -1, dc: 14 }, success: 'E_expel', fail: 'c6burst' },
        { pre: '思いとどまり、皿に向き直る', to: 'c4' },
      ],
    },
    E_true: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '三十年目のごちそうさま', pct: 100, end: true, fx: { shells: 300, jo: 6 },
      text: [
        '伯爵は光の階段を、一段ずつ、味わうように降りていった。最後の触手が水面下に消える刹那、店中の灯りがいっせいに瞬いた——拍手のように。卓には畳まれたナプキンと、貝殻硬貨の山。三百枚。三十年分の心付けだった。',
        '厨房の壁の、先代の写真。その口元が、今夜だけ少し緩んで見える。（真結 ・ 貝殻硬貨 ＋300 ・ 常心 ＋6）',
      ],
      choices: [],
    },
    E_follow: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '名乗った給仕', pct: 100, end: true, fx: { items: { meifuda: 1 }, jo: -2, shells: 100 },
      text: [
        '「桐生遥です。またのお越しを」——作法を破った名乗りに、店の空気が凍った。伯爵は長いこと遥を見て、それから触手で、そっと新しい名札を差し出した。深海色の、店のものではない名札を。',
        '年に一度、深淵の間で開かれる晩餐で給仕をすること。それが名を教えた者の契約だという。黒瀬は頭を抱えたが、藍原は笑った。「出張手当、出ますよ」（獲得：深海の名札 ・ 貝殻硬貨 ＋100 ・ 常心 −2）',
      ],
      choices: [],
    },
    E_apology: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '詫びの一皿', pct: 100, end: true, fx: { shells: 120, jo: 4 },
      text: [
        '三十年、と口にした瞬間、伯爵の輪郭から力が抜けた。「マッタ。タシカニ、マッタ」御客人は皿を——正式ではない、心づくしの一皿を、ゆっくりと味わい、静かに席を立った。',
        '海へ帰る道すがら、卓に貝殻硬貨が百二十枚。「詫びを受け取る。皿は、また来年」。宿題は残ったが、借りの利子は、確かに減った。（貝殻硬貨 ＋120 ・ 常心 ＋4）',
      ],
      choices: [],
    },
    E_unsated: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '匙は置かれたまま', pct: 100, end: true,
      text: [
        '答えられなかった。伯爵は静かに匙を卓に置き——今夜二度目、そして最後の「匙を置く」だった——音もなく席を立った。会計は済んでいた。過不足なく、心付けはなく。',
        '来年もまた、予約は入るだろう。名前欄にはただ「観測者」とだけ。給仕の書、第参夜はここで終わる。宿題を残したまま。',
      ],
      choices: [],
    },
    E_expel: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '炎の閉店', pct: 100, end: true, fx: { hin: -2, jo: -3 },
      text: [
        '炎に炙られた御客人は、怒りとも嘆きともつかぬ水音を残して、海へ退いた。店は守られた。皿は、供されなかった。',
        'その夜から、店の看板が潮に錆び始めた。先代の借りは、利子ごと残っている。黒瀬は誰にともなく呟いた。「給仕が客を追うたら、しまいや」（品位 −2 ・ 常心 −3）',
      ],
      choices: [],
    },
    E_ruin: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '水没半分', pct: 100, end: true, fx: { shells: -100, jo: -5 },
      text: [
        '御客人が「席を立った」だけで、特別室の壁は三枚裂け、海水が膝まで満ちた。伯爵は満たされぬまま深みへ帰り、店は一月の休業を貼り出した。',
        '修繕費、貝殻硬貨にして百枚。それより痛いのは、台帳の最後の頁が——白紙に戻っていたことだ。（貝殻硬貨 −100 ・ 常心 −5）',
      ],
      choices: [],
    },
    E_flee: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '落とした盆', pct: 100, end: true, fx: { hin: -1, jo: -5 },
      text: [
        '厨房まで、あと三歩だった。盆が、遥の腕から滑り落ちた。就業三月、初めて落とした盆の音を、彼女は一生忘れないだろう。振り返った特別室に、御客人の姿はもうなかった。',
        '翌朝、卓の上には畳んだナプキンが一枚。中に、小さな匙がひとつ、包まれていた。意味は、誰にも分からない。（品位 −1 ・ 常心 −5）',
      ],
      choices: [],
    },
    E_faint: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '給仕、倒れる', pct: 100, end: true, fx: { kiSet: 1 },
      text: [
        '膝から力が抜け、世界が回った——盆だけは、最後まで水平だったという。目覚めたのは更衣室の長椅子で、店はすでに閉まっていた。',
        '「御客人はお帰りになった。心配するな」と黒瀬は言ったが、どうやって帰ったのかは教えてくれなかった。特別室の卓には、匙が一本、綺麗に磨かれて置いてあった。（気力 1 で目覚める）',
      ],
      choices: [],
    },
    E_broken: {
      kicker: '給仕の書 ・ 第参夜 ・ 結', title: '悲鳴', pct: 100, end: true, fx: { joSet: 10 },
      text: [
        '悲鳴が、出た。三月間飲み込み続けた悲鳴が、店のシャンデリアを一斉に消した。灯りが戻ったとき、伯爵の席は空で、卓の上には手つかずの皿だけが残っていた。',
        '遥は一週間の休みをもらった。復帰の日、ロッカーに新しい名札が入っていた。裏に小さく、誰の字でもない字で「マタ、キク」。（常心 10 まで回復して復帰）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '給仕の書を、最初の頁から読み直す', restart: true },
    { pre: '献立の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 4, diceDc: 15,
      lastRoll: { kind: 'check', die: 16, mod: 4, total: 20, dc: 15, outcome: 'success', skillName: '香りを聞く' },
      rollLog: [
        { left: '遥 ・ 香を聞く', right: '20 ／ 二つ星', color: '#4fd8c9' },
        { left: '藍原 ・ 話術', right: '24 ／ 三つ星', color: '#e8c876' },
        { left: '黒瀬 ・ 度胸', right: '6 ／ 星なし・粗相', color: '#b25464' },
      ],
      kiHaru: 8, hin: 5, jo: 63, manetsu: 22, kiAibara: 19, kiKurose: 10,
      jun: 2, turnIdx: 0,
      shells: 214,
      items: { salt: 2, gall: 1, cream: 4, ledger: 1, bell: 1, meifuda: 0 },
      flags: {},
      storyNode: 'c1', storyNote: null, storyNoteColor: '#8b93a0',
      gmScene: 0, kigen: 60, gmTable: null,
    };
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.ki) patch.kiHaru = eng().clamp(get('kiHaru') + fx.ki, 0, KI_MAX);
    if (fx.kiSet != null) patch.kiHaru = fx.kiSet;
    if (fx.hin) patch.hin = eng().clamp(get('hin') + fx.hin, 0, HIN_MAX);
    if (fx.jo) patch.jo = eng().clamp(get('jo') + fx.jo, 0, JO_MAX);
    if (fx.joSet != null) patch.jo = fx.joSet;
    if (fx.shells) patch.shells = Math.max(0, get('shells') + fx.shells);
    if (fx.items) {
      var items = Object.assign({}, get('items'));
      for (var k in fx.items) items[k] = Math.max(0, (items[k] || 0) + fx.items[k]);
      patch.items = items;
    }
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1c',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'kiHaru', 'hin', 'jo', 'manetsu', 'kiAibara', 'kiKurose', 'jun', 'turnIdx',
      'shells', 'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'kigen', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'c1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 献立 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 給仕人記録 ──
      out.ki = st.kiHaru;
      out.kiPct = Math.round((st.kiHaru / KI_MAX) * 100);
      out.hin = st.hin;
      out.hinPct = Math.round((st.hin / HIN_MAX) * 100);
      out.jo = st.jo;
      out.kiUp = function () { app.setState({ kiHaru: E.clamp(st.kiHaru + 1, 0, KI_MAX) }); };
      out.kiDown = function () { app.setState({ kiHaru: E.clamp(st.kiHaru - 1, 0, KI_MAX) }); };
      out.hinUp = function () { app.setState({ hin: E.clamp(st.hin + 1, 0, HIN_MAX) }); };
      out.hinDown = function () { app.setState({ hin: E.clamp(st.hin - 1, 0, HIN_MAX) }); };
      out.joUp = function () { app.setState({ jo: E.clamp(st.jo + 1, 0, JO_MAX) }); };
      out.joDown = function () { app.setState({ jo: E.clamp(st.jo - 1, 0, JO_MAX) }); };

      // ── 鑑定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? skill.name + 'の鑑定 ・ 評価基準 ' + st.diceDc : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.diceFormula = 'まだ匙は投げていない'; out.diceVerdict = ''; out.diceVerdictColor = '#8b93a0';
      } else if (lr.kind === 'check') {
        var rank = starRank(lr);
        out.diceFace = lr.die;
        out.diceFormula = kanjiNum(lr.die) + ' ＋ 修正 ' + lr.mod;
        out.diceVerdict = '＝ ' + kanjiNum(lr.total) + ' ・ ' + rank.t;
        out.diceVerdictColor = rank.color;
      } else {
        out.diceFace = lr.value;
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + kanjiNum(lr.value);
        out.diceVerdictColor = '#8b93a0';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '1px solid #cda44e' : '1px solid rgba(205,164,78,.24)',
          color: sel ? '#ece4d0' : '#8b93a0',
          bg: sel ? 'rgba(205,164,78,.14)' : 'transparent',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '＋' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #cda44e' : '1px solid rgba(205,164,78,.24)',
          color: sel ? '#ece4d0' : '#8b93a0',
          bg: sel ? 'rgba(205,164,78,.14)' : 'transparent',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var rank = starRank(r);
          pushLog(st, '遥 ・ ' + skill.name, r.total + ' ／ ' + rank.s, rank.color);
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, ok: r.ok, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, '遥 ・ d' + st.diceSides, v + ' ／ 出目', '#8b93a0');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 進行表 ──
      out.junTitle = '本日の卓 ・ ' + kanjiNum(st.jun) + '巡目';
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
        if (next <= st.turnIdx) patch.jun = st.jun + 1;
        app.setState(patch);
      };
      out.nextRound = function () {
        var first = st[COMBATANTS[0].key] > 0 ? 0 : aliveIdx(0);
        app.setState({ jun: st.jun + 1, turnIdx: first });
      };
      out.combatants = COMBATANTS.map(function (c, i) {
        var hp = st[c.key];
        var dead = hp <= 0;
        var active = i === st.turnIdx && !dead;
        var tags = dead
          ? [{ t: c.deadTag, bg: 'rgba(178,84,100,.16)', color: '#b25464' }]
          : c.tags;
        function adj(d) {
          return function () {
            var patch = {};
            patch[c.key] = E.clamp(hp + d, 0, c.max);
            app.setState(patch);
          };
        }
        return {
          name: c.name, init: c.init, hp: hp, max: c.max, gauge: c.gauge,
          pct: Math.round((hp / c.max) * 100),
          side: active ? '行動中' : c.guest ? '賓客' : '',
          border: active ? '1px solid #cda44e' : c.guest ? '1px solid rgba(79,216,201,.3)' : '1px solid rgba(205,164,78,.18)',
          bg: active ? 'linear-gradient(90deg,rgba(205,164,78,.14),transparent)' : c.guest ? 'rgba(79,216,201,.05)' : 'rgba(255,255,255,.03)',
          op: dead ? '.55' : '1',
          initBg: active ? '#a6813a' : 'rgba(255,255,255,.08)',
          initColor: active ? '#171008' : '#8b93a0',
          tokenStyle: c.guest ? TOKEN_GUEST : TOKEN_HUMAN,
          nameColor: c.guest ? '#4fd8c9' : '#ece4d0',
          barBg: c.guest ? 'linear-gradient(90deg,#1f6d68,#cda44e)' : 'linear-gradient(90deg,#9c4a3a,#c96a52)',
          hasTags: tags.length > 0, tags: tags,
          dmg5: adj(-5), dmg1: adj(-1), heal1: adj(1), heal5: adj(5),
        };
      });

      // ── 食材庫 ──
      out.shells = st.shells;
      out.bagItems = ITEM_DEFS.filter(function (d) {
        return !(d.hidden0 && (st.items[d.k] || 0) <= 0);
      }).map(function (d) {
        var qty = st.items[d.k] || 0;
        return {
          name: d.name, dot: d.dot, qty: qty,
          op: qty > 0 ? '1' : '.45',
          usable: !!d.salt && qty > 0 && st.jo < JO_MAX,
          use: function () {
            var items = Object.assign({}, st.items);
            items[d.k] = qty - 1;
            pushLog(st, '遥 ・ 深海塩', '常心 ＋5', '#4fd8c9');
            app.setState({ items: items, jo: E.clamp(st.jo + 5, 0, JO_MAX), rollLog: st.rollLog });
          },
        };
      });

      // ── 給仕の書 ──
      var node = NODES[st.storyNode] || NODES.c1;
      out.storyKicker = node.kicker;
      out.storyTitle = node.title;
      var lead = node.text[0];
      out.storyLead = lead.charAt(0);
      out.storyLeadRest = lead.slice(1);
      out.storyBlocks = node.text.slice(1).map(function (b) {
        return typeof b === 'string' ? { isP: true, isQ: false, t: b } : { isP: false, isQ: true, t: b.q };
      });
      out.storyHasNote = !!st.storyNote;
      out.storyNote = st.storyNote || '';
      out.storyNoteColor = st.storyNoteColor || '#8b93a0';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end ? '第参夜 ・ 完売御礼' : '第参夜 ・ ' + node.pct + '% 供出済み';
      out.storyCanRestart = st.storyNode !== 'c1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#8b93a0' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            var rank = starRank(r);
            patch.storyNote = c.check.name + 'の鑑定 — 骰〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 基準' + dc + ' ・ ' + rank.s;
            patch.storyNoteColor = rank.color;
            pushLog(st, '遥 ・ ' + c.check.name + '（給仕の書）', r.total + ' ／ ' + rank.s, rank.color);
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          // 気力が尽きたら「給仕、倒れる」、常心が尽きたら「悲鳴」へ
          var kiNow = 'kiHaru' in patch ? patch.kiHaru : st.kiHaru;
          var joNow = 'jo' in patch ? patch.jo : st.jo;
          if (kiNow <= 0 && !nextNode.end) {
            target = 'E_faint';
            applyFx(st, NODES.E_faint.fx, patch);
          } else if (joNow <= 0 && !nextNode.end) {
            target = 'E_broken';
            applyFx(st, NODES.E_broken.fx, patch);
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
          pre: c.pre, skillText: c.skillText || '', post: c.post || '',
          dcLabel: dc != null ? '基準' + dc : '',
          go: c.restart ? function () { app._resetGame(); }
            : c.top ? function () { app.setState({ screen: 'top' }); }
            : choose(c),
        };
      });

      // ── 厨長 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '1px solid #cda44e' : '1px solid rgba(205,164,78,.22)',
          bg: active ? 'linear-gradient(90deg,rgba(205,164,78,.14),transparent)' : 'rgba(255,255,255,.03)',
          color: active ? '#ece4d0' : '#8b93a0',
        };
      });
      out.kigen = st.kigen;
      out.kigenMinus = function () { app.setState({ kigen: E.clamp(st.kigen - 5, 0, 100) }); };
      out.kigenPlus = function () { app.setState({ kigen: E.clamp(st.kigen + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '厨長 ・ まかない事故表', d + ' ／ ' + text, '#e8c876');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
