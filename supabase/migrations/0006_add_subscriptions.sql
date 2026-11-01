create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null,
  status text not null default 'active',
  provider_customer_id text,
  provider_subscription_id text,
  current_period_end timestamptz,
  cancelled boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists subscriptions_user_id_idx
on public.subscriptions (user_id);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view their subscription" on public.subscriptions;

create policy "Users can view their subscription"
on public.subscriptions
for select
to authenticated
using (auth.uid() = user_id);

create unique index if not exists subscriptions_provider_subscription_id_idx
on public.subscriptions (provider_subscription_id)
where provider_subscription_id is not null;

create index if not exists subscriptions_status_cancelled_idx
on public.subscriptions (status, cancelled);

drop trigger if exists subscriptions_set_updated_at on public.subscriptions;

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute procedure public.set_updated_at();

notify pgrst, 'reload schema';
