-- LIGA DE PÁDEL LOS JUNCOS · Esquema de base de datos (Supabase / Postgres)
-- Ejecutar completo en Supabase > SQL Editor > New query > Run

-- ========== TABLAS ==========
create table ajustes (
  id int primary key default 1 check (id = 1),           -- una sola fila
  nombre_liga text not null default 'Liga de Pádel Los Juncos',
  temporada text default '2026/2027',
  info text default '',
  puntos_victoria int not null default 3,
  puntos_derrota int not null default 0,
  puntos_derrota_tres_sets int not null default 1,        -- puntos al perder en 3 sets
  criterios_desempate text[] not null
    default array['dif_sets','dif_juegos','enfrentamiento'] -- orden configurable
);

create table parejas (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  activa boolean not null default true,
  creada_en timestamptz not null default now()
);

create table jugadores (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  edad int check (edad between 5 and 99),
  altura_cm int check (altura_cm between 100 and 230),
  mano text check (mano in ('derecha','izquierda')),
  posicion text check (posicion in ('drive','reves')),
  foto_url text,
  pareja_id uuid references parejas(id) on delete set null
);

create table jornadas (
  id uuid primary key default gen_random_uuid(),
  numero int not null unique,
  nombre text,
  activa boolean not null default true
);

create table partidos (
  id uuid primary key default gen_random_uuid(),
  jornada_id uuid not null references jornadas(id) on delete cascade,
  pareja_a uuid not null references parejas(id),
  pareja_b uuid not null references parejas(id),
  fecha timestamptz,
  estado text not null default 'pendiente'
    check (estado in ('pendiente','jugado','aplazado')),
  check (pareja_a <> pareja_b)
);

create table sets (
  id uuid primary key default gen_random_uuid(),
  partido_id uuid not null references partidos(id) on delete cascade,
  numero int not null check (numero between 1 and 3),
  juegos_a int not null check (juegos_a >= 0),
  juegos_b int not null check (juegos_b >= 0),
  unique (partido_id, numero)
);

create index on partidos (jornada_id);
create index on sets (partido_id);
create index on jugadores (pareja_id);

-- ========== VISTAS (la clasificación se calcula sola) ==========
create view partido_resumen with (security_invoker = true) as
select
  p.id, p.jornada_id, p.pareja_a, p.pareja_b, p.estado, p.fecha,
  coalesce(sum((s.juegos_a > s.juegos_b)::int), 0)::int as sets_a,
  coalesce(sum((s.juegos_b > s.juegos_a)::int), 0)::int as sets_b,
  coalesce(sum(s.juegos_a), 0)::int as juegos_a,
  coalesce(sum(s.juegos_b), 0)::int as juegos_b,
  count(s.id)::int as n_sets
from partidos p
left join sets s on s.partido_id = p.id
group by p.id;

create view clasificacion with (security_invoker = true) as
with lados as (
  select r.pareja_a as pareja_id, r.sets_a as sf, r.sets_b as sc,
         r.juegos_a as jf, r.juegos_b as jc, r.n_sets
  from partido_resumen r join jornadas j on j.id = r.jornada_id
  where r.estado = 'jugado' and j.activa
  union all
  select r.pareja_b, r.sets_b, r.sets_a, r.juegos_b, r.juegos_a, r.n_sets
  from partido_resumen r join jornadas j on j.id = r.jornada_id
  where r.estado = 'jugado' and j.activa
)
select
  pa.id as pareja_id,
  pa.nombre,
  count(l.pareja_id)::int as pj,
  (count(*) filter (where l.sf > l.sc))::int as pg,
  (count(*) filter (where l.sf < l.sc))::int as pp,
  coalesce(sum(case
    when l.sf > l.sc then a.puntos_victoria
    when l.n_sets >= 3 then a.puntos_derrota_tres_sets
    else a.puntos_derrota end), 0)::int as puntos,
  coalesce(sum(l.sf), 0)::int as sets_favor,
  coalesce(sum(l.sc), 0)::int as sets_contra,
  coalesce(sum(l.jf), 0)::int as juegos_favor,
  coalesce(sum(l.jc), 0)::int as juegos_contra,
  (coalesce(sum(l.sf), 0) - coalesce(sum(l.sc), 0))::int as dif_sets,
  (coalesce(sum(l.jf), 0) - coalesce(sum(l.jc), 0))::int as dif_juegos
from parejas pa
cross join ajustes a
left join lados l on l.pareja_id = pa.id
where pa.activa
group by pa.id, pa.nombre,
         a.puntos_victoria, a.puntos_derrota, a.puntos_derrota_tres_sets;
-- El orden final (puntos + criterios de ajustes.criterios_desempate,
-- incluido el enfrentamiento directo) lo aplica la app.

-- ========== SEGURIDAD (RLS) ==========
-- Público: solo lectura. Escritura: solo usuario autenticado (tú).
alter table ajustes   enable row level security;
alter table parejas   enable row level security;
alter table jugadores enable row level security;
alter table jornadas  enable row level security;
alter table partidos  enable row level security;
alter table sets      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['ajustes','parejas','jugadores','jornadas','partidos','sets'] loop
    execute format('create policy "lectura publica" on %I for select to anon, authenticated using (true)', t);
    execute format('create policy "admin escribe" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ========== FOTOS (Storage) ==========
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos lectura publica" on storage.objects
  for select using (bucket_id = 'fotos');
create policy "fotos admin escribe" on storage.objects
  for all to authenticated
  using (bucket_id = 'fotos') with check (bucket_id = 'fotos');

-- ========== TIEMPO REAL ==========
alter publication supabase_realtime add table ajustes, parejas, jugadores, jornadas, partidos, sets;

-- ========== DATOS INICIALES REALES ==========
insert into ajustes (id) values (1);

with datos(pareja, j1, j2) as (values
  ('Isa / Ana','Isa','Ana'),
  ('Fran / Fran','Fran','Fran'),
  ('Toni / Raul','Toni','Raul'),
  ('Manolo Lama / Pablo Campos','Manolo Lama','Pablo Campos'),
  ('Sara / Josemari','Sara','Josemari'),
  ('Jorge / Juan','Jorge','Juan'),
  ('Germán / Pablo Parrado','Germán','Pablo Parrado'),
  ('Oscar / Manu','Oscar','Manu'),
  ('Manolo / Manuel','Manolo','Manuel'),
  ('Ruben / David','Ruben','David'),
  ('Javi / Javi','Javi','Javi'),
  ('Juanka / Kino','Juanka','Kino'),
  ('Dani / Pedro Pablo','Dani','Pedro Pablo')
),
p as (
  insert into parejas (nombre) select pareja from datos returning id, nombre
)
insert into jugadores (nombre, pareja_id)
select unnest(array[d.j1, d.j2]), p.id
from datos d join p on p.nombre = d.pareja;
