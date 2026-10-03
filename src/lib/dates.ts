export const MONTHS = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
] as const;

export const DOW_LONG = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
] as const;

/** Encabezados de lunes a domingo. */
export const WEEK_LETTERS = ["L", "M", "X", "J", "V", "S", "D"] as const;

export const TERM_START = new Date(2026, 9, 6);
export const TERM_END = new Date(2027, 1, 2);
export const RANGE_START = new Date(2026, 9, 1);
export const RANGE_END = new Date(2027, 1, 28);
/** Lunes que abre la semana 1 del ciclo de entreno. */
export const ANCHOR_MON = new Date(2026, 9, 5);

const DAY_MS = 86_400_000;

export function dateOnly(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function toIso(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIso(iso: string): Date {
  const [year, month, day] = iso.split("-").map(Number);
  return new Date(year, month - 1, day);
}

export function addDays(date: Date, days: number): Date {
  const next = dateOnly(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isInTerm(date: Date): boolean {
  const time = dateOnly(date).getTime();
  return time >= TERM_START.getTime() && time <= TERM_END.getTime();
}

export function isInRange(date: Date): boolean {
  const time = dateOnly(date).getTime();
  return time >= RANGE_START.getTime() && time <= RANGE_END.getTime();
}

export function cycleWeek(date: Date): number {
  const diff = Math.round((dateOnly(date).getTime() - ANCHOR_MON.getTime()) / DAY_MS);
  const weekIndex = Math.floor(diff / 7);
  return (((weekIndex % 4) + 4) % 4) + 1;
}

export function formatLong(date: Date): string {
  return `${DOW_LONG[date.getDay()]} ${date.getDate()} de ${MONTHS[date.getMonth()]} de ${date.getFullYear()}`;
}

export function monthShort(date: Date): string {
  return MONTHS[date.getMonth()].slice(0, 3);
}

export function formatWeekSpan(days: Date[]): string {
  const first = days[0];
  const last = days[days.length - 1];
  if (!first || !last) return "";
  if (first.getMonth() === last.getMonth()) {
    return `${first.getDate()}–${last.getDate()} ${monthShort(first)}`;
  }
  return `${first.getDate()} ${monthShort(first)} – ${last.getDate()} ${monthShort(last)}`;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

export function mondayLead(year: number, month: number): number {
  return (new Date(year, month, 1).getDay() + 6) % 7;
}

export function canGoPrevMonth(year: number, month: number): boolean {
  return !(year === 2026 && month === 9);
}

export function canGoNextMonth(year: number, month: number): boolean {
  return !(year === 2027 && month === 1);
}

export function shiftMonth(year: number, month: number, delta: number): { year: number; month: number } {
  const next = new Date(year, month + delta, 1);
  return { year: next.getFullYear(), month: next.getMonth() };
}

/** Semanas de lunes a domingo que tocan el rango del calendario. */
export function weeksCoveringRange(): Date[][] {
  const lead = (RANGE_START.getDay() + 6) % 7;
  let monday = addDays(RANGE_START, -lead);
  const weeks: Date[][] = [];
  while (monday.getTime() <= RANGE_END.getTime()) {
    weeks.push(Array.from({ length: 7 }, (_, index) => addDays(monday, index)));
    monday = addDays(monday, 7);
  }
  return weeks;
}

export function initialIso(): string {
  const today = dateOnly(new Date());
  if (isInRange(today)) return toIso(today);
  return toIso(TERM_START);
}
