# Hierro

Bitácora personal de clases, gym y comidas, de octubre 2026 a febrero 2027. Pensada para el celular, en español (Ecuador), en tema oscuro.

Las clases van del lunes 5 de octubre de 2026 al 2 de febrero de 2027; el lunes 5 ya muestra las clases del lunes. Sábado y domingo no hay clases ni trabajo. El gym es lunes, jueves y viernes de 07:00 a 09:00 (mañana), y martes y miércoles de 18:00 a 19:15. El fin de semana el abdomen es de 10:00 a 11:00.

El gym de la mañana choca con dos clases que se mantienen en la malla, con un aviso "Choca con ..." en esos días: el jueves la tutoría virtual de Ética y Moral (07:00–07:59) y el viernes la práctica de Practicum 2.1 (07:00–08:59).

Lunes, jueves y viernes: pre-entreno ligero en casa de 6:15 a 6:30 y post-entreno "para llevar" de 9:00 a 9:20, antes de las clases de las 10:00. El post se prepara la noche anterior y va en tupper o lonchera con ice pack (o termo): wrap de pollo con arroz el lunes, arroz con pollo y fréjol el jueves, sanduche de atún con huevo, plátano y leche el viernes. Martes y miércoles mantienen desayuno a las 5:30 y pre/post-entreno de la tarde.

El ciclo de entreno dura 4 semanas y arranca el lunes 5 de octubre de 2026: lunes pecho y tríceps, martes cuádriceps y gemelos, miércoles espalda y bíceps, jueves hombro con tríceps (semanas 1 y 3) o bíceps (semanas 2 y 4), viernes isquiotibiales, gemelos y glúteo. El primer jueves con clases es el 8 de octubre de 2026.

Entre semana hay 5 a 6 horas de trabajo en huecos que no pisan clases (tampoco las tutorías virtuales), el gym ni las comidas. `npx tsx scripts/verify.ts` (o `node scripts/verify.ts` en Node 23+) comprueba que ningún bloque de trabajo pisa clases, gym o comidas y que el 5 de octubre de 2026 tiene clases. Las comidas apuntan a unas 2800 kcal y 135 g de proteína para 1,72 m y 68 kg. Es una estimación, no un consejo médico. Cada comida trae ingredientes y pasos.

Calendario, semana, entreno, clases y comidas cambian entre día, semana y mes. El control de fecha salta a cualquier día del rango, aunque no esté en la semana que se está viendo.

## Comandos

```bash
npm install
npm run dev
npm run build
npm run lint
npm run verify
```

`npm run dev` abre Vite en local. `npm run build` ejecuta `tsc -b && vite build` y deja el sitio en `dist`.

## Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`

No hace falta un comando de despliegue distinto. Este repositorio no se publica desde aquí.
