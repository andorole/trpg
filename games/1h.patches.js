/*
 * 1h-宛先不明郵便局 のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(58,54,48,.25);border-radius:5px;background:#fff;color:#8a8272;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(58,54,48,.25);border-radius:5px;background:#fff;color:#c9382e;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(58,54,48,.25);border-radius:5px;background:#fff;color:#2f7a4f;cursor:pointer;";

module.exports = [

  // ── 夜間窓口（top）: 「夜間配達に出る」を配達記録へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #c9382e;border-radius:6px;cursor:pointer;background:#c9382e;color:#f6f1e6;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(201,56,46,.2);">夜間配達に出る　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #c9382e;border-radius:6px;cursor:pointer;background:#c9382e;color:#f6f1e6;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(201,56,46,.2);">夜間配達に出る　➜</button>`,
  },

  // ── 局員手帳（sheet）: 体力 / 想い容量 / 現世との縁 を実数値＋増減ボタンに ──────────────
  {
    find: `<div style="background:#fdfaf2;border:1px solid rgba(58,54,48,.15);border-radius:6px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#8a8272;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">14 / 18</span></div><div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:78%;height:100%;background:#c9382e;"></div></div></div>`,
    replace: `<div style="background:#fdfaf2;border:1px solid rgba(58,54,48,.15);border-radius:6px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#8a8272;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 18</span></div><div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#c9382e;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fdfaf2;border:1px solid rgba(58,54,48,.15);border-radius:6px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#8a8272;margin-bottom:5px;"><span>想い容量</span><span style="font-family:'IBM Plex Mono',monospace;">7 / 10</span></div><div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:70%;height:100%;background:#2c4a72;"></div></div><div style="font-size:9px;color:#a39a86;margin-top:4px;">※手紙の想いを預かれる量。溢れると涙が止まらなくなる</div></div>`,
    replace: `<div style="background:#fdfaf2;border:1px solid rgba(58,54,48,.15);border-radius:6px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#8a8272;margin-bottom:5px;"><span>想い容量</span><span style="font-family:'IBM Plex Mono',monospace;">{{ omoi }} / 10</span></div><div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ omoiPct }}%;height:100%;background:#2c4a72;"></div></div><div style="font-size:9px;color:#a39a86;margin-top:4px;">※手紙の想いを預かれる量。溢れると涙が止まらなくなる</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ omoiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ omoiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fdfaf2;border:1px solid rgba(58,54,48,.15);border-radius:6px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#8a8272;margin-bottom:5px;"><span>現世との縁</span><span style="font-family:'IBM Plex Mono',monospace;color:#c9382e;">61 / 100</span></div><div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:61%;height:100%;background:linear-gradient(90deg,#c9382e,#7a5a9e);"></div></div><div style="font-size:9px;color:#a39a86;margin-top:4px;">※黄泉へ渡るたび減る。0になった局員は、帰ってこない</div></div>`,
    replace: `<div style="background:#fdfaf2;border:1px solid rgba(58,54,48,.15);border-radius:6px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#8a8272;margin-bottom:5px;"><span>現世との縁</span><span style="font-family:'IBM Plex Mono',monospace;color:#c9382e;">{{ enk }} / 100</span></div><div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ enk }}%;height:100%;background:linear-gradient(90deg,#c9382e,#7a5a9e);"></div></div><div style="font-size:9px;color:#a39a86;margin-top:4px;">※黄泉へ渡るたび減る。0になった局員は、帰ってこない</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ enkDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ enkUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 消印判定（dice）: 実際に振れる消印（配達可／保留／返送） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="消印判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#8a8272;">配達基準を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:126px;height:126px;border:3px solid {{ stampColor }};border-radius:50%;animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:{{ stampColor }};background:{{ stampBg }};gap:2px;">
                <span style="font-size:10px;letter-spacing:2px;border-bottom:1.5px solid {{ stampColor }};padding-bottom:2px;">第七夜勤区</span>
                <span style="font-family:'IBM Plex Mono',monospace;font-size:40px;font-weight:600;line-height:1;">{{ diceFace }}</span>
                <span style="font-size:11px;letter-spacing:3px;border-top:1.5px solid {{ stampColor }};padding-top:2px;font-weight:700;">{{ stampWord }}</span>
              </div>
              <div style="font-size:14px;color:#8a8272;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#a39a86;margin:2px 0 0;">※この局では、サイコロの代わりに追跡番号が運命を決めます。番号は嘘をつきません。</p>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-size:12px;font-family:'IBM Plex Mono',monospace;padding:7px 12px;border-radius:3px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Zen Maru Gothic',sans-serif;font-size:12px;padding:5px 11px;border-radius:999px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:2px solid #c9382e;border-radius:6px;cursor:pointer;background:#c9382e;color:#f6f1e6;font-family:'Zen Maru Gothic',sans-serif;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(201,56,46,.2);">消印を押す</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:0 0 9px;">■ 本日の消印簿</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#5c564c;padding:7px 0;border-bottom:1px dashed rgba(58,54,48,.22);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 配達行路（combat）: 迷い霧・未練の犬・時空の踏切のトラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="配達行路" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:24px;margin:0;color:#3a3630;">配達行路 ・ 黄泉の渡し場 経由</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ restBreak }}" style="padding:8px 15px;border:1px solid rgba(58,54,48,.3);border-radius:5px;background:#fff;color:#8a8272;cursor:pointer;font-size:13px;font-family:'Zen Maru Gothic',sans-serif;">小休止</button><button onClick="{{ advance }}" style="padding:8px 15px;border:2px solid #c9382e;border-radius:5px;background:#c9382e;color:#f6f1e6;cursor:pointer;font-weight:700;font-size:13px;font-family:'Zen Maru Gothic',sans-serif;">先へ進む</button></div>
            </div>
            <p style="font-size:12px;color:#a39a86;margin:0 0 14px;">※夜明けまでに帰局できないと「現世との縁」が10減ります。急ぎつつ、丁寧に。</p>

            <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:6px;border:2px solid #c9382e;background:rgba(201,56,46,.04);margin-bottom:14px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;background:#c9382e;color:#fff;border-radius:50%;">〒</span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#3a3630;">ツグミ（配達中） <span style="font-size:11px;color:#c9382e;">郵袋：手紙4通＋想い6.8kg</span></div><div style="display:flex;gap:5px;margin-top:3px;"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(44,74,114,.1);color:#2c4a72;">自転車（前カゴ結界付）</span><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:rgba(201,56,46,.08);color:#c9382e;">通行手形あり</span></div></div><div style="width:170px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#8a8272;margin-bottom:3px;"><span>夜明けまで</span><span style="font-family:'IBM Plex Mono',monospace;">{{ dawnLabel }}</span></div><div style="height:8px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ dawnPct }}%;height:100%;background:linear-gradient(90deg,#2c4a72,#c9382e);"></div></div></div></div>
            <sc-if value="{{ hasDawnWarn }}"><p style="font-size:12px;color:#c9382e;font-weight:700;margin:0 0 14px;">{{ dawnWarnMsg }}</p></sc-if>

            <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:0 0 10px;">■ 行路上の障り</p>
            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:6px;border:1px solid rgba(122,90,158,.5);background:rgba(122,90,158,.04);margin-bottom:8px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:#7a5a9e;color:#fff;border-radius:50%;">1</span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#7a5a9e;">迷い霧 <span style="font-size:11px;color:#8a8272;">{{ kiriDesc }}</span></div><div style="font-size:12px;color:#8a8272;margin-top:2px;">入った者の「帰りたい場所」を上書きしてくる霧。鼻歌で防げる。</div></div><div style="width:150px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#8a8272;margin-bottom:3px;"><span>晴れるまで</span><span style="font-family:'IBM Plex Mono',monospace;">{{ kiriTurns }}巡</span></div><div style="height:8px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ kiriPct }}%;height:100%;background:#7a5a9e;"></div></div>
              <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ kiriMinus }}" style="${BTN_TINY_HEAL}">−1</button><button onClick="{{ kiriPlus }}" style="${BTN_TINY_DMG}">＋1</button></div>
            </div></div>

            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:6px;border:1px solid rgba(181,138,31,.55);background:rgba(181,138,31,.05);margin-bottom:8px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:#b58a1f;color:#fff;border-radius:50%;">2</span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#8a6a1f;">未練の犬 <span style="font-size:11px;color:#8a8272;">{{ inuDesc }}</span></div><div style="font-size:12px;color:#8a8272;margin-top:2px;">誰かが手紙に書き忘れた「追伸」が犬の形になったもの。手紙のあとを付いてくる。</div></div><div style="width:150px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#8a8272;margin-bottom:3px;"><span>なつき度</span><span style="font-family:'IBM Plex Mono',monospace;">{{ inuNatsuki }}/100</span></div><div style="height:8px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ inuNatsuki }}%;height:100%;background:#b58a1f;"></div></div><div style="font-size:9px;color:#a39a86;margin-top:2px;">※100で正式に局の犬になる</div>
              <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ inuMinus }}" style="${BTN_TINY_DMG}">−5</button><button onClick="{{ inuPlus }}" style="${BTN_TINY_HEAL}">＋5</button></div>
            </div></div>

            <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:6px;border:1px solid rgba(44,74,114,.5);background:rgba(44,74,114,.04);"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:#2c4a72;color:#fff;border-radius:50%;">3</span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#2c4a72;">時空の踏切 <span style="font-size:11px;color:#c9382e;{{ tickerAnim }}">{{ fumikiriState }}</span></div><div style="font-size:12px;color:#8a8272;margin-top:2px;">「昨日」と「明日」が交互に通過する踏切。渡るタイミングで配達先の時代が決まる。</div></div><div style="width:150px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#8a8272;margin-bottom:3px;"><span>次の「明日」まで</span><span style="font-family:'IBM Plex Mono',monospace;">{{ fumikiriTurns }}巡</span></div><div style="height:8px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ fumikiriPct }}%;height:100%;background:#2c4a72;"></div></div></div></div>
          </div>
        </sc-if>`,
  },

  // ── 郵袋（inventory）: 犬用ビスケットだけ「あげる」操作ができる ──────────────
  {
    find: `<div style="padding:12px 14px;border:1px solid rgba(181,138,31,.5);border-radius:6px;background:rgba(181,138,31,.04);"><div style="font-size:14px;font-weight:700;color:#8a6a1f;">犬用ビスケット</div><div style="font-size:12px;color:#8a8272;margin-top:3px;line-height:1.7;">未練の犬用。あげると尻尾の振りが1.4倍になる。局の経費で購入可。</div></div>`,
    replace: `<div style="padding:12px 14px;border:1px solid rgba(181,138,31,.5);border-radius:6px;background:rgba(181,138,31,.04);"><div style="display:flex;align-items:center;justify-content:space-between;"><div style="font-size:14px;font-weight:700;color:#8a6a1f;">犬用ビスケット {{ biscuitLabel }}</div><sc-if value="{{ biscuitAvailable }}"><button onClick="{{ giveBiscuit }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(181,138,31,.5);border-radius:999px;background:#fff;color:#8a6a1f;cursor:pointer;">あげる</button></sc-if></div><div style="font-size:12px;color:#8a8272;margin-top:3px;line-height:1.7;">未練の犬用。あげるとなつき度が上がる。局の経費で購入可。</div></div>`,
  },

  // ── 配達記録（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="配達記録" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#8a8272;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#3a3630;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#c9382e;"><span style="flex:1;height:1px;background:rgba(58,54,48,.25);"></span><span style="font-size:12px;">〒</span><span style="flex:1;height:1px;background:rgba(58,54,48,.25);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.1;color:#403b33;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #c9382e;background:rgba(201,56,46,.03);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#5c564c;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:0 0 12px;">■ どうする</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(58,54,48,.3);border-radius:6px;background:#fff;cursor:pointer;font-family:'Zen Maru Gothic',sans-serif;font-size:14px;color:#403b33;">{{ c.num }}　{{ c.pre }}<span style="color:#c9382e;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#c9382e;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#c9382e;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#a39a86;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#a39a86;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Maru Gothic',sans-serif;">配達記録を最初からやり直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 局長室（GM）: 配達切替・局全体の未達圧・夜のハプニング表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="局長室" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:23px;margin:0 0 4px;color:#3a3630;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#8a8272;margin:0 0 20px;">局長室の扉は常に施錠。だが差し入れ口から、毎晩指示書きだけが出てくる。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:0 0 11px;">■ 進行中の配達</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:6px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#c9382e;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:20px 0 10px;">■ 局全体の「未達」圧</p>
                <div style="height:9px;border-radius:5px;background:rgba(58,54,48,.08);overflow:hidden;"><div style="width:{{ mitatsu }}%;height:100%;background:linear-gradient(90deg,#2c4a72,#c9382e);"></div></div>
                <p style="font-size:11px;color:#a39a86;margin:6px 0 0;">未達が溜まりすぎると、局舎が「配達に出たがって」動き出す。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ mitatsuMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#8a8272;">{{ mitatsu }}%</span>
                  <button onClick="{{ mitatsuPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:0 0 11px;">■ 秘匿事項（局長預かり）</p>
                <div style="border:1px solid rgba(58,54,48,.25);border-radius:6px;padding:11px 13px;margin-bottom:8px;background:#fdfaf2;"><div style="font-size:14px;font-weight:700;color:#3a3630;">XX-0000-00 の正体</div><div style="font-size:12px;color:#8a8272;margin-top:2px;">宛名が変わるのではない。<b>読む者ごとに「その人が一番受け取るべき手紙」に見えている。</b></div><div style="font-size:12px;color:#c9382e;margin-top:4px;background:rgba(201,56,46,.05);border-radius:4px;padding:4px 8px;">秘密：差出人は先代の配達員。まだ配達の途中で、帰り道を忘れているだけ。</div></div>
                <div style="border:1px solid rgba(58,54,48,.25);border-radius:6px;padding:11px 13px;background:#fdfaf2;"><div style="font-size:14px;font-weight:700;color:#3a3630;">ユキ（窓口係）</div><div style="font-size:12px;color:#8a8272;margin-top:2px;">昔、届くはずのない手紙の「受取人」だった。受け取った日から年を取っていない。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#c9382e;font-weight:700;margin:20px 0 10px;">■ 夜のハプニング表（d6）</p>
                <div style="font-size:13px;color:#5c564c;line-height:1.9;">1–2 にわか雨（油紙の出番） ・ 3 追跡番号が二通で入れ替わる<br>4 受取人がすでに引っ越し（転居先：黄泉） ・ 5 未練の犬が増える ・ 6 局長の点呼（全員、声だけで返事）</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:2px solid #c9382e;border-radius:999px;background:#c9382e;color:#f6f1e6;cursor:pointer;font-weight:700;font-size:12px;letter-spacing:1px;">ハプニング表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#c9382e;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
