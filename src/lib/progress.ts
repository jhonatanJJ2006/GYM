import { MEALS } from "../data/meals.ts";
import { sessionFor } from "../data/sessions.ts";
import { addDays, dateOnly, isInRange, mondayOnOrBefore, toIso } from "./dates.ts";
import type { MealLog, TrainingLog } from "./store.ts";

/** Número de semana ISO 8601 (lunes a domingo). */
export function isoWeek(date: Date): number {
  const day = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dow = day.getUTCDay() || 7;
  day.setUTCDate(day.getUTCDate() + 4 - dow);
  const yearStart = new Date(Date.UTC(day.getUTCFullYear(), 0, 1));
  return Math.ceil(((day.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export function intakeFor(date: Date, log: MealLog) {
  const menu = MEALS[date.getDay()];
  const eaten = new Set(log[toIso(date)] ?? []);
  let kcal = 0;
  let protein = 0;
  let targetKcal = 0;
  let targetProtein = 0;
  menu.items.forEach((meal, index) => {
    targetKcal += meal.kcal;
    targetProtein += meal.protein;
    if (eaten.has(index)) {
      kcal += meal.kcal;
      protein += meal.protein;
    }
  });
  return { kcal, protein, targetKcal, targetProtein, eaten: eaten.size, planned: menu.items.length };
}

/** Días de la semana de `date` que ya pasaron o son hoy, dentro del rango de la app. */
export function elapsedWeekDays(date: Date, today: Date): Date[] {
  const monday = mondayOnOrBefore(date);
  const limit = dateOnly(today).getTime();
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index)).filter(
    (day) => isInRange(day) && day.getTime() <= limit,
  );
}

export function weekStats(date: Date, today: Date, meals: MealLog, training: TrainingLog) {
  const days = elapsedWeekDays(date, today);
  let mealsPlanned = 0;
  let mealsEaten = 0;
  let exPlanned = 0;
  let exDone = 0;
  let sessionsDone = 0;
  for (const day of days) {
    const intake = intakeFor(day, meals);
    mealsPlanned += intake.planned;
    mealsEaten += intake.eaten;
    const session = sessionFor(day);
    const iso = toIso(day);
    const done = session.exercises.filter((exercise) => training[`${iso}:${exercise.id}`]).length;
    exPlanned += session.exercises.length;
    exDone += done;
    if (done === session.exercises.length && done > 0) sessionsDone += 1;
  }
  const pct = (a: number, b: number) => (b === 0 ? 0 : Math.round((a / b) * 100));
  return {
    days: days.length,
    load: pct(exDone, exPlanned),
    meals: pct(mealsEaten, mealsPlanned),
    compliance: pct(exDone + mealsEaten, exPlanned + mealsPlanned),
    sessionsDone,
    mealsEaten,
    mealsPlanned,
  };
}

export function parseSets(reps: string): number {
  const match = /(\d+)\s*series?/i.exec(reps);
  return match ? Number(match[1]) : 3;
}

export function parseRest(reps: string): number {
  const match = /descanso\s*(\d+)\s*(s|min)/i.exec(reps);
  if (!match) return 60;
  return match[2]!.toLowerCase() === "min" ? Number(match[1]) * 60 : Number(match[1]);
}
