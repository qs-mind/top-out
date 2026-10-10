// API logic. The database is injected as `store`, so tests can mock it.
import { randomBytes } from 'node:crypto';

export const LIMITS = { name: 40, email: 120, maxScore: 1000, top: 50 };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clean = (s) => (typeof s === 'string' ? s.trim().replace(/\s+/g, ' ') : '');

export function validatePlayer(b) {
  const first = clean(b?.firstName), last = clean(b?.lastName), email = clean(b?.email).toLowerCase();
  if (!first || !last || first.length > LIMITS.name || last.length > LIMITS.name) return { error: 'Enter first and last name (max 40 characters each).' };
  if (!EMAIL.test(email) || email.length > LIMITS.email) return { error: 'Enter a valid email.' };
  return { first, last, email };
}

export function validateScore(b) {
  const token = typeof b?.token === 'string' ? b.token : '';
  const score = b?.score;
  if (!/^[a-f0-9]{48}$/.test(token)) return { error: 'Bad player token.' };
  if (!Number.isInteger(score) || score < 1 || score > LIMITS.maxScore) return { error: 'Bad score.' };
  return { token, score };
}

export const newToken = () => randomBytes(24).toString('hex');

// Per-IP fixed-window limiter.
export function makeLimiter(max = 30, windowMs = 60_000, now = Date.now) {
  const hits = new Map();
  return (ip) => {
    const t = now();
    if (hits.size > 5000) for (const [k, v] of hits) if (t - v.start > windowMs) hits.delete(k);
    const h = hits.get(ip);
    if (!h || t - h.start > windowMs) { hits.set(ip, { start: t, n: 1 }); return true; }
    return ++h.n <= max;
  };
}

// Returns [status, body]. `store` has upsertPlayer, addScore, topScores.
export async function route(method, path, body, store) {
  if (!store) return [503, { error: 'Leaderboard unavailable.' }];
  try {
    if (method === 'GET' && path === '/api/leaderboard') {
      const rows = await store.topScores(LIMITS.top);
      return [200, { entries: rows.map((r, i) => ({ rank: i + 1, name: r.name, score: r.score })) }];
    }
    if (method === 'POST' && path === '/api/players') {
      const v = validatePlayer(body);
      if (v.error) return [400, { error: v.error }];
      return [200, { token: await store.upsertPlayer(v.first, v.last, v.email, newToken()) }];
    }
    if (method === 'POST' && path === '/api/scores') {
      const v = validateScore(body);
      if (v.error) return [400, { error: v.error }];
      const found = await store.addScore(v.token, v.score);
      return found ? [200, { ok: true }] : [404, { error: 'Unknown player.' }];
    }
    return [404, { error: 'Not found.' }];
  } catch (e) {
    console.error('api error:', e.message);
    return [503, { error: 'Leaderboard unavailable.' }];
  }
}
