# Ping Pong Tracker

PWA para llevar el conteo en vivo de partidos de ping pong al mejor de 3 sets (Bo3), con historial guardado localmente en el dispositivo (IndexedDB).

## Stack

- React + Vite
- Tailwind CSS
- Dexie.js (IndexedDB)
- vite-plugin-pwa
- Capacitor (proyecto nativo Android)

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

Hay dos formas de tener la app en el celular: como PWA instalada desde el navegador, o como APK nativo compilado con Capacitor.

### Opción A — PWA desde el navegador

Requiere que la app esté servida por HTTPS (los service workers no funcionan por HTTP en un celular, `localhost` en tu PC no cuenta).

1. Despliega `dist/` en un hosting estático (Vercel, Netlify, GitHub Pages, etc.).
2. Abre la URL en Chrome desde el celular.
3. Toca el menú (⋮) y selecciona **"Agregar a pantalla de inicio"** / **"Instalar app"** (o usa el banner "📲 Instalar app" que muestra la propia app cuando detecta que se puede instalar).
4. Confirma. Queda instalada como una app normal, con ícono propio y funcionando offline.

### Opción B — APK nativo con Capacitor (sin necesidad de hosting)

El proyecto Android ya está generado en `android/`. Requiere **Android Studio** con el SDK de Android, y un **JDK 17 o 21** (JDK 22+ todavía no es compatible con el Gradle/AGP que usa Capacitor — configúralo en Android Studio en *Build, Execution, Deployment → Build Tools → Gradle → Gradle JDK*, con la opción "Download JDK..." si no tienes uno instalado).

1. Genera el build web y sincronízalo con el proyecto nativo:
   ```bash
   npm run build
   npx cap sync android
   ```
2. Abre el proyecto en Android Studio:
   ```bash
   npx cap open android
   ```
3. Espera a que sincronice Gradle. Compila el APK con **Build → Build Bundle(s) / APK(s) → Build APK(s)**, o conecta el celular por USB (con "Depuración USB" activada) y dale al botón ▶ para instalarlo y abrirlo directo.
4. Si compilaste el APK sin conectar el celular, el archivo queda en `android/app/build/outputs/apk/debug/app-debug.apk` — pásalo al teléfono (cable, Drive, etc.), ábrelo desde el explorador de archivos y permite "instalar apps desconocidas" cuando lo pida.

Nota: si el proyecto vive en una carpeta con tildes/ñ u otro caracter no-ASCII en la ruta (como pasa aquí con "AplicaciónPingPong"), `android/gradle.properties` ya tiene `android.overridePathCheck=true` para evitar que Gradle falle por eso.
