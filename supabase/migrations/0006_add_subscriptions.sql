-- The subscriptions table already exists in the Supabase project.
-- Its existing columns are:
-- id, user_id, plan_id, status, provider_customer_id,
-- provider_subscription_id, current_period_end, created_at,
-- updated_at, cancelled.

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

notify pgrst, 'reload schema';
