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
