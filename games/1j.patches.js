/*
 * 1j-転生前人間ドック のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(58,158,140,.3);border-radius:6px;background:#fff;color:#7e948f;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(58,158,140,.3);border-radius:6px;background:#fff;color:#c65448;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(58,158,140,.3);border-radius:6px;background:#fff;color:#2f8a5c;cursor:pointer;";

module.exports = [

  // ── 受付（top）: 「受付を済ませる」を問診記録へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:8px;cursor:pointer;background:#3a9e8c;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #2a7568;white-space:nowrap;">受付を済ませる　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:8px;cursor:pointer;background:#3a9e8c;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #2a7568;white-space:nowrap;">受付を済ませる　➜</button>`,
  },

  // ── 検査結果報告書（sheet）: 徳値 / 業値 / 未練残量 / 記憶清算率 を実数値＋増減ボタン＋自動判定に ──────────────
  {
    find: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;border-bottom:1px dashed rgba(58,158,140,.18);align-items:center;"><span style="padding:9px 14px;">徳値（善行コレステロール）</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;">142</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">80–160</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:rgba(62,164,110,.12);color:#2f8a5c;text-align:center;line-height:26px;">A</b></span></div>`,
    replace: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;border-bottom:1px dashed rgba(58,158,140,.18);align-items:center;"><span style="padding:9px 14px;">徳値（善行コレステロール）</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;">{{ toku }}<button onClick="{{ tokuDown }}" style="margin-left:6px;${BTN_SMALL}">−</button><button onClick="{{ tokuUp }}" style="${BTN_SMALL}">＋</button></span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">80–160</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:{{ tokuGradeBg }};color:{{ tokuGradeColor }};text-align:center;line-height:26px;">{{ tokuGrade }}</b></span></div>`,
  },
  {
    find: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;border-bottom:1px dashed rgba(58,158,140,.18);align-items:center;"><span style="padding:9px 14px;">業値（カルマ γ-GTP）</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;">61</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">0–50</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:rgba(201,168,46,.14);color:#a5851f;text-align:center;line-height:26px;">B</b></span></div>`,
    replace: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;border-bottom:1px dashed rgba(58,158,140,.18);align-items:center;"><span style="padding:9px 14px;">業値（カルマ γ-GTP）</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;">{{ gou }}<button onClick="{{ gouDown }}" style="margin-left:6px;${BTN_SMALL}">−</button><button onClick="{{ gouUp }}" style="${BTN_SMALL}">＋</button></span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">0–50</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:{{ gouGradeBg }};color:{{ gouGradeColor }};text-align:center;line-height:26px;">{{ gouGrade }}</b></span></div>`,
  },
  {
    find: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;border-bottom:1px dashed rgba(58,158,140,.18);align-items:center;background:rgba(198,84,72,.03);"><span style="padding:9px 14px;font-weight:700;">未練残量</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;color:#c65448;">388</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">0–120</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:rgba(198,84,72,.14);color:#c65448;text-align:center;line-height:26px;">D</b></span></div>`,
    replace: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;border-bottom:1px dashed rgba(58,158,140,.18);align-items:center;background:rgba(198,84,72,.03);"><span style="padding:9px 14px;font-weight:700;">未練残量</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;color:#c65448;">{{ miren }}<button onClick="{{ mirenDown }}" style="margin-left:6px;${BTN_SMALL}">−</button><button onClick="{{ mirenUp }}" style="${BTN_SMALL}">＋</button></span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">0–120</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:{{ mirenGradeBg }};color:{{ mirenGradeColor }};text-align:center;line-height:26px;">{{ mirenGrade }}</b></span></div>`,
  },
  {
    find: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;align-items:center;"><span style="padding:9px 14px;">記憶清算率</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;color:#c9722e;">12%</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">≧95%</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:rgba(201,114,46,.14);color:#c9722e;text-align:center;line-height:26px;">C</b></span></div>`,
    replace: `<div style="display:grid;grid-template-columns:1.4fr .8fr 1fr .6fr;font-size:13px;color:#28343a;align-items:center;"><span style="padding:9px 14px;">記憶清算率</span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;font-weight:600;color:#c9722e;">{{ seisan }}%<button onClick="{{ seisanDown }}" style="margin-left:6px;${BTN_SMALL}">−</button><button onClick="{{ seisanUp }}" style="${BTN_SMALL}">＋</button></span><span style="padding:9px 14px;border-left:1px solid rgba(58,158,140,.06);font-family:'IBM Plex Mono',monospace;color:#7e948f;">≧95%</span><span style="padding:6px 14px;border-left:1px solid rgba(58,158,140,.06);"><b style="display:inline-block;width:26px;height:26px;border-radius:50%;background:{{ seisanGradeBg }};color:{{ seisanGradeColor }};text-align:center;line-height:26px;">{{ seisanGrade }}</b></span></div>`,
  },

  // ── 精密検査（dice）: 実際に振れる5段階判定（A〜E） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="精密検査" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#7e948f;">基準を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:122px;height:122px;border:3px solid {{ gradeColor }};border-radius:10px;animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:{{ gradeColor }};background:#fff;box-shadow:0 8px 20px -8px rgba(58,158,140,.3);">
                <span style="font-size:10px;letter-spacing:2px;color:#7e948f;">検査値</span>
                <span style="font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:600;line-height:1.05;color:#28343a;">{{ diceFace }}</span>
                <b style="display:inline-block;padding:1px 12px;border-radius:999px;background:{{ gradeBg }};color:{{ gradeColor }};font-size:13px;letter-spacing:2px;">判定 {{ stampWord }}</b>
              </div>
              <div style="font-size:14px;color:#7e948f;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ gradeColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#9fb2ad;margin:2px 0 0;">※判定E（出目1）の場合、魂が検査室から逃走します。院内放送が入ります。</p>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-size:12px;font-family:'IBM Plex Mono',monospace;padding:7px 12px;border-radius:6px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Zen Kaku Gothic New',sans-serif;font-size:12px;padding:5px 11px;border-radius:6px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:8px;cursor:pointer;background:#3a9e8c;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;font-family:'Zen Kaku Gothic New',sans-serif;box-shadow:0 5px 0 #2a7568;white-space:nowrap;">検体を分析にかける</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:0 0 9px;">■ 本日の判定記録</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;color:#48575c;padding:7px 0;border-bottom:1px dashed rgba(58,158,140,.22);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};flex:none;">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 処置室（combat）: 未練3件の清算トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="処置室" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
              <h1 style="font-weight:900;font-size:24px;margin:0;color:#28343a;">処置室 ・ 未練清算オペ</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ checkVital }}" style="padding:8px 15px;border:1px solid rgba(58,158,140,.35);border-radius:6px;background:#fff;color:#7e948f;cursor:pointer;font-size:13px;font-family:'Zen Kaku Gothic New',sans-serif;white-space:nowrap;flex:none;">バイタル確認</button><button onClick="{{ nextOp }}" style="padding:8px 15px;border:0;border-radius:6px;background:#3a9e8c;color:#fff;cursor:pointer;font-weight:700;font-size:13px;font-family:'Zen Kaku Gothic New',sans-serif;box-shadow:0 4px 0 #2a7568;white-space:nowrap;flex:none;">次の処置へ</button></div>
            </div>
            <p style="font-size:12px;color:#9fb2ad;margin:0 0 14px;">※未練は「消す」のではなく「畳む」処置です。畳み方を誤ると、来世で開きます（デジャヴの正体）。</p>

            <div style="border:2px solid #3a9e8c;border-radius:10px;padding:12px 14px;margin-bottom:14px;background:#fff;">
              <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:4px;"><span style="font-size:15px;font-weight:900;color:#28343a;">患者：春日野 誠 様（魂体）</span><span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#3a9e8c;white-space:nowrap;">魂圧 118/76 ・ 徳拍 {{ tokuhaku }}</span></div>
              <div style="position:relative;height:34px;border-radius:6px;background:rgba(58,158,140,.05);overflow:hidden;border:1px solid rgba(58,158,140,.2);">
                <svg viewBox="0 0 400 34" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;animation:pulseline 2s ease-in-out infinite;"><polyline points="0,17 40,17 52,17 58,6 64,28 70,17 130,17 142,17 148,5 154,29 160,17 230,17 242,17 248,6 254,28 260,17 330,17 342,17 348,5 354,29 360,17 400,17" fill="none" stroke="#3a9e8c" stroke-width="2"></polyline></svg>
              </div>
              <div style="font-size:10px;color:#9fb2ad;margin-top:4px;">魂電図：安定。ただし「橋のたもと」という語で徳拍が跳ねる。</div>
              <div style="display:flex;gap:4px;margin-top:6px;justify-content:flex-end;"><button onClick="{{ tokuhakuDown }}" style="${BTN_TINY_DMG}">−5</button><button onClick="{{ tokuhakuUp }}" style="${BTN_TINY_HEAL}">＋5</button></div>
            </div>

            <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:0 0 10px;">■ 清算対象の未練（大きい順）</p>
            <sc-for list="{{ regrets }}" as="rg">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;border:{{ rg.border }};background:{{ rg.bg }};margin-bottom:8px;opacity:{{ rg.op }};"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:{{ rg.numBg }};color:{{ rg.numColor }};border-radius:6px;">{{ rg.num }}</span><div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:700;color:#28343a;">{{ rg.title }} <span style="font-size:11px;color:{{ rg.tagColor }};">{{ rg.tag }}</span></div><div style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap;"><span style="font-size:10px;padding:2px 8px;border-radius:3px;background:{{ rg.noteBg }};color:{{ rg.noteColor }};">{{ rg.note }}</span></div></div><div style="width:150px;flex:none;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7e948f;margin-bottom:3px;"><span>未練量</span><span style="font-family:'IBM Plex Mono',monospace;">{{ rg.value }}</span></div><div style="height:8px;border-radius:5px;background:rgba(40,52,58,.06);overflow:hidden;"><div style="width:{{ rg.pct }}%;height:100%;background:{{ rg.barColor }};"></div></div>
                <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ rg.dmg }}" style="${BTN_TINY_HEAL}">畳む</button><button onClick="{{ rg.heal }}" style="${BTN_TINY_DMG}">戻す</button></div>
              </div></div>
            </sc-for>

            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:10px;border:1px dashed rgba(58,158,140,.4);background:rgba(58,158,140,.03);"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:900;background:#3a9e8c;color:#fff;border-radius:50%;">看</span><div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:700;color:#28343a;">担当整理士：三途 看（みと・かん）</div><div style="font-size:12px;color:#7e948f;margin-top:2px;">未練の畳み方は千差万別。「大きいのは、無理に畳まない主義です」</div></div><div style="width:150px;flex:none;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7e948f;margin-bottom:3px;"><span>集中力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ shuchu }}/100</span></div><div style="height:8px;border-radius:5px;background:rgba(40,52,58,.06);overflow:hidden;"><div style="width:{{ shuchu }}%;height:100%;background:#3a9e8c;"></div></div></div></div>
          </div>
        </sc-if>`,
  },

  // ── お預かり窓口（inventory）: 「橋のたもとの景色」だけ審査を進められる ──────────────
  {
    find: `<div style="padding:12px 14px;border:1px solid rgba(58,158,140,.3);border-radius:8px;margin-bottom:8px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;"><div style="font-size:14px;font-weight:700;color:#28343a;">橋のたもとの景色（記憶一枚）</div><span style="font-size:10px;color:#a5851f;font-family:'IBM Plex Mono',monospace;flex:none;">審査中</span></div><div style="font-size:12px;color:#7e948f;margin-top:3px;line-height:1.7;">記憶の持越は原則不可。ただし「風景一枚まで」の特例あり。夕方の川面で申請中。</div></div>`,
    replace: `<div style="padding:12px 14px;border:1px solid rgba(58,158,140,.3);border-radius:8px;margin-bottom:8px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><div style="font-size:14px;font-weight:700;color:#28343a;">橋のたもとの景色（記憶一枚）</div><span style="display:flex;align-items:center;gap:8px;"><sc-if value="{{ sceneryPending }}"><button onClick="{{ approveScenery }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(165,133,31,.5);border-radius:999px;background:#fff;color:#a5851f;cursor:pointer;">審査を進める</button></sc-if><span style="font-size:10px;color:{{ sceneryColor }};font-family:'IBM Plex Mono',monospace;flex:none;">{{ sceneryStatus }}</span></span></div><div style="font-size:12px;color:#7e948f;margin-top:3px;line-height:1.7;">記憶の持越は原則不可。ただし「風景一枚まで」の特例あり。夕方の川面で申請中。</div></div>`,
  },

  // ── 問診記録（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="問診記録" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#7e948f;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#28343a;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#3a9e8c;"><span style="flex:1;height:1px;background:rgba(58,158,140,.35);"></span><span style="font-size:12px;">✚</span><span style="flex:1;height:1px;background:rgba(58,158,140,.35);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.1;color:#33424a;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #3a9e8c;background:rgba(58,158,140,.04);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#48575c;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:0 0 12px;">■ 医療チームとして、どう動く</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(58,158,140,.35);border-radius:8px;background:#fff;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;color:#33424a;">{{ c.num }}　{{ c.pre }}<span style="color:#c9722e;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#c9722e;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(40,52,58,.06);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#3a9e8c;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#9fb2ad;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#9fb2ad;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Kaku Gothic New',sans-serif;">問診記録を最初からやり直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 医局（GM）: 症例切替・混雑度・院内ハプニング表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="医局" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-weight:900;font-size:23px;margin:0 0 4px;color:#28343a;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#7e948f;margin:0 0 20px;">カルテ庫は施錠。患者に見せた瞬間、それは「告知」になります。慎重に。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:0 0 11px;">■ 進行中の症例</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:8px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#3a9e8c;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:20px 0 10px;">■ 院内の混雑度（彼岸の繁忙期）</p>
                <div style="height:9px;border-radius:5px;background:rgba(40,52,58,.06);overflow:hidden;"><div style="width:{{ konzatsu }}%;height:100%;background:linear-gradient(90deg,#3a9e8c,#c9722e);"></div></div>
                <p style="font-size:11px;color:#9fb2ad;margin:6px 0 0;">満床になると「相部屋転生」（二つの魂がひとつの来世を共有）が発生。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ konzatsuMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#7e948f;">{{ konzatsu }}%</span>
                  <button onClick="{{ konzatsuPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:0 0 11px;">■ 秘匿カルテ</p>
                <div style="border:1px solid rgba(58,158,140,.3);border-radius:8px;padding:11px 13px;margin-bottom:8px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#28343a;">凪 マチ（め-043）</div><div style="font-size:12px;color:#7e948f;margin-top:2px;">死因「非公開」の理由：カルテの死亡欄が空白のまま。</div><div style="font-size:12px;color:#c65448;margin-top:4px;background:rgba(198,84,72,.05);border-radius:4px;padding:4px 8px;">秘密：彼女はまだ死んでいない。集中治療室で眠っている生者が、健診に紛れ込んでいる。転生ゲートをくぐれば、戻れなくなる。</div></div>
                <div style="border:1px solid rgba(58,158,140,.3);border-radius:8px;padding:11px 13px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#28343a;">春日野様の過去カルテ（7周分）</div><div style="font-size:12px;color:#7e948f;margin-top:2px;">7周とも蕎麦屋に転生し、7周とも同じ未練で戻ってきている。院長は今回を「最終診察」と呼んでいる。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#3a9e8c;font-weight:700;margin:20px 0 10px;">■ 院内ハプニング表（d6）</p>
                <div style="font-size:13px;color:#48575c;line-height:1.9;">1–2 院内放送「逃走魂のお知らせ」 ・ 3 レントゲンに前世が写り込む<br>4 生者の迷い込み ・ 5 転生ゲート誤作動（動物枠に行列） ・ 6 院長回診（全員直立）</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:8px;background:#3a9e8c;color:#fff;cursor:pointer;font-weight:900;font-size:12px;letter-spacing:1px;">ハプニング表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#3a9e8c;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
