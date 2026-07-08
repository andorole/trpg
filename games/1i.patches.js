/*
 * 1i-洗濯龍 のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(43,158,174,.3);border-radius:6px;background:#fff;color:#7d9298;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(43,158,174,.3);border-radius:6px;background:#fff;color:#c9722e;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(43,158,174,.3);border-radius:6px;background:#fff;color:#3ec98a;cursor:pointer;";

module.exports = [

  // ── 店内案内（top）: 「夜番をはじめる」を夜番日誌へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:999px;cursor:pointer;background:#2b9eae;color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 6px 0 #1f7683;">夜番をはじめる　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:999px;cursor:pointer;background:#2b9eae;color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 6px 0 #1f7683;">夜番をはじめる　➜</button>`,
  },

  // ── 従業員名札（sheet）: 体力 / 清潔感 / 龍との信頼 を実数値＋増減ボタンに ──────────────
  {
    find: `<div style="background:#fff;border:1px solid rgba(43,158,174,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7d9298;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">11 / 16</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:69%;height:100%;background:#2b9eae;"></div></div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(43,158,174,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7d9298;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 16</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#2b9eae;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(43,158,174,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7d9298;margin-bottom:5px;"><span>清潔感（心の）</span><span style="font-family:'IBM Plex Mono',monospace;">8 / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:80%;height:100%;background:#3ec98a;"></div></div><div style="font-size:9px;color:#9db1b5;margin-top:4px;">※呪いに触れると汚れる。汚れた心は龍が湯洗い可（要予約）</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(43,158,174,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7d9298;margin-bottom:5px;"><span>清潔感（心の）</span><span style="font-family:'IBM Plex Mono',monospace;">{{ seiketsu }} / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ seiketsuPct }}%;height:100%;background:#3ec98a;"></div></div><div style="font-size:9px;color:#9db1b5;margin-top:4px;">※呪いに触れると汚れる。汚れた心は龍が湯洗い可（要予約）</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ seiketsuDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ seiketsuUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(43,158,174,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7d9298;margin-bottom:5px;"><span>龍との信頼</span><span style="font-family:'IBM Plex Mono',monospace;color:#2b9eae;">57 / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:57%;height:100%;background:linear-gradient(90deg,#2b9eae,#3ec98a);"></div></div><div style="font-size:9px;color:#9db1b5;margin-top:4px;">※100で龍が「背中に乗せてくれる」らしい（店長談）</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(43,158,174,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7d9298;margin-bottom:5px;"><span>龍との信頼</span><span style="font-family:'IBM Plex Mono',monospace;color:#2b9eae;">{{ shinrai }} / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ shinrai }}%;height:100%;background:linear-gradient(90deg,#2b9eae,#3ec98a);"></div></div><div style="font-size:9px;color:#9db1b5;margin-top:4px;">※100で龍が「背中に乗せてくれる」らしい（店長談）</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ shinraiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ shinraiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 洗い判定（dice）: 実際に振れる洗濯表示（〇／△／✕） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="洗い判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#7d9298;">基準を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="position:relative;width:126px;height:126px;">
                <div style="position:absolute;inset:0;border-radius:50%;border:4px solid #2b9eae;background:radial-gradient(circle at 50% 45%,#e6f4f5 30%,rgba(43,158,174,.25) 31% 38%,#e6f4f5 39%);animation:drumspin 2.4s linear infinite;"></div>
                <div style="position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;">
                  <span style="font-family:'IBM Plex Mono',monospace;font-size:42px;font-weight:600;line-height:1;color:#26343a;">{{ diceFace }}</span>
                  <span style="font-size:11px;letter-spacing:2px;font-weight:900;color:{{ stampColor }};">{{ stampWord }}</span>
                </div>
              </div>
              <div style="font-size:14px;color:#7d9298;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>
              <sc-if value="{{ diceIsCheck }}">
                <div style="display:flex;gap:8px;margin-top:8px;">
                  <span title="洗える" style="width:34px;height:34px;border:2px solid {{ markOColor }};border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:15px;color:{{ markOColor }};font-weight:900;">〇</span>
                  <span title="漂白可" style="width:34px;height:34px;border:2px solid {{ markSanColor }};border-radius:6px;display:flex;align-items:center;justify-content:center;color:{{ markSanColor }};font-weight:900;">△</span>
                  <span title="タンブル乾燥禁止" style="width:34px;height:34px;border:2px solid {{ markBatsuColor }};border-radius:6px;display:flex;align-items:center;justify-content:center;color:{{ markBatsuColor }};font-weight:900;">◻✕</span>
                  <span title="祓い済み" style="width:34px;height:34px;border:2px solid #7d9298;border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:11px;color:#7d9298;font-weight:900;">祓</span>
                </div>
              </sc-if>
              <p style="font-size:10px;color:#9db1b5;margin:4px 0 0;">※判定結果は「洗濯表示」で記録されます。〇=成功 △=部分成功 ✕=洗濯不可（イベント発生）</p>
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
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:999px;cursor:pointer;background:#2b9eae;color:#fff;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 6px 0 #1f7683;">スタートボタンを押す</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:0 0 9px;">■ 本日の洗い上がり</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#4a5d63;padding:7px 0;border-bottom:1px dashed rgba(43,158,174,.25);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 洗い工程（combat）: 工程バー・呪いの汚れ残り・龍の機嫌トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="洗い工程" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
              <h1 style="font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:24px;margin:0;color:#26343a;">洗い工程 ・ 案件「花嫁衣装の呪い」</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ pauseProcess }}" style="padding:8px 15px;border:1px solid rgba(43,158,174,.35);border-radius:999px;background:#fff;color:#7d9298;cursor:pointer;font-size:13px;font-family:'Zen Maru Gothic',sans-serif;white-space:nowrap;flex:none;">一時停止</button><button onClick="{{ nextStage }}" style="padding:8px 15px;border:0;border-radius:999px;background:#2b9eae;color:#fff;cursor:pointer;font-weight:700;font-size:13px;font-family:'Zen Maru Gothic',sans-serif;box-shadow:0 4px 0 #1f7683;white-space:nowrap;flex:none;">次の工程へ</button></div>
            </div>
            <p style="font-size:12px;color:#9db1b5;margin:0 0 14px;">※呪いとの戦闘は「洗い工程」で進みます。工程ごとに全員が一手番。脱水で暴れます、たいてい。</p>

            <div style="display:flex;gap:0;margin-bottom:16px;border:1px solid rgba(43,158,174,.3);border-radius:999px;overflow:hidden;background:#fff;">
              <sc-for list="{{ stages }}" as="sg">
                <div style="flex:1;padding:8px 4px;text-align:center;font-size:11px;font-weight:{{ sg.weight }};color:{{ sg.color }};background:{{ sg.bg }};">{{ sg.label }}</div>
              </sc-for>
            </div>

            <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:12px;border:2px solid #6b4a8f;background:rgba(107,74,143,.05);margin-bottom:14px;"><span style="width:34px;height:34px;flex:none;border-radius:50%;background:radial-gradient(circle at 38% 32%,#b79ad4,#6b4a8f);box-shadow:0 0 10px rgba(107,74,143,.4);"></span><div style="flex:1;"><div style="font-size:15px;font-weight:900;color:#6b4a8f;">花嫁衣装の呪い <span style="font-size:11px;color:#7d9298;">「式は、雨だった」</span></div><div style="display:flex;gap:5px;margin-top:3px;"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(107,74,143,.12);color:#6b4a8f;">水に強い（すすぎ抵抗+2）</span><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(201,114,46,.1);color:#c9722e;">泡立ちに弱い</span></div></div><div style="width:180px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7d9298;margin-bottom:3px;"><span>汚れ残り</span><span style="font-family:'IBM Plex Mono',monospace;">{{ yogore }} / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ yogore }}%;height:100%;background:linear-gradient(90deg,#6b4a8f,#9d7bc4);"></div></div><div style="font-size:9px;color:#9db1b5;margin-top:2px;">※0で洗い上がり。呪いは「思い出」に戻る</div>
              <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ yogoreDown5 }}" style="${BTN_TINY_HEAL}">−5</button><button onClick="{{ yogoreDown1 }}" style="${BTN_TINY_HEAL}">−1</button><button onClick="{{ yogoreUp1 }}" style="${BTN_TINY_DMG}">＋1</button></div>
            </div></div>

            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;border:2px solid #2b9eae;background:rgba(43,158,174,.04);margin-bottom:8px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;background:#2b9eae;color:#fff;border-radius:50%;animation:bubble 2s ease-in-out infinite;">龍</span><div style="flex:1;"><div style="font-size:15px;font-weight:900;color:#2b9eae;">7号機の龍 <span style="font-size:11px;color:#7d9298;">{{ ryuStatus }}</span></div><div style="display:flex;gap:5px;margin-top:3px;"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:{{ ryuTagBg }};color:{{ ryuTagColor }};">{{ ryuTag }}</span></div></div><div style="width:180px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7d9298;margin-bottom:3px;"><span>機嫌</span><span style="font-family:'IBM Plex Mono',monospace;">{{ kigen }}/100</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ kigen }}%;height:100%;background:linear-gradient(90deg,#2b9eae,#3ec98a);"></div></div><div style="font-size:9px;color:#9db1b5;margin-top:2px;">※30未満で回転拒否（おやつで+15）</div>
              <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ kigenDown }}" style="${BTN_TINY_DMG}">−5</button><button onClick="{{ kigenUp }}" style="${BTN_TINY_HEAL}">＋5</button></div>
            </div></div>

            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;border:1px solid rgba(43,158,174,.25);background:#fff;margin-bottom:8px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:rgba(43,158,174,.1);color:#2b9eae;border-radius:50%;">潤</span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#26343a;">真砂 潤 <span style="font-size:11px;color:#2b9eae;">手番</span></div><div style="display:flex;gap:5px;margin-top:3px;"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(62,201,138,.12);color:#2f9a68;">泡ブースト準備完了</span></div></div><div style="width:180px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7d9298;margin-bottom:3px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }}/16</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#2b9eae;"></div></div>
              <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ taiDown }}" style="${BTN_TINY_DMG}">−1</button><button onClick="{{ taiUp }}" style="${BTN_TINY_HEAL}">＋1</button></div>
            </div></div>

            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;border:1px solid rgba(43,158,174,.25);background:#fff;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:rgba(232,138,160,.15);color:#c76a84;border-radius:50%;">柚</span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#26343a;">柚木さん（依頼人・見学中）</div><div style="display:flex;gap:5px;margin-top:3px;"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(232,138,160,.12);color:#c76a84;">このドレスの持ち主…？</span></div></div><div style="width:180px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7d9298;margin-bottom:3px;"><span>心の距離</span><span style="font-family:'IBM Plex Mono',monospace;">{{ kokoro }}%</span></div><div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ kokoro }}%;height:100%;background:#e88aa0;"></div></div></div></div>
          </div>
        </sc-if>`,
  },

  // ── 洗剤棚（inventory）: 龍のおやつだけ「あげる」操作ができる ──────────────
  {
    find: `<div style="padding:12px 14px;border:1px solid rgba(201,114,46,.5);border-radius:10px;background:rgba(201,114,46,.04);"><div style="display:flex;justify-content:space-between;"><div style="font-size:14px;font-weight:700;color:#c9722e;">龍のおやつ（乾燥イワシ）</div><span style="font-size:10px;color:#c9722e;font-family:'IBM Plex Mono',monospace;">×7</span></div><div style="font-size:12px;color:#7d9298;margin-top:3px;line-height:1.7;">機嫌+15。あげすぎると排水口から鱗が出る（掃除は夜番の仕事）。</div></div>`,
    replace: `<div style="padding:12px 14px;border:1px solid rgba(201,114,46,.5);border-radius:10px;background:rgba(201,114,46,.04);"><div style="display:flex;justify-content:space-between;align-items:center;"><div style="font-size:14px;font-weight:700;color:#c9722e;">龍のおやつ（乾燥イワシ）</div><span style="display:flex;align-items:center;gap:8px;"><sc-if value="{{ snackAvailable }}"><button onClick="{{ giveSnack }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(201,114,46,.5);border-radius:999px;background:#fff;color:#c9722e;cursor:pointer;">あげる</button></sc-if><span style="font-size:10px;color:#c9722e;font-family:'IBM Plex Mono',monospace;">×{{ snackQty }}</span></span></div><div style="font-size:12px;color:#7d9298;margin-top:3px;line-height:1.7;">機嫌+15。あげすぎると排水口から鱗が出る（掃除は夜番の仕事）。</div></div>`,
  },

  // ── 夜番日誌（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="夜番日誌" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#7d9298;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#26343a;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#2b9eae;"><span style="flex:1;height:1px;background:rgba(43,158,174,.35);"></span><span style="font-size:12px;">〇</span><span style="flex:1;height:1px;background:rgba(43,158,174,.35);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.1;color:#33424a;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #2b9eae;background:rgba(43,158,174,.04);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#4a5d63;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:0 0 12px;">■ どうする</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(43,158,174,.35);border-radius:10px;background:#fff;cursor:pointer;font-family:'Zen Maru Gothic',sans-serif;font-size:14px;color:#33424a;">{{ c.num }}　{{ c.pre }}<span style="color:#c9722e;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#c9722e;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#2b9eae;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#9db1b5;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#9db1b5;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Maru Gothic',sans-serif;">夜番日誌を最初から書き直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 店長ノート（GM）: 案件切替・排水口の圧・深夜ハプニング表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="店長ノート" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:23px;margin:0 0 4px;color:#26343a;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#7d9298;margin:0 0 20px;">レジ下の引き出し、二重底の下。夜番には（まだ）見せないノート。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:0 0 11px;">■ 進行中の案件</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:10px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#2b9eae;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:20px 0 10px;">■ 排水口の圧（世界の汚れ度）</p>
                <div style="height:9px;border-radius:6px;background:rgba(38,52,58,.07);overflow:hidden;"><div style="width:{{ haisui }}%;height:100%;background:linear-gradient(90deg,#2b9eae,#6b4a8f);"></div></div>
                <p style="font-size:11px;color:#9db1b5;margin:6px 0 0;">満ちると「大洗濯の夜」——龍が店ごと世界を洗いに出る。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ haisuiMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#7d9298;">{{ haisui }}%</span>
                  <button onClick="{{ haisuiPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:0 0 11px;">■ 秘匿事項</p>
                <div style="border:1px solid rgba(43,158,174,.3);border-radius:10px;padding:11px 13px;margin-bottom:8px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#26343a;">柚木さんの正体</div><div style="font-size:12px;color:#7d9298;margin-top:2px;">毎晩0時に来るのは、洗濯のためではない。回転窓の円を見ていると「あの日の観覧車」を思い出せるから。</div><div style="font-size:12px;color:#6b4a8f;margin-top:4px;background:rgba(107,74,143,.05);border-radius:5px;padding:4px 8px;">秘密：ドレスの染みの声の主は、6号機の中から聞こえる声と同一人物。</div></div>
                <div style="border:1px solid rgba(43,158,174,.3);border-radius:10px;padding:11px 13px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#26343a;">龍について</div><div style="font-size:12px;color:#7d9298;margin-top:2px;">昔は雨を降らせる仕事をしていた。「洗う」に転職した理由は、まだ誰にも話していない。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#2b9eae;font-weight:700;margin:20px 0 10px;">■ 深夜ハプニング表（d6）</p>
                <div style="font-size:13px;color:#4a5d63;line-height:1.9;">1–2 停電（龍の湯だけ冷めない） ・ 3 酔客が呪いを誤って持ち帰る<br>4 両替機がストライキ ・ 5 排水口から泡（虹色） ・ 6 龍が歌う（雨が降る）</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:999px;background:#2b9eae;color:#fff;cursor:pointer;font-weight:900;font-size:12px;letter-spacing:1px;">ハプニング表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#2b9eae;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
