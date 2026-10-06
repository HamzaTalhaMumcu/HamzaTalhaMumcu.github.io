alter table public.profiles
  add column if not exists brand_name text,
  add column if not exists brand_description text,
  add column if not exists brand_voice text,
  add column if not exists brand_values text,
  add column if not exists preferred_words text,
  add column if not exists avoid_words text;

alter table public.projects
  add column if not exists competitors jsonb not null default '[]'::jsonb;

create table if not exists public.campaigns (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  status text not null default 'draft' check (status in ('draft', 'ready', 'archived')),
  objective text,
  strategy_snapshot jsonb not null default '{}'::jsonb,
  creative_snapshot jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_ad_sets (
  id uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references public.campaigns(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  targeting_notes text,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.campaign_ads (
  id uuid primary key default gen_random_uuid(),
  ad_set_id uuid not null references public.campaign_ad_sets(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('hook', 'copy')),
  content jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.campaigns
  add column if not exists user_id uuid;

alter table public.campaign_ad_sets
  add column if not exists user_id uuid;

alter table public.campaign_ads
  add column if not exists user_id uuid;

update public.campaigns
set user_id = projects.user_id
from public.projects
where campaigns.project_id = projects.id
  and campaigns.user_id is null;

update public.campaign_ad_sets
set user_id = campaigns.user_id
from public.campaigns
where campaign_ad_sets.campaign_id = campaigns.id
  and campaign_ad_sets.user_id is null;

update public.campaign_ads
set user_id = campaign_ad_sets.user_id
from public.campaign_ad_sets
where campaign_ads.ad_set_id = campaign_ad_sets.id
  and campaign_ads.user_id is null;

alter table public.campaigns
  alter column user_id set not null;

alter table public.campaign_ad_sets
  alter column user_id set not null;

alter table public.campaign_ads
  alter column user_id set not null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'campaigns_user_id_fkey'
      and conrelid = 'public.campaigns'::regclass
  ) then
    alter table public.campaigns
      add constraint campaigns_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'campaign_ad_sets_user_id_fkey'
      and conrelid = 'public.campaign_ad_sets'::regclass
  ) then
    alter table public.campaign_ad_sets
      add constraint campaign_ad_sets_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'campaign_ads_user_id_fkey'
      and conrelid = 'public.campaign_ads'::regclass
  ) then
    alter table public.campaign_ads
      add constraint campaign_ads_user_id_fkey
      foreign key (user_id) references auth.users(id) on delete cascade;
  end if;
end
$$;

alter table public.campaigns enable row level security;
alter table public.campaign_ad_sets enable row level security;
alter table public.campaign_ads enable row level security;

drop policy if exists "Users can manage their campaigns" on public.campaigns;
create policy "Users can manage their campaigns"
on public.campaigns
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their campaign ad sets" on public.campaign_ad_sets;
create policy "Users can manage their campaign ad sets"
on public.campaign_ad_sets
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can manage their campaign ads" on public.campaign_ads;
create policy "Users can manage their campaign ads"
on public.campaign_ads
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create index if not exists campaigns_project_id_created_at_idx
on public.campaigns (project_id, created_at desc);
create index if not exists campaign_ad_sets_campaign_id_idx
on public.campaign_ad_sets (campaign_id);
create index if not exists campaign_ads_ad_set_id_idx
on public.campaign_ads (ad_set_id);

drop trigger if exists campaigns_set_updated_at on public.campaigns;
create trigger campaigns_set_updated_at
before update on public.campaigns
for each row execute procedure public.set_updated_at();

notify pgrst, 'reload schema';
