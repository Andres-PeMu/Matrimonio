# Astrid & Andrés · Invitaciones de boda

Aplicación Next.js con invitaciones por token, sobre animado, RSVP y administración de invitados, lugares, eventos, fotografías y contenido. PostgreSQL, Auth y Storage pertenecen a Supabase. No necesita Express, Prisma, un VPS ni servicios de pago.

## Estado y puesta en marcha

El código se puede ejecutar sin credenciales: mostrará la pantalla de preparación y el acceso administrativo deshabilitado. **Para operar con datos reales es necesario configurar Supabase, aplicar migraciones y crear el primer administrador.** No hay un modo de administración con datos ficticios ni un bypass de autenticación.

La fecha, lugares y tokens de `supabase/seed.sql` son ejemplos de desarrollo. La fecha de la imagen de referencia ya pasó; el seed usa noviembre de 2027 exclusivamente como ejemplo editable, no como fecha confirmada de la boda.

Requisitos: Node.js 22 LTS y npm. Para Supabase local, Docker y Supabase CLI; como alternativa, un proyecto Supabase Free alojado.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abre `http://localhost:3000` y `http://localhost:3000/admin/login`.

## Arquitectura y estructura

```text
Navegador → Next.js App Router
            ├─ Server Components: datos de invitación y admin
            ├─ Server Actions: Auth, CRUD, configuración, Storage
            └─ POST /api/rsvp → RPC transaccional en PostgreSQL
                                Supabase Auth + RLS + Storage
Mapas: Leaflet en cliente → teselas OpenStreetMap
```

```text
src/app/                  Rutas, layouts, estados de error y carga
src/app/admin/(protected) Protección server-side y secciones de administración
src/actions/              Operaciones administrativas con sesión y RLS
src/components/admin/     Formularios, tablas, galería, navegación
src/components/invitation Sobre, landing, cuenta regresiva y RSVP
src/components/maps/      Leaflet cargado dinámicamente sin SSR
src/lib/supabase/          Clientes separados: navegador, sesión, service role
src/lib/auth/              Verificación de usuario, perfil y boda asignada
src/lib/validations/       Zod compartido y validación de límites
src/types/                Tipos de dominio y respuestas públicas
supabase/migrations/      Esquema, índices, permisos, triggers y RPC
supabase/seed.sql          Datos exclusivamente de desarrollo
tests/                    Validación, navegador y seguridad SQL
```

Stack: Next.js 16.3.6 (versión estable consultada al crear el proyecto), React, TypeScript estricto, Tailwind CSS 4, Supabase JS/SSR, Zod y Leaflet. La fuente Great Vibes se aloja localmente, sin peticiones a Google Fonts. CSS implementa el sobre y transiciones; no se agregó una biblioteca de animación porque no es necesaria. Playwright, tsx y Prettier solo se usan en desarrollo. El lockfile fija las versiones resueltas.

## Variables

| Variable                        | Uso                                                        |
| ------------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | URL del proyecto Supabase                                  |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave pública anon del proyecto                            |
| `SUPABASE_SERVICE_ROLE_KEY`     | Clave privada, solo servidor                               |
| `NEXT_PUBLIC_SITE_URL`          | URL canónica prevista para despliegue                      |
| `WEDDING_SLUG`                  | Boda de la portada pública; predeterminado `astrid-andres` |

Nunca publiques `.env.local`. `admin.ts` importa `server-only` y no forma parte del bundle del navegador. Los enlaces copiados se construyen con el origen actual, por lo que funcionan tanto localmente como con el dominio final. En producción utiliza siempre el dominio definitivo para compartirlos.

## Supabase alojado

1. Crea un proyecto en una organización **Free** y copia sus claves en `.env.local`.
2. En SQL Editor ejecuta, en orden, los archivos de `supabase/migrations/`. Quedan versionados para poder reproducir el esquema.
3. Para desarrollo, ejecuta `supabase/seed.sql`. No uses los invitados y enlaces de prueba en producción.
4. En Authentication configura la URL del sitio; deshabilita el registro público. Este proyecto solo utiliza login con contraseña; no necesita emails o SMS de terceros.
5. Crea el usuario administrador según la sección siguiente y reinicia Next.js.

Alternativa con CLI para migraciones versionadas:

```bash
npx supabase login
npx supabase link --project-ref TU_PROJECT_REF
npx supabase db push
```

`db push` aplica migraciones; el seed se ejecuta separadamente y solo en desarrollo. No uses `db reset --linked` sobre un proyecto con datos reales.

## Supabase local

Con Docker funcionando (el script omite servicios opcionales que esta aplicación no utiliza):

```bash
npm run supabase:start
npx supabase db reset
npx supabase status
```

Ejecuta `npm run setup:local` para escribir `.env.local` y crear el administrador local. Sus credenciales se guardan en `.local-admin.txt` (excluido de Git). El script rechaza sobrescribir una configuración remota existente. Auth, Storage y PostgreSQL funcionarán localmente. Studio estará en `http://127.0.0.1:54323`. `db reset` elimina los datos de la instancia local y reaplica migraciones y seed.

En desarrollo, `next.config.ts` permite las imágenes del bucket local en `127.0.0.1:54321`. El permiso a IPs locales está desactivado en el build de producción. El resto de las imágenes remotas se limita al bucket `wedding-media` de `*.supabase.co`.

Para detener los contenedores sin eliminar los datos, ejecuta `npm run supabase:stop`. Para volver a iniciar, `npm run supabase:start` y `npm run dev`.

## Primer administrador

Crea un usuario en **Authentication → Users → Add user**, con email y contraseña. Obtén su UUID. No guardes contraseñas en tablas propias.

Ejecuta como propietario en SQL Editor, reemplazando el UUID:

```sql
insert into public.profiles(id, role, display_name)
values ('UUID_DEL_USUARIO_AUTH', 'ADMIN', 'Astrid y Andrés');

insert into public.wedding_admins(wedding_id, user_id)
values ('11111111-1111-4111-8111-111111111111', 'UUID_DEL_USUARIO_AUTH');
```

Para administrar todas las bodas puedes asignar `SUPER_ADMIN` desde SQL. Los usuarios no pueden cambiar su rol ni asignarse bodas desde el navegador. Crear bodas y asignaciones queda reservado al operador de base de datos; el panel gestiona las bodas ya asignadas y permite cambiar entre ellas.

Sin seed, crea primero una fila en `weddings` y otra en `wedding_settings`, y usa ese UUID en `wedding_admins`. Empieza con `status = 'DRAFT'`, configura todo y publícala desde el panel.

## Modelo y permisos

- `profiles`: rol y nombre, enlazado con `auth.users`.
- `weddings`: fecha, zona horaria, plazo RSVP y publicación.
- `wedding_admins`: asignación de administradores por boda.
- `guests`: cupo total (incluye al titular), token único de 256 bits, estado y notas privadas.
- `guest_confirmations`: una única confirmación por invitado.
- `attendees`: nombres de cada asistente, reemplazados atómicamente al actualizar.
- `locations`, `wedding_events`: ubicación y horarios; FK compuesta impide vincular lugares de otra boda.
- `wedding_settings`, `wedding_media`: contenido, visibilidad y rutas de Storage.

Todas las tablas tienen RLS. `anon` no puede leer directamente datos, incluidos invitados, confirmaciones, asistentes o perfiles. `authenticated` solo ve su perfil, sus asignaciones y las bodas autorizadas por `can_manage`. No hay políticas que concedan administración únicamente por tener una sesión.

Las consultas públicas usan el cliente privilegiado exclusivamente en el servidor: buscan exactamente un token, comprueban publicación y devuelven una lista explícita de campos públicos. No se envían email, teléfono, notas, perfil, UUID del invitado ni otras invitaciones. Los UUID de eventos y lugares se mantienen para relacionar eventos con sus mapas. Los enlaces son credenciales de acceso: quien recibe o reenvía un enlace puede ver y modificar esa invitación dentro del plazo.

`submit_rsvp` solo puede ejecutarlo `service_role`. Comprueba publicación, visibilidad RSVP, fecha límite, estado, nombres y cupo dentro de la transacción. Bloquea la fila de invitado y la fecha de boda, hace upsert de la confirmación y sustituye asistentes. La UNIQUE constraint en `guest_id` evita duplicados. Se rechaza reducir cupos por debajo de los confirmados. El servidor también valida antes del RPC.

Triggers mantienen `updated_at`. Eliminar un invitado elimina su confirmación y asistentes; eliminar una boda completa o un lugar referenciado se restringe deliberadamente. No hay botón de eliminación de bodas.

## Cómo operar

1. Entra en `/admin/login`.
2. Configura nombres, fecha, zona horaria, plazo RSVP, textos y visibilidad en **Configuración**. La música usa una URL HTTPS opcional, sin reproducción automática.
3. En **Lugares**, escribe dirección y selecciona coordenadas haciendo clic o arrastrando el marcador. Los campos numéricos permiten operar sin ratón.
4. En **Fecha y eventos**, asigna lugares a los eventos. La hora se interpreta en la zona de la boda. Los eventos que cruzan medianoche se dividen en dos; el formulario exige hora final posterior a la inicial.
5. Sube portada y fotografías en **Galería**. Se puede cambiar orden y descripción. Si hay varias portadas, se utiliza la primera según el orden.
6. Crea un invitado/familia con sus cupos totales en **Invitados**. Guarda, copia el enlace y envíalo por el canal que prefieras; la aplicación no envía mensajes automáticamente.
7. Usa buscar, filtrar y paginar para gestionar invitados. Regenerar requiere confirmación y revoca inmediatamente el token anterior.
8. El invitado abre el sobre, ve su nombre/cupos y confirma. Su respuesta reaparece al volver. **Confirmaciones** y **Resumen** consultan datos reales.

Enlace de desarrollo de ejemplo después del seed:

```text
http://localhost:3000/i/dev-familia-pena-00000000000000000000000000000000
```

## Fotografías y mapas

`wedding-media` es un bucket **público**, solo para fotos que se desea compartir públicamente. Las políticas de escritura y borrado exigen una boda autorizada en el prefijo `{wedding_id}/archivo`. No subas documentos privados. No se guardan imágenes Base64 ni archivos en el filesystem de Vercel.

Antes de subir, el navegador reduce la imagen a 1800 px y WebP; admite originales de hasta 20 MB. Servidor y bucket limitan el resultado a 4 MB. Este límite deja margen para multipart dentro del límite de petición de Vercel. El servidor verifica MIME y firma JPG/PNG/WebP. `next/image` optimiza las fotografías y carga la galería de forma diferida. El fondo decorativo está en WebP y sus detalles de generación están en [docs/ASSETS.md](docs/ASSETS.md).

Leaflet usa OpenStreetMap con atribución, zoom máximo 19 y carga bajo demanda en la invitación. No hay geocoding, Google Maps SDK ni claves de mapas. El botón Cómo llegar abre las indicaciones de OpenStreetMap. Las teselas públicas requieren respetar su [política de uso](https://operations.osmfoundation.org/policies/tiles/); no se precargan ni descargan mapas offline. El límite de galería y fotografías debe adecuarse al presupuesto de transferencia del proyecto.

## Pruebas y calidad

```bash
npm run lint
npm run typecheck
npm run test
npm run build
npm run format:check
npx playwright install chromium
npm run test:e2e
```

`test` verifica tokens, creación/validación de invitados, consistencia RSVP, cupos, plazo, fechas de eventos y zonas horarias. `test:e2e` verifica redirección de admin, rechazo de origen externo y adaptación a 320, 375, 390, 430, 768 y 1440 px.

La prueba de recorrido completo `tests/e2e/live.spec.ts` requiere **un Supabase de pruebas desechable**, migrado, configurado en `.env.local`, y `TEST_SUPABASE_ALLOW_MUTATIONS=1`. Crea una boda y un usuario temporales; prueba login, invitado, sobre, RSVP, persistencia, dashboard y revocación, y elimina sus propios datos al terminar. No la actives contra producción. Sin credenciales se omite explícitamente.

Las pruebas de PostgreSQL están en `tests/sql/security.sql`. En una base Supabase local aislada se pueden ejecutar después de migraciones y seed. En PostgreSQL estándar se necesita primero `tests/sql/bootstrap.sql`, que crea roles y contratos mínimos de Auth/Storage **solo para pruebas**. No ejecutar ese bootstrap en Supabase ni en bases existentes. La prueba revierte sus datos con ROLLBACK.

Ejemplo en una instancia PostgreSQL desechable:

```bash
psql "$TEST_DATABASE_URL" -v ON_ERROR_STOP=1 \
  -f tests/sql/bootstrap.sql \
  -f supabase/migrations/202609270001_initial.sql \
  -f supabase/migrations/202609270002_settings_dashboard.sql \
  -f supabase/seed.sql \
  -f tests/sql/security.sql
```

Estas pruebas comprueban RLS, aislamiento entre bodas, escalación de roles, escritura autorizada, RSVP atómico, exceso de cupos, actualización, rechazo, fecha vencida y token revocado. No sustituyen una prueba contra Auth/Storage reales.

## Despliegue GitHub → Vercel → Supabase

1. Crea un repositorio privado o público y sube este proyecto sin `.env.local`.
2. Importa el repositorio en Vercel. Selecciona Next.js y Node 22.
3. Configura las variables anteriores en el entorno correcto. Usa proyectos distintos para pruebas y producción si están disponibles dentro de tu plan.
4. Aplica las migraciones al Supabase de producción. Crea la boda real, su configuración y administrador; evita invitados de seed.
5. Define `WEDDING_SLUG` y la URL definitiva en Vercel y Supabase Auth.
6. Despliega con `npm run build`. Prueba un invitado real de control, una fotografía, un evento con mapa y una confirmación antes de compartir enlaces.

No se ha creado ningún recurso remoto, repositorio GitHub ni despliegue Vercel automáticamente. Esta aplicación no depende de filesystem persistente.

## Costo inicial

La arquitectura usa Supabase Free, Vercel Hobby para la boda personal y mapas abiertos, sin email/SMS de pago ni servicios con billing obligatorio añadidos. El dominio `*.vercel.app` evita comprar un dominio. El costo cero depende de mantenerse dentro de las cuotas y condiciones de los proveedores; no es una garantía de servicio permanente.

Vercel Hobby se limita a uso personal/no comercial según sus [términos](https://vercel.com/legal/terms). Supabase Free puede pausar proyectos con poca actividad durante siete días: consulta su [documentación de pausas](https://supabase.com/docs/guides/platform/free-project-pausing) y revisa el proyecto antes de enviar invitaciones. No se han añadido pings para eludir esa política. Consulta [precios y límites de Supabase](https://supabase.com/pricing) y [Vercel](https://vercel.com/pricing) antes de ampliar tráfico o convertirlo en servicio comercial.

## Referencias de implementación

- [Next.js](https://nextjs.org/docs/app/getting-started/installation)
- [Supabase SSR y cookies](https://supabase.com/docs/guides/auth/server-side)
- [Clientes de Supabase para Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
