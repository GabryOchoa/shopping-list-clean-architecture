-- Row Level Security (RLS) Policies
-- Safe to re-run: drops existing policies before recreating them.

-- ─────────────────────────────────────────
-- Enable RLS on all tables
-- ─────────────────────────────────────────
alter table public.profiles      enable row level security;
alter table public.profiles      force row level security;

alter table public.lists         enable row level security;
alter table public.lists         force row level security;

alter table public.items         enable row level security;
alter table public.items         force row level security;

alter table public.list_members  enable row level security;
alter table public.list_members  force row level security;

-- ─────────────────────────────────────────
-- SECURITY DEFINER helpers to break recursion
-- These bypass RLS entirely (run as superuser), so they
-- never trigger the policies that cause the cycle.
-- ─────────────────────────────────────────
create or replace function public.is_list_owner(p_list_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.lists
    where id = p_list_id
      and owner_id = p_user_id
  );
$$;

grant execute on function public.is_list_owner(uuid, uuid) to authenticated;

create or replace function public.is_list_member(p_list_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.list_members
    where list_id = p_list_id
      and user_id = p_user_id
  );
$$;

grant execute on function public.is_list_member(uuid, uuid) to authenticated;

create or replace function public.is_list_editor(p_list_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from public.list_members
    where list_id = p_list_id
      and user_id = p_user_id
      and role = 'editor'
  );
$$;

grant execute on function public.is_list_editor(uuid, uuid) to authenticated;

-- ─────────────────────────────────────────
-- PROFILES policies
-- ─────────────────────────────────────────
drop policy if exists "profiles: read own" on public.profiles;
create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: read others for invite" on public.profiles;
create policy "profiles: read others for invite"
  on public.profiles for select
  using (auth.uid() is not null);

drop policy if exists "profiles: update own" on public.profiles;
create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id);

-- ─────────────────────────────────────────
-- LISTS policies
-- ─────────────────────────────────────────
drop policy if exists "lists: read own or shared" on public.lists;
create policy "lists: read own or shared"
  on public.lists for select
  using (
    auth.uid() = owner_id
    or public.is_list_member(lists.id, auth.uid())
  );

drop policy if exists "lists: insert as owner" on public.lists;
create policy "lists: insert as owner"
  on public.lists for insert
  with check (auth.uid() = owner_id);

drop policy if exists "lists: update as owner" on public.lists;
create policy "lists: update as owner"
  on public.lists for update
  using (auth.uid() = owner_id);

drop policy if exists "lists: delete as owner" on public.lists;
create policy "lists: delete as owner"
  on public.lists for delete
  using (auth.uid() = owner_id);

-- ─────────────────────────────────────────
-- ITEMS policies
-- ─────────────────────────────────────────
drop policy if exists "items: read if list accessible" on public.items;
create policy "items: read if list accessible"
  on public.items for select
  using (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
      and (
        lists.owner_id = auth.uid()
        or public.is_list_member(lists.id, auth.uid())
      )
    )
  );

drop policy if exists "items: insert if owner or editor" on public.items;
create policy "items: insert if owner or editor"
  on public.items for insert
  with check (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
      and (
        lists.owner_id = auth.uid()
        or public.is_list_editor(lists.id, auth.uid())
      )
    )
  );

drop policy if exists "items: update if owner or editor" on public.items;
create policy "items: update if owner or editor"
  on public.items for update
  using (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
      and (
        lists.owner_id = auth.uid()
        or public.is_list_editor(lists.id, auth.uid())
      )
    )
  );

drop policy if exists "items: delete if owner or editor" on public.items;
create policy "items: delete if owner or editor"
  on public.items for delete
  using (
    exists (
      select 1 from public.lists
      where lists.id = items.list_id
      and (
        lists.owner_id = auth.uid()
        or public.is_list_editor(lists.id, auth.uid())
      )
    )
  );

-- ─────────────────────────────────────────
-- LIST MEMBERS policies
-- Uses is_list_owner() (SECURITY DEFINER) to avoid recursion.
-- For "is member" check, uses direct user_id = auth.uid() instead of
-- is_list_member() because calling is_list_member() from a list_members
-- policy causes infinite recursion: list_members → is_list_member() → list_members.
-- ─────────────────────────────────────────
drop policy if exists "list_members: read if owner or member" on public.list_members;
create policy "list_members: read if owner or member"
  on public.list_members for select
  using (
    public.is_list_owner(list_members.list_id, auth.uid())
    or list_members.user_id = auth.uid()
  );

drop policy if exists "list_members: insert as list owner" on public.list_members;
create policy "list_members: insert as list owner"
  on public.list_members for insert
  with check (
    public.is_list_owner(list_members.list_id, auth.uid())
  );

drop policy if exists "list_members: update as list owner" on public.list_members;
create policy "list_members: update as list owner"
  on public.list_members for update
  using (
    public.is_list_owner(list_members.list_id, auth.uid())
  );

drop policy if exists "list_members: delete as owner or self" on public.list_members;
create policy "list_members: delete as owner or self"
  on public.list_members for delete
  using (
    auth.uid() = user_id
    or public.is_list_owner(list_members.list_id, auth.uid())
  );
