-- Jala MVP schema for Supabase
-- Run this in Supabase SQL Editor.

create extension if not exists pgcrypto;

create table if not exists public.musicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  community text not null,
  city text,
  country text,
  music_category text,
  instrument text not null,
  bio text,
  contact text not null,
  compensation_preference text not null default 'Voluntary service',
  available boolean not null default true,
  performances integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table if exists public.musicians add column if not exists city text;
alter table if exists public.musicians add column if not exists country text;
alter table if exists public.musicians add column if not exists music_category text;
alter table if exists public.musicians add column if not exists bio text;
alter table if exists public.musicians add column if not exists compensation_preference text not null default 'Voluntary service';

create table if not exists public.requests (
  id uuid primary key default gen_random_uuid(),
  committee text not null,
  community text not null,
  date date not null,
  needs text not null,
  notes text,
  status text not null default 'Open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.responses (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.requests(id) on delete cascade,
  musician_id uuid not null references public.musicians(id) on delete cascade,
  message text not null,
  status text not null default 'Submitted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null unique references public.requests(id) on delete cascade,
  musician_id uuid not null references public.musicians(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists musicians_updated_at on public.musicians;
create trigger musicians_updated_at before update on public.musicians
for each row execute function public.set_updated_at();

drop trigger if exists requests_updated_at on public.requests;
create trigger requests_updated_at before update on public.requests
for each row execute function public.set_updated_at();

drop trigger if exists responses_updated_at on public.responses;
create trigger responses_updated_at before update on public.responses
for each row execute function public.set_updated_at();

drop trigger if exists matches_updated_at on public.matches;
create trigger matches_updated_at before update on public.matches
for each row execute function public.set_updated_at();

-- Optional: lock down public access (recommended)
alter table public.musicians enable row level security;
alter table public.requests enable row level security;
alter table public.responses enable row level security;
alter table public.matches enable row level security;

-- Since API uses SERVICE ROLE key, no open public policies required for MVP.
