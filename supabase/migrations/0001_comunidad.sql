-- Comunidad: grupos de chat por semana/postparto + foro
-- Correr una sola vez en Supabase (Dashboard → SQL Editor → New query → pegar → Run)

-- ============================================================
-- 1. Identidad pública para la comunidad (separada de `profiles`,
--    que tiene datos privados como semana/médico/hospital)
-- ============================================================
create table if not exists comunidad_perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_publico text not null default 'Mamá',
  created_at timestamptz not null default now()
);

alter table comunidad_perfiles enable row level security;

drop policy if exists "cualquier usuario autenticado puede ver nombres públicos" on comunidad_perfiles;
create policy "cualquier usuario autenticado puede ver nombres públicos"
  on comunidad_perfiles for select
  to authenticated
  using (true);

drop policy if exists "cada usuario gestiona su propio nombre público" on comunidad_perfiles;
create policy "cada usuario gestiona su propio nombre público"
  on comunidad_perfiles for insert
  to authenticated
  with check (id = auth.uid());

drop policy if exists "cada usuario edita su propio nombre público" on comunidad_perfiles;
create policy "cada usuario edita su propio nombre público"
  on comunidad_perfiles for update
  to authenticated
  using (id = auth.uid());

-- ============================================================
-- 2. Catálogo de grupos (solo lectura para usuarios)
-- ============================================================
create table if not exists comunidad_grupos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  tipo text not null check (tipo in ('embarazo', 'postparto')),
  semana_min int,
  semana_max int,
  orden int not null default 0,
  unique (tipo, semana_min, semana_max)
);

alter table comunidad_grupos enable row level security;

drop policy if exists "cualquier usuario autenticado puede ver los grupos" on comunidad_grupos;
create policy "cualquier usuario autenticado puede ver los grupos"
  on comunidad_grupos for select
  to authenticated
  using (true);

insert into comunidad_grupos (nombre, tipo, semana_min, semana_max, orden) values
  ('Semana 1-4', 'embarazo', 1, 4, 1),
  ('Semana 5-8', 'embarazo', 5, 8, 2),
  ('Semana 9-12', 'embarazo', 9, 12, 3),
  ('Semana 13-16', 'embarazo', 13, 16, 4),
  ('Semana 17-20', 'embarazo', 17, 20, 5),
  ('Semana 21-24', 'embarazo', 21, 24, 6),
  ('Semana 25-28', 'embarazo', 25, 28, 7),
  ('Semana 29-32', 'embarazo', 29, 32, 8),
  ('Semana 33-36', 'embarazo', 33, 36, 9),
  ('Semana 37-40', 'embarazo', 37, 40, 10),
  ('Postparto · semana 1-4', 'postparto', 1, 4, 11),
  ('Postparto · semana 5-8', 'postparto', 5, 8, 12),
  ('Postparto · semana 9-12', 'postparto', 9, 12, 13),
  ('Postparto · +3 meses', 'postparto', 13, null, 14)
on conflict (tipo, semana_min, semana_max) do nothing;

-- ============================================================
-- 3. Membresía de grupos (con alias para modo anónimo)
-- ============================================================
create table if not exists comunidad_grupo_miembros (
  grupo_id uuid not null references comunidad_grupos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  alias text not null,
  joined_at timestamptz not null default now(),
  primary key (grupo_id, user_id)
);

alter table comunidad_grupo_miembros enable row level security;

-- función auxiliar (security definer) para evitar recursión en las policies
create or replace function es_miembro_grupo(p_grupo_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from comunidad_grupo_miembros
    where grupo_id = p_grupo_id and user_id = auth.uid()
  );
$$;

drop policy if exists "ver miembros del propio grupo" on comunidad_grupo_miembros;
create policy "ver miembros del propio grupo"
  on comunidad_grupo_miembros for select
  to authenticated
  using (es_miembro_grupo(grupo_id));

drop policy if exists "unirse a un grupo uno mismo" on comunidad_grupo_miembros;
create policy "unirse a un grupo uno mismo"
  on comunidad_grupo_miembros for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "salir de un grupo uno mismo" on comunidad_grupo_miembros;
create policy "salir de un grupo uno mismo"
  on comunidad_grupo_miembros for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- 4. Mensajes de chat (Realtime activado abajo)
-- ============================================================
create table if not exists comunidad_mensajes (
  id uuid primary key default gen_random_uuid(),
  grupo_id uuid not null references comunidad_grupos(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null,
  es_anonimo boolean not null default false,
  created_at timestamptz not null default now()
);

alter table comunidad_mensajes enable row level security;

drop policy if exists "ver mensajes del propio grupo" on comunidad_mensajes;
create policy "ver mensajes del propio grupo"
  on comunidad_mensajes for select
  to authenticated
  using (es_miembro_grupo(grupo_id));

drop policy if exists "enviar mensajes al propio grupo" on comunidad_mensajes;
create policy "enviar mensajes al propio grupo"
  on comunidad_mensajes for insert
  to authenticated
  with check (es_miembro_grupo(grupo_id) and user_id = auth.uid());

drop policy if exists "borrar mensajes propios" on comunidad_mensajes;
create policy "borrar mensajes propios"
  on comunidad_mensajes for delete
  to authenticated
  using (user_id = auth.uid());

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and tablename = 'comunidad_mensajes'
  ) then
    alter publication supabase_realtime add table comunidad_mensajes;
  end if;
end $$;

-- ============================================================
-- 5. Foro: posts, comentarios, likes
-- ============================================================
create table if not exists comunidad_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  titulo text,
  contenido text not null,
  categoria text not null default 'general' check (categoria in ('general', 'alguien_mas', 'logros', 'preguntas')),
  es_anonimo boolean not null default false,
  created_at timestamptz not null default now()
);

alter table comunidad_posts enable row level security;

drop policy if exists "cualquier usuario autenticado ve los posts" on comunidad_posts;
create policy "cualquier usuario autenticado ve los posts"
  on comunidad_posts for select
  to authenticated
  using (true);

drop policy if exists "crear posts propios" on comunidad_posts;
create policy "crear posts propios"
  on comunidad_posts for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "editar posts propios" on comunidad_posts;
create policy "editar posts propios"
  on comunidad_posts for update
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "borrar posts propios" on comunidad_posts;
create policy "borrar posts propios"
  on comunidad_posts for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists comunidad_post_comentarios (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references comunidad_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  contenido text not null,
  es_anonimo boolean not null default false,
  created_at timestamptz not null default now()
);

alter table comunidad_post_comentarios enable row level security;

drop policy if exists "cualquier usuario autenticado ve los comentarios" on comunidad_post_comentarios;
create policy "cualquier usuario autenticado ve los comentarios"
  on comunidad_post_comentarios for select
  to authenticated
  using (true);

drop policy if exists "comentar con usuario propio" on comunidad_post_comentarios;
create policy "comentar con usuario propio"
  on comunidad_post_comentarios for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "borrar comentarios propios" on comunidad_post_comentarios;
create policy "borrar comentarios propios"
  on comunidad_post_comentarios for delete
  to authenticated
  using (user_id = auth.uid());

create table if not exists comunidad_post_likes (
  post_id uuid not null references comunidad_posts(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table comunidad_post_likes enable row level security;

drop policy if exists "cualquier usuario autenticado ve los likes" on comunidad_post_likes;
create policy "cualquier usuario autenticado ve los likes"
  on comunidad_post_likes for select
  to authenticated
  using (true);

drop policy if exists "dar like con usuario propio" on comunidad_post_likes;
create policy "dar like con usuario propio"
  on comunidad_post_likes for insert
  to authenticated
  with check (user_id = auth.uid());

drop policy if exists "sacar el like propio" on comunidad_post_likes;
create policy "sacar el like propio"
  on comunidad_post_likes for delete
  to authenticated
  using (user_id = auth.uid());

-- ============================================================
-- 6. Reportes (moderación manual por ahora)
-- ============================================================
create table if not exists comunidad_reportes (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('mensaje', 'post', 'comentario')),
  referencia_id uuid not null,
  reportado_por uuid not null references auth.users(id) on delete cascade,
  motivo text,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'revisado', 'descartado')),
  created_at timestamptz not null default now()
);

alter table comunidad_reportes enable row level security;

drop policy if exists "ver los propios reportes" on comunidad_reportes;
create policy "ver los propios reportes"
  on comunidad_reportes for select
  to authenticated
  using (reportado_por = auth.uid());

drop policy if exists "crear un reporte" on comunidad_reportes;
create policy "crear un reporte"
  on comunidad_reportes for insert
  to authenticated
  with check (reportado_por = auth.uid());
