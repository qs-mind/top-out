import test from 'node:test';
import assert from 'node:assert/strict';
import { route, validatePlayer, validateScore, makeLimiter } from '../server/api.js';

const mockStore = () => {
  const calls = [];
  return { calls,
    upsertPlayer: async (...a) => { calls.push(['upsert', ...a]); return a[3]; },
    addScore: async (t, s) => { calls.push(['score', t, s]); return t.startsWith('aa'); },
    topScores: async () => [{ name: 'Ada Lovelace', score: 20 }, { name: 'Bob Ng', score: 9 }] };
};
const tok = 'aa'.repeat(24);

test('validatePlayer trims, lowercases email, rejects bad input', () => {
  assert.deepEqual(validatePlayer({ firstName: ' Ada ', lastName: 'L', email: 'Ada@X.COM' }), { first: 'Ada', last: 'L', email: 'ada@x.com' });
  assert.ok(validatePlayer({ firstName: '', lastName: 'L', email: 'a@b.co' }).error);
  assert.ok(validatePlayer({ firstName: 'A', lastName: 'L', email: 'nope' }).error);
  assert.ok(validatePlayer({ firstName: 'x'.repeat(41), lastName: 'L', email: 'a@b.co' }).error);
});

test('validateScore needs a token and a whole score in range', () => {
  assert.equal(validateScore({ token: tok, score: 12 }).score, 12);
  for (const score of [0, -1, 1.5, '12', 5000, null]) assert.ok(validateScore({ token: tok, score }).error);
  assert.ok(validateScore({ token: 'short', score: 5 }).error);
});

test('leaderboard returns rank, name, score only', async () => {
  const [code, body] = await route('GET', '/api/leaderboard', null, mockStore());
  assert.equal(code, 200);
  assert.deepEqual(body.entries[0], { rank: 1, name: 'Ada Lovelace', score: 20 });
  assert.ok(!JSON.stringify(body).includes('@'));
});

test('players: returns a token, never the email', async () => {
  const s = mockStore();
  const [code, body] = await route('POST', '/api/players', { firstName: 'Ada', lastName: 'L', email: 'a@b.co' }, s);
  assert.equal(code, 200);
  assert.match(body.token, /^[a-f0-9]{48}$/);
  assert.ok(!JSON.stringify(body).includes('a@b.co'));
  assert.equal((await route('POST', '/api/players', { email: 'x' }, s))[0], 400);
});

test('scores: ok, unknown player, bad input', async () => {
  const s = mockStore();
  assert.equal((await route('POST', '/api/scores', { token: tok, score: 7 }, s))[0], 200);
  assert.equal((await route('POST', '/api/scores', { token: 'bb'.repeat(24), score: 7 }, s))[0], 404);
  assert.equal((await route('POST', '/api/scores', { token: tok, score: 'x' }, s))[0], 400);
});

test('no database gives 503, db error gives 503', async () => {
  assert.equal((await route('GET', '/api/leaderboard', null, null))[0], 503);
  const bad = { topScores: async () => { throw new Error('down'); } };
  assert.equal((await route('GET', '/api/leaderboard', null, bad))[0], 503);
});

test('rate limiter blocks after max and resets after the window', () => {
  let t = 0;
  const ok = makeLimiter(2, 1000, () => t);
  assert.ok(ok('1.1.1.1') && ok('1.1.1.1') && !ok('1.1.1.1') && ok('2.2.2.2'));
  t = 1500;
  assert.ok(ok('1.1.1.1'));
});
