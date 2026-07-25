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
```

La `SUPABASE_SERVICE_ROLE_KEY` es privada del hosting. No debe exponerse como variable `VITE_*`.

---

## 🧠 Cómo funciona

1. Los perfumes se cargan desde una base de datos local (`src/data`)
2. Los filtros y búsqueda se manejan con Zustand
3. Los resultados se renderizan en formato flipbook
4. El usuario puede:

   * Navegar páginas
   * Filtrar resultados
   * Buscar perfumes
   * Ver detalles en modal

---

## 📌 Roadmap

* [ ] Conectar API real (backend)
* [ ] Sistema de favoritos ❤️
* [ ] Carrito de compras 🛒
* [ ] Autenticación de usuarios 🔐
* [ ] Recomendaciones inteligentes 🤖

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
