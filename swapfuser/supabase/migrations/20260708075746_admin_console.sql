-- ── Admin role flags on profiles ─────────────────────────────────────────
alter table public.profiles
  add column if not exists is_admin boolean not null default false,
  add column if not exists is_super_admin boolean not null default false;

-- ── Role-check helpers ───────────────────────────────────────────────────
create or replace function public.is_admin(uid uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select p.is_admin from public.profiles p where p.id = uid), false);
$$;

create or replace function public.is_super_admin(uid uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select coalesce((select p.is_super_admin from public.profiles p where p.id = uid), false);
$$;

-- ── Trigger: block privilege escalation / protect super-admin rows ──────
create or replace function public.protect_admin_flags()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  -- Direct/service-role connections (SQL Editor, migrations) have no auth.uid()
  -- and are already trusted (RLS doesn't apply to them either); only constrain
  -- changes coming from an authenticated end-user session.
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

drop trigger if exists protect_admin_flags_trigger on public.profiles;
create trigger protect_admin_flags_trigger
  before update on public.profiles
  for each row execute function public.protect_admin_flags();

-- ── Extra profiles policies for admin role management ────────────────────
create policy "profiles: super admins manage roles"
  on public.profiles for update
  using (public.is_super_admin(auth.uid()) and is_super_admin = false)
  with check (public.is_super_admin(auth.uid()) and is_super_admin = false);

create policy "profiles: super admins delete users"
  on public.profiles for delete
  using (public.is_super_admin(auth.uid()) and is_super_admin = false and id <> auth.uid());

-- ── Admins can moderate all posts (not just their own) ───────────────────
create policy "posts: admins can view all"
  on public.posts for select
  using (public.is_admin(auth.uid()));

create policy "posts: admins can update any"
  on public.posts for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "posts: admins can delete any"
  on public.posts for delete
  using (public.is_admin(auth.uid()));

-- ── contact_requests ─────────────────────────────────────────────────────
create table public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  message text not null,
  status text not null default 'new' check (status in ('new', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.contact_requests enable row level security;

create policy "contact_requests: anyone can submit"
  on public.contact_requests for insert
  with check (true);

create policy "contact_requests: admins can view"
  on public.contact_requests for select
  using (public.is_admin(auth.uid()));

create policy "contact_requests: admins can update"
  on public.contact_requests for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

create policy "contact_requests: admins can delete"
  on public.contact_requests for delete
  using (public.is_admin(auth.uid()));

-- ── app_settings (singleton row) ─────────────────────────────────────────
create table public.app_settings (
  id smallint primary key default 1,
  allow_signups boolean not null default true,
  post_approval_required boolean not null default false,
  public_profiles boolean not null default true,
  contact_form_enabled boolean not null default true,
  updated_at timestamptz not null default now(),
  constraint app_settings_singleton check (id = 1)
);

insert into public.app_settings (id) values (1);

alter table public.app_settings enable row level security;

create policy "app_settings: anyone can view"
  on public.app_settings for select
  using (true);

create policy "app_settings: admins can update"
  on public.app_settings for update
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

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
