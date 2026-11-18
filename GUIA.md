# Guía de instalación, configuración y publicación

Liga de Pádel Los Juncos · Next.js + Supabase + Vercel

## 0. Qué necesitas (todo gratuito para una liga de este tamaño)
| Servicio | Para qué | Coste | Control |
|---|---|---|---|
| Supabase | Base de datos, login de admin, fotos, tiempo real | Gratis | Total: tus datos, exportables, y puedes cambiar de proveedor |
| GitHub | Guardar el código | Gratis | Tuyo |
| Vercel | Publicar la web | Gratis (plan Hobby) | Solo aloja la web. Los resultados no pasan por ellos |
| Dominio propio (opcional) | `ligalosjuncos.es` | ~10 €/año | Tuyo |

Importante: los resultados se escriben en Supabase desde tu panel. Nunca tienes que volver a publicar la web para cambiar datos.

## 1. Programas en tu ordenador
Instala Node.js 22 (o 20 LTS) desde nodejs.org. Comprueba con `node -v`.

## 2. Crear la base de datos
1. Crea una cuenta en supabase.com > **New project** (elige región de la UE, por ejemplo Frankfurt, y guarda la contraseña de la base de datos).
2. **SQL Editor > New query**: pega todo `supabase/schema.sql` y pulsa **Run**. Debe terminar sin errores.
3. Comprueba en **Table Editor** que existen `parejas` (13 filas) y `jugadores` (26 filas).
4. Si ejecutas el script dos veces dará error porque las tablas ya existen. Para empezar de cero: Project Settings > Database > o crea un proyecto nuevo.

## 3. Crear tu cuenta de administrador
1. **Authentication > Users > Add user > Create new user**: tu email y una contraseña larga. Marca **Auto Confirm User**.
2. **Authentication > Sign In / Providers**: desactiva **Allow new users to sign up** y guarda. Así solo existe tu cuenta.
3. Contraseña olvidada: Authentication > Users > tu usuario > Send password recovery, o créala de nuevo.

## 4. Ejecutarlo en tu ordenador
1. Descomprime el proyecto y abre una terminal en la carpeta.
2. Copia `.env.local.example` como `.env.local` y rellena:
   - `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Supabase > Project Settings > API).
3. `npm install` y después `npm run dev`.
4. Abre http://localhost:3000 (web pública) y http://localhost:3000/admin (panel).
5. Pruebas automáticas de la lógica: `npm test`.

## 5. Primer uso del panel
1. `/admin` > inicia sesión.
2. **Ajustes**: nombre de la liga, temporada, puntos (3/0/1 por defecto) y criterios de desempate.
3. **Jornadas y partidos > Generar calendario todos contra todos** (con 13 parejas salen 13 jornadas de 6 partidos; en cada una descansa una pareja). Confirma una sola vez; solo aparece si aún no hay jornadas.
4. Abre cada partido para poner fecha y hora.

## 6. Fotografías
Especificaciones en `docs/FOTOS.md`: 800×1000 px, 4:5, WebP/JPG, 72 ppp, máx. 200 KB, fondo liso, luz suave.
- **Subir o cambiar**: panel > Parejas y jugadores > abre la pareja > **Subir foto / Cambiar foto**.
- Cada foto nueva tiene nombre distinto, así los móviles no muestran la antigua por la caché.
- Guarda los originales en tu ordenador.

## 7. Añadir o modificar jugadores y parejas
Panel > **Parejas y jugadores**:
- **Nueva pareja**: escribe el nombre > Crear pareja > ábrela > "Añadir jugador a esta pareja".
- **Editar jugador**: edad, altura, mano, posición, pareja y foto > Guardar jugador.
- **Sustituir a un jugador**: edita el nombre de ese jugador (mantiene el puesto de la pareja) o elimínalo y añade otro.
- **Eliminar pareja**: si ya tiene partidos no se podrá borrar; usa **Desactivar** (deja de salir en la clasificación, pero se conserva el historial).

## 8. Introducir resultados
Panel > **Jornadas y partidos** > elige la jornada > abre el partido > escribe los juegos de cada set (A – B) > **Guardar partido**.
- Al guardar, el partido pasa a "jugado" y la clasificación, las fichas y todas las pantallas abiertas se actualizan solas.
- Reglas: mejor de 3 sets; el tercero solo si van 1-1; sin empates en un set.
- **Corregir un resultado**: abre el mismo partido, cambia los sets y guarda.
- **Aplazar**: cambia el estado a Aplazado y/o la fecha. Un aplazado no puede tener resultado.
- **Jornada desactivada**: sus partidos no cuentan para la clasificación.

## 9. Copias de seguridad
- Panel > **Copia de seguridad** > descarga el JSON (todo) y el CSV (clasificación). Hazlo al terminar cada jornada.
- Supabase también hace copias automáticas diarias en los planes de pago; en el gratuito dependes de tus descargas.
- Restaurar: Supabase > SQL Editor ejecutando de nuevo `schema.sql` en un proyecto limpio y recargando las tablas desde tu JSON (Table Editor > Insert > Import data from CSV/JSON), en este orden: ajustes, parejas, jugadores, jornadas, partidos, sets. Si te ves en ese caso, pídeme ayuda y preparamos el script.

## 10. Publicar por primera vez (Vercel)
1. Crea una cuenta en github.com y un repositorio **privado** nuevo.
2. Sube el proyecto (GitHub Desktop, o en la terminal: `git init`, `git add .`, `git commit -m "liga"`, y los comandos que te muestra GitHub para enlazar y hacer `git push`). `.env.local` NO se sube (está en `.gitignore`).
3. En vercel.com entra con GitHub > **Add New > Project** > importa el repositorio.
4. En **Environment Variables** añade las dos variables de `.env.local` (mismos nombres y valores).
5. **Deploy**. En un par de minutos tendrás una dirección `https://tu-proyecto.vercel.app`.
6. Comparte esa dirección con los jugadores. Tu panel es la misma dirección + `/admin`.
7. Dominio propio: Vercel > Settings > Domains > añade el dominio y sigue las instrucciones de DNS.
8. Solo hay que volver a publicar si cambias el código. Para cambiar datos, nunca.

## 11. Avisos importantes
- **Proyecto en pausa**: los proyectos gratuitos de Supabase se pausan tras una semana sin actividad. Los datos no se pierden; se reactiva con un botón en el panel de Supabase. Con la liga en marcha no ocurrirá, pero revísalo en periodos de parón.
- Límites gratuitos aproximados (consúltalos, pueden cambiar): 500 MB de base de datos y 1 GB de fotos, más que suficientes para esta liga.
- Seguridad: la clave "anon" es pública por diseño. Lo que protege los datos son las reglas de `schema.sql` (cualquiera lee, solo tu cuenta escribe). No compartas nunca la clave "service_role".
- Si cambias el nombre de una pareja se actualiza en todas partes: los partidos guardan la referencia, no el texto.

## 12. Ampliaciones futuras ya previstas por la estructura
Calendario por fechas, estadísticas individuales, gráficas de evolución (se pueden calcular desde `partidos` y `sets`), temporadas (añadiendo una tabla `temporadas` y una columna en `jornadas`), noticias y notificaciones (nuevas tablas y la misma conexión en tiempo real).
