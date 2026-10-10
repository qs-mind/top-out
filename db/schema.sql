-- Top Out leaderboard. Safe to run more than once.
create table if not exists topout_players (
  id          bigserial primary key,
  token       text not null unique,
  first_name  text not null,
  last_name   text not null,
  email       text not null,
  best_score  integer not null default 0,
  best_at     timestamptz,
  created_at  timestamptz not null default now()
);
create unique index if not exists topout_players_email_key on topout_players (lower(email));
create index if not exists topout_players_rank on topout_players (best_score desc, best_at asc) where best_score > 0;
