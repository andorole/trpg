/*
 * .dc.html（Claude Design プロトタイプ）→ implementation/ の単体動作 HTML を一括生成する。
 * 原本の <helmet> / テンプレート / ロジックをそのまま抽出し、runtime.js を埋め込んだ
 * 自己完結ファイル（ダブルクリックで開ける）を作る。
 * 使い方: node tools/build.js
 */
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const outDir = path.join(root, 'implementation');
const gamesDir = path.join(root, 'games');
const runtime = fs.readFileSync(path.join(__dirname, 'runtime.js'), 'utf8').trim();
const engine = fs.readFileSync(path.join(__dirname, 'engine.js'), 'utf8').trim();

fs.mkdirSync(outDir, { recursive: true });

// games/<id>.patches.js のパッチをテンプレートへ適用する。
// { find, replace } は完全一致（1回だけ出現すること）、
// { block: 'isXxx', replace } は <sc-if value="{{ isXxx }}"> ブロック全体を差し替える
// （入れ子の sc-if があっても深さを数えて正しく対応する閉じタグを探す）。
function findMatchingClose(template, openEnd) {
  let depth = 1;
  let i = openEnd;
  while (depth > 0) {
    const nextOpen = template.indexOf('<sc-if', i);
    const nextClose = template.indexOf('</sc-if>', i);
    if (nextClose === -1) return -1;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      i = nextOpen + '<sc-if'.length;
    } else {
      depth--;
      if (depth === 0) return nextClose;
      i = nextClose + '</sc-if>'.length;
    }
  }
  return -1;
}

function applyPatches(template, patches, file) {
  for (const p of patches) {
    if (p.block) {
      const startTag = '<sc-if value="{{ ' + p.block + ' }}"';
      const s = template.indexOf(startTag);
      if (s === -1) throw new Error(`${file}: ブロック ${p.block} が見つからない`);
      const openEnd = template.indexOf('>', s) + 1;
      const e = findMatchingClose(template, openEnd);
      if (e === -1) throw new Error(`${file}: ブロック ${p.block} の閉じタグが見つからない`);
      template = template.slice(0, s) + p.replace + template.slice(e + '</sc-if>'.length);
    } else {
      const hits = template.split(p.find).length - 1;
      if (hits !== 1) throw new Error(`${file}: パッチ find が ${hits} 回一致（1回であるべき）: ${p.find.slice(0, 60)}...`);
      template = template.replace(p.find, p.replace);
    }
  }
  return template;
}

const sources = fs.readdirSync(root).filter((f) => f.endsWith('.dc.html')).sort();
const entries = [];

for (const file of sources) {
  const src = fs.readFileSync(path.join(root, file), 'utf8');
  const helmet = src.match(/<helmet>([\s\S]*?)<\/helmet>/);
  const xdc = src.match(/<x-dc>([\s\S]*?)<\/x-dc>/);
  const logic = src.match(/<script type="text\/x-dc" data-dc-script>([\s\S]*?)<\/script>/);
  if (!helmet || !xdc || !logic) throw new Error(file + ': 期待した構造（helmet / x-dc / data-dc-script）が見つからない');

  let template = xdc[1].replace(/<helmet>[\s\S]*?<\/helmet>/, '').trim();
  const base = file.replace(/\.dc\.html$/, '');
  const title = base.replace(/^1[a-z]-/, '');
  const id = base.slice(0, 2);

  // ゲーム層（あれば）: パッチ適用 + エンジン / コンテンツの同梱
  const patchFile = path.join(gamesDir, id + '.patches.js');
  const gameFile = path.join(gamesDir, id + '.game.js');
  const hasGame = fs.existsSync(gameFile);
  if (fs.existsSync(patchFile)) {
    delete require.cache[require.resolve(patchFile)];
    template = applyPatches(template, require(patchFile), file);
  }
  const gameScripts = hasGame
    ? '\n\n' + engine + '\n\n' + fs.readFileSync(gameFile, 'utf8').trim()
    : '';

  const html = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
${helmet[1].trim()}
</head>
<body>
<div id="app"></div>
<template id="dc-template">
${template}
</template>
<script>
${runtime}

${logic[1].trim()}${gameScripts}

window.__dcApp = new Component();
if (typeof GameEngine !== 'undefined' && window.__GAME__) GameEngine.attach(window.__dcApp, window.__GAME__);
window.__dcApp.mount(document.getElementById('app'), document.getElementById('dc-template'));
</script>
</body>
</html>
`;
  fs.writeFileSync(path.join(outDir, base + '.html'), html);
  entries.push({ base, title, hasGame });
  console.log('OK', base + '.html' + (hasGame ? ' （ゲーム層あり）' : ''));
}

// 全作品を見比べる一覧ページ
const cards = entries
  .map(
    (e) =>
      `    <a class="card" href="./${encodeURI(e.base)}.html"><span class="id">${e.base.slice(0, 2).toUpperCase()}</span><span class="t">${e.title}</span>${e.hasGame ? '<span class="pill">遊べる</span>' : ''}</a>`
  )
  .join('\n');

const index = `<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>TRPG UI プロトタイプ一覧</title>
<style>
  body{margin:0;min-height:100vh;box-sizing:border-box;padding:56px 24px 64px;background:radial-gradient(120% 95% at 50% 0%,#22242a 0%,#131417 58%,#0c0d10 100%);color:#e6e8ee;font-family:'Hiragino Kaku Gothic ProN','Yu Gothic',sans-serif;}
  h1{margin:0 0 8px;text-align:center;font-size:21px;letter-spacing:6px;font-weight:700;}
  .sub{margin:0 0 40px;text-align:center;font-size:12px;letter-spacing:2px;color:#8b93a0;}
  .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;max-width:1100px;margin:0 auto;}
  .card{display:flex;align-items:center;gap:14px;padding:18px 18px;border:1px solid #2e3340;border-radius:12px;background:rgba(255,255,255,.03);color:inherit;text-decoration:none;transition:border-color .15s,background .15s,transform .15s;}
  .card:hover{border-color:#6f7d99;background:rgba(255,255,255,.06);transform:translateY(-2px);}
  .id{flex:none;width:40px;height:40px;display:flex;align-items:center;justify-content:center;border:1px solid #3c4356;border-radius:10px;font-family:ui-monospace,monospace;font-size:13px;color:#9fb0cc;}
  .t{font-size:15px;font-weight:600;letter-spacing:1px;}
  .pill{margin-left:auto;flex:none;font-size:10px;letter-spacing:1px;color:#8fd0a0;border:1px solid rgba(120,200,140,.35);border-radius:999px;padding:2px 8px;}
</style>
</head>
<body>
<h1>TRPG UI プロトタイプ</h1>
<p class="sub">全13作品 ・ 8画面 ＋ デバイス3切替 ＋ プレイスタイル3切替（ソロ／GM＋PL／GMレス）</p>
<div class="grid">
${cards}
</div>
</body>
</html>
`;
fs.writeFileSync(path.join(outDir, 'index.html'), index);
console.log('OK index.html （全 ' + entries.length + ' 作品）');
