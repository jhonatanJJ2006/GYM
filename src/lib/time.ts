export type Interval = {
  start: number;
  end: number;
};

export function parseClock(value: string): number {
  const [hours, minutes] = value.split(":").map(Number);
  return hours * 60 + minutes;
}

/** El horario de clase lista el último minuto ocupado (11:59, 12:29). */
export function classInterval(start: string, end: string): Interval {
  return { start: parseClock(start), end: parseClock(end) + 1 };
}

/** El gym usa hora de cierre (19:15, 20:30): ese minuto ya está libre. */
export function spanInterval(span: string): Interval {
  const [start, end] = span.split("–");
  return { start: parseClock(start), end: parseClock(end) };
}

export function formatClock(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return hours === 1 ? "1 h" : `${hours} h`;
  return `${hours} h ${mins} min`;
}

export function formatSpan(interval: Interval): string {
  return `${formatClock(interval.start)}–${formatClock(interval.end)}`;
}
