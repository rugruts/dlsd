-- ============================================================================
-- DUMPSACK WALLET - SUPABASE DATABASE SETUP
-- ============================================================================
-- Run this script in your Supabase SQL Editor to set up the database schema,
-- RLS policies, and storage buckets for the DumpSack Wallet application.
-- ============================================================================

-- ============================================================================
-- 1. STORAGE BUCKET: backups/ (Owner-only RLS)
-- ============================================================================

-- Create bucket if needed and make sure it's private
do $$
begin
  if not exists (select 1 from storage.buckets where name = 'backups') then
    perform storage.create_bucket('backups', false); -- public=false
  end if;
end$$;

-- Ensure bucket is private
update storage.buckets set public = false where name = 'backups';

-- Reset policies to a strict owner-only model
drop policy if exists "backups_insert_own" on storage.objects;
drop policy if exists "backups_select_own" on storage.objects;
drop policy if exists "backups_update_own" on storage.objects;
drop policy if exists "backups_delete_own" on storage.objects;

-- Owner-only INSERT: Users can only upload to their own folder (backups/<uid>/...)
create policy "backups_insert_own"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'backups' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Owner-only SELECT: Users can only read from their own folder
create policy "backups_select_own"
on storage.objects for select to authenticated
using (
  bucket_id = 'backups' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Owner-only UPDATE: Users can only update their own files
create policy "backups_update_own"
on storage.objects for update to authenticated
using (
  bucket_id = 'backups' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Owner-only DELETE: Users can only delete their own files
create policy "backups_delete_own"
on storage.objects for delete to authenticated
using (
  bucket_id = 'backups' and
  (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================================================
-- 2. DATABASE TABLES
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: public.aliases
-- Purpose: Store user aliases for wallet addresses
-- ----------------------------------------------------------------------------
create table if not exists public.aliases (
  alias text primary key,
  address text not null,
  owner_uid uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.aliases enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Aliases are publicly readable" on public.aliases;
drop policy if exists "Users can insert their own aliases" on public.aliases;
drop policy if exists "Users can delete their own aliases" on public.aliases;

-- Allow anyone to read aliases (for lookups)
create policy "Aliases are publicly readable"
  on public.aliases for select
  using (true);

-- Only owner can insert their own aliases
create policy "Users can insert their own aliases"
  on public.aliases for insert
  with check (auth.uid() = owner_uid);

-- Only owner can delete their own aliases
create policy "Users can delete their own aliases"
  on public.aliases for delete
  using (auth.uid() = owner_uid);

-- Create index for faster lookups
create index if not exists idx_aliases_owner_uid on public.aliases(owner_uid);
create index if not exists idx_aliases_address on public.aliases(address);

-- ----------------------------------------------------------------------------
-- Table: public.users
-- Purpose: Store user profiles and preferences
-- ----------------------------------------------------------------------------
create table if not exists public.users (
  uid uuid primary key references auth.users(id) on delete cascade,
  alias text,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  preferences jsonb default '{}'::jsonb
);

-- Enable RLS
alter table public.users enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Users can read own profile" on public.users;
drop policy if exists "Users can insert own profile" on public.users;
drop policy if exists "Users can update own profile" on public.users;

-- Users can only read their own profile
create policy "Users can read own profile"
  on public.users for select
  using (auth.uid() = uid);

-- Users can insert their own profile
create policy "Users can insert own profile"
  on public.users for insert
  with check (auth.uid() = uid);

-- Users can update their own profile
create policy "Users can update own profile"
  on public.users for update
  using (auth.uid() = uid);

-- ----------------------------------------------------------------------------
create table if not exists public.throne_links (
  id text primary key,
  owner_user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  payload jsonb not null,
  created_at timestamptz default now(),
  expires_at timestamptz not null,
  used boolean default false
);

-- Enable RLS
alter table public.throne_links enable row level security;

-- Drop existing policies if they exist
drop policy if exists "Throne links are publicly readable" on public.throne_links;
drop policy if exists "Users can create own throne links" on public.throne_links;
drop policy if exists "Users can update own throne links" on public.throne_links;

-- Anyone can read throne links (for claiming)
create policy "Throne links are publicly readable"
  on public.throne_links for select
  using (true);

-- Only owner can create throne links
create policy "Users can create own throne links"
  on public.throne_links for insert
  with check (auth.uid() = owner_user_id);

-- Only owner can update their throne links
create policy "Users can update own throne links"
  on public.throne_links for update
  using (auth.uid() = owner_user_id);

-- Create index for faster lookups
create index if not exists idx_throne_links_owner on public.throne_links(owner_user_id);
create index if not exists idx_throne_links_expires on public.throne_links(expires_at);

-- ============================================================================
-- 3. FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Trigger for users table
drop trigger if exists update_users_updated_at on public.users;
create trigger update_users_updated_at
  before update on public.users
  for each row
  execute function update_updated_at_column();

-- ============================================================================
-- SETUP COMPLETE
-- ============================================================================
-- Next steps:
-- 1. Enable Google OAuth in Supabase Auth settings
-- 2. Configure redirect URLs in Supabase Auth settings:
--    - For mobile: dumpsack://auth/callback
--    - For web: https://dumpsack.xyz/auth/callback
--    - For extension: chrome-extension://YOUR_EXTENSION_ID/callback
-- 3. Copy your Supabase URL and anon key to .env files
-- ============================================================================

