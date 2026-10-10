# Coach 3D: modelos, clips y equipo

## Qué hay

- `public/models/coach.glb` (1,9 MB): el coach con su esqueleto de 57 huesos (con dedos) y 26 clips. Cada clip dura 90 cuadros a 30 fps (3 s, una repetición) y cierra en bucle.
- `public/models/gear/*.glb` (2 a 86 KB cada uno): el equipo de cada ejercicio. Cada archivo trae clips con el mismo nombre que el clip del coach que lo usa (la barra que sube y baja, el carro de la prensa, la pila de pesas, el cable, la cinta de la caminadora, la biela y los pedales).
- El coach y el equipo comparten el mismo origen, en metros (el coach mide 1,75 m). `src/lib/coachStage.ts` carga los dos y reproduce el clip del coach y el del equipo con el mismo tiempo, así las manos quedan cerradas sobre el agarre y los pies sobre la plataforma o los pedales.
- `src/lib/coachClips.ts` asigna un clip a cada ejercicio de la app (`POSE_CLIP`) y el archivo de equipo y la cámara de cada clip (`CLIPS`). Los ejercicios sin clip propio usan el más cercano y están marcados como aproximados.
- Si WebGL no está disponible o el modelo no carga, el lienzo dibuja una mancuerna en 2D en vez de quedar vacío.

## Clips

| Clip | Equipo | Ejercicios de la app |
| --- | --- | --- |
| Idle | ninguno | (reposo) |
| BenchPress | `bench_press` | bench |
| InclinePress | `incline_press` | incline |
| CurlDumbbell | `dumbbells` | curl, incline-curl (aprox.) |
| HammerCurl | `dumbbells` | hammer |
| SquatBarbell | `squat` | squat |
| RomanianDeadlift | `barbell_floor` | rdl |
| BentOverRow | `barbell_floor` | row, cable-row (aprox.), kickback (aprox.) |
| ShoulderPress | `dumbbells` | ohp, overhead (aprox.) |
| LateralRaise | `dumbbells` | lateral, rear (aprox.), band (aprox.), circles (aprox.) |
| Lunge | `dumbbells` | lunge, bulgarian (aprox.) |
| CalfRaise | `dumbbells` | calf, calf-seat (aprox.) |
| FarmerCarry | `dumbbells` | farmer |
| LegPress | `leg_press` | press |
| LegPressHigh | `leg_press` | press-high |
| LatPulldown | `pulldown` | pulldown |
| CablePushdown | `cable_pushdown` | pushdown, dip (aprox.), pallof (aprox.) |
| CableCrossover | `cable_crossover` | fly, face (aprox.) |
| TreadmillJog | `treadmill` | (trote) |
| TreadmillWalk | `treadmill` | walk |
| Bike | `bike` | bike |
| Plank | `mat` | plank, side-plank, plank-tap, climber, side-hip, abwheel (aprox.) |
| Crunch | `mat` | crunch, twist (aprox.) |
| Breathe | `mat` | breathe |
| GluteBridge | `mat` | bridge, thrust, leg-curl (aprox.) |
| LegRaise | `mat` | leg-raise, deadbug (aprox.) |

## Cómo se hicieron

Todo se generó con scripts de Blender 4.2 en modo sin interfaz (`scripts/3d/`):

1. `extract.py` saca del GLB anterior solo al personaje Oliver (camisa roja), lo deja de pie en su pose de enlace, mirando al frente, con los pies en el suelo, y quita 8 huesos de punta de dedo que no tenían peso.
2. `lib.py` resuelve cada cuadro: posición de cadera, columna repartida entre pelvis y pecho, cabeza neutra mirando al frente, brazos y piernas con IK de dos huesos, manos orientadas al agarre, dedos y pulgar cerrados sobre el mango, pies apoyados.
3. `gear.py` arma el equipo con geometría simple y materiales PBR (acero, cromo, goma, tapiz), a escala real y con el origen en el suelo.
4. `clips.py` define cada clip: la trayectoria del equipo y del cuerpo en función de la fase de la repetición, con bajada lenta, pausa corta y subida, respiración y pequeños cambios de peso.
5. `export_all.py` exporta `coach.glb` con todos los clips y un GLB de equipo por tipo. `validate.cjs` pasa gltf-validator (0 errores).

Los scripts usan rutas fijas bajo `/workspace/gym-anim`. Para regenerar: copiar `scripts/3d` a esa carpeta, poner allí `coach_base.blend` (lo crea `extract.py` desde el GLB anterior, que está en el historial de git) y correr `blender -b -P export_all.py`.

No se usó captura de movimiento: las bibliotecas libres que se revisaron no traen ejercicios de gimnasio, así que los movimientos se escribieron a mano en los scripts.

## Videos de revisión

`press_banca.mp4`, `curl_mancuernas.mp4` y `sentadilla.mp4` son las tres vistas previas aprobadas (6 s, 1280x720, Eevee). Son de antes de corregir el pulgar y el hombro.
