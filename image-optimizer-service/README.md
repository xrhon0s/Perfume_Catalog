# Image Optimizer Service

Microservicio reutilizable para recibir imagenes, convertirlas a WebP, reducir peso y guardarlas en almacenamiento local o Supabase Storage.

Esta pieza queda separada del catalogo para poder usarla en otros proyectos sin mezclar logica de frontend, base de datos o administracion.

## Instalacion

```bash
cd image-optimizer-service
npm install
npm run dev
```

Por defecto queda disponible en:

```text
http://localhost:8787
```

## Optimizar una imagen

```bash
curl -X POST "http://localhost:8787/optimize?width=1200&quality=78&storage=local&prefix=perfumes" \
  -F "image=@/ruta/a/perfume.jpg"
```

Respuesta esperada:

```json
{
  "path": "perfumes/archivo.webp",
  "publicUrl": "http://localhost:8787/files/perfumes/archivo.webp",
  "format": "webp",
  "original": {
    "bytes": 2048000,
    "width": 2400,
    "height": 2400,
    "format": "jpeg"
  },
  "optimized": {
    "bytes": 245000,
    "width": 1200,
    "height": 1200
  },
  "savedPercent": 88
}
```

## Seguridad

Puedes proteger el servicio con una API key:

```env
API_KEY=una-clave-larga
```

Y enviarla asi:

```bash
curl -H "x-api-key: una-clave-larga" ...
```

## Supabase Storage

Para guardar directamente en Supabase:

```env
STORAGE_DRIVER=supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_BUCKET=perfume-images
```

Importante: `SUPABASE_SERVICE_ROLE_KEY` nunca debe estar en el frontend. Solo puede vivir en este servicio, en variables de entorno del servidor.

Tambien puedes forzar Supabase por request:

```bash
curl -X POST "http://localhost:8787/optimize?storage=supabase&prefix=perfumes" \
  -F "image=@/ruta/a/perfume.png"
```

## Recomendacion para el catalogo

Para este proyecto, una configuracion costo-efectiva seria:

- WebP como formato unico para catalogo.
- Ancho maximo de 1200 px para imagen principal.
- Calidad entre 75 y 80.
- Una imagen principal por perfume al comienzo.
- Supabase Storage mientras el proyecto esta pequeno.
- CDN/R2 solo si el trafico o el costo de ancho de banda empiezan a importar.
