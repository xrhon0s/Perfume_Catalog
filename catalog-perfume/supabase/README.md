# Supabase setup

## 1. Crear el proyecto

Crea un proyecto en Supabase y copia:

- Project URL -> `VITE_SUPABASE_URL` y `SUPABASE_URL`
- Anon public key -> `VITE_SUPABASE_ANON_KEY`

Las variables `VITE_*` son públicas para el frontend. No pongas la service role key en Vite.

## 2. Aplicar esquema

Ejecuta `supabase/migrations/001_catalog_inventory.sql` en el SQL editor de Supabase o con Supabase CLI.

Este esquema crea:

- `brands`
- `perfumes`
- `perfume_images`
- `inventory_items`
- `stock_movements`
- `admin_users`
- `catalog_perfumes`
- bucket público `perfume-images`
- políticas RLS para lectura pública y escritura de admins

## 3. Generar seed desde el catálogo actual

Opción recomendada si estás trabajando localmente con credenciales:

1. Crea `.env.migration.local` en la raíz del proyecto:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

2. Ejecuta:

```bash
npm run migrate:catalog
```

La `service_role` key es solo para scripts locales/servidor. No la pongas en variables `VITE_*`, ni en el frontend, ni en Vercel como variable pública.

Opción manual desde SQL Editor:

Corre:

```bash
npm run seed:catalog
```

Esto genera `supabase/seed.sql` a partir de los perfumes que tienen registros enriquecidos en `src/data/perfumeDetails.ts`.

Luego ejecuta `supabase/seed.sql` en Supabase después de la migración. El seed carga marcas y perfumes enriquecidos; no carga links de imágenes porque las imágenes se migrarán luego a storage/CDN.

## 4. Crear el primer admin

Crea un usuario en Supabase Auth y luego registra su id:

```sql
insert into public.admin_users (user_id)
values ('AUTH_USER_ID_HERE');
```

Ese usuario podrá administrar marcas, perfumes, imágenes e inventario.
