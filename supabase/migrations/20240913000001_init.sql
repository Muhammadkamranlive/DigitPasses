-- Arenas Cards — PostgreSQL schema for Supabase
-- Run this in the SQL editor of a new Supabase project (or via `supabase db push`).

create extension if not exists "pgcrypto";

do $$ begin
  create type public.user_role as enum ('super_admin', 'merchant', 'customer', 'sales_rep', 'developer');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pass_type as enum ('gift_card', 'loyalty_card', 'membership_card', 'punch_card');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.pass_status as enum (
    'template', 'pending_for_send', 'redeemable', 'partially_redeemed', 'fully_redeemed', 'public'
  );
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.vault_type as enum ('customer', 'merchant', 'platform');
exception when duplicate_object then null;
end $$;

do $$ begin
  create type public.txn_flag as enum ('C', 'D', 'N');
exception when duplicate_object then null;
end $$;

create table if not exists public.tenants (
  id uuid primary key default gen_random_uuid(),
  company_id serial unique,
  name text not null,
  email text not null,
  phone text,
  address text,
  city text,
  state text,
  country text default 'USA',
  industry text,
  status text not null default 'active',
  plan_name text default 'Growth',
  sales_rep_id uuid,
  created_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null unique,
  phone text,
  image_url text,
  role public.user_role not null default 'customer',
  tenant_id uuid references public.tenants (id) on delete set null,
  company_designation text,
  created_at timestamptz not null default now()
);

alter table public.tenants
  drop constraint if exists tenants_sales_rep_id_fkey;
alter table public.tenants
  add constraint tenants_sales_rep_id_fkey
  foreign key (sales_rep_id) references public.profiles (id) on delete set null;

create table if not exists public.wallet_passes (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  type public.pass_type not null,
  status public.pass_status not null default 'template',
  background_color text not null default '#5d16ec',
  foreground_color text not null default '#ffffff',
  label_color text not null default '#e9ddff',
  organization_name text not null,
  serial_number text not null unique,
  logo_text text,
  logo_url text,
  card_holder_name text,
  card_holder_title text,
  code_type text not null default 'QR',
  expiration_date date,
  recipient_name text,
  sender_name text,
  email text,
  phone text,
  terms_and_conditions text,
  privacy_policy text,
  message text,
  description text,
  -- gift
  balance numeric(12,2) default 0,
  currency_code text default 'USD',
  currency_sign text default '$',
  -- loyalty
  program_name text,
  points_balance integer default 0,
  reward_details text,
  -- membership
  member_name text,
  membership_number text,
  additional_benefits text,
  membership_status text,
  -- punch
  punch_title text,
  total_punches integer default 10,
  current_punches integer default 0,
  issued_from uuid references public.wallet_passes (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.vaults (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete cascade,
  email text not null,
  iban text,
  vault_type public.vault_type not null,
  amount numeric(12,2) not null default 0,
  currency text not null default 'USD',
  status text not null default 'open',
  created_at timestamptz not null default now()
);

create table if not exists public.account_transactions (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants (id) on delete cascade,
  card_id uuid references public.wallet_passes (id) on delete set null,
  vault_id uuid references public.vaults (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  customer_email text,
  amount numeric(12,2) not null,
  dr_cr_flag public.txn_flag not null,
  txn_type text not null,
  redemption_type text,
  reference_no text,
  balance_before numeric(12,2),
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_licenses (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.tenants (id) on delete cascade,
  public_key text not null,
  private_key text not null,
  status text not null default 'active',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.payment_plans (
  id uuid primary key default gen_random_uuid(),
  plan_name text not null,
  plan_description text,
  price numeric(10,2) not null,
  currency_code text not null default 'USD',
  billing_cycle text not null default 'monthly',
  max_cards integer,
  max_users integer,
  trial_period_days integer default 14,
  is_active boolean not null default true
);

create table if not exists public.tenant_billings (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants (id) on delete cascade,
  plan_id uuid references public.payment_plans (id),
  upgrade_status text default 'active',
  started_at timestamptz not null default now()
);

create index if not exists wallet_passes_tenant_idx on public.wallet_passes (tenant_id, status);
create index if not exists wallet_passes_email_idx on public.wallet_passes (email);
create index if not exists txn_tenant_idx on public.account_transactions (tenant_id, created_at desc);
create index if not exists profiles_tenant_idx on public.profiles (tenant_id, role);

-- Auth helper
create or replace function public.current_profile()
returns public.profiles
language sql
stable
security definer
set search_path = public
as $$
  select * from public.profiles where id = auth.uid();
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'super_admin'
  );
$$;

create or replace function public.my_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id from public.profiles where id = auth.uid();
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  requested_role text := coalesce(new.raw_user_meta_data->>'role', 'customer');
  safe_role public.user_role;
  new_tenant uuid;
begin
  if requested_role in ('merchant', 'customer', 'sales_rep', 'developer') then
    safe_role := requested_role::public.user_role;
  else
    safe_role := 'customer';
  end if;

  if safe_role = 'merchant' then
    insert into public.tenants (name, email, status)
    values (
      coalesce(new.raw_user_meta_data->>'company', 'New Merchant'),
      coalesce(new.email, 'merchant@local'),
      'active'
    )
    returning id into new_tenant;

    insert into public.vaults (tenant_id, user_id, email, vault_type, amount, iban)
    values (new_tenant, new.id, new.email, 'merchant', 5000, 'AC' || substr(replace(new.id::text, '-', ''), 1, 14));

    insert into public.tenant_licenses (tenant_id, public_key, private_key)
    values (
      new_tenant,
      'pk_live_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 24),
      'sk_live_' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 32)
    );
  end if;

  insert into public.profiles (id, first_name, last_name, email, role, tenant_id, company_designation, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'first_name', 'New'),
    coalesce(new.raw_user_meta_data->>'last_name', 'User'),
    new.email,
    safe_role,
    new_tenant,
    new.raw_user_meta_data->>'company',
    new.raw_user_meta_data->>'phone'
  );

  if safe_role = 'customer' then
    insert into public.vaults (user_id, email, vault_type, amount, iban)
    values (new.id, new.email, 'customer', 0, 'AC' || substr(replace(new.id::text, '-', ''), 1, 14));
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Serial helper
create or replace function public.next_serial(p_type text)
returns text
language plpgsql
as $$
begin
  return upper(substr(p_type, 1, 2)) || '-' || to_char(now(), 'YYMMDD') || '-' || substr(replace(gen_random_uuid()::text, '-', ''), 1, 6);
end;
$$;

-- Assign a template to a customer
create or replace function public.assign_pass(p_template_id uuid, p_email text, p_first_name text, p_last_name text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.profiles;
  tpl public.wallet_passes;
  merchant_vault public.vaults;
  new_id uuid;
  serial text;
begin
  select * into me from public.profiles where id = auth.uid();
  if me.role not in ('merchant', 'super_admin', 'developer') then
    raise exception 'Not allowed';
  end if;

  select * into tpl from public.wallet_passes where id = p_template_id and status = 'template';
  if not found then
    raise exception 'Template not found';
  end if;
  if me.role <> 'super_admin' and tpl.tenant_id <> me.tenant_id then
    raise exception 'Wrong tenant';
  end if;

  select * into merchant_vault
  from public.vaults
  where tenant_id = tpl.tenant_id and vault_type = 'merchant'
  limit 1;

  if tpl.type = 'gift_card' and merchant_vault.amount < coalesce(tpl.balance, 0) then
    raise exception 'Insufficient merchant vault balance';
  end if;

  serial := public.next_serial(tpl.type::text);

  insert into public.wallet_passes (
    tenant_id, type, status, background_color, foreground_color, label_color,
    organization_name, serial_number, logo_text, logo_url, card_holder_name, card_holder_title,
    code_type, expiration_date, recipient_name, sender_name, email, phone,
    terms_and_conditions, privacy_policy, message, description,
    balance, currency_code, currency_sign, program_name, points_balance, reward_details,
    member_name, membership_number, additional_benefits, membership_status,
    punch_title, total_punches, current_punches, issued_from
  )
  values (
    tpl.tenant_id, tpl.type, 'redeemable', tpl.background_color, tpl.foreground_color, tpl.label_color,
    tpl.organization_name, serial, tpl.logo_text, tpl.logo_url,
    coalesce(p_first_name || ' ' || p_last_name, tpl.card_holder_name), tpl.card_holder_title,
    tpl.code_type, tpl.expiration_date, p_first_name, me.first_name, p_email, tpl.phone,
    tpl.terms_and_conditions, tpl.privacy_policy, tpl.message, tpl.description,
    tpl.balance, tpl.currency_code, tpl.currency_sign, tpl.program_name, tpl.points_balance, tpl.reward_details,
    p_first_name || ' ' || p_last_name, serial, tpl.additional_benefits, 'active',
    tpl.punch_title, tpl.total_punches, 0, tpl.id
  )
  returning id into new_id;

  if tpl.type = 'gift_card' then
    update public.vaults set amount = amount - tpl.balance where id = merchant_vault.id;
    insert into public.account_transactions (
      tenant_id, card_id, vault_id, user_id, customer_email, amount, dr_cr_flag, txn_type, redemption_type, balance_before
    ) values (
      tpl.tenant_id, new_id, merchant_vault.id, me.id, p_email, tpl.balance, 'D', 'PassIssuance', 'Issue', merchant_vault.amount
    );
  end if;

  return new_id;
end;
$$;

-- Redeem
create or replace function public.redeem_pass(p_serial text, p_amount numeric, p_kind text)
returns public.wallet_passes
language plpgsql
security definer
set search_path = public
as $$
declare
  me public.profiles;
  card public.wallet_passes;
  amt numeric := coalesce(p_amount, 0);
begin
  select * into me from public.profiles where id = auth.uid();
  if me.role not in ('merchant', 'super_admin', 'developer') then
    raise exception 'Not allowed';
  end if;

  select * into card from public.wallet_passes
  where serial_number = p_serial
    and status in ('redeemable', 'partially_redeemed');

  if not found then
    raise exception 'Pass not redeemable';
  end if;
  if me.role <> 'super_admin' and card.tenant_id <> me.tenant_id then
    raise exception 'Wrong tenant';
  end if;

  if card.type = 'gift_card' then
    if amt <= 0 or amt > card.balance then
      raise exception 'Invalid amount';
    end if;
    card.balance := card.balance - amt;
    if card.balance = 0 then
      card.status := 'fully_redeemed';
    else
      card.status := 'partially_redeemed';
    end if;
  elsif card.type = 'punch_card' then
    card.current_punches := least(card.total_punches, card.current_punches + 1);
    if card.current_punches >= card.total_punches then
      card.status := 'fully_redeemed';
    else
      card.status := 'partially_redeemed';
    end if;
    amt := 1;
  elsif card.type = 'loyalty_card' then
    card.points_balance := greatest(0, card.points_balance - coalesce(p_amount, 10)::int);
    card.status := 'partially_redeemed';
    amt := coalesce(p_amount, 10);
  else
    card.status := 'fully_redeemed';
  end if;

  update public.wallet_passes
  set balance = card.balance,
      status = card.status,
      current_punches = card.current_punches,
      points_balance = card.points_balance,
      updated_at = now()
  where id = card.id;

  insert into public.account_transactions (
    tenant_id, card_id, user_id, customer_email, amount, dr_cr_flag, txn_type, redemption_type, balance_before
  ) values (
    card.tenant_id, card.id, me.id, card.email, amt, 'D', 'Redemption', coalesce(p_kind, 'in_store'), card.balance + amt
  );

  return card;
end;
$$;

-- RLS
alter table public.tenants enable row level security;
alter table public.profiles enable row level security;
alter table public.wallet_passes enable row level security;
alter table public.vaults enable row level security;
alter table public.account_transactions enable row level security;
alter table public.tenant_licenses enable row level security;
alter table public.payment_plans enable row level security;
alter table public.tenant_billings enable row level security;

create policy "profiles self" on public.profiles
  for select using (id = auth.uid() or public.is_super_admin() or tenant_id = public.my_tenant_id());

create policy "profiles update self" on public.profiles
  for update using (id = auth.uid() or public.is_super_admin());

create policy "tenants visible" on public.tenants
  for select using (public.is_super_admin() or id = public.my_tenant_id() or sales_rep_id = auth.uid());

create policy "tenants merchant update" on public.tenants
  for update using (id = public.my_tenant_id() or public.is_super_admin());

create policy "passes merchant" on public.wallet_passes
  for all using (
    public.is_super_admin()
    or tenant_id = public.my_tenant_id()
    or email = (select email from public.profiles where id = auth.uid())
  )
  with check (
    public.is_super_admin() or tenant_id = public.my_tenant_id()
  );

create policy "vaults visible" on public.vaults
  for select using (
    public.is_super_admin() or tenant_id = public.my_tenant_id() or user_id = auth.uid()
  );

create policy "txns visible" on public.account_transactions
  for select using (
    public.is_super_admin()
    or tenant_id = public.my_tenant_id()
    or user_id = auth.uid()
    or customer_email = (select email from public.profiles where id = auth.uid())
  );

create policy "licenses merchant" on public.tenant_licenses
  for select using (public.is_super_admin() or tenant_id = public.my_tenant_id());

create policy "plans public read" on public.payment_plans
  for select using (true);

create policy "billings tenant" on public.tenant_billings
  for select using (public.is_super_admin() or tenant_id = public.my_tenant_id());

insert into public.payment_plans (plan_name, plan_description, price, max_cards, max_users)
select * from (values
  ('Starter', 'Launch gift cards for a single location.', 29::numeric, 500, 3),
  ('Growth', 'Loyalty + punch cards and POS API access.', 79::numeric, 5000, 15),
  ('Scale', 'Unlimited cards, keys, and white-label branding.', 199::numeric, null::integer, null::integer)
) as v(plan_name, plan_description, price, max_cards, max_users)
where not exists (select 1 from public.payment_plans p where p.plan_name = v.plan_name);
