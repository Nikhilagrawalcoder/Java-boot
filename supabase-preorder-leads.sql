-- Run this once in your Supabase project's SQL Editor
-- (the same Supabase project envsync/.env already points at).

create table if not exists public.preorder_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text not null default 'envexa-preorder',
  created_at timestamptz not null default now()
);

-- Lock the table down: the public anon key used on the static landing
-- page may only INSERT. It cannot select, update, or delete — so the
-- key is safe to ship in client-side JS.
alter table public.preorder_leads enable row level security;

create policy "Public can insert preorder leads"
  on public.preorder_leads
  for insert
  to anon
  with check (true);

-- Optional: stop the same address from reserving twice.
create unique index if not exists preorder_leads_email_key
  on public.preorder_leads (lower(email));
