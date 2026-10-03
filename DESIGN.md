# Sistema visual de Hierro

La interfaz sigue oscura y callada, pero cada tipo de bloque y cada sección tienen un tinte propio. El color es una franja y un lavado, no un repintado. Las fotos grandes siguen solo en el modal. Este documento manda sobre calendarios, filas, miniaturas y modales. Si un cambio nuevo necesita otro color, primero se justifica aquí.

## Principio

- Un bloque del calendario no lleva foto.
- Una fila de lista no lleva foto grande.
- La foto grande vive solo dentro del modal, al tocar el bloque, la comida o el ejercicio.
- No se inventan horarios. Desayuno 5:30–6:00. Gym y trabajo se leen de los datos que ya existen.
- En la grilla de `/` todas las clases comparten el azul acero. En `/clases` cada asignatura tiene su color, siempre el mismo.

## Color

Tokens en `src/index.css` (`@theme`). No uses hex sueltos en las pantallas.

| Token | Valor | Uso |
| --- | --- | --- |
| `--color-ink` | `#0a0a0a` | Fondo de la app |
| `--color-ink-2` | `#111111` | Fondos secundarios |
| `--color-panel` | `#171717` | Filas, tarjetas, paneles |
| `--color-panel-2` | `#222222` | Hover de botones con borde |
| `--color-line` | `#2c2c2c` | Líneas de hora y separadores |
| `--color-cream` | `#f2f2f2` | Texto principal y estado activo |
| `--color-muted` | `#9b9b9b` | Texto secundario |
| `--color-grid` | `#5e5e5e` | Líneas de la grilla del calendario |
| `--color-accent` | `#f2f2f2` | Igual que cream. Selección, no un acento de color |
| `--color-warn` | `#e6e6e6` | Aviso, sin amarillo |
| `--color-block-class` | `#2a4660` | Fondo del bloque de clase, azul acero |
| `--color-rail-class` | `#a9d0f2` | Franja de clase (`bg-rail-class`) |
| `--color-block-work` | `#4a3b28` | Fondo del bloque de trabajo, arena oscura |
| `--color-rail-work` | `#e8c98a` | Franja de trabajo, arena |
| `--color-block-gym` | `#4a3228` | Fondo del bloque de gym, cobre |
| `--color-rail-gym` | `#f0b08a` | Franja de gym, cobre |
| `--color-block-meal` | `#2a4634` | Fondo del bloque de comida, salvia |
| `--color-rail-meal` | `#b7dcb8` | Franja de comida, salvia |
| `--color-mark-cal` | `#b7d4ee` | Marca de `/`, acero |
| `--color-mark-clases` | `#9ec4ee` | Marca de `/clases`, azul |
| `--color-mark-semana` | `#d4c6ee` | Marca de `/semana`, lila |
| `--color-mark-entreno` | `#f0b08a` | Marca de `/entreno`, cobre |
| `--color-mark-comidas` | `#b7dcb8` | Marca de `/comidas`, salvia |
| `--color-work` | `#e8c98a` | Mismo matiz que la franja de trabajo |
| `--color-meal` | `#b7dcb8` | Mismo matiz que la franja de comida |
| `--color-wash` | `#141414` | Columna o día seleccionado (`bg-wash`) |

El texto de los bloques es `--color-cream` sobre esos fondos oscuros. La hora dentro del bloque va en `text-cream/80`, no en un tinte claro. La franja es `box-shadow: inset 3px 0 0` con el token `--color-rail-*`. No uses un fondo pálido con texto claro.

Cada ruta pone `data-page` en `.page-root` (`cal`, `clases`, `semana`, `entreno`, `comidas`). Eso fija `--color-mark` y un lavado superior (`--page-glow`) del mismo matiz. La palabra Hierro y la pestaña activa de la barra usan `var(--color-mark)`. El cromo (paneles, líneas, foco) no se repinta.

El foco visible sigue siendo un anillo de `--color-cream`, también en `.week-block`. No lo cambies por el color de la sección.

## Tipo

- Texto: Figtree (`--font-sans`).
- Títulos: Syne (`--font-display`), peso 600–800.
- Título de página: `text-4xl`, interlineado ajustado.
- Fila: `text-sm` `font-medium`.
- Bloque de calendario: 10px el nombre, 9px la hora si el bloque mide al menos 32px.
- Horas: `tabular-nums`.

No subas el título de una fila a `text-2xl`. Si el dato no cabe, se trunca; no se parte en tres líneas.

## Espaciado

- Página: `px-4` `pt-5`, `sm:px-6`, `pb-32` para la barra inferior.
- Entre filas: `space-y-1` (4px).
- Alto de fila: 44px (`h-11`).
- Hora del calendario: 52px (`HOUR_PX` en `WeekGrid`).
- El día visible va de las 5:00 a las 23:00, para incluir el desayuno de las 5:30 y el cierre del trabajo. La hora se escribe bajo la línea, no encima, para que las 05:00 no queden cortadas. El día elegido lleva el número en un círculo `--color-cream`.

## Radios

| Token | Valor | Uso |
| --- | --- | --- |
| `--radius-block` | `0.35rem` | Bloque del calendario |
| `--radius-row` | `0.5rem` | Fila y miniatura |
| `--radius-modal` | `1.25rem` | Hoja del modal |

No uses `rounded-[1.6rem]` ni `rounded-[1.8rem]` en filas nuevas.

## Componentes

### Calendario — `WeekGrid`

`src/components/system/WeekGrid.tsx`.

Semana tipo Apple Calendar: días en la fila de arriba, horas en la columna izquierda, bloques absolutos según la hora de inicio y fin. En pantallas estrechas la grilla se desplaza en horizontal (`min-w-[760px]`); no se convierte en una lista de tarjetas.

El bloque muestra el nombre corto y, si hay alto, la hora. No importa `MealArt` ni `ExerciseFigure`. Al tocarlo abre el modal que ya existía (`openClass`, `openWork`, `openGym`, `openMeal`).

Los filtros (clases, trabajo, gym, comidas) solo muestran u ocultan bloques. No cambian horarios.

### Fila — `CompactRow`

`src/components/system/CompactRow.tsx`.

Una línea: título que trunca, y a la derecha un meta (hora) si se pasa. En `/clases` el meta es la hora de inicio; tipo, salón y profesor quedan en el modal. En `/comidas` y en entreno el meta es la hora y, a la izquierda, una miniatura.


### Asignaturas en `/clases`

El color no se sortea. Sale del mapa fijo `COURSE_COLOR` en `src/data/courses.ts`, leído con `courseColor(nombre)`. La misma asignatura usa el mismo hex todos los días y todas las semanas.

| Asignatura | Hex | Matiz |
| --- | --- | --- |
| Fundamentos de Ingeniería de Software | `#6ea8fe` | azul |
| Practicum 2.1 | `#2ec4b6` | verde azulado |
| Estadística y Probabilidad | `#f0c14a` | ámbar |
| Sistemas Operativos | `#ff6b4a` | coral |
| Lógica Digital | `#c084fc` | violeta |
| Ética y Moral | `#8fd99a` | verde |
| Ingeniería Web | `#ff8fab` | rosa |
| Introducción a la Inteligencia de Negocios | `#f3a35c` | naranja |

La fila mezcla ese hex al 42% con `--color-panel` y lleva una franja de 3px del color pleno. El nombre va en `--color-cream`, así el texto no se apoya en el tinte claro. No hay `truncate`, `line-clamp` ni `overflow: hidden` sobre el nombre: si no entra en una línea, hace salto y la fila crece. La hora permanece entera a la derecha.

En la grilla de `/`, gym y comida llevan una miniatura de 16px (`size-4`) si ya existe foto en `mealPhoto` o `exercisePhoto`. Clase y trabajo no tienen imagen y no se inventa una. La foto grande sigue solo en el modal.

Ese mapa no se usa en la grilla de `/`. Allí un bloque de clase sigue en `--color-block-class` y `--color-rail-class`.

### Miniatura — `Thumbnail`

`src/components/system/Thumbnail.tsx`.

40×40 (`size-10`), `object-cover`, radio `--radius-row`. `MealThumb` y `ExerciseThumb` leen las mismas fotos de `src/data/photos.ts`. El `alt` va vacío porque el texto de la fila ya nombra el elemento. En `/comidas` la miniatura va en la fila; la foto 4/3 sigue solo en el modal.

`ExerciseThumb` sigue esa medida. En Entreno, y en el modal de la sesión o del ejercicio, el control «Vista de los ejercicios» alterna las fotos actuales y unas figuras de trazo (sin foto de persona). Por defecto quedan las fotos, para no tapar la revisión de las imágenes. La elección se guarda en `localStorage` (`hierro.exercise-view`). Las comidas no entran en el interruptor: `MealThumb` y `MealArt` siguen siendo fotos. Con «reducir movimiento» del sistema, la figura se queda quieta en una pose que todavía se lee como el ejercicio.


### Modal

`ModalShell` en `src/components/Modals.tsx`.

Hoja inferior en el teléfono y diálogo centrado desde `sm`. Fondo `ink`, radio `--radius-modal`, cierre con Escape y trampa de foco. Ahí sí:

- Comida: `MealArt` / `PhotoHero`, aspecto 4/3, crédito de la foto.
- Ejercicio y sesión de gym: `ExerciseFigure` / `PhotoHero`.
- Clase: nombre, y en el modal el horario, la descripción (tipo y modalidad), el aula, el profesor y el NRC. Sin foto. En `/clases` la fila muestra el nombre completo y la hora; si el nombre no cabe, parte líneas y la fila crece.

El resumen del día, si se abre, usa filas cortas. No apila fotos grandes.

### Foto grande — `PhotoHero`

`src/components/PhotoHero.tsx`. Solo dentro de un modal. No la pongas en una lista ni en el calendario.

## Entreno

Una sesión de dos grupos lleva 4 ejercicios de máquina del primero y 4 del segundo, en ese orden, en `src/data/sessions.ts`:

- Empuje: pecho + tríceps
- Pierna: cuádriceps + isquiotibiales
- Jalón: espalda + bíceps
- Jueves, semanas 1 y 3: hombro + tríceps
- Jueves, semanas 2 y 4: hombro + bíceps
- Pierna B: isquiotibiales + glúteo

Abdomen y oblicuos son un solo grupo: cuatro máquinas cada uno, no un 4+4 inventado. Los horarios de la sesión no se tocan al cambiar ejercicios.

## Qué no hacer

- No volver al verde lima. En `/` no pintes cada materia de un color distinto: ahí manda el tipo de bloque. En `/clases` sí, con el mapa fijo de abajo. No dejes clase, trabajo, gym y comida del mismo gris.
- No poner la foto del plato o del ejercicio en la grilla ni en la fila.
- No alargar una fila con descripción, salón o profesor.
- No cambiar el desayuno, el gym del jueves (19:15–20:30) ni los bloques de trabajo calculados.
