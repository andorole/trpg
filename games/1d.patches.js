/*
 * 1d-確定申告ダンジョン のテンプレートパッチ（build.js がビルド時に適用）。
 * 見た目のスタイルは原本デザインからそのまま転記し、値と繰り返しだけ {{ }} / sc-for 化している。
 */

const BTN_SMALL = "width:24px;height:24px;border:1px solid rgba(35,50,74,.35);border-radius:3px;background:#fdfcf7;color:#5b6472;cursor:pointer;font-size:13px;line-height:1;";

module.exports = [

  // ── 受付（top）: 「申告を開始する」を申述書へのリンクに ──────────────
  {
    find: `<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #23324a;border-radius:4px;cursor:pointer;background:#23324a;color:#f6f3e9;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(35,50,74,.25);">申告を開始する　➜</button>`,
    replace: `<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:2px solid #23324a;border-radius:4px;cursor:pointer;background:#23324a;color:#f6f3e9;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(35,50,74,.25);">申告を開始する　➜</button>`,
  },

  // ── 納税者票（sheet）: 体力 / 気力 / 信用スコアを実数値＋増減ボタンに ──────────────
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b6472;margin-bottom:4px;"><span>体力 HP</span><span style="font-family:'IBM Plex Mono',monospace;">34 / 41</span></div><div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:83%;height:100%;background:#bf3a2b;"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b6472;margin-bottom:4px;"><span>体力 HP</span><span style="font-family:'IBM Plex Mono',monospace;">{{ tai }} / 41</span></div><div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#bf3a2b;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ taiDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ taiUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b6472;margin-bottom:4px;"><span>気力 MP</span><span style="font-family:'IBM Plex Mono',monospace;">12 / 18</span></div><div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:67%;height:100%;background:#2c5f8a;"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b6472;margin-bottom:4px;"><span>気力 MP</span><span style="font-family:'IBM Plex Mono',monospace;">{{ mp }} / 18</span></div><div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:{{ mpPct }}%;height:100%;background:#2c5f8a;"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ mpDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ mpUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },
  {
    find: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b6472;margin-bottom:4px;"><span>税務信用スコア</span><span style="font-family:'IBM Plex Mono',monospace;">A（742）</span></div><div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:74%;height:100%;background:#1f6e50;"></div></div></div>`,
    replace: `<div><div style="display:flex;justify-content:space-between;font-size:12px;color:#5b6472;margin-bottom:4px;"><span>税務信用スコア</span><span style="font-family:'IBM Plex Mono',monospace;">{{ shinyoRank }}（{{ shinyo }}）</span></div><div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:{{ shinyoPct }}%;height:100%;background:{{ shinyoColor }};"></div></div><div style="display:flex;gap:5px;margin-top:6px;"><button onClick="{{ shinyoDown }}" style="${BTN_SMALL}">−</button><button onClick="{{ shinyoUp }}" style="${BTN_SMALL}">＋</button></div></div>`,
  },

  // ── 税額査定（dice）: 実際に押せる査定印（承認／差戻） ──────────────
  {
    block: 'isDice',
    replace: `<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="税額査定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">
            <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:0 0 4px;">{{ diceHead }}</p>
            <sc-if value="{{ diceIsCheck }}">
              <div style="display:flex;justify-content:center;align-items:center;gap:9px;margin:6px 0 0;">
                <button onClick="{{ dcMinus }}" style="${BTN_SMALL}">−</button>
                <span style="font-size:12px;letter-spacing:2px;color:#5b6472;">認定基準を調整</span>
                <button onClick="{{ dcPlus }}" style="${BTN_SMALL}">＋</button>
              </div>
            </sc-if>
            <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">
              <div style="width:118px;height:118px;border:4px solid #bf3a2b;border-radius:6px;transform:rotate(-8deg);animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#bf3a2b;background:rgba(191,58,43,.03);">
                <span style="font-family:'IBM Plex Mono',monospace;font-size:44px;font-weight:600;line-height:1;">{{ diceFace }}</span>
                <span style="font-family:'Shippori Mincho',serif;font-weight:700;font-size:15px;letter-spacing:6px;border-top:2px solid #bf3a2b;padding-top:3px;margin-top:4px;">{{ stampWord }}</span>
              </div>
              <div style="font-size:14px;color:#5b6472;margin-top:6px;">{{ diceFormula }}</div>
              <div style="font-size:14px;letter-spacing:2px;color:{{ diceVerdictColor }};font-weight:700;">{{ diceVerdict }}</div>
              <p style="font-size:10px;color:#8a8264;margin:2px 0 0;">※この印影は複写では効力を持ちません。</p>
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
            <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:2px solid #bf3a2b;border-radius:4px;cursor:pointer;background:#bf3a2b;color:#f6f3e9;font-family:'Zen Kaku Gothic New',sans-serif;font-weight:700;font-size:15px;letter-spacing:3px;box-shadow:3px 3px 0 rgba(191,58,43,.25);">査定印を押す</button>
            <div style="margin-top:26px;text-align:left;">
              <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:0 0 9px;">■ 査定記録（仕訳帳）</p>
              <sc-for list="{{ logRows }}" as="r">
                <div style="display:flex;justify-content:space-between;font-size:13px;color:#3a4657;padding:7px 0;border-bottom:1px dotted rgba(35,50,74,.3);"><span>{{ r.left }}</span><span style="font-family:'IBM Plex Mono',monospace;color:{{ r.color }};">{{ r.right }}</span></div>
              </sc-for>
            </div>
          </div>
        </sc-if>`,
  },

  // ── 税務調査（combat）: 追徴予定額を0にしたら勝利のボス戦トラッカー ──────────────
  {
    block: 'isCombat',
    replace: `<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="税務調査" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
              <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:24px;margin:0;color:#23324a;">{{ kaiTitle }}</h1>
              <div style="display:flex;gap:8px;"><button onClick="{{ takeBreak }}" style="padding:8px 15px;border:1px solid rgba(35,50,74,.4);border-radius:3px;background:transparent;color:#5b6472;cursor:pointer;font-size:13px;">休憩を要求</button><button onClick="{{ nextTurn }}" style="padding:8px 15px;border:2px solid #23324a;border-radius:3px;background:#23324a;color:#f6f3e9;cursor:pointer;font-weight:700;font-size:13px;">次の答弁へ</button></div>
            </div>
            <p style="font-size:12px;color:#8a8264;margin:0 0 16px;">※本調査は任意です。ただし拒否した場合、強制調査（物理）に移行します。休憩で味方の精神+2。検査回が進むたび、重加算税で精神−3。</p>
            <sc-for list="{{ combatants }}" as="cb">
              <div style="display:flex;align-items:center;gap:12px;padding:{{ cb.pad }};border-radius:4px;border:{{ cb.border }};background:{{ cb.bg }};margin-bottom:{{ cb.mb }};opacity:{{ cb.op }};">
                <span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-family:'IBM Plex Mono',monospace;font-size:13px;background:{{ cb.initBg }};color:{{ cb.initColor }};border-radius:3px;">{{ cb.init }}</span>
                <span style="width:30px;height:30px;flex:none;border-radius:50%;border:2px solid {{ cb.tokenBorder }};background:repeating-linear-gradient(45deg,{{ cb.tokenPat }} 0 4px,transparent 4px 8px);"></span>
                <div style="flex:1;">
                  <div style="font-size:15px;font-weight:700;color:{{ cb.nameColor }};">{{ cb.name }} <span style="font-size:11px;color:{{ cb.sideColor }};">{{ cb.side }}</span></div>
                  <sc-if value="{{ cb.hasTags }}">
                    <div style="display:flex;gap:5px;margin-top:3px;flex-wrap:wrap;">
                      <sc-for list="{{ cb.tags }}" as="tg"><span style="font-size:10px;padding:2px 7px;border-radius:2px;background:{{ tg.bg }};color:{{ tg.color }};">{{ tg.t }}</span></sc-for>
                    </div>
                  </sc-if>
                </div>
                <div style="width:170px;">
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:#5b6472;margin-bottom:3px;"><span>{{ cb.gauge }}</span><span style="font-family:'IBM Plex Mono',monospace;">{{ cb.valLabel }}</span></div>
                  <div style="height:8px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:{{ cb.pct }}%;height:100%;background:{{ cb.barBg }};"></div></div>
                  <sc-if value="{{ cb.isBoss }}"><div style="font-size:9px;color:#8a8264;margin-top:2px;">※0にすれば調査終了（勝利）</div></sc-if>
                  <div style="display:flex;gap:4px;margin-top:5px;justify-content:flex-end;">
                    <sc-for list="{{ cb.btns }}" as="bt"><button onClick="{{ bt.go }}" style="font-size:10px;padding:2px 6px;border:1px solid rgba(35,50,74,.3);border-radius:3px;background:#fdfcf7;color:{{ bt.color }};cursor:pointer;">{{ bt.t }}</button></sc-for>
                  </div>
                </div>
              </div>
            </sc-for>
          </div>
        </sc-if>`,
  },

  // ── 領収書綴（inventory）: 申告額の実データ化と領収書カードの操作 ──────────────
  {
    find: `<span style="font-family:'IBM Plex Mono',monospace;font-size:14px;color:#1f6e50;">申告済 4,200G</span><span style="font-family:'IBM Plex Mono',monospace;font-size:14px;color:#bf3a2b;">未計上 820G ⚠</span>`,
    replace: `<span style="font-family:'IBM Plex Mono',monospace;font-size:14px;color:#1f6e50;">申告済 {{ decLabel }}</span><span style="font-family:'IBM Plex Mono',monospace;font-size:14px;color:{{ undecColor }};">未計上 {{ undecLabel }}</span>`,
  },
  {
    find: `<div style="border:1px dashed rgba(35,50,74,.4);border-radius:3px;padding:10px 13px;margin-bottom:8px;background:#fdfcf7;"><div style="display:flex;justify-content:space-between;font-size:13px;color:#23324a;"><span style="font-weight:700;">ポーション ×3</span><span style="font-family:'IBM Plex Mono',monospace;">360G</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#5b6472;margin-top:2px;"><span>但し 治療薬代として ・ 医療費控除対象</span><span style="color:#1f6e50;">✓</span></div></div>`,
    replace: `<sc-for list="{{ receipts }}" as="rc">
                <div style="border:1px dashed {{ rc.bd }};border-radius:3px;padding:10px 13px;margin-bottom:8px;background:{{ rc.bg }};opacity:{{ rc.op }};">
                  <div style="display:flex;justify-content:space-between;align-items:center;font-size:13px;color:#23324a;"><span style="font-weight:700;">{{ rc.title }}</span><span style="display:flex;align-items:center;gap:8px;"><sc-if value="{{ rc.actionable }}"><button onClick="{{ rc.act }}" style="font-size:10px;padding:2px 9px;border:1px solid rgba(35,50,74,.35);border-radius:3px;background:#fdfcf7;color:#3a4657;cursor:pointer;">{{ rc.actLabel }}</button></sc-if><span style="font-family:'IBM Plex Mono',monospace;color:{{ rc.amtColor }};">{{ rc.amt }}</span></span></div>
                  <div style="display:flex;justify-content:space-between;font-size:11px;color:{{ rc.noteColor }};margin-top:2px;"><span>{{ rc.note }}</span><span style="color:{{ rc.markColor }};">{{ rc.mark }}</span></div>
                </div>
              </sc-for>`,
  },
  {
    find: `<div style="border:1px dashed rgba(35,50,74,.4);border-radius:3px;padding:10px 13px;margin-bottom:8px;background:#fdfcf7;"><div style="display:flex;justify-content:space-between;font-size:13px;color:#23324a;"><span style="font-weight:700;">ドラゴンの鱗 ×1</span><span style="font-family:'IBM Plex Mono',monospace;color:#bf3a2b;">時価不明</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#5b6472;margin-top:2px;"><span>雑所得 ・ 鑑定士の押印が無ければ認められない</span><span style="color:#bf3a2b;">⚠</span></div></div>`,
    replace: ``,
  },
  {
    find: `<div style="border:1px dashed rgba(35,50,74,.4);border-radius:3px;padding:10px 13px;margin-bottom:8px;background:#fdfcf7;"><div style="display:flex;justify-content:space-between;font-size:13px;color:#23324a;"><span style="font-weight:700;">謎の壺 ×1</span><span style="font-family:'IBM Plex Mono',monospace;">0G？</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#5b6472;margin-top:2px;"><span>美術品 ・ 中から声がする ・ 資産計上を拒否している</span><span style="color:#b58a1f;">審</span></div></div>`,
    replace: ``,
  },
  {
    find: `<div style="border:1px dashed rgba(191,58,43,.5);border-radius:3px;padding:10px 13px;background:rgba(191,58,43,.03);"><div style="display:flex;justify-content:space-between;font-size:13px;color:#23324a;"><span style="font-weight:700;">白紙の領収書 ×5</span><span style="font-family:'IBM Plex Mono',monospace;color:#bf3a2b;">—</span></div><div style="display:flex;justify-content:space-between;font-size:11px;color:#bf3a2b;margin-top:2px;"><span>所持しているだけで調査官の敵意+1 ・ 廃棄推奨</span><span>⚠⚠</span></div></div>`,
    replace: ``,
  },

  // ── 申述書（story）: 分岐シナリオプレイヤー ──────────────
  {
    block: 'isStory',
    replace: `<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="申述書" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">
            <p style="font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:2px;color:#5b6472;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#23324a;">{{ storyTitle }}</h1>
            <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#23324a;"><span style="flex:1;height:1px;background:rgba(35,50,74,.35);"></span><span style="font-size:12px;">§</span><span style="flex:1;height:1px;background:rgba(35,50,74,.35);"></span></div>
            <sc-if value="{{ storyHasNote }}">
              <p style="text-align:center;font-size:13px;letter-spacing:1px;color:{{ storyNoteColor }};margin:0 0 16px;font-family:'IBM Plex Mono',monospace;">{{ storyNote }}</p>
            </sc-if>
            <sc-for list="{{ storyBlocks }}" as="b">
              <sc-if value="{{ b.isP }}"><p style="font-family:'Shippori Mincho',serif;font-size:16px;line-height:2.0;color:#2c3648;margin:0 0 18px;">{{ b.t }}</p></sc-if>
              <sc-if value="{{ b.isQ }}"><blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #bf3a2b;background:rgba(191,58,43,.04);font-family:'Shippori Mincho',serif;font-size:16px;line-height:1.9;color:#3a4657;">{{ b.t }}</blockquote></sc-if>
            </sc-for>
            <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:8px 0 12px;">■ 答弁を選択</p>
            <sc-for list="{{ storyChoices }}" as="c">
              <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(35,50,74,.35);border-radius:4px;background:#fdfcf7;cursor:pointer;font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;color:#2c3648;">{{ c.num }}　{{ c.pre }}<span style="color:#bf3a2b;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="float:right;color:#bf3a2b;font-weight:700;">{{ c.dcLabel }}</span></button>
            </sc-for>
            <div style="margin-top:24px;height:5px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#23324a;"></div></div>
            <p style="text-align:center;font-family:'IBM Plex Mono',monospace;font-size:10px;letter-spacing:2px;color:#8a8264;margin:7px 0 0;">{{ storyPctLabel }}</p>
            <sc-if value="{{ storyCanRestart }}">
              <p style="text-align:center;margin:16px 0 0;"><button onClick="{{ storyRestart }}" style="border:0;background:transparent;color:#8a8264;font-size:11px;letter-spacing:2px;cursor:pointer;text-decoration:underline;font-family:'Zen Kaku Gothic New',sans-serif;">申述書を最初から書き直す</button></p>
            </sc-if>
          </div>
        </sc-if>`,
  },

  // ── 署長室（GM）: 事案切替・調査の深度・庁舎の異変表 ──────────────
  {
    block: 'isGM',
    replace: `<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">
          <div data-screen-label="署長室" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">
            <h1 style="font-family:'Shippori Mincho',serif;font-weight:800;font-size:23px;margin:0 0 4px;color:#23324a;">{{ gmTitle }}</h1>
            <p style="font-size:13px;color:#5b6472;margin:0 0 20px;">署長だけが開ける引き出し。窓口には決して出ない書類。</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:0 0 11px;">■ 進行中の事案</p>
                <sc-for list="{{ gmScenes }}" as="gs">
                  <button onClick="{{ gs.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ gs.border }};border-radius:4px;margin-bottom:8px;background:{{ gs.bg }};cursor:pointer;"><span style="font-family:'Zen Kaku Gothic New',sans-serif;font-size:14px;font-weight:{{ gs.weight }};color:{{ gs.color }};">{{ gs.t }} <span style="font-size:10px;color:#bf3a2b;">{{ gs.tag }}</span></span></button>
                </sc-for>
                <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:20px 0 10px;">■ 調査の深度</p>
                <div style="height:9px;border-radius:2px;background:rgba(35,50,74,.12);overflow:hidden;"><div style="width:{{ depth }}%;height:100%;background:linear-gradient(90deg,#2c5f8a,#bf3a2b);"></div></div>
                <p style="font-size:11px;color:#8a8264;margin:6px 0 0;">満ちると「強制調査（物理）」フェイズへ移行。</p>
                <div style="display:flex;align-items:center;gap:9px;margin-top:8px;">
                  <button onClick="{{ depthMinus }}" style="${BTN_SMALL}">−</button>
                  <span style="font-size:12px;letter-spacing:1px;color:#5b6472;">{{ depth }}%</span>
                  <button onClick="{{ depthPlus }}" style="${BTN_SMALL}">＋</button>
                </div>
              </div>
              <div>
                <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:0 0 11px;">■ 人物 ・ 秘匿情報</p>
                <div style="border:1px solid rgba(35,50,74,.3);border-radius:4px;padding:11px 13px;margin-bottom:8px;background:#fdfcf7;"><div style="font-size:14px;font-weight:700;color:#23324a;">査察官 マルサ・ヴァルキュリア</div><div style="font-size:12px;color:#5b6472;margin-top:2px;">望み：一点の曇りもない完璧な帳簿を、一度でいいから見ること。</div><div style="font-size:12px;color:#bf3a2b;margin-top:4px;background:rgba(191,58,43,.07);border-radius:3px;padding:4px 8px;">秘密：彼女の斬魔刀「更正」は経費で落ちていない。</div></div>
                <div style="border:1px solid rgba(35,50,74,.3);border-radius:4px;padding:11px 13px;background:#fdfcf7;"><div style="font-size:14px;font-weight:700;color:#23324a;">窓口職員 リンドウ</div><div style="font-size:12px;color:#5b6472;margin-top:2px;">親切。ただし彼が「なお」と言うとき、事態は必ず悪化する。</div></div>
                <p style="font-size:11px;letter-spacing:3px;color:#bf3a2b;font-weight:700;margin:20px 0 10px;">■ 庁舎の異変表（d6）</p>
                <div style="font-size:13px;color:#3a4657;line-height:1.9;">1–2 追加資料を求められる ・ 3 内線電話が鳴る（誰も出ない）<br>4 整理番号が飛ぶ ・ 5 書類が一枚だけ増えている ・ 6 お茶が出る（和解の兆し）</div>
                <div style="display:flex;align-items:center;gap:10px;margin-top:10px;">
                  <button onClick="{{ rollTable }}" style="padding:7px 16px;border:2px solid #23324a;border-radius:3px;background:#23324a;color:#f6f3e9;cursor:pointer;font-weight:700;font-size:12px;letter-spacing:1px;">異変表を振る</button>
                  <sc-if value="{{ gmHasTable }}"><span style="font-size:13px;color:#bf3a2b;">出目 {{ gmTableD }} ・ {{ gmTableText }}</span></sc-if>
                </div>
              </div>
            </div>
          </div>
        </sc-if>`,
  },
];
