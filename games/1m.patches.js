// 1m-末期ゴミ収集車 のパッチ定義
var BTN_SMALL = 'width:26px;height:26px;border:1.5px solid #3a7ba8;border-radius:7px;background:#fff;color:#3a7ba8;font-weight:700;font-size:14px;cursor:pointer;line-height:1;';
var BTN_TINY_DMG = 'border:0;background:none;color:#c65448;font-weight:700;font-size:13px;cursor:pointer;padding:2px 6px;';
var BTN_TINY_HEAL = 'border:0;background:none;color:#2f8a5c;font-weight:700;font-size:13px;cursor:pointer;padding:2px 6px;';

module.exports = [

    // ── top: 出発ボタン ──
    {
      find: '<button style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:12px;cursor:pointer;background:#3a7ba8;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #2a5a7c;white-space:nowrap;">収集車を出す　➜</button>',
      replace: '<button onClick="{{ goStory }}" style="display:inline-flex;align-items:center;gap:10px;padding:13px 30px;border:0;border-radius:12px;cursor:pointer;background:#3a7ba8;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;box-shadow:0 5px 0 #2a5a7c;white-space:nowrap;">収集車を出す　➜</button>',
    },

    // ── sheet: 体力 ──
    {
      find: '<div style="background:#fff;border:1px solid rgba(58,123,168,.2);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#84919c;margin-bottom:5px;"><span>体力</span><span style="font-family:\'IBM Plex Mono\',monospace;">12 / 15</span></div><div style="height:9px;border-radius:6px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:80%;height:100%;background:#3a7ba8;"></div></div></div>',
      replace: '<div style="background:#fff;border:1px solid rgba(58,123,168,.2);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#84919c;margin-bottom:5px;"><span>体力</span><span style="font-family:\'IBM Plex Mono\',monospace;">{{ tai }} / 15</span></div><div style="height:9px;border-radius:6px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ taiPct }}%;height:100%;background:#3a7ba8;"></div></div><div style="display:flex;gap:6px;margin-top:6px;"><button onClick="{{ taiDown }}" style="' + BTN_SMALL + '">−</button><button onClick="{{ taiUp }}" style="' + BTN_SMALL + '">＋</button></div></div>',
    },

    // ── sheet: 心の積載量 ──
    {
      find: '<div style="background:#fff;border:1px solid rgba(58,123,168,.2);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#84919c;margin-bottom:5px;"><span>心の積載量</span><span style="font-family:\'IBM Plex Mono\',monospace;">6 / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:60%;height:100%;background:#7a5a9e;"></div></div><div style="font-size:9px;color:#a7b3bc;margin-top:4px;">※他人の思い出を積みすぎると、自分の記憶と混線する</div></div>',
      replace: '<div style="background:#fff;border:1px solid rgba(58,123,168,.2);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#84919c;margin-bottom:5px;"><span>心の積載量</span><span style="font-family:\'IBM Plex Mono\',monospace;">{{ kokoro }} / 10</span></div><div style="height:9px;border-radius:6px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ kokoroPct }}%;height:100%;background:#7a5a9e;"></div></div><div style="font-size:9px;color:#a7b3bc;margin:4px 0 6px;">※他人の思い出を積みすぎると、自分の記憶と混線する</div><div style="display:flex;gap:6px;"><button onClick="{{ kokoroDown }}" style="' + BTN_SMALL + '">−</button><button onClick="{{ kokoroUp }}" style="' + BTN_SMALL + '">＋</button></div></div>',
    },

    // ── sheet: 街の清浄度 ──
    {
      find: '<div style="background:#fff;border:1px solid rgba(58,123,168,.2);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#84919c;margin-bottom:5px;"><span>街の清浄度</span><span style="font-family:\'IBM Plex Mono\',monospace;color:#3f9e6a;">37 / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:37%;height:100%;background:linear-gradient(90deg,#3a7ba8,#3f9e6a);"></div></div><div style="font-size:9px;color:#a7b3bc;margin-top:4px;">※100で「この街の収集、完了」。その先は、まだ誰も考えていない</div></div>',
      replace: '<div style="background:#fff;border:1px solid rgba(58,123,168,.2);border-radius:12px;padding:11px 13px;"><div style="display:flex;justify-content:space-between;font-size:12px;color:#84919c;margin-bottom:5px;"><span>街の清浄度</span><span style="font-family:\'IBM Plex Mono\',monospace;color:#3f9e6a;">{{ seijou }} / 100</span></div><div style="height:9px;border-radius:6px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ seijou }}%;height:100%;background:linear-gradient(90deg,#3a7ba8,#3f9e6a);"></div></div><div style="font-size:9px;color:#a7b3bc;margin:4px 0 6px;">※100で「この街の収集、完了」。その先は、まだ誰も考えていない</div><div style="display:flex;gap:6px;"><button onClick="{{ seijouDown }}" style="' + BTN_SMALL + '">−</button><button onClick="{{ seijouUp }}" style="' + BTN_SMALL + '">＋</button></div></div>',
    },

    // ── dice: 分別判定 ──
    {
      block: 'isDice',
      replace: '<sc-if value="{{ isDice }}" hint-placeholder-val="{{ false }}">\
      <div data-screen-label="分別判定" style="animation:scfade .4s ease;max-width:560px;margin:0 auto;text-align:center;">\
        <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:0 0 4px;">■ 分別判定 ・ 目標 <button onClick="{{ dcMinus }}" style="' + BTN_TINY_DMG + '">－</button>{{ diceDc }}<button onClick="{{ dcPlus }}" style="' + BTN_TINY_HEAL + '">＋</button> ・ 技能：{{ skillLabel }}</p>\
        <div style="display:flex;flex-direction:column;align-items:center;gap:8px;margin:18px 0 24px;">\
          <div style="width:122px;height:122px;border:3px solid {{ stampColor }};border-radius:14px;animation:stampin .5s ease;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#fff;box-shadow:0 8px 20px -8px rgba(58,123,168,.35);gap:2px;">\
            <span style="font-size:10px;letter-spacing:2px;color:#84919c;">判定値</span>\
            <span style="font-family:\'IBM Plex Mono\',monospace;font-size:44px;font-weight:600;line-height:1.05;color:#2c3440;">{{ diceFace }}</span>\
            <b style="display:inline-block;padding:1px 12px;border-radius:999px;background:rgba(58,123,168,.12);color:{{ stampColor }};font-size:12px;letter-spacing:1px;">{{ stampWord }}</b>\
          </div>\
          <div style="font-size:14px;color:#84919c;margin-top:6px;">{{ diceFormula }}</div>\
          <div style="font-size:14px;letter-spacing:1px;color:{{ stampColor }};font-weight:700;">{{ diceVerdict }}</div>\
          <p style="font-size:10px;color:#a7b3bc;margin:2px 0 0;">※誤分別は思い出が「化けて」出ます。粗大（後悔）を燃やすのは特に厳禁。</p>\
        </div>\
        <div style="display:flex;justify-content:center;gap:7px;flex-wrap:wrap;margin-bottom:10px;">\
          <sc-for list="{{ diceTypes }}" as="dt" hint-placeholder-count="7">\
            <button onClick="{{ dt.go }}" style="font-size:12px;font-family:\'IBM Plex Mono\',monospace;padding:7px 12px;border-radius:8px;border:{{ dt.border }};color:{{ dt.color }};background:{{ dt.bg }};font-weight:{{ dt.weight }};cursor:pointer;">{{ dt.label }}</button>\
          </sc-for>\
        </div>\
        <div style="display:flex;justify-content:center;gap:6px;flex-wrap:wrap;margin-bottom:14px;">\
          <sc-for list="{{ diceSkills }}" as="sk" hint-placeholder-count="5">\
            <button onClick="{{ sk.go }}" style="font-size:11px;padding:6px 10px;border-radius:8px;border:{{ sk.border }};color:{{ sk.color }};background:{{ sk.bg }};cursor:pointer;font-family:\'Zen Maru Gothic\',sans-serif;">{{ sk.label }}</button>\
          </sc-for>\
        </div>\
        <button onClick="{{ rollNow }}" style="display:inline-flex;align-items:center;gap:10px;padding:12px 30px;border:0;border-radius:12px;cursor:pointer;background:#3a7ba8;color:#fff;font-weight:900;font-size:15px;letter-spacing:3px;font-family:\'Zen Maru Gothic\',sans-serif;box-shadow:0 5px 0 #2a5a7c;white-space:nowrap;">分別する</button>\
        <div style="margin-top:26px;text-align:left;">\
          <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:0 0 9px;">■ 本日の分別記録</p>\
          <sc-for list="{{ logRows }}" as="row" hint-placeholder-count="3">\
            <div style="display:flex;justify-content:space-between;gap:10px;font-size:13px;color:#4e5a66;padding:7px 0;border-bottom:1px dashed rgba(58,123,168,.25);"><span>{{ row.left }}</span><span style="font-family:\'IBM Plex Mono\',monospace;color:{{ row.color }};flex:none;">{{ row.right }}</span></div>\
          </sc-for>\
        </div>\
      </div>\
      </sc-if>',
    },

    // ── combat: 収集ルート ──
    {
      block: 'isCombat',
      replace: '<sc-if value="{{ isCombat }}" hint-placeholder-val="{{ false }}">\
      <div data-screen-label="収集ルート" style="animation:scfade .4s ease;max-width:780px;margin:0 auto;">\
        <div style="display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;margin-bottom:6px;">\
          <h1 style="font-weight:900;font-size:24px;margin:0;color:#2c3440;">収集ルート ・ 第3区（旧・住宅街）</h1>\
          <div style="display:flex;gap:8px;"><button onClick="{{ shortRest }}" style="padding:8px 15px;border:1px solid rgba(58,123,168,.35);border-radius:8px;background:#fff;color:#84919c;cursor:pointer;font-size:13px;font-family:\'Zen Maru Gothic\',sans-serif;white-space:nowrap;flex:none;">小休止</button><button onClick="{{ nextStop }}" style="padding:8px 15px;border:0;border-radius:8px;background:#3a7ba8;color:#fff;cursor:pointer;font-weight:700;font-size:13px;font-family:\'Zen Maru Gothic\',sans-serif;box-shadow:0 4px 0 #2a5a7c;white-space:nowrap;flex:none;">次の集積所へ</button></div>\
        </div>\
        <p style="font-size:12px;color:#a7b3bc;margin:0 0 14px;">※集積所ごとに全員一手番。日没までに車庫へ戻れないと、荷台の思い出が里心をつけて逃げ出します。</p>\
        <div style="border:2px solid #e8b432;border-radius:12px;padding:12px 14px;margin-bottom:14px;background:rgba(232,180,50,.04);">\
          <div style="display:flex;align-items:baseline;justify-content:space-between;flex-wrap:wrap;gap:6px;margin-bottom:6px;"><span style="font-size:15px;font-weight:900;color:#a5851f;">1号車 ・ 荷台積載 {{ truckLoad }}%</span><span style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;color:#a5851f;white-space:nowrap;">日没まで {{ duskLabel }}</span></div>\
          <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;">\
            <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#84919c;margin-bottom:3px;"><span>燃料（軽油＋鼻歌）</span><span style="font-family:\'IBM Plex Mono\',monospace;">{{ fuel }}%</span></div><div style="height:8px;border-radius:5px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ fuel }}%;height:100%;background:#3f9e6a;"></div></div></div>\
            <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#84919c;margin-bottom:3px;"><span>回転板の機嫌</span><span style="font-family:\'IBM Plex Mono\',monospace;">{{ wheelLabel }}</span></div><div style="height:8px;border-radius:5px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ wheel }}%;height:100%;background:#e8b432;"></div></div></div>\
            <div><div style="display:flex;justify-content:space-between;font-size:11px;color:#84919c;margin-bottom:3px;"><span>ソラの心の積載</span><span style="font-family:\'IBM Plex Mono\',monospace;">{{ kokoro }}/10</span></div><div style="height:8px;border-radius:5px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ kokoroPct }}%;height:100%;background:#7a5a9e;"></div></div></div>\
          </div>\
        </div>\
        <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:0 0 10px;">■ 本日の集積所（対応順）</p>\
        <sc-for list="{{ stops }}" as="s" hint-placeholder-count="4">\
          <div style="display:flex;align-items:center;gap:12px;padding:11px 14px;border-radius:12px;border:{{ s.border }};background:{{ s.bg }};margin-bottom:8px;">\
            <span style="width:30px;height:30px;flex:none;display:flex;align-items:center;justify-content:center;font-weight:900;font-size:13px;background:{{ s.numBg }};color:{{ s.numColor }};border-radius:8px;">{{ s.num }}</span>\
            <div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:700;color:{{ s.titleColor }};">{{ s.title }} <span style="font-size:11px;color:{{ s.tagColor }};">{{ s.tag }}</span></div><div style="font-size:12px;color:#84919c;margin-top:2px;">{{ s.note }}</div></div>\
            <div style="width:150px;flex:none;"><div style="display:flex;justify-content:space-between;font-size:11px;color:#84919c;margin-bottom:3px;"><span>{{ s.gauge }}</span><span style="font-family:\'IBM Plex Mono\',monospace;">{{ s.value }}</span></div><div style="height:8px;border-radius:5px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ s.pct }}%;height:100%;background:{{ s.barColor }};"></div></div>\
              <sc-if value="{{ s.hasBtns }}" hint-placeholder-val="{{ true }}">\
                <div style="display:flex;gap:5px;margin-top:5px;justify-content:flex-end;"><button onClick="{{ s.dec }}" style="' + BTN_TINY_DMG + '">－</button><button onClick="{{ s.inc }}" style="' + BTN_TINY_HEAL + '">＋</button></div>\
              </sc-if>\
            </div>\
          </div>\
        </sc-for>\
      </div>\
      </sc-if>',
    },

    // ── inventory: 婚約指輪の照会 ──
    {
      find: '<div style="border:1px solid rgba(58,123,168,.25);border-radius:12px;padding:10px 13px;margin-bottom:8px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;color:#2c3440;"><span style="font-weight:700;">婚約指輪（郵便受け内・未開封）</span><span style="font-family:\'IBM Plex Mono\',monospace;color:#3a7ba8;flex:none;">燃えない</span></div><div style="font-size:11px;color:#84919c;margin-top:2px;">照会結果：持ち主「該当者なし」。——つまり、渡すはずだった人がまだどこかに。</div></div>',
      replace: '<div style="border:1px solid rgba(58,123,168,.25);border-radius:12px;padding:10px 13px;margin-bottom:8px;background:#fff;"><div style="display:flex;justify-content:space-between;gap:8px;font-size:13px;color:#2c3440;"><span style="font-weight:700;">婚約指輪（郵便受け内・未開封）</span><span style="font-family:\'IBM Plex Mono\',monospace;color:#3a7ba8;flex:none;">燃えない</span></div><div style="font-size:11px;color:{{ ringColor }};margin-top:2px;">{{ ringNote }}</div><sc-if value="{{ ringPending }}" hint-placeholder-val="{{ true }}"><button onClick="{{ lookupRing }}" style="margin-top:7px;font-size:11px;padding:5px 12px;border-radius:7px;border:1px solid #3a7ba8;background:rgba(58,123,168,.05);color:#3a7ba8;cursor:pointer;font-family:\'Zen Maru Gothic\',sans-serif;">照会端末にかざす（電池 残{{ battery }}本）</button></sc-if></div>',
    },

    // ── story: 収集記録 ──
    {
      block: 'isStory',
      replace: '<sc-if value="{{ isStory }}" hint-placeholder-val="{{ false }}">\
      <div data-screen-label="収集記録" style="animation:scfade .4s ease;max-width:640px;margin:0 auto;">\
        <p style="font-family:\'IBM Plex Mono\',monospace;font-size:11px;letter-spacing:2px;color:#84919c;text-align:center;margin:0 0 6px;">{{ storyKicker }}</p>\
        <h1 style="font-family:\'Shippori Mincho\',serif;font-weight:800;font-size:28px;text-align:center;margin:0 0 4px;color:#2c3440;">{{ storyTitle }}</h1>\
        <div style="display:flex;align-items:center;gap:12px;margin:16px 0 22px;color:#3a7ba8;"><span style="flex:1;height:1px;background:rgba(58,123,168,.35);"></span><span style="font-size:12px;">🚛</span><span style="flex:1;height:1px;background:rgba(58,123,168,.35);"></span></div>\
        <sc-for list="{{ storyBlocks }}" as="b" hint-placeholder-count="3">\
          <sc-if value="{{ b.isP }}" hint-placeholder-val="{{ true }}">\
            <p style="font-family:\'Shippori Mincho\',serif;font-size:16px;line-height:2.1;color:#333d47;margin:0 0 18px;">{{ b.t }}</p>\
          </sc-if>\
          <sc-if value="{{ b.isQ }}" hint-placeholder-val="{{ false }}">\
            <blockquote style="margin:22px 0;padding:14px 20px;border-left:3px solid #3a7ba8;background:rgba(58,123,168,.04);font-family:\'Shippori Mincho\',serif;font-size:16px;line-height:1.9;color:#4e5a66;">{{ b.t }}</blockquote>\
          </sc-if>\
        </sc-for>\
        <sc-if value="{{ storyHasNote }}" hint-placeholder-val="{{ false }}">\
          <p style="font-size:13px;font-weight:700;color:{{ storyNoteColor }};margin:0 0 18px;">{{ storyNote }}</p>\
        </sc-if>\
        <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:0 0 12px;">■ どうする</p>\
        <sc-for list="{{ storyChoices }}" as="c" hint-placeholder-count="3">\
          <button onClick="{{ c.go }}" style="display:block;width:100%;text-align:left;padding:13px 16px;margin-bottom:9px;border:1px solid rgba(58,123,168,.35);border-radius:12px;background:#fff;cursor:pointer;font-family:\'Zen Maru Gothic\',sans-serif;font-size:14px;color:#333d47;">{{ c.num }}　{{ c.pre }} <span style="color:#c9722e;font-weight:700;">{{ c.skillText }}</span>{{ c.post }} <span style="color:#c9722e;font-weight:700;">{{ c.dcLabel }}</span></button>\
        </sc-for>\
        <div style="margin-top:24px;height:5px;border-radius:3px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ storyPct }}%;height:100%;background:#3a7ba8;"></div></div>\
        <p style="text-align:center;font-family:\'IBM Plex Mono\',monospace;font-size:10px;letter-spacing:2px;color:#a7b3bc;margin:7px 0 0;">{{ storyPctLabel }}</p>\
      </div>\
      </sc-if>',
    },

    // ── GM: 事業課端末 ──
    {
      block: 'isGM',
      replace: '<sc-if value="{{ isGM }}" hint-placeholder-val="{{ false }}">\
      <div data-screen-label="事業課端末" style="animation:scfade .4s ease;max-width:820px;margin:0 auto;">\
        <h1 style="font-weight:900;font-size:23px;margin:0 0 4px;color:#2c3440;">{{ gmTitle }}</h1>\
        <p style="font-size:13px;color:#84919c;margin:0 0 20px;">詰所の端末。ジジの日報と、アプリの管理画面（ログイン済みのまま3年）。</p>\
        <div style="display:grid;grid-template-columns:{{ twoCols }};gap:20px;">\
          <div>\
            <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:0 0 11px;">■ シナリオ進行</p>\
            <sc-for list="{{ gmScenes }}" as="sc" hint-placeholder-count="3">\
              <button onClick="{{ sc.go }}" style="display:block;width:100%;text-align:left;padding:11px 13px;border:{{ sc.border }};border-radius:12px;margin-bottom:8px;background:{{ sc.bg }};cursor:pointer;"><div style="font-size:14px;font-weight:{{ sc.weight }};color:{{ sc.color }};">{{ sc.t }} <span style="font-size:10px;color:#3a7ba8;">{{ sc.tag }}</span></div></button>\
            </sc-for>\
            <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:20px 0 10px;">■ 街の清浄度</p>\
            <div style="height:9px;border-radius:5px;background:rgba(44,52,64,.06);overflow:hidden;"><div style="width:{{ seijou }}%;height:100%;background:linear-gradient(90deg,#3a7ba8,#3f9e6a);"></div></div>\
            <div style="display:flex;gap:6px;margin-top:6px;"><button onClick="{{ seijouDown }}" style="' + BTN_SMALL + '">−</button><button onClick="{{ seijouUp }}" style="' + BTN_SMALL + '">＋</button></div>\
            <p style="font-size:11px;color:#a7b3bc;margin:6px 0 0;">100%の日、ジチタイちゃんは「最後のお知らせ」を配信する設定になっている。内容は誰も知らない。</p>\
          </div>\
          <div>\
            <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:0 0 11px;">■ 秘匿事項</p>\
            <div style="border:1px solid rgba(58,123,168,.3);border-radius:12px;padding:11px 13px;margin-bottom:8px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#2c3440;">桜通りのゴミ出し主</div><div style="font-size:12px;color:#84919c;margin-top:2px;">最後の生存者ではない。<b>ジジ</b>である。42年の習慣で、回収する側と出す側を一人で続けている——彼自身の思い出を、少しずつ。</div><div style="font-size:12px;color:#7a5a9e;margin-top:4px;background:rgba(122,90,158,.05);border-radius:4px;padding:4px 8px;">ただし婚約指輪だけは、ジジのものではない。照会「該当者なし」は本物。生存者が、いる。</div></div>\
            <div style="border:1px solid rgba(58,123,168,.3);border-radius:12px;padding:11px 13px;background:#fff;"><div style="font-size:14px;font-weight:700;color:#2c3440;">ジチタイちゃんの正体</div><div style="font-size:12px;color:#84919c;margin-top:2px;">滅亡前夜、市民全員の「捨てられなかった思い出」のバックアップを預かった。彼女が明るいのは、それが「いつか取りに来る」前提の預かり方だから。</div></div>\
            <p style="font-size:11px;letter-spacing:3px;color:#3a7ba8;font-weight:700;margin:20px 0 10px;">■ 収集ハプニング表（d6）</p>\
            <button onClick="{{ rollTable }}" style="font-size:12px;padding:7px 14px;border-radius:8px;border:1px solid #3a7ba8;background:rgba(58,123,168,.05);color:#3a7ba8;cursor:pointer;font-family:\'Zen Maru Gothic\',sans-serif;margin-bottom:8px;">表を振る</button>\
            <sc-if value="{{ gmHasTable }}" hint-placeholder-val="{{ false }}">\
              <p style="font-size:13px;color:#4e5a66;">出目 {{ gmTableD }} ・ {{ gmTableText }}</p>\
            </sc-if>\
            <div style="font-size:13px;color:#4e5a66;line-height:1.9;">1–2 パンク（スペアと世間話） ・ 3 野良の思い出が荷台に飛び乗る<br>4 回転板に「まだ言えてないただいま」が絡まる ・ 5 にわか雨（思い出は濡れると重い） ・ 6 ジチタイちゃんの臨時放送（3年ぶりの新着）</div>\
          </div>\
        </div>\
      </div>\
      </sc-if>',
    },
];
