-- Códigos de verificación de email para signup (flujo custom con Resend)
-- Correr una sola vez en Supabase (Dashboard → SQL Editor → New query → pegar → Run)

create table if not exists email_verification_codes (
  email text primary key,
  code text not null,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

-- Solo se accede desde las funciones serverless con la service role key,
-- nunca desde el cliente (anon key) → RLS sin policies bloquea todo acceso público.
alter table email_verification_codes enable row level security;
