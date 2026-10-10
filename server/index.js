// Serves the static game and the leaderboard API. No framework.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { route, makeLimiter } from './api.js';
import { makeStore } from './store.js';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const PUBLIC = ['index.html', 'styles.css', 'src', 'public']; // nothing else is served
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.json': 'application/json', '.png': 'image/png', '.ico': 'image/x-icon' };

export function makeServer(store, limiter = makeLimiter()) {
  return createServer(async (req, res) => {
    const headers = { 'X-Content-Type-Options': 'nosniff' };
    const send = (code, type, data) => { res.writeHead(code, { ...headers, 'Content-Type': type, 'Cache-Control': 'no-store' }); res.end(data); };
    const json = (code, obj) => send(code, 'application/json', JSON.stringify(obj));
    try {
      const path = new URL(req.url, 'http://x').pathname;
      if (path.startsWith('/api/')) {
        const ip = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim() || req.socket.remoteAddress;
        if (!limiter(ip)) return json(429, { error: 'Too many requests.' });
        let body = null;
        if (req.method === 'POST') {
          let raw = '';
          for await (const c of req) { raw += c; if (raw.length > 2000) return json(413, { error: 'Too large.' }); }
          try { body = JSON.parse(raw); } catch { return json(400, { error: 'Bad JSON.' }); }
        }
        const [code, out] = await route(req.method, path, body, store);
        return json(code, out);
      }
      if (req.method !== 'GET' && req.method !== 'HEAD') return json(405, { error: 'Method not allowed.' });
      const rel = path === '/' ? 'index.html' : normalize(decodeURIComponent(path)).replace(/^[/\\]+/, '');
      if (!PUBLIC.includes(rel.split(sep)[0]) || rel.includes('..')) return send(404, 'text/plain', 'Not found');
      send(200, TYPES[extname(rel)] || 'application/octet-stream', await readFile(join(ROOT, rel)));
    } catch { send(404, 'text/plain', 'Not found'); }
  });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT) || 3000;
  const store = makeStore(process.env.DATABASE_URL);
  if (!store) console.warn('DATABASE_URL not set: the game runs, the leaderboard is unavailable.');
  makeServer(store).listen(port, () => console.log(`Top Out on http://localhost:${port}`));
}
