# Ping Pong Tracker

PWA para llevar el conteo en vivo de partidos de ping pong al mejor de 3 sets (Bo3), con historial guardado localmente en el dispositivo (IndexedDB).

## Stack

- React + Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- vite-plugin-pwa

## Desarrollo local

```bash
npm install
npm run dev
```

Abre la URL que muestra la terminal (por defecto `http://localhost:5173`).

## Build de producción

```bash
npm run build
npm run preview
```

## Instalar en Android

1. Sirve el build de producción en HTTPS (o `npm run preview` en la misma red y accede desde el celular), o despliega `dist/` en un hosting estático (Vercel, Netlify, GitHub Pages, etc.).
2. Abre la URL en Chrome desde el celular.
3. Toca el menú (⋮) y selecciona **"Agregar a pantalla de inicio"** / **"Instalar app"**.
4. Confirma. La app quedará instalada como una app normal, con ícono propio y funcionando offline.
