/*
 * 1c-深宴 のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(205,164,78,.3);border-radius:7px;background:rgba(255,255,255,.05);color:#8b93a0;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(205,164,78,.3);border-radius:6px;background:rgba(255,255,255,.05);color:#b25464;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(205,164,78,.3);border-radius:6px;background:rgba(255,255,255,.05);color:#4fd8c9;cursor:pointer;";

module.exports = [

  // ── 献立（top）: 「開店の鐘を鳴らす」を給仕の書へのリンクに ──────────────
  {
    find: `<button style="margin-top:30px;display:inline-flex;align-items:center;gap:10px;padding:13px 28px;border:0;border-radius:9px;cursor:pointer;background:linear-gradient(180deg,#e4c675,#a6813a);color:#171008;font-family:'Zen Old Mincho',serif;font-weight:700;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(166,129,58,.5);">開店の鐘を鳴らす　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="margin-top:30px;display:inline-flex;align-items:center;gap:10px;padding:13px 28px;border:0;border-radius:9px;cursor:pointer;background:linear-gradient(180deg,#e4c675,#a6813a);color:#171008;font-family:'Zen Old Mincho',serif;font-weight:700;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(166,129,58,.5);">開店の鐘を鳴らす　➜</button>`,
  },

  // ── 給仕人記録（sheet）: 気力 / 品位 / 常心 を実数値＋増減ボタンに ──────────────
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8b93a0;margin-bottom:4px;"><span>気力</span><span>9 / 13</span></div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:69%;height:100%;background:linear-gradient(90deg,#9c4a3a,#c96a52);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8b93a0;margin-bottom:4px;"><span>気力</span><span>{{ ki }} / 13</span></div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ kiPct }}%;height:100%;background:linear-gradient(90deg,#9c4a3a,#c96a52);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ kiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ kiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8b93a0;margin-bottom:4px;"><span>品位</span><span>5 / 9</span></div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:56%;height:100%;background:linear-gradient(90deg,#1f6d68,#3fc9bb);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8b93a0;margin-bottom:4px;"><span>品位</span><span>{{ hin }} / 9</span></div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ hinPct }}%;height:100%;background:linear-gradient(90deg,#1f6d68,#3fc9bb);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ hinDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ hinUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8b93a0;margin-bottom:4px;"><span>常心</span><span>63 / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:63%;height:100%;background:linear-gradient(90deg,#2c3c54,#46618a);"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8b93a0;margin-bottom:4px;"><span>常心</span><span>{{ jo }} / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ jo }}%;height:100%;background:linear-gradient(90deg,#2c3c54,#46618a);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ joDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ joUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 鑑定（dice）: 実際に振れる鑑定盤（星評価） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="鑑定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:4px;color:#cda44e;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#8b93a0;">評価基準を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:7px;margin:18px 0 24px;">
              <div style="width:122px;height:122px;border-radius:50%;animation:diceflip .55s ease,glow 2.6s ease-in-out infinite;background:radial-gradient(circle at 32% 28%,#3a4a5c,#0f1620 72%);border:2px solid #cda44e;display:flex;align-items:center;justify-content:center;color:#e8c876;font-family:'Zen Old Mincho',serif;font-weight:700;font-size:52px;">{{ diceFace }}</div>
              <div style="font-size:14px;color:#8b93a0;">{{ diceFormula }}</div>
              <div style="font-family:'Zen Old Mincho',serif;font-size:16px;letter-spacing:4px;color:{{ diceVerdictColor }};">{{ diceVerdict }}</div>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-family:'Zen Old Mincho',serif;font-size:13px;padding:7px 13px;border-radius:8px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Zen Old Mincho',serif;font-size:12px;padding:5px 11px;border-radius:999px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:9px;cursor:pointer;background:linear-gradient(180deg,#e4c675,#a6813a);color:#171008;font-family:'Zen Old Mincho',serif;font-weight:700;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(166,129,58,.5);">鑑定の匙を投げる</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#cda44e;margin:0 0 9px;">本日の評定</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#c3bda9;padding:7px 0;border-bottom:1px dotted rgba(205,164,78,.22);"><span>{{ r.left }}</span><span style="color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 進行表（combat）: 気力 / 御満悦度トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="進行表" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:18px;">
              <h1 style="font-family:'Zen Old Mincho',serif;font-weight:700;font-size:25px;margin:0;color:#ece4d0;">{{ junTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ nextRound }}" style="padding:8px 15px;border:1px solid rgba(205,164,78,.32);border-radius:8px;background:transparent;color:#8b93a0;cursor:pointer;font-family:'Zen Old Mincho',serif;font-size:13px;">巡を送る</button><button onClick="{{ nextTurn }}" style="padding:8px 15px;border:0;border-radius:8px;background:linear-gradient(180deg,#e4c675,#a6813a);color:#171008;cursor:pointer;font-family:'Zen Old Mincho',serif;font-weight:700;font-size:13px;">次の給仕へ</button></div>
            </div>
            <sc-for list="{{ combatants }}" as="cb">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:9px;border:{{ cb.border }};background:{{ cb.bg }};margin-bottom:8px;opacity:{{ cb.op }};">
                <span style="width:30px;height:30px;flex:none;border-radius:50%;background:{{ cb.initBg }};color:{{ cb.initColor }};display:flex;align-items:center;justify-content:center;font-family:'Zen Old Mincho',serif;font-size:14px;">{{ cb.init }}</span>
                <span style="{{ cb.tokenStyle }}"></span>
                <div style="flex:1;">
                  <div style="font-size:15px;color:{{ cb.nameColor }};">{{ cb.name }} <span style="font-size:11px;color:#cda44e;">{{ cb.side }}</span></div>
                  <sc-if value="{{ cb.hasTags }}">
                    <div style="display:flex;gap:5px;margin-top:3px;">
                      <sc-for list="{{ cb.tags }}" as="tg"><span style="font-size:10px;padding:2px 7px;border-radius:999px;background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    </div>
                  </sc-if>
                </div>
                <div style="width:130px;">
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#8b93a0;margin-bottom:3px;"><span>{{ cb.gauge }}</span><span>{{ cb.hp }}/{{ cb.max }}</span></div>
                  <div style="height:7px;border-radius:5px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ cb.pct }}%;height:100%;background:{{ cb.barBg }};"></div></div>
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

  // ── 食材庫（inventory）: 貝殻硬貨・数量を実データ化、深海塩は「使う」で常心回復 ──────────────
  {
    find: `>貝殻硬貨 214枚</span>`,
    replace: `>貝殻硬貨 {{ shells }}枚</span>`,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#c3bda9;padding:9px 4px;border-bottom:1px dotted rgba(205,164,78,.22);"><span style="width:8px;height:8px;border-radius:2px;background:#cda44e;"></span><span style="flex:1;">深海塩</span><span style="color:#8b93a0;">×2</span></div>`,
    replace: `<sc-for list="{{ bagItems }}" as="it">
                <div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#c3bda9;padding:9px 4px;border-bottom:1px dotted rgba(205,164,78,.22);opacity:{{ it.op }};">
                  <span style="width:8px;height:8px;border-radius:2px;background:{{ it.dot }};"></span>
                  <span style="flex:1;">{{ it.name }}</span>
                  <sc-if value="{{ it.usable }}"><button onClick="{{ it.use }}" style="font-size:11px;padding:2px 10px;border:1px solid rgba(205,164,78,.3);border-radius:999px;background:rgba(255,255,255,.06);color:#c3bda9;cursor:pointer;font-family:'Zen Old Mincho',serif;">使う</button></sc-if>
                  <span style="color:#8b93a0;">×{{ it.qty }}</span>
                </div>
              </sc-for>`,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#c3bda9;padding:9px 4px;border-bottom:1px dotted rgba(205,164,78,.22);"><span style="width:8px;height:8px;border-radius:2px;background:#4fd8c9;"></span><span style="flex:1;">発光する胆</span><span style="color:#8b93a0;">×1</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#c3bda9;padding:9px 4px;border-bottom:1px dotted rgba(205,164,78,.22);"><span style="width:8px;height:8px;border-radius:2px;background:#46618a;"></span><span style="flex:1;">影の泡立てクリーム</span><span style="color:#8b93a0;">×4</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#c3bda9;padding:9px 4px;border-bottom:1px dotted rgba(205,164,78,.22);"><span style="width:8px;height:8px;border-radius:2px;background:#b25464;"></span><span style="flex:1;">客人台帳</span><span style="color:#8b93a0;">×1</span></div>`,
    replace: ``,
  },
  {
    find: `<div style="display:flex;align-items:center;gap:11px;font-size:14px;color:#c3bda9;padding:9px 4px;"><span style="width:8px;height:8px;border-radius:2px;background:#8b93a0;"></span><span style="flex:1;">割れた呼び鈴</span><span style="color:#8b93a0;">×1</span></div>`,
    replace: ``,
  },

  // ── 給仕の書（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="給仕の書" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-size:11px;letter-spacing:4px;color:#cda44e;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Zen Old Mincho',serif;font-weight:700;font-size:29px;text-align:center;margin:0 0 4px;color:#ece4d0;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#cda44e;"><span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(205,164,78,.5));"></span><span style="font-size:13px;">◆</span><span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(205,164,78,.5),transparent);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-style:italic;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <p style="font-size:17px;line-height:1.85;color:#c3bda9;margin:0 0 18px;"><span style="float:left;font-family:'Zen Old Mincho',serif;font-size:56px;line-height:.82;font-weight:700;color:#cda44e;margin:4px 12px 0 0;">{{ storyLead }}</span>{{ storyLeadRest }}</p>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-size:17px;line-height:1.85;color:#c3bda9;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid rgba(205,164,78,.45);background:rgba(255,255,255,.02);font-style:italic;font-size:18px;line-height:1.7;color:#a89f86;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#cda44e;margin:8px 0 12px;">どう動く</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(205,164,78,.28);border-radius:9px;background:rgba(255,255,255,.03);cursor:pointer;font-family:'Zen Old Mincho',serif;font-size:15px;color:#ece4d0;">— {{ c.pre }}<span style="color:#cda44e;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#cda44e;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:4px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:linear-gradient(90deg,#8a6a2a,#cda44e);"></div></div>
            <p style="text-align:center;font-size:11px;letter-spacing:2px;color:#8b7f5e;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#8b7f5e;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Old Mincho',serif;">最初の頁から読み直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 厨長（GM）: 場面切替・御機嫌の傾き・まかない事故表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="厨長" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Zen Old Mincho',serif;font-weight:700;font-size:24px;margin:0 0 4px;color:#ece4d0;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#8b93a0;margin:0 0 20px;">厨房だけが知る頁。ホールには出さない。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#cda44e;margin:0 0 11px;">場面</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:8px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-family:'Zen Old Mincho',serif;font-size:14px;color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#cda44e;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#cda44e;margin:20px 0 10px;">御機嫌の傾き</p>
                <div style="height:9px;border-radius:6px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ kigen }}%;height:100%;background:linear-gradient(90deg,#1f6d68,#9c3a4a);"></div></div>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ kigenMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#8b93a0;">{{ kigen }}%</span>
                  <button onClick="{{ kigenPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#cda44e;margin:0 0 11px;">賓客 ・ 秘匿</p>
                <div style="border:1px solid rgba(205,164,78,.22);border-radius:8px;padding:11px 13px;margin-bottom:8px;background:rgba(255,255,255,.03);"><div style="font-size:14px;color:#ece4d0;">深き沖の伯爵</div><div style="font-size:12px;color:#8b93a0;margin-top:2px;">望み：この店の"名物"を、正しい作法で捧げられること。</div><div style="font-size:12px;color:#b25464;margin-top:4px;background:rgba(178,84,100,.1);border-radius:5px;padding:4px 8px;">秘密：正体は、先代店主が三十年前に還さなかった客。</div></div>
                <div style="border:1px solid rgba(205,164,78,.22);border-radius:8px;padding:11px 13px;background:rgba(255,255,255,.03);"><div style="font-size:14px;color:#ece4d0;">客用ナプキンの結界</div><div style="font-size:12px;color:#8b93a0;margin-top:2px;">触れる者の緊張を吸うが、満ちれば破れる。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#cda44e;margin:20px 0 10px;">まかない事故表 (d6)</p>
                <div style="font-size:13px;color:#c3bda9;line-height:1.9;">1–2 皿が割れる ・ 3 灯りが落ちる<br>4 御客人が席を立つ ・ 5 香りが変わる ・ 6 予約外の客が来る</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:8px;background:linear-gradient(180deg,#e4c675,#a6813a);color:#171008;cursor:pointer;font-family:'Zen Old Mincho',serif;font-weight:700;font-size:12px;letter-spacing:1px;">事故表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#e8c876;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
