-- The application relates ad variants directly to projects.
-- Keep legacy advertisement_id data if it exists, but do not require it for new rows.
do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'ad_variants'
      and column_name = 'advertisement_id'
  ) then
    alter table public.ad_variants
      alter column advertisement_id drop not null;
  end if;
end
$$;

notify pgrst, 'reload schema';
