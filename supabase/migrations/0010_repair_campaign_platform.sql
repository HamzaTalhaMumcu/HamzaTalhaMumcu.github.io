alter table public.campaigns
  add column if not exists platform text default 'meta';

update public.campaigns
set platform = 'meta'
where platform is null;

alter table public.campaigns
  alter column platform set default 'meta',
  alter column platform set not null;

notify pgrst, 'reload schema';
