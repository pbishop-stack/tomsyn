create table if not exists tomsysn_rounds (
  id serial primary key,
  cycle integer not null,
  query text not null,
  confidence real not null,
  cap_reason text not null,
  failed jsonb not null,
  suggestions jsonb not null,
  ingested integer not null,
  corpus integer not null,
  created_at timestamptz not null default now()
);

create index if not exists tomsysn_rounds_cycle_idx on tomsysn_rounds (cycle desc);
