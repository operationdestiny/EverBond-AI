begin;

create extension if not exists pgcrypto;

create table if not exists public.evercoin_wallets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance bigint not null default 0 check (balance >= 0),
  updated_at timestamptz not null default now()
);

create table if not exists public.evercoin_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  amount bigint not null,
  reason text not null,
  reference_id text,
  created_at timestamptz not null default now()
);

create index if not exists evercoin_transactions_user_created_idx
  on public.evercoin_transactions (user_id, created_at desc);

create table if not exists public.character_gallery_images (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null references public.characters(id) on delete cascade,
  storage_path text not null unique,
  prompt text not null,
  provider text not null default 'venice',
  model text not null,
  evercoin_charge bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists character_gallery_owner_character_idx
  on public.character_gallery_images (user_id, character_id, created_at desc);

create table if not exists public.user_character_preferences (
  user_id uuid not null references auth.users(id) on delete cascade,
  character_id text not null references public.characters(id) on delete cascade,
  selected_gallery_image_id uuid references public.character_gallery_images(id) on delete set null,
  updated_at timestamptz not null default now(),
  primary key (user_id, character_id)
);

alter table public.evercoin_wallets enable row level security;
alter table public.evercoin_transactions enable row level security;
alter table public.character_gallery_images enable row level security;
alter table public.user_character_preferences enable row level security;

drop policy if exists evercoin_wallet_owner_read
  on public.evercoin_wallets;
create policy evercoin_wallet_owner_read
on public.evercoin_wallets
for select
using (auth.uid() = user_id);

drop policy if exists evercoin_transactions_owner_read
  on public.evercoin_transactions;
create policy evercoin_transactions_owner_read
on public.evercoin_transactions
for select
using (auth.uid() = user_id);

drop policy if exists character_gallery_owner_all
  on public.character_gallery_images;
create policy character_gallery_owner_all
on public.character_gallery_images
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists user_character_preferences_owner_all
  on public.user_character_preferences;
create policy user_character_preferences_owner_all
on public.user_character_preferences
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'character-gallery',
  'character-gallery',
  false,
  10485760,
  array['image/png', 'image/jpeg', 'image/webp']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create or replace function public.enforce_character_gallery_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  image_count integer;
begin
  select count(*)
  into image_count
  from public.character_gallery_images
  where user_id = new.user_id
    and character_id = new.character_id;

  if image_count >= 5 then
    raise exception 'IMAGE_LIMIT_REACHED'
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists character_gallery_limit_trigger
  on public.character_gallery_images;

create trigger character_gallery_limit_trigger
before insert
on public.character_gallery_images
for each row
execute function public.enforce_character_gallery_limit();

create or replace function public.charge_evercoin(
  p_user_id uuid,
  p_amount bigint,
  p_reason text,
  p_reference_id text default null
)
returns table (
  charged boolean,
  balance bigint
)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance bigint;
begin
  if p_amount < 0 then
    raise exception 'INVALID_EVERCOIN_AMOUNT';
  end if;

  insert into public.evercoin_wallets (user_id, balance)
  values (p_user_id, 0)
  on conflict (user_id) do nothing;

  select w.balance
  into current_balance
  from public.evercoin_wallets w
  where w.user_id = p_user_id
  for update;

  if current_balance < p_amount then
    return query
    select false, current_balance;
    return;
  end if;

  update public.evercoin_wallets
  set
    balance = balance - p_amount,
    updated_at = now()
  where user_id = p_user_id
  returning evercoin_wallets.balance
  into current_balance;

  if p_amount > 0 then
    insert into public.evercoin_transactions (
      user_id,
      amount,
      reason,
      reference_id
    )
    values (
      p_user_id,
      -p_amount,
      p_reason,
      p_reference_id
    );
  end if;

  return query
  select true, current_balance;
end;
$$;

create or replace function public.refund_evercoin(
  p_user_id uuid,
  p_amount bigint,
  p_reason text,
  p_reference_id text default null
)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  current_balance bigint;
begin
  if p_amount <= 0 then
    select coalesce(balance, 0)
    into current_balance
    from public.evercoin_wallets
    where user_id = p_user_id;

    return coalesce(current_balance, 0);
  end if;

  insert into public.evercoin_wallets (user_id, balance)
  values (p_user_id, p_amount)
  on conflict (user_id) do update
  set
    balance = public.evercoin_wallets.balance + excluded.balance,
    updated_at = now()
  returning balance into current_balance;

  insert into public.evercoin_transactions (
    user_id,
    amount,
    reason,
    reference_id
  )
  values (
    p_user_id,
    p_amount,
    p_reason,
    p_reference_id
  );

  return current_balance;
end;
$$;

grant select on public.evercoin_wallets to authenticated;
grant select on public.evercoin_transactions to authenticated;
grant select, insert, update, delete on public.character_gallery_images to authenticated;
grant select, insert, update, delete on public.user_character_preferences to authenticated;

grant all on public.evercoin_wallets to service_role;
grant all on public.evercoin_transactions to service_role;
grant all on public.character_gallery_images to service_role;
grant all on public.user_character_preferences to service_role;

grant execute on function public.charge_evercoin(uuid, bigint, text, text)
to service_role;
grant execute on function public.refund_evercoin(uuid, bigint, text, text)
to service_role;

commit;
