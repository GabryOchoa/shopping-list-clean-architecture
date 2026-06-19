-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────
-- PROFILES
-- Mirrors auth.users — created automatically on sign-up
-- ─────────────────────────────────────────
create table public.profiles (
  id            uuid primary key references auth.users (id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  created_at    timestamptz not null default now()
);

-- Auto-create a profile when a user signs up via Google OAuth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ─────────────────────────────────────────
-- LISTS
-- ─────────────────────────────────────────
create table public.lists (
  id           uuid primary key default uuid_generate_v4(),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  name         text not null,
  description  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Auto-update updated_at on any change
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_list_updated
  before update on public.lists
  for each row execute procedure public.handle_updated_at();

-- ─────────────────────────────────────────
-- ITEMS
-- ─────────────────────────────────────────
create table public.items (
  id          uuid primary key default uuid_generate_v4(),
  list_id     uuid not null references public.lists (id) on delete cascade,
  name        text not null,
  quantity    int not null default 1,
  is_checked  boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ─────────────────────────────────────────
-- LIST MEMBERS  (sharing)
-- role: 'viewer' can read, 'editor' can edit items
-- ─────────────────────────────────────────
create table public.list_members (
  id         uuid primary key default uuid_generate_v4(),
  list_id    uuid not null references public.lists (id) on delete cascade,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  role       text not null default 'viewer' check (role in ('viewer', 'editor')),
  joined_at  timestamptz not null default now(),
  unique (list_id, user_id)  -- a user can only be a member of a list once
);