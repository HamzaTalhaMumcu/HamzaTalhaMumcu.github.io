create table if not exists public.ai_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  period_start date not null default date_trunc('month', timezone('utc', now()))::date,
  generations integer not null default 0 check (generations >= 0)
);

alter table public.ai_usage enable row level security;

drop policy if exists "Users can view their AI usage" on public.ai_usage;

create policy "Users can view their AI usage"
on public.ai_usage
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.consume_ai_generation(
  p_user_id uuid,
  p_limit integer default 10
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  current_period date := date_trunc('month', timezone('utc', now()))::date;
  consumed boolean;
begin
  if auth.uid() is null or auth.uid() <> p_user_id or p_limit < 1 then
    return false;
  end if;

  insert into public.ai_usage (user_id, period_start, generations)
  values (p_user_id, current_period, 0)
  on conflict (user_id) do nothing;

  update public.ai_usage
  set period_start = current_period, generations = 0
  where user_id = p_user_id
    and period_start < current_period;

  update public.ai_usage
  set generations = generations + 1
  where user_id = p_user_id
    and period_start = current_period
    and generations < p_limit
  returning true into consumed;

  return coalesce(consumed, false);
end;
$$;

revoke all on function public.consume_ai_generation(uuid, integer) from public;
grant execute on function public.consume_ai_generation(uuid, integer) to authenticated;

notify pgrst, 'reload schema';
