# 🌿 Perfume Catalog

Aplicación web interactiva para explorar perfumes en formato tipo revista digital (flipbook), con filtros dinámicos, búsqueda en tiempo real y visualización de detalles.

---

## 🚀 Demo



---

## 📸 Preview

![Preview](./public/vite.svg)

---

## ✨ Características

* 📖 Navegación tipo revista (flipbook)
* 🔎 Búsqueda en tiempo real
* 🎛️ Filtros por:

  * Marca (perfumería)
  * Familia olfativa
* 📄 Navegación por páginas
* 🧾 Modal con detalle del perfume
* 🛍️ Carrito persistente
* 💬 Pedido directo por WhatsApp o solicitud para revisión
* 📋 Gestión de pedidos desde administración
* 📱 Diseño responsive
* ⚡ Alto rendimiento con Vite

---

## 🛠️ Tecnologías

* **React**
* **TypeScript**
* **Vite**
* **TailwindCSS**
* **Zustand** (estado global)
* **Framer Motion** (animaciones)
* **react-pageflip** (efecto revista)

---

## 📂 Estructura del proyecto

```bash
src/
├── components/   # Componentes UI
├── data/         # Base de datos y helpers
├── pages/        # Páginas principales
├── store/        # Estado global (Zustand)
├── assets/       # Recursos estáticos
```

---

## ⚙️ Instalación

```bash
# Clonar repositorio
git clone https://github.com/tu-usuario/perfume-catalog.git

# Entrar al proyecto
cd perfume-catalog

# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev
```

---

## 🏗️ Build

```bash
npm run build
```

## ✅ Verificación

Antes de integrar cambios ejecuta:

```bash
npm run check
```

El comando corre lint, pruebas automáticas de los flujos críticos, validación
del catálogo y build de producción.

## 💾 Respaldo de Supabase

Para crear un respaldo local de las tablas y las imágenes del catálogo:

```bash
npm run backup:supabase
```

El script usa `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde
`.env.migration.local` o `.env.local`. Guarda cada ejecución en
`backups/FECHA/`, incluyendo un manifiesto, archivos JSON por tabla y las
imágenes de `perfume-images/perfumes`.

Para respaldar solo la base de datos:

```bash
npm run backup:supabase -- --data-only
```

La carpeta `backups` está ignorada por Git porque puede contener información
privada. Conserva al menos una copia fuera del equipo antes de cambios
importantes en producción.

## 🖼️ Imágenes

El admin sube imágenes a una función serverless dentro de este mismo proyecto:

```text
/api/optimize-image
```

La función valida que el usuario sea admin en Supabase, convierte la imagen a WebP con `sharp`, la comprime y la guarda en Supabase Storage.

Variables de entorno necesarias en producción:

```env
VITE_IMAGE_OPTIMIZER_URL=/api/optimize-image
VITE_IMAGE_OPTIMIZER_STORAGE=
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
SUPABASE_BUCKET=perfume-images
MAX_UPLOAD_MB=8
DEFAULT_MAX_WIDTH=1200
DEFAULT_WEBP_QUALITY=78
VITE_WHATSAPP_NUMBER=573001234567
```

La `SUPABASE_SERVICE_ROLE_KEY` es privada del hosting. No debe exponerse como variable `VITE_*`.

---

## 🧠 Cómo funciona

1. Los perfumes se cargan desde Supabase; los datos locales se conservan para
   migración y validación
2. Los filtros y búsqueda se manejan con Zustand
3. Los resultados se renderizan en formato flipbook
4. El usuario puede:

   * Navegar páginas
   * Filtrar resultados
   * Buscar perfumes
   * Ver detalles en modal
   * Preparar un carrito
   * Continuar directamente por WhatsApp
   * Enviar una solicitud para revisión administrativa

---

## 📌 Alcance

El proyecto incluye catálogo público, carrito, solicitudes de pedido y un
panel autenticado para administrar productos e inventario, revisar pedidos y
continuar la venta por WhatsApp. Los pagos en línea y las recomendaciones no
forman parte del alcance actual.

---

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/nueva-feature`)
3. Haz commit (`git commit -m 'Agrega nueva feature'`)
4. Push (`git push origin feature/nueva-feature`)
5. Abre un Pull Request

---

## 📄 Licencia

MIT License

---

## 👤 Autor

* GitHub: [@xrhon0s](https://github.com/xrhon0s)

---

## ⭐ Si te gusta el proyecto

¡Dale una estrella ⭐ en GitHub!
