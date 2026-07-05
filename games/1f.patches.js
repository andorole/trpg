/*
 * 1f-左心室不動産 のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(58,53,46,.2);border-radius:999px;background:#fff;color:#7a7264;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(58,53,46,.2);border-radius:999px;background:#fff;color:#b32e3f;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(58,53,46,.2);border-radius:999px;background:#fff;color:#3d8a5f;cursor:pointer;";

module.exports = [

  // ── 物件一覧（top）: 「内見ツアーへ出発」を内見記録へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,#e0566a,#b32e3f);color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(179,46,63,.5);">内見ツアーへ出発　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,#e0566a,#b32e3f);color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:2px;box-shadow:0 10px 24px -8px rgba(179,46,63,.5);">内見ツアーへ出発　➜</button>`,
  },

  // ── 入居者カード（sheet）: 体力 / 血液残量 / 宿主適合率 を実数値＋増減ボタンに ──────────────
  {
    find: `<div style="background:#fff;border:1px solid rgba(58,53,46,.14);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7264;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">14 / 17</span></div><div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:82%;height:100%;background:linear-gradient(90deg,#e0566a,#b32e3f);"></div></div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(58,53,46,.14);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7264;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 17</span></div><div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:linear-gradient(90deg,#e0566a,#b32e3f);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(58,53,46,.14);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7264;margin-bottom:5px;"><span>血液残量（家賃原資）</span><span style="font-family:'IBM Plex Mono',monospace;">3.4L</span></div><div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:68%;height:100%;background:linear-gradient(90deg,#cf3f4f,#8f1f2e);"></div></div><div style="font-size:9px;color:#a89a86;margin-top:4px;">※4.2ヶ月分。滞納時は直接徴収されます</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(58,53,46,.14);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7264;margin-bottom:5px;"><span>血液残量（家賃原資）</span><span style="font-family:'IBM Plex Mono',monospace;">{{ bloodLabel }}</span></div><div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ bloodPct }}%;height:100%;background:linear-gradient(90deg,#cf3f4f,#8f1f2e);"></div></div><div style="font-size:9px;color:#a89a86;margin-top:4px;">※滞納時は直接徴収されます</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ bloodDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ bloodUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(58,53,46,.14);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7264;margin-bottom:5px;"><span>宿主適合率</span><span style="font-family:'IBM Plex Mono',monospace;color:#3d8a5f;">76%</span></div><div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:76%;height:100%;background:linear-gradient(90deg,#57a87c,#3d8a5f);"></div></div><div style="font-size:9px;color:#a89a86;margin-top:4px;">※下がると「異物」と認定されます</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(58,53,46,.14);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7264;margin-bottom:5px;"><span>宿主適合率</span><span style="font-family:'IBM Plex Mono',monospace;color:#3d8a5f;">{{ tekigo }}%</span></div><div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ tekigo }}%;height:100%;background:linear-gradient(90deg,#57a87c,#3d8a5f);"></div></div><div style="font-size:9px;color:#a89a86;margin-top:4px;">※下がると「異物」と認定されます</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ tekigoDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ tekigoUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 入居審査（dice）: 実際に振れるサイコロと値下げ交渉の家賃反映 ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="入居審査" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#7a7264;">難度を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:118px;height:118px;border:4px solid {{ stampColor }};border-radius:16px;transform:rotate(-5deg);animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:{{ stampColor }};background:{{ stampBg }};">
                <span style="font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:600;line-height:1;">{{ diceFace }}</span>
                <span style="font-weight:900;font-size:14px;letter-spacing:4px;border-top:2px solid {{ stampColor }};padding-top:3px;margin-top:4px;">{{ stampWord }}</span>
              </div>
              <div style="font-size:14px;color:#7a7264;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#a89a86;margin:2px 0 0;">※大家の機嫌により、成功しても評価はまちまちです。</p>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-size:12px;font-family:'IBM Plex Mono',monospace;padding:7px 12px;border-radius:999px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Zen Maru Gothic',sans-serif;font-size:12px;padding:5px 11px;border-radius:999px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:999px;cursor:pointer;background:linear-gradient(180deg,#e0566a,#b32e3f);color:#fff;font-weight:900;font-size:15px;letter-spacing:2px;font-family:'Zen Maru Gothic',sans-serif;box-shadow:0 10px 24px -8px rgba(179,46,63,.5);">サイコロを振る</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:0 0 9px;">● 審査履歴</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#4a4436;padding:7px 0;border-bottom:1px dotted rgba(58,53,46,.25);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 免疫対応（combat）: 抗原認識度（共有ゲージ）と入居者トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="免疫対応" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <h1 style="font-weight:900;font-size:24px;margin:0;color:#3a352e;">{{ waveTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ hideBehind }}" style="padding:8px 15px;border:1px solid rgba(58,53,46,.3);border-radius:999px;background:#fff;color:#6b6353;cursor:pointer;font-family:'Zen Maru Gothic',sans-serif;font-size:13px;">物陰に隠れる</button><button onClick="{{ nextTurn }}" style="padding:8px 15px;border:0;border-radius:999px;background:linear-gradient(180deg,#e0566a,#b32e3f);color:#fff;cursor:pointer;font-weight:700;font-size:13px;font-family:'Zen Maru Gothic',sans-serif;">次の手番</button></div>
            </div>
            <p style="font-size:12px;color:#a89a86;margin:0 0 14px;">※免疫システムはあなたを「敵」ではなく「汚れ」として処理します。悪意はありません。それが一番怖い。</p>

            <div style="border:1px solid rgba(201,138,42,.5);border-radius:12px;padding:10px 14px;margin-bottom:14px;background:rgba(201,138,42,.06);display:flex;align-items:center;gap:12px;">
              <span style="font-size:20px;">⚠</span>
              <div style="flex:1;"><div style="font-size:13px;font-weight:700;color:#c98a2a;">パーティ共有ゲージ：抗原認識度</div><div style="font-size:11px;color:#7a7264;">満タンで全館一斉退去（くしゃみ）が発動します</div></div>
              <div style="width:170px;"><div style="height:10px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ ninshiki }}%;height:100%;background:linear-gradient(90deg,#c98a2a,#cf3f4f);"></div></div><div style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#c98a2a;text-align:right;margin-top:2px;">{{ ninshiki }} / 100</div></div>
            </div>
            <sc-if value="{{ hasSneeze }}"><p style="font-size:12px;color:#b32e3f;font-weight:700;margin:0 0 14px;">{{ sneezeMsg }}</p></sc-if>

            <sc-for list="{{ combatants }}" as="cb">
              <div style="display:flex;align-items:center;gap:12px;padding:{{ cb.pad }};border-radius:12px;border:{{ cb.border }};background:#fff;margin-bottom:8px;opacity:{{ cb.op }};box-shadow:{{ cb.shadow }};">
                <span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:{{ cb.initBg }};color:{{ cb.initColor }};border-radius:50%;">{{ cb.init }}</span>
                <span style="{{ cb.tokenStyle }}"></span>
                <div style="flex:1;">
                  <div style="font-size:15px;font-weight:900;color:#3a352e;">{{ cb.name }} <span style="font-size:11px;color:#b32e3f;">{{ cb.side }}</span></div>
                  <div style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap;">
                    <sc-for list="{{ cb.tags }}" as="tg"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    <sc-if value="{{ cb.toggleable }}"><button onClick="{{ cb.toggle }}" style="font-size:10px;padding:2px 8px;border-radius:999px;border:1px solid rgba(58,53,46,.25);background:#fff;color:#6b6353;cursor:pointer;">{{ cb.toggleLabel }}</button></sc-if>
                  </div>
                </div>
                <div style="width:150px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7a7264;margin-bottom:3px;"><span>{{ cb.gauge }}</span><span style="font-family:'IBM Plex Mono',monospace;">{{ cb.hp }}/{{ cb.max }}</span></div><div style="height:8px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ cb.pct }}%;height:100%;background:{{ cb.barBg }};"></div></div>
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

  // ── 契約書類・お荷物（inventory）: 「前の住人の日記」だけ読める ──────────────
  {
    find: `<div style="margin-top:14px;border:1px solid rgba(201,138,42,.45);border-radius:12px;padding:13px 15px;background:rgba(201,138,42,.05);"><div style="font-size:13px;font-weight:900;color:#c98a2a;margin-bottom:5px;">鑑定メモ：前の住人の日記</div><div style="font-size:12px;line-height:1.8;color:#7a7264;">最終ページ：「39日目。ついに気づいた。この部屋、心室じゃない。ここは——」以降、白紙。ページの端に胃液の染み。</div></div>`,
    replace: `<div style="margin-top:14px;border:1px solid rgba(201,138,42,.45);border-radius:12px;padding:13px 15px;background:rgba(201,138,42,.05);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;"><div style="font-size:13px;font-weight:900;color:#c98a2a;">鑑定メモ：前の住人の日記</div><sc-if value="{{ diaryUnread }}"><button onClick="{{ readDiary }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(201,138,42,.5);border-radius:999px;background:#fff;color:#c98a2a;cursor:pointer;">読む</button></sc-if></div><div style="font-size:12px;line-height:1.8;color:#7a7264;">{{ diaryText }}</div></div>`,
  },

  // ── 内見記録（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="内見記録" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#a89a86;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-weight:900;font-size:28px;text-align:center;margin:0 0 4px;color:#3a352e;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#cf3f4f;"><span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(207,63,79,.4));"></span><span style="font-size:13px;">♥</span><span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(207,63,79,.4),transparent);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-size:16px;line-height:2.05;color:#4a4436;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:4px solid #cf3f4f;border-radius:0 12px 12px 0;background:#fff;font-size:15px;line-height:1.9;color:#6b6353;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:0 0 12px;">● どうする？</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(58,53,46,.2);border-radius:12px;background:#fff;cursor:pointer;font-family:'Zen Maru Gothic',sans-serif;font-size:14px;color:#4a4436;box-shadow:0 2px 8px rgba(58,53,46,.05);">{{ c.num }}　{{ c.pre }}<span style="color:#b32e3f;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#b32e3f;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:6px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:linear-gradient(90deg,#e0566a,#b32e3f);"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#a89a86;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#a89a86;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Maru Gothic',sans-serif;">内見記録を最初からやり直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 管理会社（GM）: 案件切替・宿主の体調・体内の異変表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="管理会社" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-weight:900;font-size:23px;margin:0 0 4px;color:#3a352e;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#7a7264;margin:0 0 20px;">バックヤードの帳簿。入居者様には決してお見せしないページです。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:0 0 11px;">● 進行中の案件</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:12px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#b32e3f;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:20px 0 10px;">● 宿主の体調（＝世界の天気）</p>
                <div style="height:9px;border-radius:999px;background:rgba(58,53,46,.1);overflow:hidden;"><div style="width:{{ taicho }}%;height:100%;background:linear-gradient(90deg,#3d8a5f,#c98a2a);"></div></div>
                <p style="font-size:11px;color:#a89a86;margin:6px 0 0;">微熱気味。38.5℃を超えると全物件が「サウナ付き」になります。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ taichoMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#7a7264;">{{ taicho }}%</span>
                  <button onClick="{{ taichoPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:0 0 11px;">● 秘匿情報</p>
                <div style="border:1px solid rgba(58,53,46,.18);border-radius:12px;padding:11px 13px;margin-bottom:8px;background:#fff;"><div style="font-size:14px;font-weight:900;color:#3a352e;">営業担当 カナメ</div><div style="font-size:12px;color:#7a7264;margin-top:2px;">望み：今期の成約ノルマ達成（あと1件）。</div><div style="font-size:12px;color:#b32e3f;margin-top:4px;background:rgba(207,63,79,.06);border-radius:8px;padding:4px 8px;">秘密：彼自身が「前の住人」。39日目に免疫と和解し、以来営業側に転職した。</div></div>
                <div style="border:1px solid rgba(58,53,46,.18);border-radius:12px;padding:11px 13px;background:#fff;"><div style="font-size:14px;font-weight:900;color:#3a352e;">オオヌシ様（宿主）</div><div style="font-size:12px;color:#7a7264;margin-top:2px;">自分の体に賃貸物件があることを、まだ知らない。</div><div style="font-size:12px;color:#c98a2a;margin-top:4px;background:rgba(201,138,42,.08);border-radius:8px;padding:4px 8px;">最近「お腹のあたりで生活音がする」と友達に相談し始めた。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#b32e3f;font-weight:700;margin:20px 0 10px;">● 体内の異変表（d6）</p>
                <div style="font-size:13px;color:#4a4436;line-height:1.9;">1–2 心拍上昇（宿主が階段） ・ 3 胃酸逆流警報<br>4 新しい入居希望者（ウイルス） ・ 5 くしゃみ予報 ・ 6 宿主が恋をする（全館暖房・家賃高騰）</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:999px;background:linear-gradient(180deg,#e0566a,#b32e3f);color:#fff;cursor:pointer;font-weight:900;font-size:12px;letter-spacing:1px;">異変表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#b32e3f;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
