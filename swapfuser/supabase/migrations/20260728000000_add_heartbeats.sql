-- ── heartbeats (keepalive pings from GitHub Actions) ─────────────────────
create table public.heartbeats (
  id bigint generated always as identity primary key,
  source text not null default 'github-actions',
  created_at timestamptz not null default now()
);

alter table public.heartbeats enable row level security;

create policy "heartbeats: anyone can insert"
  on public.heartbeats for insert
  with check (true);

create policy "heartbeats: admins can view"
  on public.heartbeats for select
  using (public.is_admin(auth.uid()));
