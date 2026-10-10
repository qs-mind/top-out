// Postgres store. Parameterised SQL only. Connects lazily on first use.
import postgres from 'postgres';

export function makeStore(url) {
  if (!url) return null;
  let sql;
  const db = () => (sql ??= postgres(url, { max: 5, idle_timeout: 20, connect_timeout: 10 }));
  return {
    // Same email -> same player (token kept), name updated.
    async upsertPlayer(first, last, email, token) {
      const [r] = await db()`
        insert into topout_players (token, first_name, last_name, email) values (${token}, ${first}, ${last}, ${email})
        on conflict (lower(email)) do update set first_name = excluded.first_name, last_name = excluded.last_name
        returning token`;
      return r.token;
    },
    async addScore(token, score) {
      const r = await db()`
        update topout_players set best_score = ${score}, best_at = now()
        where token = ${token} and best_score < ${score} returning id`;
      if (r.length) return true;
      const [p] = await db()`select id from topout_players where token = ${token}`;
      return !!p;
    },
    async topScores(n) {
      const rows = await db()`
        select first_name || ' ' || last_name as name, best_score as score from topout_players
        where best_score > 0 order by best_score desc, best_at asc limit ${n}`;
      return rows.map((r) => ({ name: r.name, score: r.score }));
    },
  };
}
