-- ══════════════════════════════════════════════════════
-- Lyntl — Complete Database Schema
-- Run this in Supabase SQL Editor (single execution)
-- ══════════════════════════════════════════════════════

-- Enable UUID extension
create extension if not exists "pgcrypto";

-- ── PARTNERS (funeral homes) ──────────────────────────
create table public.partners (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null,               -- funeral home legal name
  contact_name        text not null,               -- owner/manager name
  email               text not null unique,
  phone               text,
  slug                text not null unique,         -- url-safe identifier
  city                text,
  state               text,
  stripe_customer_id  text,
  active              boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- ── FAMILIES ─────────────────────────────────────────
create table public.families (
  id                        uuid primary key default gen_random_uuid(),
  partner_id                uuid not null references public.partners(id) on delete cascade,
  token                     text not null unique,   -- 12-char url-safe token → /f/[token]
  -- deceased info
  deceased_name             text not null,
  deceased_dod              date,                   -- date of death
  deceased_state            text,                   -- state of primary residence
  -- family contact
  contact_name              text not null,
  contact_email             text,
  contact_phone             text not null,          -- required for SMS
  -- status
  intake_completed          boolean not null default false,
  tasks_generated           boolean not null default false,
  -- billing
  stripe_payment_intent_id  text,
  amount_charged_cents      int not null default 4900,
  paid_at                   timestamptz,
  -- timestamps
  activated_at              timestamptz not null default now(),
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

-- ── INTAKE RESPONSES ─────────────────────────────────
create table public.intake_responses (
  id          uuid primary key default gen_random_uuid(),
  family_id   uuid not null references public.families(id) on delete cascade,
  section     text not null,       -- deceased | estate | benefits | family | foreign
  key         text not null,       -- question key e.g. "has_property"
  value       jsonb not null,      -- flexible: boolean, string, array, object
  created_at  timestamptz not null default now(),
  unique(family_id, key)
);

-- ── TASKS ────────────────────────────────────────────
create table public.tasks (
  id               uuid primary key default gen_random_uuid(),
  family_id        uuid not null references public.families(id) on delete cascade,
  category         text not null check (category in ('government','property','finance','daily','veteran','business','foreign')),
  title            text not null,
  description      text not null,
  why_it_matters   text,           -- plain-English explanation
  urgency          text not null default 'normal' check (urgency in ('urgent','normal','low')),
  deadline_days    int,            -- days from date_of_death
  deadline_date    date,           -- calculated absolute date
  status           text not null default 'pending' check (status in ('pending','in_progress','done','skipped','not_applicable')),
  sort_order       int not null default 0,
  -- letter template
  letter_subject   text,
  letter_body      text,
  letter_variables jsonb,          -- variables to fill in e.g. {"account_number": ""}
  -- form/link
  gov_form_name    text,           -- e.g. "SSA-8"
  gov_form_url     text,
  -- metadata
  states_relevant  text[],         -- if multi-state task, which states
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ── REMINDERS ────────────────────────────────────────
create table public.reminders (
  id             uuid primary key default gen_random_uuid(),
  family_id      uuid not null references public.families(id) on delete cascade,
  task_id        uuid references public.tasks(id) on delete set null,
  type           text not null check (type in ('sms','email')),
  message        text not null,
  scheduled_for  timestamptz not null,
  sent_at        timestamptz,
  status         text not null default 'pending' check (status in ('pending','sent','failed','cancelled')),
  error_message  text,
  created_at     timestamptz not null default now()
);

-- ── PARTNER AUTH LINK ────────────────────────────────
-- Links Supabase auth user to partner record
create table public.partner_users (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  partner_id  uuid not null references public.partners(id) on delete cascade,
  role        text not null default 'admin' check (role in ('admin','staff')),
  created_at  timestamptz not null default now(),
  unique(user_id, partner_id)
);

-- ══════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ══════════════════════════════════════════════════════

alter table public.partners       enable row level security;
alter table public.families       enable row level security;
alter table public.intake_responses enable row level security;
alter table public.tasks          enable row level security;
alter table public.reminders      enable row level security;
alter table public.partner_users  enable row level security;

-- Partners: only see your own record
create policy "partners_own_record" on public.partners
  for all using (
    id in (
      select partner_id from public.partner_users
      where user_id = auth.uid()
    )
  );

-- Partner users: see own rows
create policy "partner_users_own" on public.partner_users
  for all using (user_id = auth.uid());

-- Families: partners see only their own families
create policy "families_by_partner" on public.families
  for all using (
    partner_id in (
      select partner_id from public.partner_users
      where user_id = auth.uid()
    )
  );

-- Intake responses: accessible via family ownership
create policy "intake_by_family" on public.intake_responses
  for all using (
    family_id in (
      select id from public.families
      where partner_id in (
        select partner_id from public.partner_users
        where user_id = auth.uid()
      )
    )
  );

-- Tasks: same pattern
create policy "tasks_by_family" on public.tasks
  for all using (
    family_id in (
      select id from public.families
      where partner_id in (
        select partner_id from public.partner_users
        where user_id = auth.uid()
      )
    )
  );

-- Reminders: same pattern
create policy "reminders_by_family" on public.reminders
  for all using (
    family_id in (
      select id from public.families
      where partner_id in (
        select partner_id from public.partner_users
        where user_id = auth.uid()
      )
    )
  );

-- ── SERVICE ROLE BYPASS ──────────────────────────────
-- API routes using service role key bypass RLS automatically.
-- Family portal (/f/[token]) uses service role to read by token.

-- ══════════════════════════════════════════════════════
-- INDEXES
-- ══════════════════════════════════════════════════════

create index idx_families_token        on public.families(token);
create index idx_families_partner_id   on public.families(partner_id);
create index idx_tasks_family_id       on public.tasks(family_id);
create index idx_tasks_status          on public.tasks(status);
create index idx_tasks_urgency         on public.tasks(urgency);
create index idx_tasks_deadline        on public.tasks(deadline_date);
create index idx_reminders_scheduled   on public.reminders(scheduled_for) where status = 'pending';
create index idx_intake_family_key     on public.intake_responses(family_id, key);

-- ══════════════════════════════════════════════════════
-- UPDATED_AT TRIGGER
-- ══════════════════════════════════════════════════════

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger partners_updated_at
  before update on public.partners
  for each row execute function public.handle_updated_at();

create trigger families_updated_at
  before update on public.families
  for each row execute function public.handle_updated_at();

create trigger tasks_updated_at
  before update on public.tasks
  for each row execute function public.handle_updated_at();
