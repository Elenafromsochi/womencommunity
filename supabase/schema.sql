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

-- ============================================================================
-- Администраторы клуба. Роль администратора — НЕ в клиентском состоянии, а
-- здесь, в базе, чтобы модерацию нельзя было обойти, просто переключив роль в
-- приложении. Добавь свой uid одной строкой (uid берётся в Supabase →
-- Authentication → Users → колонка UID):
--   insert into public.admins (user_id) values ('ВАШ-UID') on conflict do nothing;
-- ============================================================================
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade
);
alter table public.admins enable row level security;

-- Каждый видит только свою строку (нужно, чтобы приложение знало «я админ?»).
drop policy if exists "admins read self" on public.admins;
create policy "admins read self" on public.admins
  for select to authenticated using (auth.uid() = user_id);

-- Проверка «текущий пользователь — администратор?» для политик ниже.
-- SECURITY DEFINER обходит RLS таблицы admins, поэтому проверка работает,
-- даже если сам пользователь не может читать чужие строки.
create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;

-- ============================================================================
-- Общая база материалов + модерация.
-- Эксперт публикует материал → он ложится сюда со статусом 'pending'
-- (на модерации). Администратор одобряет ('approved') или отклоняет
-- ('rejected'). Одобренные материалы видят все участницы клуба.
-- ============================================================================
create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default '',
  title text not null,
  type text not null default 'article',
  topic text not null default '',
  description text not null default '',
  body jsonb,                 -- абзацы статьи (массив строк)
  duration text,
  media_url text,
  cover text,
  status text not null default 'pending', -- pending | approved | rejected
  reject_reason text,
  created_at timestamptz not null default now()
);
alter table public.materials enable row level security;

-- Читать можно: одобренные — всем; свои (любой статус) — автору; всё — админу.
drop policy if exists "materials read" on public.materials;
create policy "materials read" on public.materials
  for select to authenticated
  using (status = 'approved' or auth.uid() = author_id or public.is_admin());

-- Создавать можно только свой материал и только со статусом 'pending'.
drop policy if exists "materials insert own pending" on public.materials;
create policy "materials insert own pending" on public.materials
  for insert to authenticated
  with check (auth.uid() = author_id and status = 'pending');

-- Менять статус (одобрить/отклонить) может администратор.
drop policy if exists "materials update admin" on public.materials;
create policy "materials update admin" on public.materials
  for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Удалять можно свой материал или админу — любой.
drop policy if exists "materials delete own or admin" on public.materials;
create policy "materials delete own or admin" on public.materials
  for delete to authenticated using (auth.uid() = author_id or public.is_admin());

-- ============================================================================
-- Дашборд владельца: сводная статистика платформы в реальном времени.
-- SECURITY DEFINER считает по всем строкам (в обход RLS), но вызвать функцию
-- может только администратор — проверка is_admin() внутри. Так владелец видит
-- общие цифры, не получая доступа к личным данным участниц.
-- ============================================================================
create or replace function public.platform_stats()
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  result json;
begin
  if not public.is_admin() then
    raise exception 'not authorized';
  end if;
  select json_build_object(
    -- Люди
    'members_total', (select count(*) from auth.users),
    'new_7d', (select count(*) from auth.users where created_at > now() - interval '7 days'),
    'experts_total', (select count(*) from public.user_state
        where coalesce((state->'expertProfile'->>'published')::boolean, false) = true),
    -- Контент
    'materials_total', (select count(*) from public.materials),
    'materials_pending', (select count(*) from public.materials where status = 'pending'),
    'materials_approved', (select count(*) from public.materials where status = 'approved'),
    -- Активность (updated_at обновляется при каждом сохранении данных участницы)
    'active_7d', (select count(*) from public.user_state
        where updated_at > now() - interval '7 days'),
    'journal_total', (select coalesce(sum(
        case when jsonb_typeof(state->'journalEntries') = 'array'
             then jsonb_array_length(state->'journalEntries') else 0 end), 0)
      from public.user_state),
    'steps_done', (select count(*)
      from public.user_state us,
      lateral jsonb_array_elements(
        case when jsonb_typeof(us.state->'sphereSteps') = 'array'
             then us.state->'sphereSteps' else '[]'::jsonb end) st
      where (st->>'done')::boolean is true),
    -- Платное: оборот и сплит (из таблицы payments — реальные заглушки оплаты)
    'revenue_total', (select coalesce(sum(amount), 0) from public.payments where status = 'paid'),
    'platform_earned', (select coalesce(sum(platform_fee), 0) from public.payments where status = 'paid'),
    'experts_earned', (select coalesce(sum(expert_amount), 0) from public.payments where status = 'paid'),
    'subs_active', (select count(distinct payer_id) from public.payments
        where kind = 'subscription' and status = 'paid' and expires_at > now()),
    'masterminds_total', (select count(*) from public.masterminds),
    'payments_count', (select count(*) from public.payments where status = 'paid')
  ) into result;
  return result;
end;
$$;

grant execute on function public.platform_stats() to authenticated;

-- ============================================================================
-- ОПЛАТЫ (заглушки). Две точки оплаты:
--  1) Подписка на клуб (участница → платформа, 100% платформе).
--  2) Мастермайнд эксперта (участница → платформа → сплит 50/50 эксперту).
-- Пока платёж имитируется: функции ниже создают запись об оплате и считают
-- сплит на сервере. Когда подключим провайдера (ЮKassa/СБП-сплитование) —
-- заменим только «движок», вся логика балансов уже готова.
-- ============================================================================

-- Мастермайнды — платные продукты экспертов, видны всем участницам.
create table if not exists public.masterminds (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references auth.users (id) on delete cascade,
  author_name text not null default '',
  title text not null,
  description text not null default '',
  date text,
  time text,
  type text not null default 'online',
  location text,
  price numeric not null default 0,
  spots integer,
  created_at timestamptz not null default now()
);
alter table public.masterminds enable row level security;

drop policy if exists "masterminds read" on public.masterminds;
create policy "masterminds read" on public.masterminds
  for select to authenticated using (true);
drop policy if exists "masterminds insert own" on public.masterminds;
create policy "masterminds insert own" on public.masterminds
  for insert to authenticated with check (auth.uid() = author_id);
drop policy if exists "masterminds update own" on public.masterminds;
create policy "masterminds update own" on public.masterminds
  for update to authenticated using (auth.uid() = author_id) with check (auth.uid() = author_id);
drop policy if exists "masterminds delete own or admin" on public.masterminds;
create policy "masterminds delete own or admin" on public.masterminds
  for delete to authenticated using (auth.uid() = author_id or public.is_admin());

-- Платежи (подписки и оплаты мастермайндов).
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  payer_id uuid not null references auth.users (id) on delete cascade,
  payer_name text not null default '',
  kind text not null,               -- 'subscription' | 'mastermind'
  plan text,                        -- для подписки: 'monthly' | 'yearly'
  mastermind_id uuid references public.masterminds (id) on delete set null,
  item_title text not null default '',
  expert_id uuid references auth.users (id) on delete set null,
  amount numeric not null default 0,
  platform_fee numeric not null default 0,
  expert_amount numeric not null default 0,
  expires_at timestamptz,           -- для подписки
  status text not null default 'paid',
  created_at timestamptz not null default now()
);
alter table public.payments enable row level security;

-- Читать: свои платежи — плательщик; продажи — эксперт; всё — админ.
drop policy if exists "payments read" on public.payments;
create policy "payments read" on public.payments
  for select to authenticated
  using (auth.uid() = payer_id or auth.uid() = expert_id or public.is_admin());
-- Вставка — только через функции оплаты (SECURITY DEFINER), прямой insert закрыт.

-- Оплата подписки (100% платформе). Цены заданы на сервере.
create or replace function public.pay_subscription(p_plan text)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_amount numeric;
  v_expires timestamptz;
  v_name text;
begin
  if p_plan = 'monthly' then
    v_amount := 490; v_expires := now() + interval '1 month';
  elsif p_plan = 'yearly' then
    v_amount := 3900; v_expires := now() + interval '1 year';
  else
    raise exception 'unknown plan';
  end if;
  select coalesce(state->'profile'->>'name', '') into v_name
    from public.user_state where user_id = auth.uid();
  insert into public.payments
    (payer_id, payer_name, kind, plan, item_title, amount, platform_fee, expert_amount, expires_at)
  values
    (auth.uid(), coalesce(v_name, ''), 'subscription', p_plan,
     case when p_plan = 'yearly' then 'Подписка на год' else 'Подписка на месяц' end,
     v_amount, v_amount, 0, v_expires);
  return json_build_object('ok', true, 'expires_at', v_expires, 'amount', v_amount);
end;
$$;
grant execute on function public.pay_subscription(text) to authenticated;

-- Оплата мастермайнда (сплит 50/50). Цена и эксперт берутся из мастермайнда.
create or replace function public.pay_mastermind(p_mastermind_id uuid)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  m public.masterminds%rowtype;
  v_fee numeric;
  v_expert numeric;
  v_name text;
begin
  select * into m from public.masterminds where id = p_mastermind_id;
  if not found then raise exception 'mastermind not found'; end if;
  -- Уже оплачено этой участницей — не дублируем.
  if exists (select 1 from public.payments
             where kind = 'mastermind' and mastermind_id = p_mastermind_id
               and payer_id = auth.uid() and status = 'paid') then
    return json_build_object('ok', true, 'already', true);
  end if;
  v_fee := round(m.price * 0.5);       -- комиссия платформы 50%
  v_expert := m.price - v_fee;
  select coalesce(state->'profile'->>'name', '') into v_name
    from public.user_state where user_id = auth.uid();
  insert into public.payments
    (payer_id, payer_name, kind, mastermind_id, item_title, expert_id,
     amount, platform_fee, expert_amount)
  values
    (auth.uid(), coalesce(v_name, ''), 'mastermind', p_mastermind_id, m.title, m.author_id,
     m.price, v_fee, v_expert);
  return json_build_object('ok', true, 'amount', m.price);
end;
$$;
grant execute on function public.pay_mastermind(uuid) to authenticated;
