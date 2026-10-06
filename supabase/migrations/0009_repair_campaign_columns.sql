alter table public.campaigns
  add column if not exists project_id uuid references public.projects(id) on delete cascade,
  add column if not exists user_id uuid references auth.users(id) on delete cascade,
  add column if not exists name text,
  add column if not exists status text default 'draft',
  add column if not exists objective text,
  add column if not exists strategy_snapshot jsonb default '{}'::jsonb,
  add column if not exists creative_snapshot jsonb default '[]'::jsonb,
  add column if not exists created_at timestamptz default timezone('utc', now()),
  add column if not exists updated_at timestamptz default timezone('utc', now());

update public.campaigns
set
  status = coalesce(status, 'draft'),
  strategy_snapshot = coalesce(strategy_snapshot, '{}'::jsonb),
  creative_snapshot = coalesce(creative_snapshot, '[]'::jsonb),
  created_at = coalesce(created_at, timezone('utc', now())),
  updated_at = coalesce(updated_at, timezone('utc', now()))
where status is null
   or strategy_snapshot is null
   or creative_snapshot is null
   or created_at is null
   or updated_at is null;

notify pgrst, 'reload schema';
