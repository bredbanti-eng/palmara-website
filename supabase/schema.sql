-- Run this in the Supabase SQL editor (your project -> SQL Editor -> New query)
-- to create the table generate-reading, create-order, verify-payment, and the
-- Razorpay webhook all read and write.

create extension if not exists "pgcrypto";

create table if not exists reports (
  id uuid primary key default gen_random_uuid(),
  hand_shape text not null check (hand_shape in ('earth', 'air', 'fire', 'water')),
  seed integer not null,
  language text not null default 'en',
  report_text text not null,
  paid boolean not null default false,
  created_at timestamptz not null default now()
);

-- One cached reading per (hand shape, seed, language) combination, so the
-- same photo always gets back the same reading instead of generating a new
-- one (and a new Anthropic API call) every time.
create unique index if not exists reports_shape_seed_language_key
  on reports (hand_shape, seed, language);

create index if not exists reports_created_at_idx on reports (created_at desc);
