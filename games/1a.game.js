/*
 * 1a-ハイファンタジー のゲーム内容。
 * - 判定画面: 実際に振れるダイス（d4〜d100）と技能つき d20 判定・巻末の記録
 * - 人物録: HP / MP の増減（戦況・物語と共有）
 * - 戦況: イニシアチブ順トラッカー（手番送り・ラウンド・ダメージ / 回復・戦闘不能）
 * - 持ち物: 所持金・数量の実データ化。癒しの霊薬は「使う」で HP+7
 * - 物語: 分岐シナリオ「紫の狼煙」（判定つき選択肢・HP 消耗・複数エンディング）
 * - 進行(GM): 場面切替・緊張度・乱表 d6
 * 状態は GameEngine 経由で localStorage に自動保存される。
 */
(function () {
  var E = null; // GameEngine（attach 時点では未定義の可能性があるため使用時に参照）
  function eng() { return E || (E = window.GameEngine); }

  var HP_MAX = 41, MP_MAX = 18;

  var SKILLS = [
    { name: '隠密', mod: 7 },
    { name: '軽業', mod: 6 },
    { name: '看破', mod: 4 },
    { name: '解錠', mod: 5 },
    { name: '平目', mod: 0 },
  ];
  var DICE_SIDES = [4, 6, 8, 10, 12, 20, 100];

  var ITEM_DEFS = [
    { k: 'potion', name: '癒しの霊薬', wt: '0.3', dot: '#9c7a34', potion: true },
    { k: 'knife', name: '投げ短刀', wt: '1.2', dot: '#9c7a34' },
    { k: 'scroll', name: '封印された巻物', wt: '0.5', dot: '#7c2e22' },
    { k: 'climb', name: '登攀具一式', wt: '3.0', dot: '#9c7a34' },
    { k: 'key', name: '古びた鍵', wt: '—', dot: '#2f6b5e' },
    { k: 'lamp', name: '記憶の灯', wt: '—', dot: '#6b4a8c', hidden0: true },
    { k: 'crown', name: '王家の冠', wt: '1.0', dot: '#ab8638', hidden0: true },
  ];

  var COMBATANTS = [
    { key: 'hpAriel', name: 'アリエル', init: 21, max: HP_MAX, enemy: false, tags: [{ t: '加速', bg: 'rgba(47,107,95,.16)', color: '#2f6b5e' }] },
    { key: 'hpGhost', name: '墓守の亡霊', init: 18, max: 30, enemy: true, tags: [{ t: '怯え', bg: 'rgba(124,46,34,.14)', color: '#7c2e22' }] },
    { key: 'hpGray', name: 'グレイ', init: 14, max: 52, enemy: false, tags: [] },
    { key: 'hpMorga', name: 'モルガ', init: 9, max: 26, enemy: false, tags: [{ t: '集中', bg: 'rgba(156,122,52,.16)', color: '#9c7a34' }] },
  ];

  var GM_TABLE = ['床が崩れる', '床が崩れる', '囁きが聞こえる', '灯が増える', '亡霊が現れる', '門が閉じる'];
  var GM_SCENES = ['門前の対峙', '記憶の回廊', '玉座の主'];

  var KANJI = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  // ─────────────────────────────────────────────
  // シナリオ「紫の狼煙」
  // text: 最初の文字列＝ドロップキャップ段落。{ q: … } は引用ブロック。
  // 選択肢: { pre, skillText, post, dcLabel 用の check:{name,mod,dc}, success/fail または to, if }
  // fx はノード到達時に一度だけ適用（hp/mp/gold/items/flags/hpSet）
  // ─────────────────────────────────────────────
  var NODES = {
    n1: {
      kicker: '第三幕 ・ 第七節', title: '紫の狼煙', pct: 64,
      text: [
        '夜が明けきらぬうち、谷を渡る風が灰を運んできた。焦げた匂い。アリエルは外套の襟を立て、橋の残骸の先——黒い門のかたちに崩れた墓所の入口を見据えた。紫の光が、その奥でゆっくりと脈打っている。',
        '「合図にしては、長すぎる」とグレイが低く言う。誓約の楯に朝露が滴る。モルガは指先で宙に印を描き、何かを聴くように目を閉じた。「呼んでいるわ。けれど、こちらの名前を知らない声」',
        { q: '門は記憶を喰らう。くぐる前に、捨てたくない名を胸に刻め。' },
        '石段の縁に、真新しい爪痕。誰か——あるいは何かが、つい先刻ここを通った。前に進むほど、紫はその色を濃くしていく。',
      ],
      choices: [
        { pre: '爪痕を ', skillText: '看破', post: ' で調べる', check: { name: '看破', mod: 4, dc: 14 }, success: 'n2a', fail: 'n2b' },
        { pre: '門をくぐり、紫の光へ進む', to: 'n3' },
        { pre: 'モルガに、声の正体を ', skillText: '尋ねる', to: 'n2c' },
      ],
    },
    n2a: {
      kicker: '第三幕 ・ 第八節', title: '爪痕の主', pct: 66, fx: { flags: { clawChecked: 1 } },
      text: [
        'アリエルは膝をつき、指先で石の窪みをなぞった。籠手だ。人間の手甲が石段を掴んだ痕——それも、つい先刻。灰の積もり方が浅い。',
        '「先客がいる」と囁くと、グレイの手が楯にかかった。足跡は門の内へと続き、戻った形跡はない。',
      ],
      choices: [
        { pre: '門をくぐり、跡を追う', to: 'n3' },
        { pre: '物陰に伏せ、様子を窺う ', skillText: '隠密', check: { name: '隠密', mod: 7, dc: 12 }, success: 'n2a2', fail: 'n2a3' },
      ],
    },
    n2a2: {
      kicker: '第三幕 ・ 第八節', title: '影の中', pct: 68, fx: { flags: { spy: 1 } },
      text: [
        '息を殺して四半刻。門の脇、崩れた柱の陰に灰色の外套が見えた。人だ。生きている。——胸元に、見覚えのある鴉の徽章。灰鴉同盟の密偵が、なぜこんな谷の果てに。',
        '気づかれる前にこちらから声をかけるべきか。それとも。',
      ],
      choices: [
        { pre: '崩れた柱の男に、声をかける', to: 'n2a4' },
        { pre: '捨て置いて、門へ向かう', to: 'n3' },
      ],
    },
    n2a4: {
      kicker: '第三幕 ・ 第八節', title: '灰鴉の言伝', pct: 70, fx: { flags: { knowName: 1 } },
      text: [
        '振り向いた男は観念したように両手を上げた。「同盟の言伝だ。……墓の主に、名を返してやれ。それが谷を鎮める唯一の道だと、長老会は言っている」',
        'それだけ告げると、男は灰の中に消えた。名を、返す？',
      ],
      choices: [{ pre: '言伝を胸に、門をくぐる', to: 'n3' }],
    },
    n2a3: {
      kicker: '第三幕 ・ 第八節', title: '崩れる足場', pct: 68, fx: { hp: -3 },
      text: [
        '柱の陰に身を沈めた、その足元で朽ちた石が鳴った。ざり、と派手な音。影が一瞬で膨れ上がり、鋭い何かが頬を掠める。（HP −3）',
        '体勢を立て直したときには、気配は門の奥へ引いていた。もう、行くしかない。',
      ],
      choices: [{ pre: '追わず、門をくぐる', to: 'n3' }],
    },
    n2b: {
      kicker: '第三幕 ・ 第八節', title: '灰の沈黙', pct: 66, fx: { flags: { clawChecked: 1 } },
      text: [
        '爪痕は深いが、灰が縁を柔らかく埋めていて、新旧の判別がつかない。風が谷を鳴らすたび、痕はただの影に沈む。',
      ],
      choices: [
        { pre: '門をくぐり、紫の光へ進む', to: 'n3' },
        { pre: 'モルガに、声の正体を尋ねる', to: 'n2c', if: function (st) { return !st.flags.knowVoice; } },
      ],
    },
    n2c: {
      kicker: '第三幕 ・ 第八節', title: 'モルガの耳', pct: 66, fx: { flags: { knowVoice: 1 } },
      text: [
        'モルガは目を閉じたまま長く黙り、やがて言った。「声はね、名前を探しているの。自分の、名前を。名を失くした誰かが、この墓の主よ」',
        '「そして多分——」彼女は門を見た。「わたしたちの誰かが、それを知っているわ」',
      ],
      choices: [
        { pre: '門をくぐり、紫の光へ進む', to: 'n3' },
        { pre: '爪痕を ', skillText: '看破', post: ' で調べる', check: { name: '看破', mod: 4, dc: 14 }, success: 'n2a', fail: 'n2b', if: function (st) { return !st.flags.clawChecked; } },
      ],
    },
    n3: {
      kicker: '第三幕 ・ 第九節', title: '記憶を喰らう門', pct: 74,
      text: [
        '門柱に手を触れた途端、頭蓋の内側を細い指で撫でられたような感触が走った。——喰われている。まだ浅く、けれど確かに。石の門は、くぐる者の記憶を舐め取ってその身を保っているのだ。',
        { q: '門は記憶を喰らう。くぐる前に、捨てたくない名を胸に刻め。' },
      ],
      choices: [
        { pre: '捨てたくない名を胸に刻み、踏み込む ', skillText: '意志', check: { name: '意志', mod: 0, dc: 13 }, success: 'n4', fail: 'n4b' },
        { pre: '封印された巻物の封を切り、掲げて進む', to: 'n4c', if: function (st) { return st.items.scroll > 0; } },
      ],
    },
    n4: {
      kicker: '第三幕 ・ 第十節', title: '記憶の回廊', pct: 80,
      text: [
        '名は、残った。冷たい水をくぐり抜けたように全身が重いが、胸の奥で自分の名が確かに脈打っている。回廊の壁には色褪せた壁画——戴冠、豊穣、そして谷を呑む灰の日。',
      ],
      choices: [
        { pre: '壁画を ', skillText: '読み解く', check: { name: '知力', mod: 1, dc: 12 }, success: 'n4d', fail: 'n4e' },
        { pre: '先を急ぐ', to: 'n5' },
      ],
    },
    n4b: {
      kicker: '第三幕 ・ 第十節', title: '欠けた頁', pct: 80, fx: { flags: { lostMemory: 1 } },
      text: [
        'くぐり終えた瞬間、何かが薄くなった。誰かが歌っていた歌の節が、思い出せない。確かに知っていたはずの旋律が、灰のように指の間をこぼれていく。（大切な記憶をひとつ、門に置いてきた）',
        '回廊の壁には色褪せた壁画——戴冠、豊穣、そして谷を呑む灰の日。',
      ],
      choices: [
        { pre: '壁画を ', skillText: '読み解く', check: { name: '知力', mod: 1, dc: 12 }, success: 'n4d', fail: 'n4e' },
        { pre: '先を急ぐ', to: 'n5' },
      ],
    },
    n4c: {
      kicker: '第三幕 ・ 第十節', title: '勅書', pct: 78, fx: { items: { scroll: -1 }, flags: { royalName: 1 } },
      text: [
        '封蝋は触れる前に紫の炎で燃え落ちた。羊皮紙に浮かび上がったのは王家の紋章と、たった一行の勅——「朕の名を灰に封ず。谷を渡る者、これを主に返すべし」。末尾に、確かに名が記されている。',
        '門は、勅書を掲げたアリエルの前で従順に沈黙した。',
      ],
      choices: [{ pre: '回廊を抜け、玉座の間へ', to: 'n5' }],
    },
    n4d: {
      kicker: '第三幕 ・ 第十節', title: '壁画の告げるもの', pct: 84, fx: { flags: { knowKing: 1 } },
      text: [
        '読めた。最後の壁画——王は迫る灰禍から民を逃がすため、己の名を代価に門へ封を掛けたのだ。名を失った王は死してなお墓を守り、名を呼ぶ声だけが谷に残った。',
        '王の名は、壁画の隅、戴冠の場面にだけ刻まれている。アリエルはそれを胸に刻んだ。',
      ],
      choices: [{ pre: '玉座の間へ', to: 'n5' }],
    },
    n4e: {
      kicker: '第三幕 ・ 第十節', title: '読めない文字', pct: 82,
      text: [
        '古語だ。断片は拾えるが、肝心の銘の部分が灰の染みで潰れている。ただ、王が「何かを差し出して」谷を守った——その筋書きだけは読み取れた。',
      ],
      choices: [{ pre: '玉座の間へ', to: 'n5' }],
    },
    n5: {
      kicker: '第三幕 ・ 第十一節', title: '玉座の主', pct: 88,
      text: [
        '玉座の間。紫の灯が幾百も浮かび、中央の朽ちた玉座の前に、それはいた。錆びた王冠、虚ろな眼窩。墓守の亡霊——誰何するより先に、剣呑な冷気が膨れ上がる。「名ヲ……返セ……」',
      ],
      choices: [
        { pre: '剣を抜く——', skillText: '影縫い', check: { name: '敏捷', mod: 4, dc: 14 }, success: 'n6win', fail: 'n6hit' },
        { pre: '王家の勅書を、高く掲げる', to: 'n8', if: function (st) { return st.flags.royalName; } },
        { pre: '「あなたの名を、探しに来た」と ', skillText: '呼びかける', check: { name: '感応', mod: 2, dc: function (st) { return st.flags.knowVoice || st.flags.knowKing ? 11 : 15; } }, success: 'n6talk', fail: 'n6angry' },
      ],
    },
    n6hit: {
      kicker: '第三幕 ・ 第十一節', title: '冷気の一閃', pct: 90, fx: { hp: -6 },
      text: [
        '速い。骨の指が霞み、外套ごと肩口を凍気が抉る（HP −6）。二の太刀は空を斬った。亡霊の姿が灯の間を渡り、嗤うように揺れる。',
      ],
      choices: [
        { pre: 'なおも斬り結ぶ ', skillText: '敏捷', check: { name: '敏捷', mod: 4, dc: 14 }, success: 'n6win', fail: 'n6hit2' },
        { pre: '後退し、声を張る ', skillText: '感応', check: { name: '感応', mod: 2, dc: 13 }, success: 'n6talk', fail: 'n6angry' },
      ],
    },
    n6hit2: {
      kicker: '第三幕 ・ 第十一節', title: '膝をつく', pct: 92, fx: { hp: -6 },
      text: [
        '視界が白む（HP −6）。楯を構えたグレイの背中越しに、亡霊の冷気が壁の壁画を凍らせていくのが見えた。次の一手が、恐らく最後の一手になる。',
      ],
      choices: [
        { pre: '最後の一太刀に懸ける ', skillText: '敏捷', check: { name: '敏捷', mod: 4, dc: 15 }, success: 'n6win', fail: 'end_down' },
        { pre: '楯の陰へ——撤退する', to: 'end_retreat' },
      ],
    },
    n6angry: {
      kicker: '第三幕 ・ 第十一節', title: '応えぬ声', pct: 90, fx: { hp: -4 },
      text: [
        '冷気が渦を巻いて叩きつけた（HP −4）。「違ウ……オマエハ、知ラナイ……！」言葉はまだ、届く形をしていない。名の手がかりが要る。',
      ],
      choices: [
        { pre: '剣で応える ', skillText: '敏捷', check: { name: '敏捷', mod: 4, dc: 14 }, success: 'n6win', fail: 'n6hit' },
        { pre: '勅書を掲げる', to: 'n8', if: function (st) { return st.flags.royalName; } },
        { pre: '壁画で知った名を、叫ぶ', to: 'n8', if: function (st) { return st.flags.knowKing; } },
      ],
    },
    n6talk: {
      kicker: '第三幕 ・ 第十一節', title: '静止', pct: 92,
      text: [
        '亡霊が、止まった。眼窩の奥で紫の灯が揺れる。「名……ヲ……」枯れ井戸の底から響くような声。求めているのは戦いではない。ずっと、それだけを。',
      ],
      choices: [
        { pre: '勅書を、両手で差し出す', to: 'n8', if: function (st) { return st.flags.royalName; } },
        { pre: '壁画で知った名を、静かに告げる', to: 'n8', if: function (st) { return st.flags.knowKing; } },
        { pre: '名を知らぬまま、「共に探す」と誓う', to: 'n8b' },
      ],
    },
    n6win: {
      kicker: '第三幕 ・ 第十一節', title: '灯の残るところ', pct: 94,
      text: [
        '最後の一刀が冠を打ち、亡霊は灰となって崩れた。——だが、灯は消えない。玉座の周りで幾百の紫が、主を失ってなお脈打ち続けている。',
        'モルガが呟く。「これ、記憶よ。全部、あの人の」',
      ],
      choices: [
        { pre: '灯に、素手で触れる ', skillText: '意志', check: { name: '意志', mod: 0, dc: 14 }, success: 'n8c', fail: 'end_memory' },
        { pre: '触れずに、戦利品を集めて引き上げる', to: 'n8d' },
      ],
    },
    n8: {
      kicker: '第三幕 ・ 終節', title: '名の還るところ', pct: 100, end: true, fx: { gold: 120, items: { crown: 1 } },
      text: [
        '名が呼ばれた——あるいは差し出された——瞬間、谷のすべての紫が一斉に高く昇り、夜明けの色に溶けた。玉座の前には錆びた冠と、両の掌に収まるほどの小さな灯がひとつ。「……礼ヲ」風のような声がそう言い、それきり谷は静かになった。',
        '（真結・報酬：王家の冠 ・ 120ゴルド。灰燼の谷は鎮まった）',
      ],
      choices: [],
    },
    n8b: {
      kicker: '第三幕 ・ 終節', title: '誓いの灯', pct: 100, end: true, fx: { items: { lamp: 1 } },
      text: [
        '長い沈黙ののち、亡霊は一つの灯を差し出した。「共ニ……探ス……」契約だ。名が見つかるまで、この灯はアリエルの荷にある。夜ごと、小さく誰かの名を囁くという。',
        '（結・獲得：記憶の灯。物語は次の幕へ続く）',
      ],
      choices: [],
    },
    n8c: {
      kicker: '第三幕 ・ 終節', title: '記憶の器', pct: 100, end: true, fx: { gold: 90, items: { lamp: 1 } },
      text: [
        '灯は掌の上で小さくまとまり、温かい重みになった。王の記憶は器に還り、谷の風から哭き声が消えた。意志は、流されなかった。',
        '（結・報酬：記憶の灯 ・ 90ゴルド）',
      ],
      choices: [],
    },
    n8d: {
      kicker: '第三幕 ・ 終節', title: '遠雷', pct: 100, end: true, fx: { gold: 60 },
      text: [
        '戦利品の金貨だけを鞍袋に詰め、一行は夜のうちに谷を離れた（＋60ゴルド）。振り返れば、紫はまだ脈打っている。あの声の主を知る日は、いずれ来るだろう。——別の物語で。',
      ],
      choices: [],
    },
    end_retreat: {
      kicker: '第三幕 ・ 終節', title: '撤退', pct: 100, end: true,
      text: [
        '限界だ。グレイが殿を務め、一行は転がるように門を出た。手ぶらの帰還——だが全員、息はある。谷の紫は、また今度。',
      ],
      choices: [],
    },
    end_down: {
      kicker: '第三幕 ・ 終節', title: '灰の中へ', pct: 100, end: true, fx: { hpSet: 1 },
      text: [
        '膝が落ち、灰が頬に触れた。……グレイの楯が頭上で鳴り、モルガの印が閃くのを、遠くで聞いた。目覚めたのは崩れた橋のたもと。命はある。だが墓所の門は、再び固く閉じていた。（HP 1 で撤退）',
      ],
      choices: [],
    },
    end_memory: {
      kicker: '第三幕 ・ 終節', title: '一番古いもの', pct: 100, end: true, fx: { flags: { lostOldest: 1 } },
      text: [
        '紫がアリエルの腕を駆け上がり、一番古い記憶を持っていった。何を失ったのかさえ、もう分からない。ただ、夜だけ饒舌だった男は、その夜から夜も寡黙になった。一行は無言で谷を後にした。',
      ],
      choices: [],
    },
  };

  var END_CHOICES = [
    { pre: '最初の頁から、読み直す', restart: true },
    { pre: '卓へ戻る', top: true },
  ];

  // ─────────────────────────────────────────────

  function initialState() {
    return {
      diceSides: 20, skillIdx: 2, diceDc: 14,
      lastRoll: { kind: 'check', die: 14, mod: 5, total: 19, dc: 14, outcome: 'success', skillName: '看破' },
      rollLog: [
        { left: 'アリエル ・ 看破', right: '19 ／ 成功', color: '#2f6b3f' },
        { left: 'グレイ ・ 力業', right: '9 ／ 失敗', color: '#7c2e22' },
        { left: 'モルガ ・ 呪文判定', right: '23 ／ 大成功', color: '#2f6b3f' },
      ],
      hpAriel: 32, mp: 11, hpGhost: 12, hpGray: 48, hpMorga: 22,
      round: 2, turnIdx: 0,
      gold: 142,
      items: { potion: 3, knife: 6, scroll: 1, climb: 1, key: 1, lamp: 0, crown: 0 },
      flags: {},
      storyNode: 'n1', storyNote: null, storyNoteColor: '#6f6049',
      gmScene: 0, tension: 72, gmTable: null,
    };
  }

  function pushLog(st, left, right, color) {
    st.rollLog = [{ left: left, right: right, color: color }].concat(st.rollLog).slice(0, 10);
  }

  // fx をパッチに畳み込む（st は現在値、patch は setState 用の差分）
  function applyFx(st, fx, patch) {
    if (!fx) return;
    function get(k) { return k in patch ? patch[k] : st[k]; }
    if (fx.hp) patch.hpAriel = eng().clamp(get('hpAriel') + fx.hp, 0, HP_MAX);
    if (fx.hpSet != null) patch.hpAriel = fx.hpSet;
    if (fx.mp) patch.mp = eng().clamp(get('mp') + fx.mp, 0, MP_MAX);
    if (fx.gold) patch.gold = get('gold') + fx.gold;
    if (fx.items) {
      var items = Object.assign({}, get('items'));
      for (var k in fx.items) items[k] = Math.max(0, (items[k] || 0) + fx.items[k]);
      patch.items = items;
    }
    if (fx.flags) patch.flags = Object.assign({}, get('flags'), fx.flags);
  }

  window.__GAME__ = {
    id: '1a',
    initialState: initialState,
    persist: [
      'diceSides', 'skillIdx', 'diceDc', 'lastRoll', 'rollLog',
      'hpAriel', 'mp', 'hpGhost', 'hpGray', 'hpMorga', 'round', 'turnIdx',
      'gold', 'items', 'flags', 'storyNode', 'storyNote', 'storyNoteColor',
      'gmScene', 'tension', 'gmTable',
    ],
    migrate: function (st) {
      var init = initialState();
      if (!NODES[st.storyNode]) { st.storyNode = 'n1'; st.storyNote = null; st.flags = {}; }
      st.items = Object.assign({}, init.items, st.items || {});
      st.flags = st.flags || {};
      if (!Array.isArray(st.rollLog)) st.rollLog = init.rollLog;
    },

    vals: function (app) {
      var st = app.state;
      var E = eng();
      var out = {};

      // ── 卓 ──
      out.goStory = function () { app.setState({ screen: 'story' }); };

      // ── 人物録 ──
      out.hpAriel = st.hpAriel;
      out.hpArielPct = Math.round((st.hpAriel / HP_MAX) * 100);
      out.mp = st.mp;
      out.mpPct = Math.round((st.mp / MP_MAX) * 100);
      out.hpUp = function () { app.setState({ hpAriel: E.clamp(st.hpAriel + 1, 0, HP_MAX) }); };
      out.hpDown = function () { app.setState({ hpAriel: E.clamp(st.hpAriel - 1, 0, HP_MAX) }); };
      out.mpUp = function () { app.setState({ mp: E.clamp(st.mp + 1, 0, MP_MAX) }); };
      out.mpDown = function () { app.setState({ mp: E.clamp(st.mp - 1, 0, MP_MAX) }); };

      // ── 判定 ──
      var isCheck = st.diceSides === 20;
      var skill = SKILLS[st.skillIdx] || SKILLS[0];
      out.diceIsCheck = isCheck;
      out.diceHead = isCheck ? skill.name + '判定 ・ 難度 ' + st.diceDc : 'd' + st.diceSides + ' を振る';
      out.dcMinus = function () { app.setState({ diceDc: E.clamp(st.diceDc - 1, 2, 30) }); };
      out.dcPlus = function () { app.setState({ diceDc: E.clamp(st.diceDc + 1, 2, 30) }); };
      var lr = st.lastRoll;
      if (!lr) {
        out.diceFace = '—'; out.diceFormula = 'まだ骰は振られていない'; out.diceVerdict = ''; out.diceVerdictColor = '#6f6049';
      } else if (lr.kind === 'check') {
        out.diceFace = lr.die;
        out.diceFormula = 'd20 ＝ ' + lr.die + ' ＋ 修正 ' + lr.mod;
        out.diceVerdict = '＝ ' + lr.total + ' ・ ' + E.outcomeText(lr.outcome);
        out.diceVerdictColor = lr.outcome === 'fail' || lr.outcome === 'fumble' ? '#7c2e22' : '#2f6b3f';
      } else {
        out.diceFace = lr.value;
        out.diceFormula = 'd' + lr.sides + ' の出目';
        out.diceVerdict = '＝ ' + lr.value;
        out.diceVerdictColor = '#6f6049';
      }
      out.diceTypes = DICE_SIDES.map(function (s) {
        var sel = s === st.diceSides;
        return {
          label: 'd' + s,
          go: function () { app.setState({ diceSides: s }); },
          border: sel ? '1px solid #ab8638' : '1px solid rgba(120,95,45,.3)',
          color: sel ? '#23351f' : '#6f6049',
          bg: sel ? 'rgba(171,134,56,.14)' : 'transparent',
        };
      });
      out.diceSkills = SKILLS.map(function (sk, i) {
        var sel = i === st.skillIdx;
        return {
          label: sk.name + '（' + (sk.mod >= 0 ? '＋' + sk.mod : sk.mod) + '）',
          go: function () { app.setState({ skillIdx: i }); },
          border: sel ? '1px solid #ab8638' : '1px solid rgba(120,95,45,.3)',
          color: sel ? '#23351f' : '#6f6049',
          bg: sel ? 'rgba(171,134,56,.14)' : 'transparent',
        };
      });
      out.rollNow = function () {
        if (st.diceSides === 20) {
          var r = E.check(skill.mod, st.diceDc);
          var txt = E.outcomeText(r.outcome);
          pushLog(st, 'アリエル ・ ' + skill.name, r.total + ' ／ ' + txt, r.ok ? '#2f6b3f' : '#7c2e22');
          app.setState({ lastRoll: { kind: 'check', die: r.die, mod: r.mod, total: r.total, dc: r.dc, outcome: r.outcome, skillName: skill.name }, rollLog: st.rollLog });
        } else {
          var v = E.rollDie(st.diceSides);
          pushLog(st, 'アリエル ・ d' + st.diceSides, v + ' ／ 出目', '#6f6049');
          app.setState({ lastRoll: { kind: 'plain', sides: st.diceSides, value: v }, rollLog: st.rollLog });
        }
      };
      out.logRows = st.rollLog;

      // ── 戦況 ──
      out.roundTitle = '戦況 ・ 第' + (KANJI[st.round] || st.round) + 'ラウンド';
      function aliveIdx(from, dir) {
        for (var i = 1; i <= COMBATANTS.length; i++) {
          var idx = (from + i * dir + COMBATANTS.length * i) % COMBATANTS.length;
          if (st[COMBATANTS[idx].key] > 0) return idx;
        }
        return from;
      }
      out.nextTurn = function () {
        var next = aliveIdx(st.turnIdx, 1);
        var patch = { turnIdx: next };
        if (next <= st.turnIdx) patch.round = st.round + 1; // 一巡したらラウンドも進む
        app.setState(patch);
      };
      out.nextRound = function () {
        var first = st[COMBATANTS[0].key] > 0 ? 0 : aliveIdx(0, 1);
        app.setState({ round: st.round + 1, turnIdx: first });
      };
      out.combatants = COMBATANTS.map(function (c, i) {
        var hp = st[c.key];
        var dead = hp <= 0;
        var active = i === st.turnIdx && !dead;
        var tags = dead ? [{ t: '倒れた', bg: 'rgba(124,46,34,.14)', color: '#7c2e22' }] : c.tags;
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
          side: active ? '行動中' : c.enemy ? '敵' : '',
          border: active ? '1px solid #ab8638' : '1px solid rgba(120,95,45,.28)',
          bg: active ? 'linear-gradient(90deg,rgba(171,134,56,.16),rgba(171,134,56,.04))' : 'rgba(244,236,214,.4)',
          op: dead ? '.55' : '1',
          initBg: active ? '#23381f' : 'rgba(120,95,45,.18)',
          initColor: active ? '#f1e7cf' : '#6f6049',
          tokenBorder: c.enemy ? '#7c2e22' : '#ab8638',
          tokenPat: c.enemy ? 'rgba(124,46,34,.16)' : 'rgba(120,95,45,.14)',
          nameColor: c.enemy ? '#7c2e22' : '#23351f',
          hasTags: tags.length > 0, tags: tags,
          dmg5: adj(-5), dmg1: adj(-1), heal1: adj(1), heal5: adj(5),
        };
      });

      // ── 持ち物 ──
      out.gold = st.gold;
      out.bagItems = ITEM_DEFS.filter(function (d) {
        return !(d.hidden0 && (st.items[d.k] || 0) <= 0);
      }).map(function (d) {
        var qty = st.items[d.k] || 0;
        return {
          name: d.name, wt: d.wt, dot: d.dot, qty: qty,
          op: qty > 0 ? '1' : '.45',
          usable: !!d.potion && qty > 0 && st.hpAriel < HP_MAX,
          use: function () {
            var items = Object.assign({}, st.items);
            items[d.k] = qty - 1;
            pushLog(st, 'アリエル ・ 癒しの霊薬', 'HP ＋7', '#2f6b3f');
            app.setState({ items: items, hpAriel: E.clamp(st.hpAriel + 7, 0, HP_MAX), rollLog: st.rollLog });
          },
        };
      });

      // ── 物語 ──
      var node = NODES[st.storyNode] || NODES.n1;
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
      out.storyNoteColor = st.storyNoteColor || '#6f6049';
      out.storyPct = node.pct;
      out.storyPctLabel = node.end ? '第三幕 ・ 読了' : '第三幕 ・ ' + node.pct + '% 読了';
      out.storyCanRestart = st.storyNode !== 'n1';
      out.storyRestart = function () { app._resetGame(); };

      function choose(c) {
        return function () {
          var patch = { storyNote: null, storyNoteColor: '#6f6049' };
          var target = c.to;
          if (c.check) {
            var dc = typeof c.check.dc === 'function' ? c.check.dc(st) : c.check.dc;
            var r = E.check(c.check.mod, dc);
            var txt = E.outcomeText(r.outcome);
            patch.storyNote = c.check.name + '判定 — d20〈' + r.die + '〉＋' + r.mod + ' ＝ ' + r.total + ' ／ 難度' + dc + ' ・ ' + txt;
            patch.storyNoteColor = r.ok ? '#2f6b3f' : '#7c2e22';
            pushLog(st, 'アリエル ・ ' + c.check.name + '（物語）', r.total + ' ／ ' + txt, r.ok ? '#2f6b3f' : '#7c2e22');
            patch.rollLog = st.rollLog;
            target = r.ok ? c.success : c.fail;
          }
          var nextNode = NODES[target];
          applyFx(st, nextNode.fx, patch);
          // HP が尽きたら強制的に「灰の中へ」
          var hpNow = 'hpAriel' in patch ? patch.hpAriel : st.hpAriel;
          if (hpNow <= 0 && !nextNode.end) {
            target = 'end_down';
            applyFx(st, NODES.end_down.fx, patch);
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

      // ── 進行（GM） ──
      out.gmScenes = GM_SCENES.map(function (t, i) {
        var active = i === st.gmScene;
        return {
          t: t, tag: active ? '進行中' : '',
          go: function () { app.setState({ gmScene: i }); },
          border: active ? '1px solid #ab8638' : '1px solid rgba(120,95,45,.3)',
          bg: active ? 'linear-gradient(90deg,rgba(171,134,56,.14),transparent)' : 'rgba(244,236,214,.5)',
          color: active ? '#23351f' : '#6f6049',
        };
      });
      out.tension = st.tension;
      out.tMinus = function () { app.setState({ tension: E.clamp(st.tension - 5, 0, 100) }); };
      out.tPlus = function () { app.setState({ tension: E.clamp(st.tension + 5, 0, 100) }); };
      out.gmHasTable = !!st.gmTable;
      out.gmTableD = st.gmTable ? st.gmTable.d : '';
      out.gmTableText = st.gmTable ? st.gmTable.text : '';
      out.rollTable = function () {
        var d = E.rollDie(6);
        var text = GM_TABLE[d - 1];
        pushLog(st, '語り手 ・ 乱表（墓所の異変）', d + ' ／ ' + text, '#7a5a1c');
        app.setState({ gmTable: { d: d, text: text }, rollLog: st.rollLog });
      };

      return out;
    },
  };
})();
