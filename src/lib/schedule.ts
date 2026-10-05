import { classesFor, type ClassBlock } from "../data/courses.ts";
import { HOLIDAYS } from "../data/holidays.ts";
import { MEALS, type Meal, type MealDay } from "../data/meals.ts";
import { sessionFor, type Session } from "../data/sessions.ts";
import { cycleWeek, isInTerm, toIso } from "./dates.ts";
import { classInterval, parseClock, spanInterval, type Interval } from "./time.ts";

const DAY_START = 7 * 60;
const DAY_END = 23 * 60;
const MIN_TOTAL = 5 * 60;
const MAX_TOTAL = 6 * 60;
const IDEAL = 5 * 60 + 30;
const MIN_BLOCK = 30;
const MEAL_HOLD = 25;

export type TimelineItem =
  | { kind: "clase"; start: number; block: ClassBlock }
  | { kind: "trabajo"; start: number; end: number }
  | { kind: "gym"; start: number; end: number; session: Session }
  | { kind: "comida"; start: number; meal: Meal };

export type DayPlan = {
  date: Date;
  iso: string;
  cycleWeek: number;
  inTerm: boolean;
  session: Session;
  classes: ClassBlock[];
  work: Interval[];
  workMinutes: number;
  meals: MealDay;
  holiday: string | null;
  banners: string[];
  items: TimelineItem[];
};

const KIND_ORDER = { clase: 0, trabajo: 1, gym: 2, comida: 3 } as const;

function mealBusy(item: Meal): Interval {
  const start = parseClock(item.time);
  if (item.end) return { start, end: parseClock(item.end) };
  return { start, end: start + MEAL_HOLD };
}

function mergeIntervals(list: Interval[]): Interval[] {
  const sorted = [...list].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Interval[] = [];
  for (const interval of sorted) {
    const last = merged[merged.length - 1];
    if (!last || interval.start > last.end) merged.push({ ...interval });
    else last.end = Math.max(last.end, interval.end);
  }
  return merged;
}

function freeGaps(busy: Interval[], windowStart = DAY_START): Interval[] {
  const clipped = mergeIntervals(
    busy
      .map((interval) => ({
        start: Math.max(interval.start, DAY_START),
        end: Math.min(interval.end, DAY_END),
      }))
      .filter((interval) => interval.end > interval.start),
  );
  const gaps: Interval[] = [];
  let cursor = windowStart;
  for (const block of clipped) {
    if (block.start > cursor) gaps.push({ start: cursor, end: block.start });
    cursor = Math.max(cursor, block.end);
  }
  if (cursor < DAY_END) gaps.push({ start: cursor, end: DAY_END });
  return gaps.filter((gap) => gap.end - gap.start >= MIN_BLOCK);
}

/**
 * Entre semana, 5 a 6 horas en huecos que no pisan clases (también las virtuales), gym ni la ventana corta de una comida.
 * Sábado y domingo no tienen trabajo.
 */
export function workBlocksFor(date: Date): Interval[] {
  const dow = date.getDay();
  if (dow === 0 || dow === 6) return [];

  const busy: Interval[] = [
    ...classesFor(date).map((block) => classInterval(block.start, block.end)),
    spanInterval(sessionFor(date).time),
    ...MEALS[dow].items.map((item) => mealBusy(item)),
  ];

  const blocks: Interval[] = [];
  let total = 0;
  for (const gap of freeGaps(busy, DAY_START)) {
    const room = MAX_TOTAL - total;
    if (room < MIN_BLOCK) break;
    let want = Math.min(gap.end - gap.start, room);
    if (total + want > IDEAL) {
      const towardIdeal = IDEAL - total;
      if (towardIdeal >= MIN_BLOCK) want = Math.min(want, towardIdeal);
      else if (total >= MIN_TOTAL) break;
    }
    if (want < MIN_BLOCK) continue;
    blocks.push({ start: gap.start, end: gap.start + want });
    total += want;
    if (total >= IDEAL) break;
  }
  return blocks;
}

function bannersFor(date: Date, holiday: string | null): string[] {
  const notes: string[] = [];
  const dow = date.getDay();
  const inTerm = isInTerm(date);
  const weekend = dow === 0 || dow === 6;

  if (!inTerm && date < new Date(2026, 9, 6)) {
    notes.push("Antes del 6 de octubre no hay clases. El gym sigue el ciclo para que octubre no quede vacío.");
  } else if (!inTerm) {
    notes.push(
      "Después del 2 de febrero de 2027 no hay clases. Si sigues entrenando, el ciclo de 4 semanas continúa igual.",
    );
  }

  if (weekend) {
    notes.push("Fin de semana: sin clases y sin trabajo. Abdomen 10:00–11:00. El post-entreno queda a las 11:15.");
  } else if (dow === 4) {
    notes.push(
      "Jueves: tutorías virtuales 17:00–17:59 y 18:00–18:59. El snack pre-entreno es a las 19:00, no encima de esas tutorías. El gym es 19:15–20:30.",
    );
  }

  if (holiday) {
    notes.push(
      `${holiday}. La malla semanal igual aparece; confirma con la universidad si ese feriado suspende la clase.`,
    );
  }
  return notes;
}

export function buildDay(date: Date): DayPlan {
  const dow = date.getDay();
  const session = sessionFor(date);
  const gym = spanInterval(session.time);
  const classes = classesFor(date);
  const work = workBlocksFor(date);
  const meals = MEALS[dow];
  const holiday = HOLIDAYS[toIso(date)] ?? null;

  const items: TimelineItem[] = [
    ...classes.map((block) => ({ kind: "clase" as const, start: parseClock(block.start), block })),
    ...work.map((block) => ({ kind: "trabajo" as const, start: block.start, end: block.end })),
    { kind: "gym" as const, start: gym.start, end: gym.end, session },
    ...meals.items.map((meal) => ({ kind: "comida" as const, start: parseClock(meal.time), meal })),
  ];
  items.sort((a, b) => a.start - b.start || KIND_ORDER[a.kind] - KIND_ORDER[b.kind]);

  return {
    date,
    iso: toIso(date),
    cycleWeek: cycleWeek(date),
    inTerm: isInTerm(date),
    session,
    classes,
    work,
    workMinutes: work.reduce((sum, block) => sum + (block.end - block.start), 0),
    meals,
    holiday,
    banners: bannersFor(date, holiday),
    items,
  };
}

export function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && b.start < a.end;
}
