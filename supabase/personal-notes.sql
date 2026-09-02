-- Run this once in the reused Supabase project's SQL Editor.
-- It creates only the trip planner's own table and policies.
create table if not exists public.jk_trip_notes (
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id text not null,
  note_id text not null,
  category text not null default '其他',
  title text not null,
  detail text not null default '',
  done boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (user_id, trip_id, note_id)
);

alter table public.jk_trip_notes enable row level security;

revoke all on table public.jk_trip_notes from anon;
grant select, insert, update, delete on table public.jk_trip_notes to authenticated;

drop policy if exists "jk notes select own" on public.jk_trip_notes;
drop policy if exists "jk notes insert own" on public.jk_trip_notes;
drop policy if exists "jk notes update own" on public.jk_trip_notes;
drop policy if exists "jk notes delete own" on public.jk_trip_notes;

create policy "jk notes select own"
  on public.jk_trip_notes for select to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

create policy "jk notes insert own"
  on public.jk_trip_notes for insert to authenticated
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "jk notes update own"
  on public.jk_trip_notes for update to authenticated
  using (auth.uid() is not null and auth.uid() = user_id)
  with check (auth.uid() is not null and auth.uid() = user_id);

create policy "jk notes delete own"
  on public.jk_trip_notes for delete to authenticated
  using (auth.uid() is not null and auth.uid() = user_id);

create index if not exists jk_trip_notes_trip_idx
  on public.jk_trip_notes (user_id, trip_id, updated_at desc);
