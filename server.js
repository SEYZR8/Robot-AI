const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const MIME = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8',
  '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.webmanifest':'application/manifest+json; charset=utf-8', '.png':'image/png',
  '.jpg':'image/jpeg', '.jpeg':'image/jpeg', '.svg':'image/svg+xml', '.ico':'image/x-icon'
};

function safePath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  if (decoded === '/') decoded = '/index.html';
  const normalized = path.normalize(decoded).replace(/^([.][.][/\\])+/, '');
  const file = path.resolve(ROOT, '.' + normalized);
  if (!file.startsWith(ROOT + path.sep) && file !== ROOT) return null;
  return file;
}

const server = http.createServer((req, res) => {
  const file = safePath(req.url || '/');
  if (!file) { res.writeHead(400); return res.end('Bad request'); }
  fs.stat(file, (err, stat) => {
    if (!err && stat.isFile()) {
      const ext = path.extname(file).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-cache'
      });
      return fs.createReadStream(file).pipe(res);
    }
    const index = path.join(ROOT, 'index.html');
    fs.readFile(index, (e, data) => {
      if (e) { res.writeHead(500); return res.end('UZB ROLE: index.html topilmadi'); }
      res.writeHead(200, {'Content-Type': MIME['.html'], 'Cache-Control':'no-cache'});
      res.end(data);
    });
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`UZB ROLE server running on http://0.0.0.0:${PORT}`);
});
