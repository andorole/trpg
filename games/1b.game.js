/*
 * 1b-和風伝奇 のゲーム内容。
 * - 卜定: d6/d10/d20/d100 に加え「六道」（d6 で地獄道〜天道）。技能つき d20 判定・帳面の記録
 * - 調書: 気力 / 霊力 / 正気(0-100) の増減（対峙・怪異録と共有）
 * - 対峙: 刻トラッカー（気力 / 影喰いは瘴気ゲージ。0 で昏倒 / 調伏）
 * - 道具: 銭（貫・文）・数量の実データ化。清めの塩は「使う」で正気+4
 * - 怪異録: 分岐シナリオ「沼の底の、もうひとり」（正気度ルール・複数エンディング）
 *   GM 秘匿（影喰い＝水死した村の娘 / 鏡の理＝割れば影は戻るが代償）を真相として回収する
 * - 差配: 場面切替・穢れの満ち・乱表 d6
 */
(function () {
  var E = null;
  function eng() { return E || (E = window.GameEngine); }

  var KI_MAX = 14, REI_MAX = 10, SAN_MAX = 100;

  var SKILLS = [
    { name: '民俗学', mod: 8 },
    { name: '目星', mod: 6 },
    { name: '聞き込み', mod: 5 },
    { name: '呪術', mod: 4 },
    { name: '胆力', mod: 0 },
  ];
  // 六道（d6）: 1=地獄 … 6=天
  var ROKUDO = ['地獄道', '餓鬼道', '畜生道', '修羅道', '人道', '天道'];
  var DICE_DEFS = [
    { label: 'd6', sides: 6 },
    { label: 'd10', sides: 10 },
    { label: 'd20', sides: 20 },
    { label: 'd100', sides: 100 },
    { label: '六道', sides: 'rokudo' },
  ];

  var KANJI = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
  function kanjiNum(n) { return KANJI[n] != null ? KANJI[n] : String(n); }
  function kanjiMoney(mon) {
    var kan = Math.floor(mon / 1000);
    var hyaku = Math.round((mon % 1000) / 100);
    if (kan <= 0) return kanjiNum(hyaku) + '百文';
    return kanjiNum(kan) + '貫' + (hyaku > 0 ? ' ' + kanjiNum(hyaku) + '百文' : '');
  }

  var ITEM_DEFS = [
    { k: 'shio', name: '清めの塩', unit: '包', dot: '#b13a2a', salt: true },
    { k: 'fuda', name: '破魔の御札', unit: '枚', dot: '#b13a2a' },
    { k: 'juzu', name: '数珠', unit: '連', dot: '#2c3c54' },
    { k: 'chomen', name: '古い帳面', unit: '冊', dot: '#211c16' },
    { k: 'kagami', name: '割れた鏡の欠片', unit: '片', dot: '#211c16' },
    { k: 'kushi', name: 'みおの櫛', unit: '本', dot: '#8f2c1f', hidden0: true },
  ];

  var COMBATANTS = [
    { key: 'kiSana', name: '紗那', init: 19, max: KI_MAX, gauge: '気力', enemy: false, deadTag: '昏倒', tags: [{ t: '守護', bg: 'rgba(44,60,84,.14)', color: '#2c3c54' }] },
    { key: 'kiKage', name: '影喰い', init: 16, max: 34, gauge: '瘴気', enemy: true, deadTag: '調伏', tags: [{ t: '半実体', bg: 'rgba(33,28,22,.12)', color: '#3f372b' }] },
    { key: 'kiJuzo', name: '柊 十三', init: 12, max: 20, gauge: '気力', enemy: false, deadTag: '昏倒', tags: [] },
    { key: 'kiGo', name: '犬飼 剛', init: 8, max: 16, gauge: '気力', enemy: false, deadTag: '昏倒', tags: [{ t: '恐怖', bg: 'rgba(177,58,42,.14)', color: '#8f2c1f' }] },
  ];

  var GM_TABLE = ['水位が上がる', '水位が上がる', '鈴が鳴る', '影が一つ消える', 'もうひとりが現れる', '鏡が割れる'];
  var GM_SCENES = ['沼の対峙', '鏡の家', '沼の主'];

  // ─────────────────────────────────────────────
  // シナリオ「沼の底の、もうひとり」（怪異 第七號・第三節から）
  // fx: ki(気力) / rei(霊力) / san(正気) / mon(銭) / items / flags / kiSet / sanSet
  // ─────────────────────────────────────────────
  var NODES = {
    s1: {
      kicker: '怪異録 第七號 ・ 三', title: '沼の底の、もうひとり', pct: 58,
      text: [
        '沼のおもては、夕日を返さなかった。紗那が屈み込むと、水の中の自分には影がない。背後で、村の子が囁く。「ゆうべ、もうひとりの母さんが、家に上がってきたの」',
        '十三が破魔の札を構える。札の墨が、見ているうちに滲んでいく。あやめは沼に向かって鈴を鳴らし——その音だけが、こだまを返さない。「ここは、もう半分あちら側」',
        { q: '鏡を覗くな。覗いた者の影が、こちらを覗き返す。' },
        '沼の縁に並ぶ、足跡。すべて村のほうへ向かっている——なのに、戻ってきた者の話は、誰からも聞かない。',
      ],
      choices: [
        { pre: '足跡を ', skillText: '目星', post: ' で検める', check: { name: '目星', mod: 6, dc: 13 }, success: 's2a', fail: 's2b' },
        { pre: 'あやめに、沼の主を ', skillText: '問う', to: 's2c' },
        { pre: '手鏡を、あえて沼へかざす', to: 's3mirror' },
      ],
    },
    s2a: {
      kicker: '怪異録 第七號 ・ 四', title: '検めの眼', pct: 62, fx: { flags: { printsChecked: 1 } },
      text: [
        '足跡はどれも裸足で、同じ大きさ。若い娘のものだ。それが幾年ぶんも、幾重にも重なって村へ向かっている。踵に力がない——「歩き方を、思い出しながら歩いている」足だ。',
        'そして一番下、最も古い層にだけ、逆向きの跡があった。小さな、子どもの足。沼へ、入っていく方の。',
      ],
      choices: [
        { pre: '古い祠を検分する', to: 's2d' },
        { pre: '村で ', skillText: '聞き込み', post: ' をする', check: { name: '聞き込み', mod: 5, dc: 12 }, success: 's2e', fail: 's2f' },
      ],
    },
    s2b: {
      kicker: '怪異録 第七號 ・ 四', title: '昏い水面', pct: 62, fx: { san: -2, flags: { printsChecked: 1 } },
      text: [
        '日が沈み切り、跡は闇に溶けた。剛が提灯を掲げるが、灯りは水面の際で、切り取られたように届かなくなる。見てはいけないものの縁を、なぞっている感触だけが残った。（正気 −2）',
      ],
      choices: [
        { pre: 'あやめに、沼の主を問う', to: 's2c', if: function (st) { return !st.flags.askedAyame; } },
        { pre: '古い祠を検分する', to: 's2d' },
      ],
    },
    s2c: {
      kicker: '怪異録 第七號 ・ 四', title: '巫女の耳', pct: 62, fx: { flags: { askedAyame: 1 } },
      text: [
        'あやめは鈴を胸に抱き、首を振った。「沼の主は、水天様じゃない。祀りが絶えたあとに棲みついた——新入りよ。鈴の音を返さないのは、音ごと喰べているから」',
        '「でもね」巫女は祠の方角を見た。「水天様の御札は、まだ生きてる。祀られていた場所なら、なおのこと」',
      ],
      choices: [
        { pre: '古い祠を検分する', to: 's2d' },
        { pre: '足跡を ', skillText: '目星', post: ' で検める', check: { name: '目星', mod: 6, dc: 13 }, success: 's2a', fail: 's2b', if: function (st) { return !st.flags.printsChecked; } },
      ],
    },
    s3mirror: {
      kicker: '怪異録 第七號 ・ 四', title: '鏡映し', pct: 64,
      text: [
        '鏡を沼へ向ける。五寸の鏡面に、夕闇の沼と、こちらを見ている「もうひとりの紗那」が映った。——現実の岸辺には、誰もいないのに。',
        '十三が短く言う。「逸らすな。逸らしたら、入れ替わるぞ」',
      ],
      choices: [
        { pre: '目を逸らさず、映るものを見届ける ', skillText: '胆力', check: { name: '胆力', mod: 0, dc: 13 }, success: 's3a', fail: 's3b' },
      ],
    },
    s3a: {
      kicker: '怪異録 第七號 ・ 四', title: '水鏡の告げ', pct: 68, fx: { flags: { sawDouble: 1 } },
      text: [
        '水鏡の中のもうひとりは、争う素振りを見せなかった。ただ、ゆっくりと沼の底を指差し、口だけを動かした。読み取れたのは、みっつの音——「な・ま・え」。',
        '名前。あれは、名を呼んでほしいのだ。',
      ],
      choices: [
        { pre: '古い祠を検分する', to: 's2d' },
        { pre: 'あやめに、沼の主を問う', to: 's2c', if: function (st) { return !st.flags.askedAyame; } },
      ],
    },
    s3b: {
      kicker: '怪異録 第七號 ・ 四', title: '手が、震えた', pct: 66, fx: { san: -4 },
      text: [
        '指が震え、鏡面が揺れた。その一瞬、もうひとりの紗那が——嗤った。鏡を取り落とさなかったのは、十三が腕を掴んだからだ。「見過ぎだ。今日はもう、鏡はしまえ」（正気 −4）',
      ],
      choices: [
        { pre: '古い祠を検分する', to: 's2d' },
        { pre: 'あやめに、沼の主を問う', to: 's2c', if: function (st) { return !st.flags.askedAyame; } },
      ],
    },
    s2e: {
      kicker: '怪異録 第七號 ・ 五', title: '村の証言', pct: 66, fx: { flags: { knowMio: 1 } },
      text: [
        '戸を叩くと、子どもらが競うように話した。「もうひとりの母さんは、鏡を見ないの」「影がないの」「夜しか来ないの」。大人たちは口を噤む——ただ一人、湯呑みを持つ手を震わせた古老を除いて。',
        '「六十年前にも、あった。……娘が沼に沈められてからだ。名は、みお。祀りの生贄よ。誰も、名を呼んでやらなんだ」',
      ],
      choices: [
        { pre: '古い祠を検分する', to: 's2d' },
        { pre: '夜の沼へ戻り、対峙する', to: 's5' },
      ],
    },
    s2f: {
      kicker: '怪異録 第七號 ・ 五', title: '閉ざされた戸', pct: 64, fx: { san: -2 },
      text: [
        '戸はどこも固く閉ざされ、灯りだけが板の隙間から漏れている。立ち去りかけたとき、その隙間から子どもの声がした。「……母さんが、ふたりいるの。どっちが本物か、わかんないの」（正気 −2）',
      ],
      choices: [
        { pre: '古い祠を検分する', to: 's2d' },
        { pre: '夜の沼へ戻り、対峙する', to: 's5' },
      ],
    },
    s2d: {
      kicker: '怪異録 第七號 ・ 五', title: '古い祠', pct: 68,
      text: [
        '祠は半里先の丘にあった。水天を祀る小さな社——注連縄は朽ち、供え物の跡に、娘物の櫛と、割れた鏡の「枠」だけが残っている。行李の欠片と、ぴたりと合う枠だ。',
        '社殿の壁に、墨の剥げた縁起書きが貼られていた。読めるか。',
      ],
      choices: [
        { pre: '縁起書きを ', skillText: '民俗学', post: ' で読み解く', check: { name: '民俗学', mod: 8, dc: 12 }, success: 's2g', fail: 's2h' },
        { pre: '読まずに、夜の沼へ戻る', to: 's5' },
      ],
    },
    s2g: {
      kicker: '怪異録 第七號 ・ 六', title: '影還しの神楽', pct: 76, fx: { flags: { knowRitual: 1, knowMio: 1 } },
      text: [
        '読めた。曰く——沼に映る影は水天への預けもの。影が還らぬときは、満月の夜、鏡を水面に「沈め」、預けた者の名を呼べ。これを影還しの神楽と云う。',
        '「割れば助かる」と古老が言っていたのは、この伝えの崩れた形だ。割るのではない。沈めて、名を呼ぶ。そして縁起の末尾、生贄の記録に、その名はあった。——みお。',
      ],
      choices: [{ pre: '夜の沼へ戻り、対峙する', to: 's5' }],
    },
    s2h: {
      kicker: '怪異録 第七號 ・ 六', title: '欠けた銘', pct: 72, fx: { san: -2, flags: { knowMio: 1 } },
      text: [
        '墨は雨に流れ、肝心の作法の段が読めない。ただ、末尾の小さな銘だけが、彫り込みで残っていた。「みお 六つ」。……六歳。奉納ではない。これは、墓標だ。（正気 −2）',
      ],
      choices: [{ pre: '夜の沼へ戻り、対峙する', to: 's5' }],
    },
    s5: {
      kicker: '怪異録 第七號 ・ 七', title: '夜の沼', pct: 84,
      text: [
        '月が沼の真上に来たとき、水面が持ち上がった。影で編まれた人のかたち——村人たちから攫った影を幾重にも纏い、それでもなお「人」になり切れない輪郭が、岸に立つ紗那を見た。',
        '「カエシテ、ジャナイ。……イレテ。ナカニ、イレテ」',
      ],
      choices: [
        { pre: '影還しの神楽を執り行う ', skillText: '呪術', check: { name: '呪術', mod: 4, dc: 13 }, success: 's6ritual', fail: 's6ritualFail', if: function (st) { return st.flags.knowRitual; } },
        { pre: '「みお」——名を呼ぶ ', skillText: '縁', check: { name: '縁', mod: 2, dc: 12 }, success: 's6name', fail: 's6angry', if: function (st) { return st.flags.knowMio && !st.flags.knowRitual; } },
        { pre: '十三と共に ', skillText: '祓う', check: { name: '呪術', mod: 4, dc: 14 }, success: 's6banish', fail: 's6hit' },
        { pre: '手鏡を、割る', to: 'E_break' },
      ],
    },
    s6ritual: {
      kicker: '怪異録 第七號 ・ 八', title: '影還しの神楽', pct: 94, fx: { rei: -3 },
      text: [
        '鈴の音が、初めてこだまを返した。あやめが舞い、紗那が印を結び、十三が四方を封じる。五寸の手鏡は月を映したまま、静かに水へ沈んでいく。（霊力 −3）',
        'あとは、名を呼ぶだけだ。',
      ],
      choices: [{ pre: '水面に向かって、その名を呼ぶ', to: 'E_ritual' }],
    },
    s6ritualFail: {
      kicker: '怪異録 第七號 ・ 八', title: '乱れた舞', pct: 88, fx: { ki: -4, san: -2, rei: -2 },
      text: [
        '印を結ぶ手が、一拍遅れた。瘴気が縄のようにうねって岸を薙ぎ、紗那は水際まで引き摺られる。（気力 −4 ・ 正気 −2）',
        '「仕切り直しは利かん！」十三が叫ぶ。「祓うか、沈めるか——選べ！」',
      ],
      choices: [
        { pre: '祓いに切り替える ', skillText: '呪術', check: { name: '呪術', mod: 4, dc: 14 }, success: 's6banish', fail: 's6hit' },
        { pre: '手鏡を、割る', to: 'E_break' },
      ],
    },
    s6name: {
      kicker: '怪異録 第七號 ・ 八', title: '名を呼ばれた影', pct: 92,
      text: [
        '名は、水面に落ちた小石のように波紋をひろげた。影のかたちが、びくりと止まる。纏っていた影が一枚、また一枚と剥がれ落ち、輪郭が細く、幼くなっていく。',
        '「……ミオ。ソレ、ワタシノ、ナマエ」',
      ],
      choices: [
        { pre: '「憶えている。ずっと憶えている」と誓う', to: 'E_name' },
        { pre: '怯まず ', skillText: '祓う', check: { name: '呪術', mod: 4, dc: 14 }, success: 's6banish', fail: 's6hit' },
      ],
    },
    s6angry: {
      kicker: '怪異録 第七號 ・ 八', title: '届かぬ声', pct: 88, fx: { ki: -3, san: -3 },
      text: [
        '沼が沸き立った。呼び方が、違ったのか——影の腕が鞭のようにしなり、紗那の肩を打つ。「チガウ、チガウ、ソノヨビカタ、オトナタチト、オナジ！」（気力 −3 ・ 正気 −3）',
      ],
      choices: [
        { pre: '十三と共に ', skillText: '祓う', check: { name: '呪術', mod: 4, dc: 14 }, success: 's6banish', fail: 's6hit' },
        { pre: '手鏡を、割る', to: 'E_break' },
      ],
    },
    s6hit: {
      kicker: '怪異録 第七號 ・ 八', title: '瘴気の鞭', pct: 88, fx: { ki: -5, san: -2 },
      text: [
        '影の腕が三本に増え、退魔の結界ごと紗那を薙ぎ払った。口の中に泥の味。提灯が水に落ち、じゅ、と消える。（気力 −5 ・ 正気 −2）',
      ],
      choices: [
        { pre: 'なお ', skillText: '祓う', check: { name: '呪術', mod: 4, dc: 14 }, success: 's6banish', fail: 's6hit2' },
        { pre: '一旦引き、夜明けを待つ', to: 'E_retreat' },
      ],
    },
    s6hit2: {
      kicker: '怪異録 第七號 ・ 八', title: '水際', pct: 90, fx: { ki: -5, san: -2 },
      text: [
        '膝が水に浸かった。冷たさが骨まで届く。水面下で、無数の手が足首を待っているのが「視えて」しまう。（気力 −5 ・ 正気 −2）',
        '次で決めねば、引き込まれる。',
      ],
      choices: [
        { pre: '最後の ', skillText: '祓い', check: { name: '呪術', mod: 4, dc: 15 }, success: 's6banish', fail: 'E_down' },
        { pre: '手鏡を、割る', to: 'E_break' },
        { pre: '一旦引き、夜明けを待つ', to: 'E_retreat' },
      ],
    },
    s6banish: {
      kicker: '怪異録 第七號 ・ 八', title: '調伏', pct: 94,
      text: [
        '十三の九字が閃き、あやめの鈴が真上で鳴った。紗那の唱える祝詞が縫い目となって、影のかたちを解いていく。攫われた影たちが、鳥の群れのように村へ帰っていくのが見えた。',
        '最後に残った小さな影は、抗わなかった。ただ、沼の底へ、ゆっくりと沈んでいった。',
      ],
      choices: [{ pre: '手を合わせ、見送る', to: 'E_banish' }],
    },
    E_ritual: {
      kicker: '怪異録 第七號 ・ 結', title: '影還し', pct: 100, end: true, fx: { mon: 800, san: 6 },
      text: [
        '「——みお」。呼んだ名は、沼のいちばん深いところまで届いた。水面が鏡のように凪ぎ、村じゅうの影が一斉に持ち主のもとへ駆け戻っていく。紗那の足元にも、ほっそりとした影が、そっと繋がり直した。',
        '最後に、水の底から小さな声がした。「……ヨンデクレテ、アリガトウ」。沼は、ただの沼に戻った。',
        '（真結 ・ 村よりの謝礼 八百文 ・ 正気 ＋6。祠には新しい注連縄が張られ、毎年、名を呼ぶ祀りが始まるという）',
      ],
      choices: [],
    },
    E_name: {
      kicker: '怪異録 第七號 ・ 結', title: '憶えている', pct: 100, end: true, fx: { items: { kushi: 1 }, san: 4 },
      text: [
        '約束は、呪よりも強く縛る——祖母の村で聞いた言葉だ。影たちは夜のうちに、少しずつ持ち主の家へ帰っていった。最後の影は岸に上がり、紗那に深く頭を下げてから、月の中へ解けた。',
        '朝、祠の跡に娘物の櫛がひとつ、置かれていた。帳面の第七號に、紗那はこう記す。「怪異、みお。六歳。六十年間、名を呼ばれなかっただけの子」（獲得：みおの櫛 ・ 正気 ＋4）',
      ],
      choices: [],
    },
    E_banish: {
      kicker: '怪異録 第七號 ・ 結', title: '祓い済み', pct: 100, end: true, fx: { mon: 800, san: -4 },
      text: [
        '影は村人のもとへ還り、事件は「解決」した。村長は深々と頭を下げ、謝礼の袋は約定より重かった。（謝礼 八百文）',
        'ただ、紗那の帳面の最後の行だけが、いつまでも乾かない墨のように滲んでいる。——誰にも名を呼ばれないまま、あの子はもう一度、沈んだ。（正気 −4）',
      ],
      choices: [],
    },
    E_break: {
      kicker: '怪異録 第七號 ・ 結', title: '割れる音', pct: 100, end: true, fx: { san: -8, flags: { mirrorBroken: 1 } },
      text: [
        '五寸の鏡は、あっけなく割れた。その瞬間、村じゅうの影が弾かれたように持ち主へ戻り、影のかたちは悲鳴もなく崩れて消えた。古老の言い伝えは、確かに正しかった。',
        'だが鏡の理は、代償を求める。割った者の影——紗那には、もう取られる影がなかった。代わりに、鏡の中の「もうひとり」が消えた。以来、紗那はどんな鏡にも映らない。帳面の第七號は、そこで終わっている。（正気 −8）',
      ],
      choices: [],
    },
    E_retreat: {
      kicker: '怪異録 第七號 ・ 結', title: '夜明けを待つ', pct: 100, end: true,
      text: [
        '十三が殿を務め、一行は荷をまとめ、峠の堂で夜明けを待った。朝日の中の沼は、何事もなかったような顔で空を映している——影のない紗那の顔以外は。',
        '怪異 第七號、継続。満月は、ひと月後にまた来る。',
      ],
      choices: [],
    },
    E_down: {
      kicker: '怪異録 第七號 ・ 結', title: '泥の味', pct: 100, end: true, fx: { kiSet: 1 },
      text: [
        '足首を、冷たい手が掴んだ——そこで記憶が切れている。気づけば峠の堂で、あやめが濡れた着物を絞っていた。「十三さまが、水から引き上げたのよ。三度も呼んだのに、返事をしないんだもの」',
        '気力は尽き、満月は沈んだ。怪異 第七號、継続。（気力 1 で生還）',
      ],
      choices: [],
    },
    E_mad: {
      kicker: '怪異録 第七號 ・ 結', title: '水鏡', pct: 100, end: true, fx: { sanSet: 10 },
      text: [
        '——どちらが本物の紗那か、本人にも分からなくなった夜のことを、紗那は憶えていない。憶えているのは十三で、語りたがらない。',
        'ひと月の湯治ののち、彼女は帳面を開き直した。手は、まだ少し震える。それでも民俗学者は、書くことでしか贖えない。怪異 第七號、継続。（正気 10 まで回復して復帰）',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '帳面を、最初の頁から読み直す', restart: true },
    { pre: '案件の間へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 1, diceDc: 13,
      lastRoll: { kind: 'check', die: 16, mod: 3, total: 19, dc: 13, outcome: 'success', skillName: '目星' },
      rollLog: [
        { left: '紗那 ・ 目星', right: '19 ／ 成', color: '#5a7a4a' },
        { left: '十三 ・ 退魔', right: '22 ／ 大成', color: '#5a7a4a' },
        { left: '剛 ・ 胆力', right: '7 ／ 凶', color: '#8f2c1f' },
      ],
      kiSana: 9, rei: 6, san: 71, kiKage: 20, kiJuzo: 18, kiGo: 11,
      koku: 2, turnIdx: 0,
      mon: 4200,
      items: { shio: 3, fuda: 5, juzu: 1, chomen: 1, kagami: 1, kushi: 0 },
      flags: {},
      storyNode: 's1', storyNote: null, storyNoteColor: '#5a4f3f',
      gmScene: 0, kegare: 66, gmTable: null,
    };
  }

  function outcomeKanji(outcome) {
    return { crit: '大成 ・ 大吉', success: '成 ・ 吉', fail: '否 ・ 凶', fumble: '大凶' }[outcome] || '';
  }
  function outcomeShort(outcome) {
    return { crit: '大成', success: '成', fail: '凶', fumble: '大凶' }[outcome] || '';
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.ki) patch.kiSana = eng().clamp(get('kiSana') + fx.ki, 0, KI_MAX);
    if (fx.kiSet != null) patch.kiSana = fx.kiSet;
    if (fx.rei) patch.rei = eng().clamp(get('rei') + fx.rei, 0, REI_MAX);
    if (fx.san) patch.san = eng().clamp(get('san') + fx.san, 0, SAN_MAX);
    if (fx.sanSet != null) patch.san = fx.sanSet;
    if (fx.mon) patch.mon = get('mon') + fx.mon;
    if (fx.items) {
      var items = Object.assign({}, get('items'));
      for (var k in fx.items) items[k] = Math.max(0, (items[k] || 0) + fx.items[k]);
      patch.items = items;
    }
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1b',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'kiSana', 'rei', 'san', 'kiKage', 'kiJuzo', 'kiGo', 'koku', 'turnIdx',
      'mon', 'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'kegare', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 's1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 案件 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 調書 ──
      out.ki = st.kiSana;
      out.kiPct = Math.round((st.kiSana / KI_MAX) * 100);
      out.rei = st.rei;
      out.reiPct = Math.round((st.rei / REI_MAX) * 100);
      out.san = st.san;
      out.kiUp = function () { app.setState({ kiSana: E.clamp(st.kiSana + 1, 0, KI_MAX) }); };
      out.kiDown = function () { app.setState({ kiSana: E.clamp(st.kiSana - 1, 0, KI_MAX) }); };
      out.reiUp = function () { app.setState({ rei: E.clamp(st.rei + 1, 0, REI_MAX) }); };
      out.reiDown = function () { app.setState({ rei: E.clamp(st.rei - 1, 0, REI_MAX) }); };
      out.sanUp = function () { app.setState({ san: E.clamp(st.san + 1, 0, SAN_MAX) }); };
      out.sanDown = function () { app.setState({ san: E.clamp(st.san - 1, 0, SAN_MAX) }); };

      // ── 卜定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? skill.name + '判定 ・ 難度 ' + st.diceDc
        : st.diceSides === 'rokudo' ? '六道の骰 ・ 行く末を占う' : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.diceFormula = 'まだ卜は立てていない'; out.diceVerdict = ''; out.diceVerdictColor = '#5a4f3f';
      } else if (lr.kind === 'check') {
        out.diceFace = lr.die;
        out.diceFormula = '骰 ' + lr.die + ' ＋ 修正 ' + lr.mod + ' ＝ ' + lr.total;
        out.diceVerdict = outcomeKanji(lr.outcome);
        out.diceVerdictColor = lr.outcome === 'fail' || lr.outcome === 'fumble' ? '#8f2c1f' : '#5a7a4a';
      } else if (lr.kind === 'rokudo') {
        out.diceFace = lr.value;
        out.diceFormula = '六道の骰';
        out.diceVerdict = lr.realm;
        out.diceVerdictColor = lr.value >= 5 ? '#5a7a4a' : lr.value <= 2 ? '#8f2c1f' : '#5a4f3f';
      } else {
        out.diceFace = lr.value;
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.diceVerdictColor = '#5a4f3f';
      }
      out.diceTypes = DICE_DEFS.map(function (d) {
        var sel = d.sides === st.diceSides;
        return {
          label: d.label,
          go: function () { app.setState({ diceSides: d.sides }); },
          border: sel ? '1px solid #b13a2a' : '1px solid rgba(90,79,63,.3)',
          color: sel ? '#211c16' : '#5a4f3f',
          bg: sel ? 'rgba(177,58,42,.12)' : 'transparent',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '＋' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #b13a2a' : '1px solid rgba(90,79,63,.3)',
          color: sel ? '#211c16' : '#5a4f3f',
          bg: sel ? 'rgba(177,58,42,.12)' : 'transparent',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          pushLog(st, '紗那 ・ ' + skill.name, r.total + ' ／ ' + outcomeShort(r.outcome), r.ok ? '#5a7a4a' : '#8f2c1f');
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, skillName: skill.name }, rollLog: st.rollLog });
        } else if (st.diceSides === 'rokudo') {
          var d = E.rollDie(6);
          var realm = ROKUDO[d - 1];
          pushLog(st, '紗那 ・ 六道', d + ' ／ ' + realm, d >= 5 ? '#5a7a4a' : d <= 2 ? '#8f2c1f' : '#5a4f3f');
          app.setState({ lastRoll: { kind: 'rokudo', value: d, realm: realm }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, '紗那 ・ d' + st.diceSides, v + ' ／ 出目', '#5a4f3f');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 対峙 ──
      out.kokuTitle = '対峙 ・ 第' + kanjiNum(st.koku) + '刻';
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
        if (next <= st.turnIdx) patch.koku = st.koku + 1;
        app.setState(patch);
      };
      out.nextRound = function () {
        var first = st[COMBATANTS[0].key] > 0 ? 0 : aliveIdx(0);
        app.setState({ koku: st.koku + 1, turnIdx: first });
      };
      out.combatants = COMBATANTS.map(function (c, i) {
        var hp = st[c.key];
        var dead = hp <= 0;
        var active = i === st.turnIdx && !dead;
        var tags = dead
          ? [{ t: c.deadTag, bg: c.enemy ? 'rgba(90,122,74,.18)' : 'rgba(177,58,42,.14)', color: c.enemy ? '#5a7a4a' : '#8f2c1f' }]
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
          side: active ? '行動中' : c.enemy ? '怪異' : '',
          border: active ? '1px solid #b13a2a' : '1px solid rgba(90,79,63,.26)',
          bg: active ? 'linear-gradient(90deg,rgba(177,58,42,.13),transparent)' : 'rgba(239,230,207,.4)',
          op: dead ? '.55' : '1',
          initBg: active ? '#8f2c1f' : 'rgba(90,79,63,.16)',
          initColor: active ? '#f3ead3' : '#5a4f3f',
          tokenBorder: c.enemy ? '#211c16' : '#b13a2a',
          tokenPat: c.enemy ? 'rgba(33,28,22,.18)' : 'rgba(120,90,40,.14)',
          barBg: c.enemy ? 'linear-gradient(90deg,#3f372b,#211c16)' : 'linear-gradient(90deg,#b13a2a,#cc5a44)',
          hasTags: tags.length > 0, tags: tags,
          dmg5: adj(-5), dmg1: adj(-1), heal1: adj(1), heal5: adj(5),
        };
      });

      // ── 道具 ──
      out.moneyLabel = kanjiMoney(st.mon);
      out.bagItems = ITEM_DEFS.filter(function (d) {
        return !(d.hidden0 && (st.items[d.k] || 0) <= 0);
      }).map(function (d) {
        var qty = st.items[d.k] || 0;
        return {
          name: d.name, dot: d.dot, qtyLabel: kanjiNum(qty) + d.unit,
          op: qty > 0 ? '1' : '.45',
          usable: !!d.salt && qty > 0 && st.san < SAN_MAX,
          use: function () {
            var items = Object.assign({}, st.items);
            items[d.k] = qty - 1;
            pushLog(st, '紗那 ・ 清めの塩', '正気 ＋4', '#5a7a4a');
            app.setState({ items: items, san: E.clamp(st.san + 4, 0, SAN_MAX), rollLog: st.rollLog });
          },
        };
      });

      // ── 怪異録 ──
      var node = NODES[st.storyNode] || NODES.s1;
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
      out.storyNoteColor = st.storyNoteColor || '#5a4f3f';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end ? '第七號 ・ 結' : '第七號 ・ ' + node.pct + '% 了';
      out.storyCanRestart = st.storyNode !== 's1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#5a4f3f' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            patch.storyNote = c.check.name + 'の卜 — 骰〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + outcomeKanji(r.outcome);
            patch.storyNoteColor = r.ok ? '#5a7a4a' : '#8f2c1f';
            pushLog(st, '紗那 ・ ' + c.check.name + '（怪異録）', r.total + ' ／ ' + outcomeShort(r.outcome), r.ok ? '#5a7a4a' : '#8f2c1f');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          // 気力が尽きたら「泥の味」、正気が尽きたら「水鏡」へ
          var kiNow = 'kiSana' in patch ? patch.kiSana : st.kiSana;
          var sanNow = 'san' in patch ? patch.san : st.san;
          if (kiNow <= 0 && !nextNode.end) {
            target = 'E_down';
            applyFx(st, NODES.E_down.fx, patch);
          } else if (sanNow <= 0 && !nextNode.end) {
            target = 'E_mad';
            applyFx(st, NODES.E_mad.fx, patch);
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
          dcLabel: dc != null ? '難度' + dc : '',
          go: c.restart ? function () { app._resetGame(); }
            : c.top ? function () { app.setState({ screen: 'top' }); }
            : choose(c),
        };
      });

      // ── 差配 ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '1px solid #b13a2a' : '1px solid rgba(90,79,63,.3)',
          bg: active ? 'linear-gradient(90deg,rgba(177,58,42,.12),transparent)' : 'rgba(239,230,207,.5)',
          color: active ? '#211c16' : '#5a4f3f',
          weight: active ? '700' : '400',
        };
      });
      out.kegare = st.kegare;
      out.kegareMinus = function () { app.setState({ kegare: E.clamp(st.kegare - 5, 0, 100) }); };
      out.kegarePlus = function () { app.setState({ kegare: E.clamp(st.kegare + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '差配 ・ 乱表（沼の兆し）', d + ' ／ ' + text, '#8f2c1f');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
