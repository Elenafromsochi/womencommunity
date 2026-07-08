-- Схема базы данных «Женское общество» для Supabase.
-- Запусти этот скрипт один раз в Supabase → SQL Editor → New query → Run.
--
-- Таблица user_state хранит все данные участницы одной JSONB-строкой на аккаунт
-- (профиль, диагностика, маркеры, прогресс, сохранённое, записи на события и т.д.).
-- Row Level Security гарантирует: каждый видит и меняет только свои данные.

create table if not exists public.user_state (
  user_id uuid primary key references auth.users (id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_state enable row level security;

drop policy if exists "user_state select own" on public.user_state;
create policy "user_state select own" on public.user_state
  for select using (auth.uid() = user_id);

drop policy if exists "user_state insert own" on public.user_state;
create policy "user_state insert own" on public.user_state
  for insert with check (auth.uid() = user_id);

drop policy if exists "user_state update own" on public.user_state;
create policy "user_state update own" on public.user_state
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ===========================================================================
-- Поиск бадди (межпользовательский). Эти таблицы читаются всеми вошедшими,
-- чтобы участницы находили друг друга; писать можно только своё.
-- ===========================================================================

create table if not exists public.buddy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null default '',
  city text,
  sphere text not null,
  note text,
  created_at timestamptz not null default now(),
  unique (user_id, sphere)
);
alter table public.buddy_requests enable row level security;

drop policy if exists "buddy_req read" on public.buddy_requests;
create policy "buddy_req read" on public.buddy_requests
  for select to authenticated using (true);
drop policy if exists "buddy_req insert own" on public.buddy_requests;
create policy "buddy_req insert own" on public.buddy_requests
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "buddy_req update own" on public.buddy_requests;
create policy "buddy_req update own" on public.buddy_requests
  for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "buddy_req delete own" on public.buddy_requests;
create policy "buddy_req delete own" on public.buddy_requests
  for delete to authenticated using (auth.uid() = user_id);

create table if not exists public.buddy_invites (
  id uuid primary key default gen_random_uuid(),
  from_user uuid not null references auth.users (id) on delete cascade,
  to_user uuid not null references auth.users (id) on delete cascade,
  sphere text not null,
  from_name text not null default '',
  from_city text,
  from_note text,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (from_user, to_user, sphere)
);
alter table public.buddy_invites enable row level security;

drop policy if exists "buddy_inv read own" on public.buddy_invites;
create policy "buddy_inv read own" on public.buddy_invites
  for select to authenticated using (auth.uid() = from_user or auth.uid() = to_user);
drop policy if exists "buddy_inv insert own" on public.buddy_invites;
create policy "buddy_inv insert own" on public.buddy_invites
  for insert to authenticated with check (auth.uid() = from_user);
drop policy if exists "buddy_inv update to" on public.buddy_invites;
create policy "buddy_inv update to" on public.buddy_invites
  for update to authenticated using (auth.uid() = to_user) with check (auth.uid() = to_user);

-- ============================================================================
-- Отклики (комментарии) к материалам — общие для всех участниц.
-- ============================================================================
create table if not exists public.material_comments (
  id uuid primary key default gen_random_uuid(),
  material_id text not null,
  user_id uuid references auth.users (id) on delete cascade,
  author text not null,
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.material_comments enable row level security;

drop policy if exists "comments read" on public.material_comments;
create policy "comments read" on public.material_comments
  for select to authenticated using (true);
drop policy if exists "comments insert own" on public.material_comments;
create policy "comments insert own" on public.material_comments
  for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "comments delete own" on public.material_comments;
create policy "comments delete own" on public.material_comments
  for delete to authenticated using (auth.uid() = user_id);

-- ============================================================================
-- Личные чаты 1:1 (участница ↔ эксперт).
-- ============================================================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  sender_name text not null default '',
  text text not null,
  created_at timestamptz not null default now()
);
alter table public.messages enable row level security;

drop policy if exists "messages read own" on public.messages;
create policy "messages read own" on public.messages
  for select to authenticated using (auth.uid() = sender_id or auth.uid() = recipient_id);
drop policy if exists "messages insert own" on public.messages;
create policy "messages insert own" on public.messages
  for insert to authenticated with check (auth.uid() = sender_id);
