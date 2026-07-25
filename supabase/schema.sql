create extension if not exists pgcrypto;

create table if not exists public.device_registry(
  user_id uuid not null references auth.users(id) on delete cascade,
  device_id text not null,
  device_name text,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  primary key(user_id,device_id)
);

create table if not exists public.family_profiles(
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key(user_id,profile_id)
);

create table if not exists public.learning_events(
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id text not null,
  profile_id text not null,
  language text not null check(language in ('en','de')),
  event_type text not null,
  occurred_at timestamptz not null,
  updated_at timestamptz not null default now(),
  device_id text,
  payload jsonb not null,
  primary key(user_id,event_id)
);

create table if not exists public.learning_snapshots(
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null,
  language text not null check(language in ('en','de')),
  schema_version integer not null,
  app_version text not null,
  payload jsonb not null,
  updated_at timestamptz not null default now(),
  primary key(user_id,profile_id,language)
);

create index if not exists learning_events_user_time_idx on public.learning_events(user_id,occurred_at);
create index if not exists learning_events_profile_lang_idx on public.learning_events(user_id,profile_id,language);

alter table public.device_registry enable row level security;
alter table public.family_profiles enable row level security;
alter table public.learning_events enable row level security;
alter table public.learning_snapshots enable row level security;

drop policy if exists "own devices" on public.device_registry;
create policy "own devices" on public.device_registry for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "own profiles" on public.family_profiles;
create policy "own profiles" on public.family_profiles for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "own events" on public.learning_events;
create policy "own events" on public.learning_events for all using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "own snapshots" on public.learning_snapshots;
create policy "own snapshots" on public.learning_snapshots for all using(auth.uid()=user_id) with check(auth.uid()=user_id);

create or replace function public.limit_two_devices() returns trigger
language plpgsql security definer set search_path=public as $$
begin
  if not exists(select 1 from public.device_registry where user_id=new.user_id and device_id=new.device_id)
     and (select count(*) from public.device_registry where user_id=new.user_id)>=2 then
    raise exception 'Only two devices are allowed for this family account';
  end if;
  return new;
end;$$;

drop trigger if exists enforce_two_devices on public.device_registry;
create trigger enforce_two_devices before insert on public.device_registry
for each row execute function public.limit_two_devices();
