create extension if not exists "pgcrypto";

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  product_url text,
  product_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table public.product_analyses (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'complete', 'failed')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, id)
);

create table public.advertising_strategies (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  result jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (project_id, id)
);

create table public.ad_variants (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  kind text not null check (kind in ('hook', 'copy')),
  content jsonb not null default '{}'::jsonb,
  position integer not null default 0 check (position >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index projects_user_id_updated_at_idx on public.projects(user_id, updated_at desc);
create index product_analyses_project_id_idx on public.product_analyses(project_id);
create index advertising_strategies_project_id_idx on public.advertising_strategies(project_id);
create index ad_variants_project_id_kind_idx on public.ad_variants(project_id, kind, position);

alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.product_analyses enable row level security;
alter table public.advertising_strategies enable row level security;
alter table public.ad_variants enable row level security;

create policy "Users can manage their profile" on public.profiles for all using (auth.uid() = id) with check (auth.uid() = id);
create policy "Users can manage their projects" on public.projects for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can manage their analyses" on public.product_analyses for all using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.projects where projects.id = project_id and projects.user_id = auth.uid()));
create policy "Users can manage their strategies" on public.advertising_strategies for all using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.projects where projects.id = project_id and projects.user_id = auth.uid()));
create policy "Users can manage their variants" on public.ad_variants for all using (auth.uid() = user_id) with check (auth.uid() = user_id and exists (select 1 from public.projects where projects.id = project_id and projects.user_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create or replace function public.set_updated_at()
returns trigger language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create trigger projects_set_updated_at before update on public.projects for each row execute procedure public.set_updated_at();
create trigger analyses_set_updated_at before update on public.product_analyses for each row execute procedure public.set_updated_at();
create trigger strategies_set_updated_at before update on public.advertising_strategies for each row execute procedure public.set_updated_at();
create trigger variants_set_updated_at before update on public.ad_variants for each row execute procedure public.set_updated_at();
