/*
 * 1l-辺境コンビニ のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(47,158,95,.3);border-radius:6px;background:#fff;color:#7f927f;cursor:pointer;font-size:13px;line-height:1;";
const BTN_TINY_DMG = "font-size:10px;padding:2px 6px;border:1px solid rgba(47,158,95,.3);border-radius:6px;background:#fff;color:#c65448;cursor:pointer;";
const BTN_TINY_HEAL = "font-size:10px;padding:2px 6px;border:1px solid rgba(47,158,95,.3);border-radius:6px;background:#fff;color:#2f8a5c;cursor:pointer;";

module.exports = [

  // ── 店内モニター（top）: 「開店の照明を点ける」を業務日報へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:8px;cursor:pointer;background:#2f9e5f;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #217346;white-space:nowrap;">開店の照明を点ける　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:8px;cursor:pointer;background:#2f9e5f;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #217346;white-space:nowrap;">開店の照明を点ける　➜</button>`,
  },

  // ── 店長ファイル（sheet）: 体力 / 接客スマイル / 本部からの信頼 を実数値＋増減ボタンに ──────────────
  {
    find: `<div style="background:#fff;border:1px solid rgba(47,158,95,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7f927f;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">13 / 17</span></div><div style="height:9px;border-radius:6px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:76%;height:100%;background:#2f9e5f;"></div></div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(47,158,95,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7f927f;margin-bottom:5px;"><span>体力</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 17</span></div><div style="height:9px;border-radius:6px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#2f9e5f;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(47,158,95,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7f927f;margin-bottom:5px;"><span>接客スマイル</span><span style="font-family:'IBM Plex Mono',monospace;">6 / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:60%;height:100%;background:#f08c2e;"></div></div><div style="font-size:9px;color:#a3b3a3;margin-top:4px;">※0で「真顔接客」。魔物のお客様はむしろ落ち着く</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(47,158,95,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7f927f;margin-bottom:5px;"><span>接客スマイル</span><span style="font-family:'IBM Plex Mono',monospace;">{{ smile }} / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ smilePct }}%;height:100%;background:#f08c2e;"></div></div><div style="font-size:9px;color:#a3b3a3;margin-top:4px;">※0で「真顔接客」。魔物のお客様はむしろ落ち着く</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ smileDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ smileUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div style="background:#fff;border:1px solid rgba(47,158,95,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7f927f;margin-bottom:5px;"><span>本部からの信頼</span><span style="font-family:'IBM Plex Mono',monospace;color:#2f9e5f;">71 / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:71%;height:100%;background:linear-gradient(90deg,#2f9e5f,#2f5d9e);"></div></div><div style="font-size:9px;color:#a3b3a3;margin-top:4px;">※100で「辺境2号店」の出店権。誰も望んでいない</div></div>`,
    replace: `<div style="background:#fff;border:1px solid rgba(47,158,95,.2);border-radius:10px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#7f927f;margin-bottom:5px;"><span>本部からの信頼</span><span style="font-family:'IBM Plex Mono',monospace;color:#2f9e5f;">{{ shinrai }} / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ shinrai }}%;height:100%;background:linear-gradient(90deg,#2f9e5f,#2f5d9e);"></div></div><div style="font-size:9px;color:#a3b3a3;margin-top:4px;">※100で「辺境2号店」の出店権。誰も望んでいない</div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ shinraiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ shinraiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── レジ判定（dice）: 実際にスキャンできるレシート判定 ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="レジ判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#7f927f;">目標を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:150px;border:1px solid rgba(37,51,42,.25);background:#fff;animation:receiptout .5s ease;box-shadow:0 10px 22px -10px rgba(37,51,42,.3);padding:12px 14px 10px;text-align:left;font-family:'IBM Plex Mono',monospace;">
                <div style="font-size:9px;letter-spacing:1px;color:#7f927f;text-align:center;border-bottom:1px dashed rgba(37,51,42,.3);padding-bottom:6px;margin-bottom:6px;">辺境マート 大穴前店<br>レジ1 ・ 05:47</div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#25332a;"><span>判定</span><span>{{ skillLabel }}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#25332a;"><span>d20</span><span>{{ diceFace }}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:11px;color:#25332a;border-bottom:1px dashed rgba(37,51,42,.3);padding-bottom:6px;margin-bottom:6px;"><span>補正</span><span>{{ modLabel }}</span></div>
                <div style="display:flex;justify-content:space-between;font-size:15px;font-weight:600;color:{{ stampColor }};"><span>合計</span><span>{{ totalLabel }}</span></div>
                <div style="font-size:10px;text-align:center;color:{{ stampColor }};margin-top:5px;letter-spacing:2px;">＊＊ {{ stampWord }} ＊＊</div>
              </div>
              <div style="font-size:14px;color:#7f927f;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#a3b3a3;margin:2px 0 0;">※出目1は「レジ詰まり」。行列が1段階悪化し、魔物のお客様が舌打ちします。</p>
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
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:8px;cursor:pointer;background:#2f9e5f;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;font-family:'Zen Kaku Gothic New',sans-serif;box-shadow:0 5px 0 #217346;white-space:nowrap;">スキャンする</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:0 0 9px;">■ 本日のレジ記録</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;color:#4a5a4e;padding:7px 0;border-bottom:1px dashed rgba(47,158,95,.25);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};flex:none;">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 開門ラッシュ（combat）: 行列ゲージとレジ待ち列トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="開門ラッシュ" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">
              <h1 style="font-weight:900;font-size:24px;margin:0;color:#25332a;">開門ラッシュ ・ 06:00の陣</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ callHelp }}" style="padding:8px 15px;border:1px solid rgba(47,158,95,.35);border-radius:7px;background:#fff;color:#7f927f;cursor:pointer;font-size:13px;font-family:'Zen Kaku Gothic New',sans-serif;white-space:nowrap;flex:none;">レジ応援を呼ぶ</button><button onClick="{{ nextCustomer }}" style="padding:8px 15px;border:0;border-radius:7px;background:#2f9e5f;color:#fff;cursor:pointer;font-weight:700;font-size:13px;font-family:'Zen Kaku Gothic New',sans-serif;box-shadow:0 4px 0 #217346;white-space:nowrap;flex:none;">次のお客様へ</button></div>
            </div>
            <p style="font-size:12px;color:#a3b3a3;margin:0 0 14px;">※開門前ラッシュは一日最大の山場。行列ゲージが満ちると「お客様の声」に本部激辛コメントが載ります。</p>

            <div style="border:2px solid #f08c2e;border-radius:12px;padding:12px 14px;margin-bottom:14px;background:rgba(240,140,46,.03);">
              <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px;"><span style="font-size:15px;font-weight:900;color:#f08c2e;">行列状況：店外まで{{ queueGroups }}組</span><span style="font-family:'IBM Plex Mono',monospace;font-size:11px;color:#f08c2e;white-space:nowrap;">開門まで 12:40</span></div>
              <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">
                <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#7f927f;margin-bottom:3px;"><span>行列ゲージ</span><span style="font-family:'IBM Plex Mono',monospace;">{{ queue }}/100</span></div><div style="height:8px;border-radius:5px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ queue }}%;height:100%;background:#f08c2e;"></div></div></div>
                <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#7f927f;margin-bottom:3px;"><span>レジ2（ギギ）</span><span style="font-family:'IBM Plex Mono',monospace;">処理中</span></div><div style="height:8px;border-radius:5px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:48%;height:100%;background:#2f9e5f;"></div></div></div>
                <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#7f927f;margin-bottom:3px;"><span>おでん残量</span><span style="font-family:'IBM Plex Mono',monospace;">大根×2 卵×5</span></div><div style="height:8px;border-radius:5px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:30%;height:100%;background:#c65448;"></div></div></div>
              </div>
            </div>

            <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:0 0 10px;">■ レジ待ち列（対応順）</p>
            <sc-for list="{{ customers }}" as="cu">
              <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;border:{{ cu.border }};background:{{ cu.bg }};margin-bottom:8px;"><span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;background:{{ cu.numBg }};color:{{ cu.numColor }};border-radius:7px;">{{ cu.num }}</span><div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:700;color:{{ cu.titleColor }};">{{ cu.title }} <span style="font-size:11px;color:{{ cu.tagColor }};">{{ cu.tag }}</span></div><div style="font-size:12px;color:#7f927f;margin-top:2px;">{{ cu.note }}</div></div><div style="width:150px;flex:none;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#7f927f;margin-bottom:3px;"><span>{{ cu.gauge }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ cu.valColor }};">{{ cu.value }}</span></div><div style="height:8px;border-radius:5px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ cu.pct }}%;height:100%;background:{{ cu.barColor }};"></div></div>
                <sc-if value="{{ cu.hasBtns }}"><div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ cu.dec }}" style="${BTN_TINY_DMG}">−5</button><button onClick="{{ cu.inc }}" style="${BTN_TINY_HEAL}">＋5</button></div></sc-if>
              </div></div>
            </sc-for>
          </div>
        </sc-if>`,
  },

  // ── 発注端末（inventory）: 「地図の切れ端」だけ査定を進められる ──────────────
  {
    find: `<div style="border:1px solid rgba(47,158,95,.25);border-radius:10px;padding:10px 13px;margin-bottom:8px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;color:#25332a;"><span style="font-weight:700;">地図の切れ端（大穴・第9層）</span><span style="font-family:'IBM Plex Mono',monospace;color:#a5851f;flex:none;">査定中</span></div><div style="font-size:11px;color:#7f927f;margin-top:2px;">第9層は公式には「存在しない」。本部に報告するべきか。</div></div>`,
    replace: `<div style="border:1px solid rgba(47,158,95,.25);border-radius:10px;padding:10px 13px;margin-bottom:8px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;align-items:center;font-size:13px;color:#25332a;"><span style="font-weight:700;">地図の切れ端（大穴・第9層）</span><span style="display:flex;align-items:center;gap:8px;"><sc-if value="{{ mapPending }}"><button onClick="{{ appraiseMap }}" style="font-size:10px;padding:2px 10px;border:1px solid rgba(165,133,31,.5);border-radius:6px;background:#fff;color:#a5851f;cursor:pointer;">査定を進める</button></sc-if><span style="font-family:'IBM Plex Mono',monospace;color:{{ mapColor }};flex:none;">{{ mapStatus }}</span></span></div><div style="font-size:11px;color:#7f927f;margin-top:2px;">{{ mapNote }}</div></div>`,
  },

  // ── 業務日報（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="業務日報" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#7f927f;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#25332a;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#2f9e5f;"><span style="flex:1;height:1px;background:rgba(47,158,95,.35);"></span><span style="font-size:12px;">◆</span><span style="flex:1;height:1px;background:rgba(47,158,95,.35);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.1;color:#31402f;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #2f9e5f;background:rgba(47,158,95,.04);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#4a5a4e;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:0 0 12px;">■ どうする</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(47,158,95,.35);border-radius:10px;background:#fff;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;color:#31402f;">{{ c.num }}　{{ c.pre }}<span style="color:#c9722e;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#c9722e;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#2f9e5f;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#a3b3a3;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#a3b3a3;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Kaku Gothic New',sans-serif;">業務日報を最初から書き直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── バックヤード（GM）: 幕切替・大穴の異変度・来店ハプニング表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="バックヤード" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-weight:900;font-size:23px;margin:0 0 4px;color:#25332a;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#7f927f;margin:0 0 20px;">バックヤードの掲示と本部FAX。売場には持ち出さないこと。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:0 0 11px;">■ シナリオ進行</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:10px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#2f9e5f;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:20px 0 10px;">■ 大穴の異変度（おでん指数連動）</p>
                <div style="height:9px;border-radius:5px;background:rgba(37,51,42,.06);overflow:hidden;"><div style="width:{{ ihen }}%;height:100%;background:linear-gradient(90deg,#2f9e5f,#c65448);"></div></div>
                <p style="font-size:11px;color:#a3b3a3;margin:6px 0 0;">満ちると「大穴の氾濫」——魔物の大群が、避難所を求めて全員来店する。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ ihenMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#7f927f;">{{ ihen }}%</span>
                  <button onClick="{{ ihenPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:0 0 11px;">■ 秘匿事項（店長限り）</p>
                <div style="border:1px solid rgba(47,158,95,.3);border-radius:10px;padding:11px 13px;margin-bottom:8px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#25332a;">聖騎士ノエルの事情</div><div style="font-size:12px;color:#7f927f;margin-top:2px;">騎士団を辞めた理由は「大穴の討伐命令」への造反。守りたかったのは、大穴に住む側だった。</div><div style="font-size:12px;color:#2f5d9e;margin-top:4px;background:rgba(47,93,158,.05);border-radius:4px;padding:4px 8px;">秘密：騎士団は近く、討伐隊をこの店の前に集結させる。</div></div>
                <div style="border:1px solid rgba(47,158,95,.3);border-radius:10px;padding:11px 13px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#25332a;">おでん鍋の正体</div><div style="font-size:12px;color:#7f927f;margin-top:2px;">先代が大穴の最深部から持ち帰った「境界の釜」。火を絶やさない限り、大穴の底とこの店は「良い隣人」でいられる。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#2f9e5f;font-weight:700;margin:20px 0 10px;">■ 来店ハプニング表（d6）</p>
                <div style="font-size:13px;color:#4a5a4e;line-height:1.9;">1–2 大量買い（棚が空く） ・ 3 万引き（ただし犯人は透明）<br>4 本部の抜き打ち視察 ・ 5 竜車の配送遅延 ・ 6 先代の常連が「先代いる？」と来店</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:0;border-radius:8px;background:#2f9e5f;color:#fff;cursor:pointer;font-weight:900;font-size:12px;letter-spacing:1px;">ハプニング表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#2f9e5f;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
