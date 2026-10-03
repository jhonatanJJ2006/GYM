# Hierro

Bitácora personal de clases, gym y comidas, de octubre 2026 a febrero 2027. Pensada para el celular.

El calendario es una semana con los días arriba y las horas a la izquierda. Los bloques son compactos y no llevan foto. La foto grande de un plato o de un ejercicio aparece solo al abrir el modal. En clases, comidas y entreno las listas son filas cortas; las fotos de esas listas son miniaturas.

El desayuno sigue de 5:30 a 6:00. El jueves el pre-entreno sigue a las 19:00 y el gym a las 19:15–20:30. Los feriados que ya estaban en los datos siguen etiquetados. Las fotos vienen de Wikimedia Commons; el autor y la licencia están en el modal y en CREDITS.md.

El sistema visual (color, tipo, espaciado, radios y componentes) está en [DESIGN.md](DESIGN.md).

## Rutas

- `/` calendario
- `/clases` semana a semana, del 6 oct 2026 al 2 feb 2027
- `/semana` malla tipo del ciclo
- `/entreno` ciclo de cuatro semanas
- `/comidas` plato del día y compra

## Comandos

```bash
npm install
npm run dev
npm run lint
npm run build
```

## Vercel

- Framework: Vite
- Build command: `npm run build`
- Output directory: `dist`
