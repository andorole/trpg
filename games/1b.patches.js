/*
 * 1b-和風伝奇 のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(90,79,63,.35);border-radius:5px;background:rgba(239,230,207,.6);color:#5a4f3f;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(90,79,63,.35);border-radius:4px;background:rgba(239,230,207,.6);color:#8f2c1f;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(90,79,63,.35);border-radius:4px;background:rgba(239,230,207,.6);color:#5a7a4a;cursor:pointer;";

module.exports = [

  // ── 案件（top）: 「調べを進める」を怪異録（物語）へのリンクに ──────────────
  {
    find: `<button style="margin-top:30px;display:inline-flex;align-items:center;gap:10px;padding:13px 28px;border:0;border-radius:6px;cursor:pointer;background:linear-gradient(180deg,#b13a2a,#8f2c1f);color:#f3ead3;font-family:'Shippori Mincho',serif;font-weight:700;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(143,44,31,.55);">調べを進める　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="margin-top:30px;display:inline-flex;align-items:center;gap:10px;padding:13px 28px;border:0;border-radius:6px;cursor:pointer;background:linear-gradient(180deg,#b13a2a,#8f2c1f);color:#f3ead3;font-family:'Shippori Mincho',serif;font-weight:700;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(143,44,31,.55);">調べを進める　➜</button>`,
  },

  // ── 調書（sheet）: 気力 / 霊力 / 正気 を実数値＋増減ボタンに ──────────────
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5a4f3f;margin-bottom:4px;"><span>気力</span><span>9 / 14</span></div><div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:64%;height:100%;background:linear-gradient(90deg,#b13a2a,#cc5a44);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5a4f3f;margin-bottom:4px;"><span>気力</span><span>{{ ki }} / 14</span></div><div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:{{ kiPct }}%;height:100%;background:linear-gradient(90deg,#b13a2a,#cc5a44);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ kiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ kiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5a4f3f;margin-bottom:4px;"><span>霊力</span><span>6 / 10</span></div><div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:60%;height:100%;background:linear-gradient(90deg,#2c3c54,#46618a);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5a4f3f;margin-bottom:4px;"><span>霊力</span><span>{{ rei }} / 10</span></div><div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:{{ reiPct }}%;height:100%;background:linear-gradient(90deg,#2c3c54,#46618a);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ reiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ reiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5a4f3f;margin-bottom:4px;"><span>正気</span><span>71</span></div><div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:71%;height:100%;background:linear-gradient(90deg,#5a7a4a,#7a9a64);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5a4f3f;margin-bottom:4px;"><span>正気</span><span>{{ san }}</span></div><div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:{{ san }}%;height:100%;background:linear-gradient(90deg,#5a7a4a,#7a9a64);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ sanDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ sanUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 卜定（dice）: 実際に振れる骰（d6/d10/d20/d100/六道） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:4px;color:#8f2c1f;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#5a4f3f;">難度を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:7px;margin:18px 0 24px;">
              <div style="width:122px;height:122px;border-radius:8px;animation:diceflip .55s ease;background:linear-gradient(145deg,#c0432f,#8f2c1f);border:2px solid #6f2014;box-shadow:0 16px 34px -12px rgba(0,0,0,.5),inset 0 0 26px rgba(0,0,0,.25);display:flex;align-items:center;justify-content:center;color:#f3ead3;font-family:'Yuji Syuku',serif;font-size:56px;">{{ diceFace }}</div>
              <div style="font-size:14px;color:#5a4f3f;">{{ diceFormula }}</div>
              <div style="font-family:'Yuji Syuku',serif;font-size:17px;letter-spacing:6px;color:{{ diceVerdictColor }};">{{ diceVerdict }}</div>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-family:'Shippori Mincho',serif;font-size:13px;padding:7px 13px;border-radius:4px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Shippori Mincho',serif;font-size:12px;padding:5px 11px;border-radius:3px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:6px;cursor:pointer;background:linear-gradient(180deg,#b13a2a,#8f2c1f);color:#f3ead3;font-family:'Shippori Mincho',serif;font-weight:700;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(143,44,31,.5);">卜を立てる</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#8f2c1f;margin:0 0 9px;">帳面の記録</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#3f372b;padding:7px 0;border-bottom:1px dotted rgba(90,79,63,.3);"><span>{{ r.left }}</span><span style="color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 対峙（combat）: 気力 / 瘴気トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
              <h1 style="font-family:'Yuji Syuku',serif;font-weight:400;font-size:26px;margin:0;color:#211c16;">{{ kokuTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ nextRound }}" style="padding:8px 15px;border:1px solid rgba(90,79,63,.4);border-radius:5px;background:transparent;color:#5a4f3f;cursor:pointer;font-family:'Shippori Mincho',serif;font-size:13px;">刻を送る</button><button onClick="{{ nextTurn }}" style="padding:8px 15px;border:0;border-radius:5px;background:linear-gradient(180deg,#b13a2a,#8f2c1f);color:#f3ead3;cursor:pointer;font-family:'Shippori Mincho',serif;font-weight:700;font-size:13px;">次の手番</button></div>
            </div>
            <sc-for list="{{ combatants }}" as="cb">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:6px;border:{{ cb.border }};background:{{ cb.bg }};margin-bottom:8px;opacity:{{ cb.op }};">
                <span style="width:30px;height:30px;flex:none;border-radius:50%;background:{{ cb.initBg }};color:{{ cb.initColor }};display:flex;align-items:center;justify-content:center;font-family:'Yuji Syuku',serif;font-size:14px;">{{ cb.init }}</span>
                <span style="width:30px;height:30px;flex:none;border-radius:50%;border:2px solid {{ cb.tokenBorder }};background:repeating-linear-gradient(45deg,{{ cb.tokenPat }} 0 4px,transparent 4px 8px);"></span>
                <div style="flex:1;">
                  <div style="font-size:15px;color:#211c16;">{{ cb.name }} <span style="font-size:11px;color:#8f2c1f;">{{ cb.side }}</span></div>
                  <sc-if value="{{ cb.hasTags }}">
                    <div style="display:flex;gap:5px;margin-top:3px;">
                      <sc-for list="{{ cb.tags }}" as="tg"><span style="font-size:10px;padding:2px 7px;border-radius:3px;background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    </div>
                  </sc-if>
                </div>
                <div style="width:130px;">
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#5a4f3f;margin-bottom:3px;"><span>{{ cb.gauge }}</span><span>{{ cb.hp }}/{{ cb.max }}</span></div>
                  <div style="height:7px;border-radius:4px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:{{ cb.pct }}%;height:100%;background:{{ cb.barBg }};"></div></div>
                  <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;">
                    <button onClick="{{ cb.dmg5 }}" style="${BTN_TINY_DMG}">−5</button>
                    <button onClick="{{ cb.dmg1 }}" style="${BTN_TINY_DMG}">−1</button>
                    <button onClick="{{ cb.heal1 }}" style="${BTN_TINY_HEAL}">＋1</button>
                    <button onClick="{{ cb.heal5 }}" style="${BTN_TINY_HEAL}">＋5</button>
                  </div>
                </div>
              </div>
            </sc-for>
          </div>
        </sc-if>`,
  },

  // ── 道具（inventory）: 銭・数量を実データ化、清めの塩は「使う」で正気回復 ──────────────
  {
    find: `>四貫 二百文</span>`,
    replace: `>{{ moneyLabel }}</span>`,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#3f372b;padding:9px 4px;border-bottom:1px dotted rgba(90,79,63,.3);"><span style="width:8px;height:8px;border-radius:1px;background:#b13a2a;"></span><span style="flex:1;">清めの塩</span><span style="color:#5a4f3f;">三包</span></div>`,
    replace: `<sc-for list="{{ bagItems }}" as="it">
                <div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#3f372b;padding:9px 4px;border-bottom:1px dotted rgba(90,79,63,.3);opacity:{{ it.op }};">
                  <span style="width:8px;height:8px;border-radius:1px;background:{{ it.dot }};"></span>
                  <span style="flex:1;">{{ it.name }}</span>
                  <sc-if value="{{ it.usable }}"><button onClick="{{ it.use }}" style="font-size:11px;padding:2px 10px;border:1px solid rgba(90,79,63,.4);border-radius:3px;background:rgba(239,230,207,.7);color:#5a4f3f;cursor:pointer;font-family:'Shippori Mincho',serif;">使う</button></sc-if>
                  <span style="color:#5a4f3f;">{{ it.qtyLabel }}</span>
                </div>
              </sc-for>`,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#3f372b;padding:9px 4px;border-bottom:1px dotted rgba(90,79,63,.3);"><span style="width:8px;height:8px;border-radius:1px;background:#b13a2a;"></span><span style="flex:1;">破魔の御札</span><span style="color:#5a4f3f;">五枚</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#3f372b;padding:9px 4px;border-bottom:1px dotted rgba(90,79,63,.3);"><span style="width:8px;height:8px;border-radius:1px;background:#2c3c54;"></span><span style="flex:1;">数珠</span><span style="color:#5a4f3f;">一連</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#3f372b;padding:9px 4px;border-bottom:1px dotted rgba(90,79,63,.3);"><span style="width:8px;height:8px;border-radius:1px;background:#211c16;"></span><span style="flex:1;">古い帳面</span><span style="color:#5a4f3f;">一冊</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#3f372b;padding:9px 4px;"><span style="width:8px;height:8px;border-radius:1px;background:#211c16;"></span><span style="flex:1;">割れた鏡の欠片</span><span style="color:#5a4f3f;">一片</span></div>`,
    replace: ``,
  },

  // ── 怪異録（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-size:11px;letter-spacing:4px;color:#8f2c1f;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Yuji Syuku',serif;font-weight:400;font-size:30px;text-align:center;margin:0 0 4px;color:#211c16;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#b13a2a;"><span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(177,58,42,.5));"></span><span style="font-size:13px;font-family:'Yuji Syuku',serif;">卍</span><span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(177,58,42,.5),transparent);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <p style="font-size:17px;line-height:1.95;color:#322b21;margin:0 0 18px;"><span style="float:left;font-family:'Yuji Syuku',serif;font-size:58px;line-height:.82;color:#b13a2a;margin:5px 12px 0 0;">{{ storyLead }}</span>{{ storyLeadRest }}</p>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-size:17px;line-height:1.95;color:#322b21;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:12px 18px;border-right:3px solid rgba(177,58,42,.5);background:rgba(177,58,42,.04);font-size:18px;line-height:1.8;color:#5a4f3f;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#8f2c1f;margin:8px 0 12px;">どう動く</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(90,79,63,.32);border-radius:5px;background:rgba(239,230,207,.6);cursor:pointer;font-family:'Shippori Mincho',serif;font-size:15px;color:#322b21;">— {{ c.pre }}<span style="color:#8f2c1f;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#8f2c1f;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:linear-gradient(90deg,#b13a2a,#cc5a44);"></div></div>
            <p style="text-align:center;font-size:11px;letter-spacing:2px;color:#9c8657;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#9c8657;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Shippori Mincho',serif;">最初の頁から読み直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 差配（GM）: 場面切替・穢れの満ち・乱表ロール ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Yuji Syuku',serif;font-weight:400;font-size:25px;margin:0 0 4px;color:#211c16;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#5a4f3f;margin:0 0 20px;">差配人だけが繰る頁。卓には伏せてある。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#8f2c1f;margin:0 0 11px;">場面</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:5px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-family:'Shippori Mincho',serif;font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#8f2c1f;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#8f2c1f;margin:20px 0 10px;">穢れの満ち</p>
                <div style="height:9px;border-radius:5px;background:rgba(90,79,63,.16);overflow:hidden;"><div style="width:{{ kegare }}%;height:100%;background:linear-gradient(90deg,#2c3c54,#8f2c1f);"></div></div>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ kegareMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#5a4f3f;">{{ kegare }}%</span>
                  <button onClick="{{ kegarePlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#8f2c1f;margin:0 0 11px;">怪異 ・ 秘匿</p>
                <div style="border:1px solid rgba(90,79,63,.3);border-radius:5px;padding:11px 13px;margin-bottom:8px;background:rgba(239,230,207,.5);"><div style="font-size:14px;font-weight:700;color:#211c16;">影喰い</div><div style="font-size:12px;color:#5a4f3f;margin-top:2px;">望み：影を集め、人になること。</div><div style="font-size:12px;color:#8f2c1f;margin-top:4px;background:rgba(177,58,42,.1);border-radius:4px;padding:4px 8px;">正体：水死した村の娘。</div></div>
                <div style="border:1px solid rgba(90,79,63,.3);border-radius:5px;padding:11px 13px;background:rgba(239,230,207,.5);"><div style="font-size:14px;font-weight:700;color:#211c16;">鏡の理</div><div style="font-size:12px;color:#5a4f3f;margin-top:2px;">割れば影は戻る。が、割った者の影が代償に。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#8f2c1f;margin:20px 0 10px;">乱表 ・ 沼の兆し (d6)</p>
                <div style="font-size:13px;color:#3f372b;line-height:1.9;">1–2 水位が上がる ・ 3 鈴が鳴る<br>4 影が一つ消える ・ 5 もうひとりが現れる ・ 6 鏡が割れる</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:5px;background:linear-gradient(180deg,#b13a2a,#8f2c1f);color:#f3ead3;cursor:pointer;font-family:'Shippori Mincho',serif;font-weight:700;font-size:12px;letter-spacing:1px;">乱表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#8f2c1f;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
