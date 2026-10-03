import { existsSync } from "node:fs";
import { classesFor } from "../src/data/courses.ts";
import { foodsIn } from "../src/data/plate.ts";
import { exercisePhoto, mealPhoto } from "../src/data/photos.ts";
import { SESSIONS } from "../src/data/sessions.ts";
import { RANGE_END, RANGE_START, addDays, toIso } from "../src/lib/dates.ts";
import { buildDay, overlaps } from "../src/lib/schedule.ts";
import { classInterval, spanInterval } from "../src/lib/time.ts";

const failures: string[] = [];

function check(condition: boolean, message: string) {
  if (!condition) failures.push(message);
}

for (let cursor = RANGE_START; cursor.getTime() <= RANGE_END.getTime(); cursor = addDays(cursor, 1)) {
  const plan = buildDay(cursor);
  const dow = cursor.getDay();
  const iso = toIso(cursor);
  if (dow === 0 || dow === 6) {
    check(plan.workMinutes === 0, `${iso} es fin de semana y tiene ${plan.workMinutes} min de trabajo`);
    check(!plan.items.some((item) => item.kind === "trabajo"), `${iso} muestra un bloque de trabajo`);
    check(plan.classes.length === 0, `${iso} tiene clases en fin de semana`);
  } else {
    check(
      plan.workMinutes >= 300 && plan.workMinutes <= 360,
      `${iso} trabajo ${plan.workMinutes} min, fuera de 5–6 h`,
    );
    const gym = spanInterval(plan.session.time);
    for (const block of plan.work) {
      check(!overlaps(block, gym), `${iso} trabajo ${block.start}-${block.end} pisa el gym`);
      for (const klass of classesFor(cursor)) {
        check(
          !overlaps(block, classInterval(klass.start, klass.end)),
          `${iso} trabajo pisa ${klass.name} ${klass.start}`,
        );
      }
    }
  }
  check(plan.session.time.length > 0, `${iso} sin sesión`);
  check(plan.meals.items.length === 6, `${iso} no tiene 6 comidas`);
  const breakfast = plan.meals.items.find((item) => item.role.startsWith("Desayuno"));
  check(breakfast?.time === "5:30" && breakfast.end === "6:00", `${iso} desayuno ${breakfast?.time}–${breakfast?.end}`);
  for (const meal of plan.meals.items) {
    check(foodsIn(meal.ingredients).length > 0, `${iso} ${meal.role} sin alimentos reconocibles`);
    const plate = mealPhoto(meal.ingredients);
    check(existsSync(`public${plate.src}`), `${iso} ${meal.role} sin foto ${plate.src}`);
    if (!meal.role.startsWith("Desayuno")) {
      check(meal.time !== "5:30", `${iso} ${meal.role} no debería moverse a las 5:30`);
    }
  }
}

for (const session of Object.values(SESSIONS)) {
  for (const exercise of session.exercises) {
    const photo = exercisePhoto(exercise.pose);
    check(existsSync(`public${photo.src}`), `${session.id} ${exercise.name} sin foto ${photo.src}`);
    check(exercise.reps.length > 0, `${exercise.name} sin repeticiones`);
    check(exercise.weight.length > 0, `${exercise.name} sin peso`);
  }
}

const oct8 = buildDay(new Date(2026, 9, 8));
check(oct8.date.getDay() === 4, "8 oct no es jueves");
check(oct8.cycleWeek === 1, `8 oct ciclo ${oct8.cycleWeek}, se esperaba 1`);
check(oct8.session.id === "tri", `8 oct sesión ${oct8.session.id}`);
check(oct8.session.time === "19:15–20:30", `8 oct gym ${oct8.session.time}`);
check(oct8.session.title === "Hombro + tríceps", oct8.session.title);
check(oct8.classes.some((item) => item.name === "Lógica Digital" && item.start === "18:00"), "falta tutoría de Lógica");
check(oct8.meals.items.some((item) => item.time === "19:00" && item.role === "Pre-entreno"), "pre-entreno del jueves");
check(!oct8.meals.items.some((item) => item.time === "17:10"), "el jueves no debe tener comida a las 17:10");
check(oct8.classes.length > 0, "8 oct sin clases");
check(oct8.work.length > 0, "8 oct sin trabajo");

const saturday = buildDay(new Date(2026, 9, 10));
check(saturday.workMinutes === 0, "sábado 10 con trabajo");
check(saturday.session.id === "absA", "sábado sin abdomen");
check(saturday.classes.length === 0, "sábado con clases");

const oct5 = buildDay(new Date(2026, 9, 5));
const oct6 = buildDay(new Date(2026, 9, 6));
const feb2 = buildDay(new Date(2027, 1, 2));
const feb3 = buildDay(new Date(2027, 1, 3));
const feb4 = buildDay(new Date(2027, 1, 4));
check(oct5.classes.length === 0, "5 oct no debería tener clases");
check(oct6.classes.length > 0, "6 oct debería tener clases");
check(feb2.classes.length > 0, "2 feb debería tener clases");
check(feb3.classes.length === 0, "3 feb no debería tener clases");
check(feb4.date.getDay() === 4 && feb4.session.time === "19:15–20:30", "4 feb el ciclo de hombro se cortó");
check(feb4.classes.length === 0, "4 feb todavía tiene clases");

const oct15 = buildDay(new Date(2026, 9, 15));
check(oct15.cycleWeek === 2 && oct15.session.id === "bi", "15 oct debería ser semana 2, hombro + bíceps");

const holiday = buildDay(new Date(2026, 9, 9));
check(Boolean(holiday.holiday), "9 oct sin feriado");
check(
  holiday.banners.some((banner) => banner.includes("confirma con la universidad")),
  "falta el aviso de confirmar el feriado",
);

console.log("--- jueves 8 oct 2026 ---");
for (const item of oct8.items) {
  if (item.kind === "clase") console.log(`clase ${item.block.start}–${item.block.end} ${item.block.name} ${item.block.type}`);
  else if (item.kind === "trabajo") console.log(`trabajo ${item.start}–${item.end}`);
  else if (item.kind === "gym") console.log(`gym ${item.session.time} ${item.session.title}`);
  else console.log(`comida ${item.meal.time} ${item.meal.role}`);
}
console.log(`trabajo total ${oct8.workMinutes} min`);

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}
console.log("ok");
