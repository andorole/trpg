/*
 * 1a-ハイファンタジー のテンプレートパッチ（build.js がビルド時に適用）。
 * - { block: 'isXxx', replace } … <sc-if value="{{ isXxx }}"> ブロック全体を差し替え
 * - { find, replace }           … 一意な文字列の置換（find は原本と完全一致であること）
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(120,95,45,.35);border-radius:7px;background:rgba(244,236,214,.6);color:#6f6049;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(120,95,45,.35);border-radius:6px;background:rgba(244,236,214,.6);color:#7c2e22;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(120,95,45,.35);border-radius:6px;background:rgba(244,236,214,.6);color:#2f6b3f;cursor:pointer;";

module.exports = [

  // ── 卓（top）: 「物語を続ける」を物語画面へのリンクに ──────────────
  {
    find: `<button style="margin-top:30px;display:inline-flex;align-items:center;gap:10px;padding:13px 28px;border:0;border-radius:9px;cursor:pointer;background:linear-gradient(180deg,#2f4a34,#23381f);color:#f1e7cf;font-family:'Cinzel',serif;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(20,40,25,.6);">物語を続ける　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="margin-top:30px;display:inline-flex;align-items:center;gap:10px;padding:13px 28px;border:0;border-radius:9px;cursor:pointer;background:linear-gradient(180deg,#2f4a34,#23381f);color:#f1e7cf;font-family:'Cinzel',serif;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(20,40,25,.6);">物語を続ける　➜</button>`,
  },

  // ── 人物録（sheet）: HP / MP を実数値＋増減ボタンに ──────────────
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#6f6049;margin-bottom:4px;"><span>生命 HP</span><span>32 / 41</span></div><div style="height:9px;border-radius:6px;background:rgba(120,95,45,.18);overflow:hidden;"><div style="width:78%;height:100%;background:linear-gradient(90deg,#7c2e22,#a8442f);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#6f6049;margin-bottom:4px;"><span>生命 HP</span><span>{{ hpAriel }} / 41</span></div><div style="height:9px;border-radius:6px;background:rgba(120,95,45,.18);overflow:hidden;"><div style="width:{{ hpArielPct }}%;height:100%;background:linear-gradient(90deg,#7c2e22,#a8442f);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ hpDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ hpUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#6f6049;margin-bottom:4px;"><span>気 MP</span><span>11 / 18</span></div><div style="height:9px;border-radius:6px;background:rgba(120,95,45,.18);overflow:hidden;"><div style="width:61%;height:100%;background:linear-gradient(90deg,#2f6b5e,#3f8a78);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#6f6049;margin-bottom:4px;"><span>気 MP</span><span>{{ mp }} / 18</span></div><div style="height:9px;border-radius:6px;background:rgba(120,95,45,.18);overflow:hidden;"><div style="width:{{ mpPct }}%;height:100%;background:linear-gradient(90deg,#2f6b5e,#3f8a78);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ mpDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ mpUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 判定（dice）: 実際に振れるダイスロール盤 ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#9c7a34;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#6f6049;">難度を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:7px;margin:18px 0 24px;">
              <div style="width:122px;height:122px;border-radius:16px;animation:diceflip .55s ease;background:linear-gradient(145deg,#2f4a34,#22351f);border:2px solid #ab8638;box-shadow:0 16px 34px -12px rgba(0,0,0,.55),inset 0 0 26px rgba(0,0,0,.28);display:flex;align-items:center;justify-content:center;color:#f1e7cf;font-family:'Cinzel',serif;font-size:56px;font-weight:700;">{{ diceFace }}</div>
              <div style="font-size:14px;color:#6f6049;">{{ diceFormula }}</div>
              <div style="font-family:'Cinzel',serif;font-size:15px;letter-spacing:4px;color:{{ diceVerdictColor }};">{{ diceVerdict }}</div>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-family:'EB Garamond',serif;font-size:13px;padding:7px 13px;border-radius:8px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'EB Garamond',serif;font-size:12px;padding:5px 11px;border-radius:999px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:9px;cursor:pointer;background:linear-gradient(180deg,#2f4a34,#23381f);color:#f1e7cf;font-family:'Cinzel',serif;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(20,40,25,.6);">骰を振る</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c7a34;margin:0 0 9px;">巻末の記録</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#4a3f2c;padding:7px 0;border-bottom:1px dotted rgba(120,95,45,.3);"><span>{{ r.left }}</span><span style="color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 戦況（combat）: HP・状態・手番を実際に動かせるトラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
              <h1 style="font-family:'Cinzel',serif;font-weight:700;font-size:26px;margin:0;color:#23351f;">{{ roundTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ nextRound }}" style="padding:8px 15px;border:1px solid rgba(120,95,45,.4);border-radius:8px;background:transparent;color:#6f6049;cursor:pointer;font-family:'EB Garamond',serif;font-size:13px;">ラウンド送り</button><button onClick="{{ nextTurn }}" style="padding:8px 15px;border:0;border-radius:8px;background:linear-gradient(180deg,#2f4a34,#23381f);color:#f1e7cf;cursor:pointer;font-family:'Cinzel',serif;font-size:13px;letter-spacing:1px;">次の手番</button></div>
            </div>
            <sc-for list="{{ combatants }}" as="cb">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:9px;border:{{ cb.border }};background:{{ cb.bg }};margin-bottom:8px;opacity:{{ cb.op }};">
                <span style="width:30px;height:30px;flex:none;border-radius:50%;background:{{ cb.initBg }};color:{{ cb.initColor }};display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:14px;">{{ cb.init }}</span>
                <span style="width:30px;height:30px;flex:none;border-radius:50%;border:2px solid {{ cb.tokenBorder }};background:repeating-linear-gradient(45deg,{{ cb.tokenPat }} 0 4px,transparent 4px 8px);"></span>
                <div style="flex:1;">
                  <div style="font-family:'Cinzel',serif;font-size:15px;color:{{ cb.nameColor }};">{{ cb.name }} <span style="font-size:11px;color:#9c7a34;letter-spacing:1px;">{{ cb.side }}</span></div>
                  <sc-if value="{{ cb.hasTags }}">
                    <div style="display:flex;gap:5px;margin-top:3px;">
                      <sc-for list="{{ cb.tags }}" as="tg"><span style="font-size:10px;padding:2px 7px;border-radius:999px;background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    </div>
                  </sc-if>
                </div>
                <div style="width:130px;">
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#6f6049;margin-bottom:3px;"><span>HP</span><span>{{ cb.hp }}/{{ cb.max }}</span></div>
                  <div style="height:7px;border-radius:5px;background:rgba(120,95,45,.18);overflow:hidden;"><div style="width:{{ cb.pct }}%;height:100%;background:linear-gradient(90deg,#7c2e22,#a8442f);"></div></div>
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

  // ── 持ち物（inventory）: 所持金・数量を実データ化、霊薬は「使う」で HP 回復 ──────────────
  {
    find: `>142 ゴルド</span>`,
    replace: `>{{ gold }} ゴルド</span>`,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#4a3f2c;padding:9px 4px;border-bottom:1px dotted rgba(120,95,45,.3);"><span style="width:8px;height:8px;border-radius:2px;background:#9c7a34;"></span><span style="flex:1;">癒しの霊薬</span><span style="color:#6f6049;">×3</span><span style="color:#9c7a34;width:42px;text-align:right;">0.3</span></div>`,
    replace: `<sc-for list="{{ bagItems }}" as="it">
                <div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#4a3f2c;padding:9px 4px;border-bottom:1px dotted rgba(120,95,45,.3);opacity:{{ it.op }};">
                  <span style="width:8px;height:8px;border-radius:2px;background:{{ it.dot }};"></span>
                  <span style="flex:1;">{{ it.name }}</span>
                  <sc-if value="{{ it.usable }}"><button onClick="{{ it.use }}" style="font-size:11px;padding:2px 10px;border:1px solid rgba(120,95,45,.4);border-radius:999px;background:rgba(244,236,214,.7);color:#6f6049;cursor:pointer;font-family:'EB Garamond',serif;">使う</button></sc-if>
                  <span style="color:#6f6049;">×{{ it.qty }}</span>
                  <span style="color:#9c7a34;width:42px;text-align:right;">{{ it.wt }}</span>
                </div>
              </sc-for>`,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#4a3f2c;padding:9px 4px;border-bottom:1px dotted rgba(120,95,45,.3);"><span style="width:8px;height:8px;border-radius:2px;background:#9c7a34;"></span><span style="flex:1;">投げ短刀</span><span style="color:#6f6049;">×6</span><span style="color:#9c7a34;width:42px;text-align:right;">1.2</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#4a3f2c;padding:9px 4px;border-bottom:1px dotted rgba(120,95,45,.3);"><span style="width:8px;height:8px;border-radius:2px;background:#7c2e22;"></span><span style="flex:1;">封印された巻物</span><span style="color:#6f6049;">×1</span><span style="color:#9c7a34;width:42px;text-align:right;">0.5</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#4a3f2c;padding:9px 4px;border-bottom:1px dotted rgba(120,95,45,.3);"><span style="width:8px;height:8px;border-radius:2px;background:#9c7a34;"></span><span style="flex:1;">登攀具一式</span><span style="color:#6f6049;">×1</span><span style="color:#9c7a34;width:42px;text-align:right;">3.0</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#4a3f2c;padding:9px 4px;"><span style="width:8px;height:8px;border-radius:2px;background:#2f6b5e;"></span><span style="flex:1;">古びた鍵</span><span style="color:#6f6049;">×1</span><span style="color:#9c7a34;width:42px;text-align:right;">—</span></div>`,
    replace: ``,
  },

  // ── 物語（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#9c7a34;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Cinzel',serif;font-weight:700;font-size:30px;text-align:center;margin:0 0 4px;color:#23351f;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#ab8638;"><span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(171,134,56,.5));"></span><span style="font-size:13px;">❖</span><span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(171,134,56,.5),transparent);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-style:italic;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <p style="font-size:17px;line-height:1.85;color:#3a3122;margin:0 0 18px;"><span style="float:left;font-family:'Cinzel',serif;font-size:62px;line-height:.82;font-weight:700;color:#294630;margin:4px 12px 0 0;">{{ storyLead }}</span>{{ storyLeadRest }}</p>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-size:17px;line-height:1.85;color:#3a3122;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid rgba(171,134,56,.6);font-style:italic;font-size:18px;line-height:1.7;color:#5b4d38;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c7a34;margin:8px 0 12px;">どうする</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(120,95,45,.35);border-radius:9px;background:rgba(244,236,214,.6);cursor:pointer;font-family:'EB Garamond',serif;font-size:15px;color:#3a3122;">— {{ c.pre }}<span style="color:#9c7a34;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#9c7a34;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:4px;background:rgba(120,95,45,.16);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:linear-gradient(90deg,#9c7a34,#c8a455);"></div></div>
            <p style="text-align:center;font-size:11px;letter-spacing:2px;color:#9c8657;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#9c8657;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'EB Garamond',serif;">最初の頁から読み直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 進行（GM）: 場面切替・緊張度・乱表ロール ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Cinzel',serif;font-weight:700;font-size:25px;margin:0 0 4px;color:#23351f;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#6f6049;margin:0 0 20px;">語り手だけが見る頁。卓には伏せられている。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c7a34;margin:0 0 11px;">場面</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:8px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-family:'Cinzel',serif;font-size:14px;color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#9c7a34;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c7a34;margin:20px 0 10px;">緊張の高まり</p>
                <div style="height:9px;border-radius:6px;background:rgba(120,95,45,.18);overflow:hidden;"><div style="width:{{ tension }}%;height:100%;background:linear-gradient(90deg,#9c7a34,#7c2e22);"></div></div>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ tMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#6f6049;">{{ tension }}%</span>
                  <button onClick="{{ tPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c7a34;margin:0 0 11px;">登場人物 ・ 秘匿</p>
                <div style="border:1px solid rgba(120,95,45,.3);border-radius:8px;padding:11px 13px;margin-bottom:8px;background:rgba(244,236,214,.5);"><div style="font-family:'Cinzel',serif;font-size:14px;color:#23351f;">墓守の亡霊</div><div style="font-size:12px;color:#6f6049;margin-top:2px;">望み：名を取り戻すこと。</div><div style="font-size:12px;color:#7c2e22;margin-top:4px;background:rgba(124,46,34,.1);border-radius:5px;padding:4px 8px;">秘密：かつての王その人。</div></div>
                <div style="border:1px solid rgba(120,95,45,.3);border-radius:8px;padding:11px 13px;background:rgba(244,236,214,.5);"><div style="font-family:'Cinzel',serif;font-size:14px;color:#23351f;">紫の灯</div><div style="font-size:12px;color:#6f6049;margin-top:2px;">触れた者の最古の記憶を奪う。</div></div>
                <p style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#9c7a34;margin:20px 0 10px;">乱表 ・ 墓所の異変 (d6)</p>
                <div style="font-size:13px;color:#4a3f2c;line-height:1.9;">1–2 床が崩れる ・ 3 囁きが聞こえる<br>4 灯が増える ・ 5 亡霊が現れる ・ 6 門が閉じる</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:8px;background:linear-gradient(180deg,#2f4a34,#23381f);color:#f1e7cf;cursor:pointer;font-family:'Cinzel',serif;font-size:12px;letter-spacing:1px;">乱表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#7a5a1c;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
