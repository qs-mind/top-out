# Top Out

Public repo. Never commit secrets, connection strings or the licensed Thmanyah fonts. Company rules: `../CLAUDE.md`.

- Static game (HTML, ES modules, Three.js) served by a small Node server: `npm start` (port `PORT`, default 3000). Tests: `npm test`.
- Host: Openship, https://play.qsmind.app. Env var: `DATABASE_URL` (plain postgres:// URL, shared QS Mind Postgres). Missing is fine: the game plays, the leaderboard shows unavailable.
- Schema: `db/schema.sql`, tables `topout_*`. Run it once on the database.
- Leaderboard API: `POST /api/players`, `POST /api/scores`, `GET /api/leaderboard`. Emails never leave the database. Keep it that way.
- The server serves only `index.html`, `styles.css`, `src/`, `public/`.
- Do not change game mechanics when touching the leaderboard.
