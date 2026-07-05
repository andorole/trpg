/*
 * 1e-存在しない国の入国審査 のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 * 原本にすでにあった「書類を再確認する」トグル（rechecked）はそのまま維持し、ゲーム層と共存させる。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(217,164,65,.3);border-radius:3px;background:rgba(255,255,255,.03);color:#8d93a0;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY = "font-size:10px;padding:2px 6px;border:1px solid rgba(217,164,65,.3);border-radius:3px;background:rgba(255,255,255,.04);color:#c9c2ad;cursor:pointer;";

module.exports = [

  // ── 検問所（top）: 「開門する」を審査記録へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #d9a441;border-radius:5px;cursor:pointer;background:linear-gradient(180deg,#e2b355,#b8862f);color:#191104;font-family:'Shippori Mincho',serif;font-weight:800;font-size:15px;letter-spacing:3px;box-shadow:0 10px 24px -8px rgba(217,164,65,.4);">開門する　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #d9a441;border-radius:5px;cursor:pointer;background:linear-gradient(180deg,#e2b355,#b8862f);color:#191104;font-family:'Shippori Mincho',serif;font-weight:800;font-size:15px;letter-spacing:3px;box-shadow:0 10px 24px -8px rgba(217,164,65,.4);">開門する　➜</button>`,
  },

  // ── 審査官手帳（sheet）: 体力 / 覚醒度 / 実在感 を実数値＋増減ボタンに ──────────────
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8d93a0;margin-bottom:4px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">12 / 16</span></div><div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:75%;height:100%;background:#b0603f;"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8d93a0;margin-bottom:4px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 16</span></div><div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#b0603f;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8d93a0;margin-bottom:4px;"><span>覚醒度</span><span style="font-family:'IBM Plex Mono',monospace;">7 / 10</span></div><div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:70%;height:100%;background:#d9a441;"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8d93a0;margin-bottom:4px;"><span>覚醒度</span><span style="font-family:'IBM Plex Mono',monospace;">{{ kaku }} / 10</span></div><div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ kakuPct }}%;height:100%;background:#d9a441;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ kakuDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ kakuUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8d93a0;margin-bottom:4px;"><span>実在感</span><span style="font-family:'IBM Plex Mono',monospace;color:#6fd3d8;">63%</span></div><div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:63%;height:100%;background:#4f8f94;"></div></div><div style="font-size:9px;color:#7d8492;margin-top:3px;">※勤務を続けると減少します</div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#8d93a0;margin-bottom:4px;"><span>実在感</span><span style="font-family:'IBM Plex Mono',monospace;color:#6fd3d8;">{{ jitsu }}%</span></div><div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ jitsu }}%;height:100%;background:#4f8f94;"></div></div><div style="font-size:9px;color:#7d8492;margin-top:3px;">※判定を下すたび、自動で1%減少します</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ jitsuDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ jitsuUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 照合判定（dice）: 実際に押せる審査印（許可／拒否） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="照合判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#8d93a0;">難度を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:118px;height:118px;border:4px solid {{ stampBorder }};border-radius:6px;transform:rotate(-6deg);animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:{{ diceVerdictColor }};background:{{ stampBg }};">
                <span style="font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:600;line-height:1;">{{ diceFace }}</span>
                <span style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:15px;letter-spacing:6px;border-top:2px solid {{ stampBorder }};padding-top:3px;margin-top:4px;">{{ stampWord }}</span>
              </div>
              <div style="font-size:14px;color:#8d93a0;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:2px;color:{{ diceVerdictColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-family:'DotGothic16',monospace;font-size:12px;color:#6fd3d8;margin:4px 0 0;">{{ diceAside }}</p>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-size:12px;font-family:'IBM Plex Mono',monospace;padding:7px 12px;border-radius:3px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Shippori Mincho',serif;font-size:12px;padding:5px 11px;border-radius:3px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:2px solid #d9a441;border-radius:5px;cursor:pointer;background:linear-gradient(180deg,#e2b355,#b8862f);color:#191104;font-family:'Shippori Mincho',serif;font-weight:800;font-size:15px;letter-spacing:3px;box-shadow:0 10px 24px -8px rgba(217,164,65,.4);">審査印を押す</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:0 0 9px;">■ 今夜の審査記録</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#c9c2ad;padding:7px 0;border-bottom:1px dotted rgba(217,164,65,.22);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 検問の列（combat）: 各旅行者の「発見した矛盾」を実際に数えられる ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="検問の列" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:24px;margin:0;color:#e8e0cc;">{{ queueTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ sendHolding }}" style="padding:8px 15px;border:1px solid rgba(217,164,65,.4);border-radius:3px;background:transparent;color:#c9c2ad;cursor:pointer;font-family:'Shippori Mincho',serif;font-size:13px;">保留室へ送る</button><button onClick="{{ nextWindow }}" style="padding:8px 15px;border:2px solid #d9a441;border-radius:3px;background:linear-gradient(180deg,#e2b355,#b8862f);color:#191104;cursor:pointer;font-weight:800;font-size:13px;font-family:'Shippori Mincho',serif;">次の窓口へ</button></div>
            </div>
            <p style="font-size:12px;color:#7d8492;margin:0 0 16px;">列の長さ：目視不能 ・ 霧の濃度：中 ・ 犬の機嫌：普通</p>
            <sc-for list="{{ travelers }}" as="tv">
              <div style="display:flex;align-items:center;gap:12px;padding:{{ tv.pad }};border-radius:5px;border:{{ tv.border }};background:{{ tv.bg }};margin-bottom:8px;opacity:{{ tv.op }};">
                <span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:{{ tv.numBg }};color:{{ tv.numColor }};border-radius:3px;">{{ tv.num }}</span>
                <span style="width:30px;height:30px;flex:none;border-radius:50%;{{ tv.tokenStyle }}"></span>
                <div style="flex:1;">
                  <div style="font-size:15px;font-weight:700;color:{{ tv.nameColor }};">{{ tv.name }} <span style="font-size:11px;color:{{ tv.sideColor }};">{{ tv.side }}</span></div>
                  <sc-if value="{{ tv.hasTags }}">
                    <div style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap;">
                      <sc-for list="{{ tv.tags }}" as="tg"><span style="font-size:10px;padding:2px 7px;border-radius:2px;background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    </div>
                  </sc-if>
                  <sc-if value="{{ tv.hasNote }}"><div style="font-size:11px;color:#6fd3d8;font-family:'DotGothic16',monospace;margin-top:3px;">{{ tv.note }}</div></sc-if>
                </div>
                <div style="width:170px;">
                  <sc-if value="{{ tv.trackable }}">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:#8d93a0;margin-bottom:3px;"><span>発見した矛盾</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tv.count }} / {{ tv.max }}</span></div>
                    <div style="height:8px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ tv.pct }}%;height:100%;background:linear-gradient(90deg,#4f8f94,#d9a441);"></div></div>
                    <sc-if value="{{ tv.ready }}"><div style="font-size:9px;color:#d9a441;margin-top:2px;">※審問へ移行可能</div></sc-if>
                    <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;">
                      <button onClick="{{ tv.dec }}" style="${BTN_TINY}">−1</button>
                      <button onClick="{{ tv.inc }}" style="${BTN_TINY}">＋1</button>
                    </div>
                  </sc-if>
                  <sc-if value="{{ tv.unknown }}">
                    <div style="display:flex;justify-content:space-between;font-size:11px;color:#8d93a0;margin-bottom:3px;"><span>発見した矛盾</span><span style="font-family:'IBM Plex Mono',monospace;color:#c96a52;">？ / ？</span></div>
                    <div style="height:8px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:100%;height:100%;background:repeating-linear-gradient(90deg,rgba(192,74,58,.35) 0 6px,transparent 6px 12px);"></div></div>
                  </sc-if>
                  <sc-if value="{{ tv.isFog }}">
                    <button onClick="{{ tv.peek }}" style="font-size:10px;padding:3px 9px;border:1px dashed rgba(217,164,65,.4);border-radius:3px;background:transparent;color:#7d8492;cursor:pointer;">覗き見る</button>
                  </sc-if>
                </div>
              </div>
            </sc-for>
          </div>
        </sc-if>`,
  },

  // ── 押収品保管庫（inventory）: 「手紙（宛先：あなた）」だけ開封できる ──────────────
  {
    find: `<div style="border:1px solid rgba(192,74,58,.5);border-radius:4px;padding:10px 13px;background:rgba(192,74,58,.04);"><div style="display:flex;justify-content:space-between;font-size:13px;color:#e8e0cc;"><span style="font-weight:700;">手紙（宛先：あなた）</span><span style="font-family:'IBM Plex Mono',monospace;color:#c96a52;">No.097</span></div><div style="font-size:11px;color:#c96a52;margin-top:2px;">未開封。差出人欄の筆跡は、あなた自身のもの。開封は推奨されない。</div></div>`,
    replace: `<div style="border:1px solid rgba(192,74,58,.5);border-radius:4px;padding:10px 13px;background:rgba(192,74,58,.04);"><div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#e8e0cc;"><span style="font-weight:700;">手紙（宛先：あなた）</span><span style="display:flex;align-items:center;gap:8px;"><sc-if value="{{ letterUnopened }}"><button onClick="{{ openLetter }}" style="font-size:10px;padding:2px 9px;border:1px solid rgba(192,74,58,.5);border-radius:3px;background:rgba(255,255,255,.04);color:#c96a52;cursor:pointer;">開封する</button></sc-if><span style="font-family:'IBM Plex Mono',monospace;color:#c96a52;">No.097</span></span></div><div style="font-size:11px;color:#c96a52;margin-top:2px;">{{ letterNote }}</div></div>`,
  },

  // ── 審査記録（story）: 分岐シナリオプレイヤー（既存の再確認トグルは維持） ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="審査記録" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#8d93a0;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#e8e0cc;">「アンナ・ヴェイル」</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#d9a441;"><span style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(217,164,65,.5));"></span><span style="font-size:12px;">✧</span><span style="flex:1;height:1px;background:linear-gradient(90deg,rgba(217,164,65,.5),transparent);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-size:16px;line-height:2.05;color:#c9c2ad;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid rgba(217,164,65,.5);background:rgba(217,164,65,.03);font-size:16px;line-height:1.9;color:#c9c2ad;">{{ b.t }}</blockquote></sc-if>
              <sc-if value="{{ b.isA }}"><p style="font-family:'DotGothic16',monospace;font-size:12px;color:#6fd3d8;margin:0 0 18px;">{{ b.t }}</p></sc-if>
            </sc-for>

            <div style="border:1px solid rgba(217,164,65,.4);border-radius:6px;overflow:hidden;margin:0 0 10px;background:#efe9d8;color:#2a3140;box-shadow:0 14px 30px -12px rgba(0,0,0,.6);">
              <div style="display:flex;align-items:center;justify-content:space-between;padding:9px 16px;background:#e3dbc2;border-bottom:1px solid rgba(42,49,64,.25);">
                <span style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:13px;letter-spacing:2px;">旅券 ・ アルカディア発行</span>
                <span style="font-family:'IBM Plex Mono',monospace;font-size:10px;color:#6b6350;">PASSPORT No. {{ doc.passNo }}</span>
              </div>
              <div style="display:flex;gap:16px;padding:14px 16px;">
                <div style="width:74px;height:92px;flex:none;border:1px solid rgba(42,49,64,.35);background:repeating-linear-gradient(45deg,rgba(42,49,64,.08) 0 5px,transparent 5px 10px),#f7f2e3;display:flex;align-items:flex-end;justify-content:center;padding-bottom:5px;font-size:9px;color:#6b6350;">{{ doc.photo }}</div>
                <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px;">
                  <div style="display:flex;justify-content:space-between;border-bottom:1px dotted rgba(42,49,64,.3);padding-bottom:5px;"><span style="font-size:11px;color:#6b6350;">氏名</span><span style="font-family:'Shippori Mincho',serif;font-size:14px;{{ doc.nameStyle }}">{{ doc.name }}</span></div>
                  <div style="display:flex;justify-content:space-between;border-bottom:1px dotted rgba(42,49,64,.3);padding-bottom:5px;"><span style="font-size:11px;color:#6b6350;">国籍</span><span style="font-family:'Shippori Mincho',serif;font-size:14px;{{ doc.nationStyle }}">{{ doc.nation }}</span></div>
                  <div style="display:flex;justify-content:space-between;border-bottom:1px dotted rgba(42,49,64,.3);padding-bottom:5px;"><span style="font-size:11px;color:#6b6350;">出生地</span><span style="font-family:'Shippori Mincho',serif;font-size:14px;{{ doc.birthStyle }}">{{ doc.birth }}</span></div>
                  <div style="display:flex;justify-content:space-between;"><span style="font-size:11px;color:#6b6350;">渡航目的</span><span style="font-family:'Shippori Mincho',serif;font-size:14px;color:#2a3140;">帰郷</span></div>
                </div>
              </div>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 22px;">
              <button onClick="{{ recheck }}" style="padding:10px 18px;border:2px solid #d9a441;border-radius:5px;cursor:pointer;background:transparent;color:#d9a441;font-family:'Shippori Mincho',serif;font-weight:700;font-size:13px;letter-spacing:1px;">{{ recheckLabel }}</button>
              <sc-if value="{{ rechecked }}" hint-placeholder-val="{{ false }}">
                <span style="font-family:'DotGothic16',monospace;font-size:12px;color:#6fd3d8;text-align:right;">記載が、さっきと違う。書類はあなたを試している。</span>
              </sc-if>
              <sc-if value="{{ notRechecked }}" hint-placeholder-val="{{ true }}">
                <span style="font-size:11px;color:#7d8492;text-align:right;">※再確認するたび、記載は変わることがある。</span>
              </sc-if>
            </div>

            <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:0 0 12px;">■ 審査官の行動</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(217,164,65,.35);border-radius:5px;background:rgba(255,255,255,.02);cursor:pointer;font-family:'Shippori Mincho',serif;font-size:14px;color:#e8e0cc;">{{ c.num }}　{{ c.pre }}<span style="color:#d9a441;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#d9a441;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:linear-gradient(90deg,#b8862f,#d9a441);"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#7d8492;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#7d8492;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Shippori Mincho',serif;">審査記録を最初から書き直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 上級審問室（GM）: 場面切替・国境の揺らぎ・夜の異変表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="上級審問室" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:23px;margin:0 0 4px;color:#e8e0cc;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#8d93a0;margin:0 0 20px;">管理官だけが読める頁。窓口のランプが瞬くのは、この頁がめくられた時だ。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:0 0 11px;">■ 今夜の場面</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:5px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-family:'Shippori Mincho',serif;font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#d9a441;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:20px 0 10px;">■ 国境の揺らぎ</p>
                <div style="height:9px;border-radius:2px;background:rgba(255,255,255,.08);overflow:hidden;"><div style="width:{{ yuragi }}%;height:100%;background:linear-gradient(90deg,#4f8f94,#c04a3a);"></div></div>
                <p style="font-size:11px;color:#7d8492;margin:6px 0 0;">満ちると国境が検問所を「向こう側」へ置いて移動する。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ yuragiMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#8d93a0;">{{ yuragi }}%</span>
                  <button onClick="{{ yuragiPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:0 0 11px;">■ 人物 ・ 秘匿情報</p>
                <div style="border:1px solid rgba(217,164,65,.25);border-radius:5px;padding:11px 13px;margin-bottom:8px;background:rgba(255,255,255,.02);"><div style="font-size:14px;font-weight:700;color:#e8e0cc;">「アンナ・ヴェイル」</div><div style="font-size:12px;color:#8d93a0;margin-top:2px;">望み：帰郷。それは本心で、噓はどこにもない。</div><div style="font-size:12px;color:#c96a52;margin-top:4px;background:rgba(192,74,58,.08);border-radius:3px;padding:4px 8px;">秘密：アルカディアは、彼女が眠るたびに作り直される国。旅券が温かいのは、国が生きているから。</div></div>
                <div style="border:1px solid rgba(217,164,65,.25);border-radius:5px;padding:11px 13px;background:rgba(255,255,255,.02);"><div style="font-size:14px;font-weight:700;color:#e8e0cc;">窓口の老人</div><div style="font-size:12px;color:#8d93a0;margin-top:2px;">初代審査官。実在感が薄れすぎて、もう誰にも解雇できない。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#d9a441;font-weight:700;margin:20px 0 10px;">■ 夜の異変表（d6）</p>
                <div style="font-size:13px;color:#c9c2ad;line-height:1.9;">1–2 列が一人増えている ・ 3 ランプが瞬く<br>4 印章の位置が変わっている ・ 5 犬が誰もいない方を見る ・ 6 夜が明けない</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:2px solid #d9a441;border-radius:3px;background:linear-gradient(180deg,#e2b355,#b8862f);color:#191104;cursor:pointer;font-weight:800;font-size:12px;letter-spacing:1px;">異変表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#e8c876;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
