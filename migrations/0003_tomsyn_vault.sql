create table if not exists tomsyn_snapshot (
  id text primary key,
  payload jsonb not null,
  saved_at timestamptz not null default now()
);
