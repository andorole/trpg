/*
 * 1g-反省文ドラゴン のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(43,43,51,.25);border-radius:3px;background:#fff;color:#7a7668;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(43,43,51,.25);border-radius:3px;background:#fff;color:#c43c3c;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(43,43,51,.25);border-radius:3px;background:#fff;color:#2f7a4f;cursor:pointer;";

module.exports = [

  // ── 総務受付（top）: 「始末書を書き始める」を経緯書へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #2b2b33;border-radius:4px;cursor:pointer;background:#2b2b33;color:#f2f0ea;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(43,43,51,.2);">始末書を書き始める　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #2b2b33;border-radius:4px;cursor:pointer;background:#2b2b33;color:#f2f0ea;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(43,43,51,.2);">始末書を書き始める　➜</button>`,
  },

  // ── 人事ファイル（sheet）: 体力 / 社会性 / 上司からの信頼 を実数値＋増減ボタンに ──────────────
  {
    find: `<div style="background:#faf8f3;border:1px solid rgba(43,43,51,.14);border-radius:4px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7668;margin-bottom:5px;"><span>体力（竜格）</span><span style="font-family:'IBM Plex Mono',monospace;">88 / 92</span></div><div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:96%;height:100%;background:linear-gradient(90deg,#c45a2a,#c43c3c);"></div></div></div>`,
    replace: `<div style="background:#faf8f3;border:1px solid rgba(43,43,51,.14);border-radius:4px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7668;margin-bottom:5px;"><span>体力（竜格）</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 92</span></div><div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:linear-gradient(90deg,#c45a2a,#c43c3c);"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#faf8f3;border:1px solid rgba(43,43,51,.14);border-radius:4px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7668;margin-bottom:5px;"><span>社会性（人間界適応）</span><span style="font-family:'IBM Plex Mono',monospace;color:#c43c3c;">6 / 20</span></div><div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:30%;height:100%;background:#5b7fa8;"></div></div></div>`,
    replace: `<div style="background:#faf8f3;border:1px solid rgba(43,43,51,.14);border-radius:4px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7668;margin-bottom:5px;"><span>社会性（人間界適応）</span><span style="font-family:'IBM Plex Mono',monospace;color:#c43c3c;">{{ shakai }} / 20</span></div><div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:{{ shakaiPct }}%;height:100%;background:#5b7fa8;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ shakaiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ shakaiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#faf8f3;border:1px solid rgba(43,43,51,.14);border-radius:4px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7668;margin-bottom:5px;"><span>上司からの信頼</span><span style="font-family:'IBM Plex Mono',monospace;color:#b58a1f;">回復中</span></div><div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:41%;height:100%;background:linear-gradient(90deg,#b58a1f,#3d8a5f);"></div></div><div style="font-size:9px;color:#a09a88;margin-top:3px;">※前回の「誠意ある放火」で急落</div></div>`,
    replace: `<div style="background:#faf8f3;border:1px solid rgba(43,43,51,.14);border-radius:4px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7a7668;margin-bottom:5px;"><span>上司からの信頼</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ trustColor }};">{{ trustLabel }}</span></div><div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:{{ trust }}%;height:100%;background:linear-gradient(90deg,#b58a1f,#3d8a5f);"></div></div><div style="font-size:9px;color:#a09a88;margin-top:3px;">※前回の「誠意ある放火」で急落</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ trustDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ trustUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 決裁判定（dice）: 実際に振れる決裁印（承認／条件付差戻／差戻） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="決裁判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#7a7668;">決裁基準を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:118px;height:118px;border:4px solid {{ stampColor }};border-radius:6px;transform:rotate(-6deg);animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:{{ stampColor }};background:{{ stampBg }};">
                <span style="font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:600;line-height:1;">{{ diceFace }}</span>
                <span style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:14px;letter-spacing:2px;border-top:2px solid {{ stampColor }};padding-top:3px;margin-top:4px;">{{ stampWord }}</span>
              </div>
              <div style="font-size:14px;color:#7a7668;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#a09a88;margin:2px 0 0;">※差戻しは失敗ではありません。反省の解像度を上げるチャンスです（総務部標語）。</p>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-size:12px;font-family:'IBM Plex Mono',monospace;padding:7px 12px;border-radius:3px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Zen Kaku Gothic New',sans-serif;font-size:12px;padding:5px 11px;border-radius:3px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:2px solid #5b3a8f;border-radius:4px;cursor:pointer;background:#5b3a8f;color:#f2f0ea;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(91,58,143,.25);">決裁に回す</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:0 0 9px;">■ 決裁履歴</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#4a4a52;padding:7px 0;border-bottom:1px dotted rgba(43,43,51,.25);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 査問会議（combat）: 呆れゲージ（ボス）と平常心トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="査問会議" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:24px;margin:0;color:#2b2b33;">{{ kaiTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ retea }}" style="padding:8px 15px;border:1px solid rgba(43,43,51,.3);border-radius:3px;background:#fff;color:#7a7668;cursor:pointer;font-size:13px;">お茶を淹れ直す</button><button onClick="{{ nextTurn }}" style="padding:8px 15px;border:2px solid #2b2b33;border-radius:3px;background:#2b2b33;color:#f2f0ea;cursor:pointer;font-weight:700;font-size:13px;">次の弁明へ</button></div>
            </div>
            <p style="font-size:12px;color:#a09a88;margin:0 0 14px;">※勝利条件：上司の「呆れ」を0にする。敗北条件：会議室Dも燃える（100到達）。</p>

            <div style="display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:4px;border:2px solid #2f7a4f;background:rgba(47,122,79,.05);margin-bottom:14px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:#2f7a4f;color:#fff;border-radius:3px;">上</span><span style="width:30px;height:30px;flex:none;border-radius:50%;border:2px solid #2f7a4f;background:radial-gradient(circle at 38% 32%,#e8f3ec,#bcd8c6);"></span><div style="flex:1;"><div style="font-size:15px;font-weight:700;color:#2f7a4f;">上司 ユーリ課長代理（元・勇者） <span style="font-size:11px;color:#7a7668;">議長</span></div><div style="display:flex;gap:5px;margin-top:3px;"><span style="font-size:10px;padding:2px 7px;border-radius:2px;background:rgba(47,122,79,.1);color:#2f7a4f;">聖剣は倉庫に封印中</span><span style="font-size:10px;padding:2px 7px;border-radius:2px;background:rgba(43,43,51,.07);color:#4a4a52;">こめかみに指</span></div></div><div style="width:170px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7a7668;margin-bottom:3px;"><span>呆れゲージ</span><span style="font-family:'IBM Plex Mono',monospace;">{{ akire }} / 100</span></div><div style="height:8px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:{{ akire }}%;height:100%;background:linear-gradient(90deg,#b58a1f,#c43c3c);"></div></div><div style="font-size:9px;color:#a09a88;margin-top:2px;">※0で和解 ・ 100で「もういい」</div>
              <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;">
                <button onClick="{{ akireDown5 }}" style="${BTN_TINY_HEAL}">−5</button>
                <button onClick="{{ akireDown1 }}" style="${BTN_TINY_HEAL}">−1</button>
                <button onClick="{{ akireUp1 }}" style="${BTN_TINY_DMG}">＋1</button>
                <button onClick="{{ akireUp5 }}" style="${BTN_TINY_DMG}">＋5</button>
              </div>
            </div></div>

            <sc-for list="{{ combatants }}" as="cb">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:4px;border:{{ cb.border }};background:{{ cb.bg }};margin-bottom:8px;opacity:{{ cb.op }};">
                <span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:{{ cb.initBg }};color:{{ cb.initColor }};border-radius:3px;">{{ cb.init }}</span>
                <span style="width:30px;height:30px;flex:none;border-radius:8px;border:2px solid {{ cb.tokenBorder }};background:repeating-linear-gradient(45deg,{{ cb.tokenPat }} 0 4px,transparent 4px 8px),#fff;"></span>
                <div style="flex:1;">
                  <div style="font-size:15px;font-weight:700;color:#2b2b33;">{{ cb.name }} <span style="font-size:11px;color:#c45a2a;">{{ cb.side }}</span></div>
                  <sc-if value="{{ cb.hasTags }}">
                    <div style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap;">
                      <sc-for list="{{ cb.tags }}" as="tg"><span style="font-size:10px;padding:2px 7px;border-radius:2px;{{ tg.anim }}background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    </div>
                  </sc-if>
                </div>
                <div style="width:170px;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7a7668;margin-bottom:3px;"><span>平常心</span><span style="font-family:'IBM Plex Mono',monospace;">{{ cb.hp }}/{{ cb.max }}</span></div><div style="height:8px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:{{ cb.pct }}%;height:100%;background:#5b7fa8;"></div></div>
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

  // ── 添付資料（inventory）: 下書き47枚目に「提出候補の印」をつけられる ──────────────
  {
    find: `<div style="margin-top:14px;border:1px solid rgba(181,138,31,.5);border-radius:4px;padding:13px 15px;background:rgba(181,138,31,.05);"><div style="font-size:13px;font-weight:700;color:#b58a1f;margin-bottom:5px;">鑑定メモ：下書き47枚目</div><div style="font-size:12px;line-height:1.8;color:#7a7668;">最後の一枚にだけ、本音が書かれている。「本当は、皆で使うあの会議室が、嫌いではなかった」——提出用には使えない。しかし、これがいちばん誠意かもしれない。</div></div>`,
    replace: `<div style="margin-top:14px;border:1px solid rgba(181,138,31,.5);border-radius:4px;padding:13px 15px;background:rgba(181,138,31,.05);"><div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:5px;"><div style="font-size:13px;font-weight:700;color:#b58a1f;">鑑定メモ：下書き47枚目</div><sc-if value="{{ honneUnmarked }}"><button onClick="{{ markHonne }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(181,138,31,.5);border-radius:3px;background:#fff;color:#b58a1f;cursor:pointer;">提出候補に印をつける</button></sc-if></div><div style="font-size:12px;line-height:1.8;color:#7a7668;">{{ honneText }}</div></div>`,
  },

  // ── 経緯書（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="経緯書" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#7a7668;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#2b2b33;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#2b2b33;"><span style="flex:1;height:1px;background:rgba(43,43,51,.3);"></span><span style="font-size:12px;">§</span><span style="flex:1;height:1px;background:rgba(43,43,51,.3);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.05;color:#33333b;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #5b3a8f;background:rgba(91,58,143,.04);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#4a4a52;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:0 0 12px;">■ 誓約・行動を選択</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(43,43,51,.3);border-radius:4px;background:#fff;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;color:#33333b;">{{ c.num }}　{{ c.pre }}<span style="color:#5b3a8f;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#5b3a8f;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:2px;background:rgba(43,43,51,.1);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#5b3a8f;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#a09a88;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#a09a88;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Kaku Gothic New',sans-serif;">経緯書を最初から書き直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 人事部長室（GM）: 案件切替・全社うっかり警戒度・社内ハプニング表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="人事部長室" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:23px;margin:0 0 4px;color:#2b2b33;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#7a7668;margin:0 0 20px;">人事部長だけが開ける施錠棚。考課の裏側は、社員には見せない。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:0 0 11px;">■ 進行中の案件</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:4px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#5b3a8f;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:20px 0 10px;">■ 全社「うっかり」警戒度</p>
                <div style="height:9px;border-radius:2px;background:rgba(43,43,51,.08);overflow:hidden;"><div style="width:{{ keikai }}%;height:100%;background:linear-gradient(90deg,#3d8a5f,#c43c3c);"></div></div>
                <p style="font-size:11px;color:#a09a88;margin:6px 0 0;">満ちると「全社防災訓練（本番）」イベントが発生。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ keikaiMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#7a7668;">{{ keikai }}%</span>
                  <button onClick="{{ keikaiPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:0 0 11px;">■ 人物 ・ 秘匿情報</p>
                <div style="border:1px solid rgba(43,43,51,.25);border-radius:4px;padding:11px 13px;margin-bottom:8px;background:#faf8f3;"><div style="font-size:14px;font-weight:700;color:#2b2b33;">ユーリ課長代理（元・勇者）</div><div style="font-size:12px;color:#7a7668;margin-top:2px;">望み：ドラゴンたちの雇用を守ること。厳しいのはそのため。</div><div style="font-size:12px;color:#c43c3c;margin-top:4px;background:rgba(196,60,60,.06);border-radius:3px;padding:4px 8px;">秘密：本社取締役会は「竜のリストラ」を検討中。彼の机の引き出しには、否決され続けている抗弁書が127枚。</div></div>
                <div style="border:1px solid rgba(43,43,51,.25);border-radius:4px;padding:11px 13px;background:#faf8f3;"><div style="font-size:14px;font-weight:700;color:#2b2b33;">ぷに男（スライム課・監査役）</div><div style="font-size:12px;color:#7a7668;margin-top:2px;">実は先代魔王の転生体。今の会社が、わりと気に入っている。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#5b3a8f;font-weight:700;margin:20px 0 10px;">■ 社内ハプニング表（d6）</p>
                <div style="font-size:13px;color:#4a4a52;line-height:1.9;">1–2 火災報知器の誤作動（誤りとは限らない） ・ 3 複合機が呪いを吐く<br>4 取締役の抜き打ち視察 ・ 5 差入れの到着（士気+1） ・ 6 くしゃみの予感</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:2px solid #5b3a8f;border-radius:3px;background:#5b3a8f;color:#f2f0ea;cursor:pointer;font-weight:700;font-size:12px;letter-spacing:1px;">ハプニング表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#5b3a8f;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
