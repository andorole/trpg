/*
 * 1k-魔法少女コールセンター のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(224,68,124,.3);border-radius:8px;background:#fff;color:#93829b;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(224,68,124,.3);border-radius:8px;background:#fff;color:#c65448;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(224,68,124,.3);border-radius:8px;background:#fff;color:#2f8a5c;cursor:pointer;";

module.exports = [

  // ── 受電状況（top）: 「ヘッドセットを装着」を通話ログへのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:999px;cursor:pointer;background:#e0447c;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #a82f5b;white-space:nowrap;">ヘッドセットを装着　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:999px;cursor:pointer;background:#e0447c;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #a82f5b;white-space:nowrap;">ヘッドセットを装着　➜</button>`,
  },

  // ── オペレーター名鑑（sheet）: 声量 / 共感ゲージ / 魔力残量 を実数値＋増減ボタンに ──────────────
  {
    find: `<div style="background:#fff;border:1px solid rgba(224,68,124,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#93829b;margin-bottom:5px;"><span>声量（体力）</span><span style="font-family:'IBM Plex Mono',monospace;">12 / 15</span></div><div style="height:9px;border-radius:6px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:80%;height:100%;background:#e0447c;"></div></div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(224,68,124,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#93829b;margin-bottom:5px;"><span>声量（体力）</span><span style="font-family:'IBM Plex Mono',monospace;">{{ seiryo }} / 15</span></div><div style="height:9px;border-radius:6px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ seiryoPct }}%;height:100%;background:#e0447c;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ seiryoDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ seiryoUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(224,68,124,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#93829b;margin-bottom:5px;"><span>共感ゲージ</span><span style="font-family:'IBM Plex Mono',monospace;">7 / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:70%;height:100%;background:#7a5a9e;"></div></div><div style="font-size:9px;color:#b3a3ba;margin-top:4px;">※満タンで「もらい泣き」発動。応対+3、記録は涙で滲む</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(224,68,124,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#93829b;margin-bottom:5px;"><span>共感ゲージ</span><span style="font-family:'IBM Plex Mono',monospace;">{{ kyokan }} / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ kyokanPct }}%;height:100%;background:#7a5a9e;"></div></div><div style="font-size:9px;color:#b3a3ba;margin-top:4px;">※満タンで「もらい泣き」発動。応対+3、記録は涙で滲む</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ kyokanDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ kyokanUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(224,68,124,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#93829b;margin-bottom:5px;"><span>魔力残量（元職）</span><span style="font-family:'IBM Plex Mono',monospace;color:#e0447c;">3%</span></div><div style="height:9px;border-radius:6px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:3%;height:100%;background:linear-gradient(90deg,#e0447c,#7a5a9e);"></div></div><div style="font-size:9px;color:#b3a3ba;margin-top:4px;">※引退時に返納したはず。なぜか3%だけ、戻ってくる</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(224,68,124,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#93829b;margin-bottom:5px;"><span>魔力残量（元職）</span><span style="font-family:'IBM Plex Mono',monospace;color:#e0447c;">{{ maryoku }}%</span></div><div style="height:9px;border-radius:6px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ maryoku }}%;height:100%;background:linear-gradient(90deg,#e0447c,#7a5a9e);"></div></div><div style="font-size:9px;color:#b3a3ba;margin-top:4px;">※引退時に返納したはず。なぜか3%だけ、戻ってくる</div></div>`,
  },

  // ── 応対判定（dice）: 実際に振れるCSAT判定（大変満足〜切電） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="応対判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#93829b;">目標を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:122px;height:122px;border:3px solid {{ stampColor }};border-radius:50%;animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:{{ stampColor }};background:#fff;box-shadow:0 8px 20px -8px rgba(224,68,124,.35);">
                <span style="font-size:10px;letter-spacing:2px;color:#93829b;">CSAT</span>
                <span style="font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:600;line-height:1.05;color:#2d2438;">{{ diceFace }}</span>
                <b style="display:inline-block;padding:1px 12px;border-radius:999px;background:{{ stampBg }};color:{{ stampColor }};font-size:12px;letter-spacing:1px;">{{ stampWord }}</b>
              </div>
              <div style="font-size:14px;color:#93829b;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#b3a3ba;margin:2px 0 0;">※出目1は「切電」。世界の平和度が0.3%下がり、SVが飛んでくる。</p>
            </div>
            <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:14px;">
              <sc-for list="{{ diceTypes }}" as="dt">
                <button onClick="{{ dt.go }}" style="font-size:12px;font-family:'IBM Plex Mono',monospace;padding:7px 12px;border-radius:999px;cursor:pointer;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};">{{ dt.label }}</button>
              </sc-for>
            </div>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:16px;">
                <sc-for list="{{ diceSkills }}" as="sk">
                  <button onClick="{{ sk.go }}" style="font-family:'Zen Kaku Gothic New',sans-serif;font-size:12px;padding:5px 11px;border-radius:999px;cursor:pointer;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};">{{ sk.label }}</button>
                </sc-for>
              </div>
            </sc-if>
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:999px;cursor:pointer;background:#e0447c;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;font-family:'Zen Kaku Gothic New',sans-serif;box-shadow:0 5px 0 #a82f5b;white-space:nowrap;">応対を開始する</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:0 0 9px;">■ 本日の応対スコア</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;color:#54465f;padding:7px 0;border-bottom:1px dashed rgba(224,68,124,.22);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};flex:none;">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 入電の嵐（combat）: 回線ごとの進捗と敵幹部の敵意トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="入電の嵐" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
              <h1 style="font-weight:900;font-size:24px;margin:0;color:#2d2438;">入電の嵐 ・ 駅前に怪人出現中</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ notifyAll }}" style="padding:8px 15px;border:1px solid rgba(224,68,124,.35);border-radius:999px;background:#fff;color:#93829b;cursor:pointer;font-size:13px;font-family:'Zen Kaku Gothic New',sans-serif;white-space:nowrap;flex:none;">全員に周知</button><button onClick="{{ nextCall }}" style="padding:8px 15px;border:0;border-radius:999px;background:#e0447c;color:#fff;cursor:pointer;font-weight:700;font-size:13px;font-family:'Zen Kaku Gothic New',sans-serif;box-shadow:0 4px 0 #a82f5b;white-space:nowrap;flex:none;">次の呼を取る</button></div>
            </div>
            <p style="font-size:12px;color:#b3a3ba;margin:0 0 14px;">※怪人出現中は入電が10倍。放棄呼が増えるほど街のパニックが進行します。電話で戦うタイプの戦闘です。</p>

            <div style="border:2px solid #c65448;border-radius:12px;padding:12px 14px;margin-bottom:14px;background:rgba(198,84,72,.03);">
              <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px;"><span style="font-size:15px;font-weight:900;color:#c65448;">事案：駅前ロータリー怪人「シメキリの獣」</span><span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#c65448;white-space:nowrap;">対応中：プリズム・ノヴァ（現地）</span></div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#93829b;margin-bottom:3px;"><span>街のパニック度</span><span style="font-family:'IBM Plex Mono',monospace;">{{ panic }}/100</span></div><div style="height:8px;border-radius:5px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ panic }}%;height:100%;background:#c65448;"></div></div></div>
                <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#93829b;margin-bottom:3px;"><span>待呼</span><span style="font-family:'IBM Plex Mono',monospace;">{{ machiko }}件</span></div><div style="height:8px;border-radius:5px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ machikoPct }}%;height:100%;background:#e0447c;"></div></div></div>
                <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#93829b;margin-bottom:3px;"><span>ノヴァの魔力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ novaMp }}%</span></div><div style="height:8px;border-radius:5px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ novaMp }}%;height:100%;background:#7a5a9e;"></div></div></div>
              </div>
            </div>

            <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:0 0 10px;">■ 回線状況（手番順）</p>
            <sc-for list="{{ lines }}" as="ln">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;border:{{ ln.border }};background:{{ ln.bg }};margin-bottom:8px;opacity:{{ ln.op }};"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;background:{{ ln.numBg }};color:{{ ln.numColor }};border-radius:50%;">{{ ln.num }}</span><div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:700;color:{{ ln.titleColor }};">{{ ln.title }} <span style="font-size:11px;color:{{ ln.tagColor }};">{{ ln.tag }}</span></div><div style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap;"><span style="font-size:10px;padding:2px 8px;border-radius:999px;background:{{ ln.noteBg }};color:{{ ln.noteColor }};">{{ ln.note }}</span></div></div><div style="width:150px;flex:none;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#93829b;margin-bottom:3px;"><span>{{ ln.gauge }}</span><span style="font-family:'IBM Plex Mono',monospace;">{{ ln.value }}</span></div><div style="height:8px;border-radius:5px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ ln.pct }}%;height:100%;background:{{ ln.barColor }};"></div></div>
                <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ ln.dec }}" style="${BTN_TINY_HEAL}">進める</button><button onClick="{{ ln.inc }}" style="${BTN_TINY_DMG}">戻す</button></div>
              </div></div>
            </sc-for>
          </div>
        </sc-if>`,
  },

  // ── ナレッジ（inventory）: 「私物のマグカップ」だけ話しかけられる ──────────────
  {
    find: `<div style="padding:12px 14px;border:1px solid rgba(122,90,158,.4);border-radius:10px;background:rgba(122,90,158,.04);"><div style="display:flex;justify-content:space-between;gap:8px;"><div style="font-size:14px;font-weight:700;color:#7a5a9e;">私物のマグカップ</div><span style="font-size:10px;color:#7a5a9e;font-family:'IBM Plex Mono',monospace;flex:none;">魔力反応：微</span></div><div style="font-size:12px;color:#93829b;margin-top:3px;line-height:1.7;">現役時代の相棒（妖精）が、今は普通のマグカップのふりをして住んでいる。すずはまだ気づいていないふりをしている。</div></div>`,
    replace: `<div style="padding:12px 14px;border:1px solid rgba(122,90,158,.4);border-radius:10px;background:rgba(122,90,158,.04);"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;"><div style="font-size:14px;font-weight:700;color:#7a5a9e;">私物のマグカップ</div><span style="display:flex;align-items:center;gap:8px;"><sc-if value="{{ mugSilent }}"><button onClick="{{ talkToMug }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(122,90,158,.5);border-radius:999px;background:#fff;color:#7a5a9e;cursor:pointer;">話しかけてみる</button></sc-if><span style="font-size:10px;color:#7a5a9e;font-family:'IBM Plex Mono',monospace;flex:none;">魔力反応：微</span></span></div><div style="font-size:12px;color:#93829b;margin-top:3px;line-height:1.7;">{{ mugText }}</div></div>`,
  },

  // ── 通話ログ（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="通話ログ" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#93829b;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#2d2438;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#e0447c;"><span style="flex:1;height:1px;background:rgba(224,68,124,.35);"></span><span style="font-size:12px;">☎</span><span style="flex:1;height:1px;background:rgba(224,68,124,.35);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.1;color:#3c3246;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #e0447c;background:rgba(224,68,124,.03);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#54465f;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:0 0 12px;">■ どう応対する</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(224,68,124,.35);border-radius:10px;background:#fff;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;color:#3c3246;">{{ c.num }}　{{ c.pre }}<span style="color:#7a5a9e;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#7a5a9e;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#e0447c;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#b3a3ba;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#b3a3ba;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Kaku Gothic New',sans-serif;">通話ログを最初からやり直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── SV席（GM）: 幕切替・世界の平和度・入電ハプニング表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="SV席" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-weight:900;font-size:23px;margin:0 0 4px;color:#2d2438;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#93829b;margin:0 0 20px;">SV席は全回線をモニタリングできる。介入は最小限に。オペレーターの成長も、この席の仕事のうち。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:0 0 11px;">■ シナリオ進行</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:10px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#e0447c;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:20px 0 10px;">■ 世界の平和度（CSAT連動）</p>
                <div style="height:9px;border-radius:5px;background:rgba(45,36,56,.06);overflow:hidden;"><div style="width:{{ heiwa }}%;height:100%;background:linear-gradient(90deg,#e0447c,#7a5a9e);"></div></div>
                <p style="font-size:11px;color:#b3a3ba;margin:6px 0 0;">{{ heiwa }}%。今夜の応対次第で、世界は少し優しくなったり、ならなかったりする。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ heiwaMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#93829b;">{{ heiwa }}%</span>
                  <button onClick="{{ heiwaPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:0 0 11px;">■ 秘匿情報（SV限り）</p>
                <div style="border:1px solid rgba(224,68,124,.3);border-radius:10px;padding:11px 13px;margin-bottom:8px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#2d2438;">#4474 敵幹部の正体</div><div style="font-size:12px;color:#93829b;margin-top:2px;">「世界を滅ぼす」と繰り返すが、通話履歴によると今月4回目。毎回、誰かが話を聞くと帰っていく。</div><div style="font-size:12px;color:#c65448;margin-top:4px;background:rgba(198,84,72,.05);border-radius:4px;padding:4px 8px;">秘密：正体は初代魔法少女。守った世界が自分を忘れていくのが、耐えられない夜がある。</div></div>
                <div style="border:1px solid rgba(224,68,124,.3);border-radius:10px;padding:11px 13px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#2d2438;">虹口すずの引退の経緯</div><div style="font-size:12px;color:#93829b;margin-top:2px;">最後の技で街を救い、魔力を使い切った。技の名前は「また明日」。翌朝、彼女はこのセンターの求人に応募した。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#e0447c;font-weight:700;margin:20px 0 10px;">■ 入電ハプニング表（d6）</p>
                <div style="font-size:13px;color:#54465f;line-height:1.9;">1–2 間違い電話（ピザの注文） ・ 3 マスコミからの取材申込<br>4 妖精語の入電（翻訳機必須） ・ 5 全回線に同時入電（怪人の仕業） ・ 6 未来の自分から着信</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:999px;background:#e0447c;color:#fff;cursor:pointer;font-weight:900;font-size:12px;letter-spacing:1px;">ハプニング表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#e0447c;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
