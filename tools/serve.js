/*
 * 動作確認用の簡易静的サーバ（依存なし）。日本語ファイル名対応。
 * 使い方: node tools/serve.js [ポート番号]
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const port = Number(process.argv[2]) || 8123;
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/plain; charset=utf-8',
};

http
  .createServer((req, res) => {
    const urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let fp = path.normalize(path.join(root, urlPath));
    if (!fp.startsWith(root)) {
      res.writeHead(403);
      return res.end('forbidden');
    }
    if (fs.existsSync(fp) && fs.statSync(fp).isDirectory()) fp = path.join(fp, 'index.html');
    fs.readFile(fp, (err, data) => {
      if (err) {
        res.writeHead(404);
        return res.end('not found');
      }
      res.writeHead(200, { 'Content-Type': types[path.extname(fp).toLowerCase()] || 'application/octet-stream' });
      res.end(data);
    });
  })
  .listen(port, () => console.log('serving ' + root + ' on http://localhost:' + port));
