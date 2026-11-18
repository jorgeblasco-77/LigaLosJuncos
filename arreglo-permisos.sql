-- ========== PERMISOS DE ACCESO A LAS TABLAS (GRANT) ==========
-- Las reglas RLS de arriba filtran filas, pero antes hace falta permiso sobre la tabla.
-- Si falta, la app muestra: "permission denied for table ...".
grant usage on schema public to anon, authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;
