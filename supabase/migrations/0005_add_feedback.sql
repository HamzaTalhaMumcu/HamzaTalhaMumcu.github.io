create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  email text not null,
  category text not null default 'general'
    check (category in ('general', 'bug', 'feature', 'improvement')),
  message text not null check (char_length(message) between 10 and 2000),
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.feedback enable row level security;

drop policy if exists "Users can submit feedback" on public.feedback;
create policy "Users can submit feedback"
on public.feedback
for insert
to authenticated
with check (auth.uid() = user_id);

drop policy if exists "Users can view their feedback" on public.feedback;
create policy "Users can view their feedback"
on public.feedback
for select
to authenticated
using (auth.uid() = user_id);

create index if not exists feedback_user_created_at_idx
on public.feedback (user_id, created_at desc);

notify pgrst, 'reload schema';
