# GYM Hierro para Android

App nativa en Kotlin con Jetpack Compose, Material 3 y Navigation Compose. Replica la web (`src/`) con el diseño Hierro Dark de `DESIGN.md`: fuentes Syne y Manrope, cabecera, barra inferior en el celular, barra lateral en tablet y chips de color por pagina.

## Estructura

```
android/
  app/src/main/java/com/hierro/
    data/        Modelos, fechas, horas, progreso, PlanRepository (plan fijo) y UserRepository (DataStore)
    coach/       CoachClips.kt (port de src/lib/coachClips.ts) y Coach3D.kt (SceneView + respaldo 2D)
    navigation/  Routes.kt con todas las rutas
    notify/      Avisos locales con WorkManager
    ui/          Tema, componentes, pantallas, AppViewModel y HierroApp (NavHost)
  app/src/main/assets/
    data/hierro.json   Exportado desde la web con scripts/export-android-data.ts
    models/            coach.glb y gear/*.glb (los mismos de public/models)
    photos/            Fotos locales de comidas y ejercicios (creditos en Perfil)
  app/src/test/        Pruebas unitarias, de navegacion y capturas Roborazzi
  ci/android.yml       Workflow de CI (copiarlo a .github/workflows/)
```

Los datos del plan no se reescriben a mano: si cambian en la web, regenerarlos con

```
npx vite-node scripts/export-android-data.ts
```

## Pantallas y rutas

| Pantalla | Ruta Android | Equivalente web |
| --- | --- | --- |
| Calendario | `calendario` | `/` |
| Clases | `clases` | `/clases` |
| Semana | `semana` | `/semana` |
| Entreno | `entreno` | `/entreno` |
| Comidas (registro y lista de compra) | `comidas` | `/comidas` |
| Detalle del dia | `dia/{iso}` | modal de dia |
| Detalle de clase | `clase/{iso}/{key}` | modal de clase |
| Bloque de trabajo | `trabajo/{iso}/{start}` | modal de trabajo |
| Sesion de gym del dia | `gym/{iso}` | modal de gym |
| Sesion del plan | `sesion/{id}` | modal de sesion |
| Comida y receta | `comida/{dow}/{index}` | modal de comida |
| Ejercicio con coach 3D | `ejercicio/{sessionId}/{index}` | modal de ejercicio |
| Entreno guiado | `guiado/{iso}` | entreno guiado |
| Nuevo evento propio | `evento/{iso}` | formulario de evento |
| Avisos | `avisos` | panel de avisos |
| Perfil, avance semanal y creditos | `perfil` | perfil |

## Datos del usuario

`DataStoreUserRepository` guarda perfil, comidas registradas, entrenos marcados, eventos propios, lista de compra y avisos con las mismas claves y el mismo formato JSON que el `localStorage` de la web. Las pruebas usan `InMemoryUserRepository`.

## Coach 3D

`Coach3D` carga `models/coach.glb` y el GLB de equipo que indica `CoachClips` con SceneView. Las dos animaciones se avanzan con el mismo reloj, asi coach y equipo quedan sincronizados; la camara usa los mismos presets de la web. Si el equipo no trae el clip (colchoneta, paseo del granjero) queda quieto, igual que en la web. Si el equipo no tiene OpenGL ES 3 o falla la carga, se muestra un icono 2D.

## Entreno guiado y avisos

El entreno guiado cuenta series, lleva el descanso con temporizador, vibra y suena al terminar y mantiene la pantalla encendida. Los avisos se programan con WorkManager y piden el permiso de notificaciones en Android 13 o superior.

## Compilar y probar

Requiere JDK 17 y el Android SDK 35.

```
cd android
./gradlew assembleDebug testDebugUnitTest lintDebug
./gradlew assembleDebug -Phierro.abi=arm64-v8a -Phierro.minify=true   # APK liviano para arm64
./gradlew recordRoborazziDebug -Phierro.shots=../shots                  # capturas de todas las pantallas
./gradlew installDebug                                                  # instalar en un equipo conectado
```
