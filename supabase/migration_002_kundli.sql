-- Run this in the Supabase SQL editor (your project -> SQL Editor -> New
-- query) AFTER schema.sql. It adapts the reports table for the personalized
-- palm + birth-details reading, and adds a table for the post-report
-- upsell interest capture ("curious when your Mahadasha begins?").

-- 1. Birth details submitted alongside the palm photo.
alter table reports
  add column if not exists name text,
  add column if not exists dob date,
  add column if not exists birth_time text,
  add column if not exists birth_time_unknown boolean not null default false,
  add column if not exists birth_place text;

-- 2. Reports are now personalized (each one is written for one named
-- visitor), so the same hand shape + seed no longer means "the same
-- reading" for everyone — drop the old shape/seed caching index.
drop index if exists reports_shape_seed_language_key;

-- 3. Leads captured from the "Curious when your Mahadasha begins?" card
-- shown after someone unlocks their full reading.
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  report_id uuid references reports(id) on delete set null,
  name text,
  contact text not null,
  interest text not null default 'mahadasha',
  created_at timestamptz not null default now()
);

create index if not exists leads_created_at_idx on leads (created_at desc);
