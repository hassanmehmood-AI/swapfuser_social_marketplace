-- ── Fix: the trigger was reverting is_admin/is_super_admin because
-- auth.uid() is NULL when running via the SQL Editor (no app session).
create or replace function public.protect_admin_flags()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if auth.uid() is null then
    return new;
  end if;

  if not public.is_super_admin(auth.uid()) then
    new.is_super_admin := old.is_super_admin;
    if not public.is_admin(auth.uid()) then
      new.is_admin := old.is_admin;
    end if;
  end if;

  if old.is_super_admin and not public.is_super_admin(auth.uid()) then
    new.is_admin := old.is_admin;
    new.is_super_admin := old.is_super_admin;
  end if;

  return new;
end;
$$;

-- ── Re-apply the bootstrap admin grant now that the trigger is fixed ────
update public.profiles
set is_admin = true, is_super_admin = true
where id = '37c9a33d-9955-4a09-90ef-93837e1a5071'; -- asefuddin10@gmail.com (@xcel)
