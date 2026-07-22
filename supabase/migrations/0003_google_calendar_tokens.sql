-- Tokens OAuth de Google Calendar por usuaria (solo lectura de eventos)
-- Correr una sola vez en Supabase (Dashboard → SQL Editor → New query → pegar → Run)

create table if not exists google_calendar_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  refresh_token text not null,
  access_token text,
  access_token_expires_at timestamptz,
  created_at timestamptz not null default now()
);

-- Solo se accede desde las funciones serverless con la service role key,
-- nunca desde el cliente (anon key) → RLS sin policies bloquea todo acceso público.
alter table google_calendar_tokens enable row level security;
