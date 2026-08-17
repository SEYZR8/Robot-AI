const http = require('http');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, 'app');
const mime = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp'
};

async function readBody(req) {
  return await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', c => { data += c; if (data.length > 2_000_000) req.destroy(); });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

function json(res, status, body) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(body));
}

async function aiChat(messages) {
  const key = process.env.OPENAI_API_KEY;
  if (!key) return null;
  const model = process.env.OPENAI_MODEL || 'gpt-5.6';
  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model,
      instructions: 'You are ROBOT AI, a precise, warm, highly capable humanoid assistant. Answer in the user\'s language. Be useful, honest, concise when possible, and never claim to have capabilities you do not have. You can help with programming, IT, engineering, science, planning and everyday questions.',
      input: messages.slice(-20)
    })
  });
  if (!response.ok) throw new Error(`AI request failed: ${response.status}`);
  const data = await response.json();
  return data.output_text || '';
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);

    if (req.method === 'POST' && url.pathname === '/api/chat') {
      const body = JSON.parse(await readBody(req) || '{}');
      const messages = Array.isArray(body.messages) ? body.messages : [];
      try {
        const answer = await aiChat(messages);
        if (answer) return json(res, 200, { ok: true, answer, mode: 'ai' });
        return json(res, 200, { ok: true, answer: 'AI backend hozir ulanmagan. OPENAI_API_KEY berilgach, men to‘liq AI rejimida ishlayman.', mode: 'local' });
      } catch (e) {
        return json(res, 502, { ok: false, error: e.message });
      }
    }

    if (req.method === 'GET' && url.pathname === '/api/health') {
      return json(res, 200, { ok: true, ai: Boolean(process.env.OPENAI_API_KEY), model: process.env.OPENAI_MODEL || 'gpt-5.6' });
    }

    let urlPath = decodeURIComponent(url.pathname);
    if (urlPath === '/') urlPath = '/index.html';
    const file = path.normalize(path.join(root, urlPath));
    if (!file.startsWith(root)) return res.writeHead(403).end('Forbidden');
    fs.readFile(file, (err, data) => {
      if (err) {
        res.writeHead(err.code === 'ENOENT' ? 404 : 500, { 'Content-Type': 'text/plain; charset=utf-8' });
        return res.end(err.code === 'ENOENT' ? 'Not found' : 'Server error');
      }
      res.writeHead(200, { 'Content-Type': mime[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
      res.end(data);
    });
  } catch (e) {
    json(res, 500, { ok: false, error: e.message });
  }
});

const port = Number(process.env.PORT) || 3000;
server.listen(port, '0.0.0.0', () => console.log(`Robot AI running on http://127.0.0.1:${port}`));
