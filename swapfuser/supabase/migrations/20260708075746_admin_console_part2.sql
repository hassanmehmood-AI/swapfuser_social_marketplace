-- ── Admin-only RPCs that need auth.users (last_sign_in_at / created_at) ──
create or replace function public.admin_dashboard_stats()
returns table (
  total_users bigint,
  active_users_7d bigint,
  total_posts bigint,
  open_contact_requests bigint
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
  select
    (select count(*) from public.profiles),
    (select count(*) from auth.users where last_sign_in_at >= now() - interval '7 days'),
    (select count(*) from public.posts where is_active = true),
    (select count(*) from public.contact_requests where status = 'new');
end;
$$;

revoke all on function public.admin_dashboard_stats() from public;
grant execute on function public.admin_dashboard_stats() to authenticated;

create or replace function public.admin_list_users()
returns table (
  id uuid,
  username text,
  full_name text,
  avatar_url text,
  is_admin boolean,
  is_super_admin boolean,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
  select p.id, p.username, p.full_name, p.avatar_url, p.is_admin, p.is_super_admin, p.created_at, u.last_sign_in_at
  from public.profiles p
  join auth.users u on u.id = p.id
  order by p.created_at desc;
end;
$$;

revoke all on function public.admin_list_users() from public;
grant execute on function public.admin_list_users() to authenticated;

create or replace function public.admin_activity_since(since timestamptz)
returns table (created_at timestamptz, kind text)
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin(auth.uid()) then
    raise exception 'not authorized';
  end if;

  return query
  select p.created_at, 'post'::text from public.posts p where p.created_at >= since
  union all
  select c.created_at, 'comment'::text from public.comments c where c.created_at >= since
  union all
  select u.created_at, 'signup'::text from auth.users u where u.created_at >= since;
end;
$$;

revoke all on function public.admin_activity_since(timestamptz) from public;
grant execute on function public.admin_activity_since(timestamptz) to authenticated;

-- ── Bootstrap first admin ────────────────────────────────────────────────
update public.profiles
set is_admin = true, is_super_admin = true
where id = '37c9a33d-9955-4a09-90ef-93837e1a5071'; -- asefuddin10@gmail.com (@xcel)
