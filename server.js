const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, 'app');
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon'
};

function sendFile(res, file) {
  fs.stat(file, (statErr, stat) => {
    if (statErr) return send404(res);
    if (stat.isDirectory()) {
      const index = path.join(file, 'index.html');
      return fs.access(index, fs.constants.R_OK, err => {
        if (err) return send404(res);
        sendFile(res, index);
      });
    }

    fs.readFile(file, (err, data) => {
      if (err) return send500(res);
      res.writeHead(200, {
        'Content-Type': mime[path.extname(file).toLowerCase()] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      res.end(data);
    });
  });
}

function send404(res) {
  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}

function send500(res) {
  res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Server error');
}

const server = http.createServer((req, res) => {
  try {
    const parsed = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
    let requestPath = decodeURIComponent(parsed.pathname);

    if (requestPath === '/') requestPath = '/index.html';

    // Prevent path traversal and resolve only inside /app.
    const relative = requestPath.replace(/^\/+/, '');
    const file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(root + path.sep)) {
      res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Forbidden');
    }

    sendFile(res, file);
  } catch (err) {
    send500(res);
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => {
  console.log(`Samarqand Drive running on http://127.0.0.1:${port}`);
});
