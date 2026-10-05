import { useMemo, useState } from "react";
import {
  MONTHS,
  RANGE_END,
  RANGE_START,
  WEEK_LETTERS,
  addDays,
  dateOnly,
  daysInMonth,
  formatLong,
  formatWeekSpan,
  initialIso,
  isInRange,
  isSameDay,
  mondayLead,
  mondayOnOrBefore,
  parseIso,
  shiftMonth,
  toIso,
} from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";
import { Button } from "./ui/button.tsx";

export type SpanView = "dia" | "semana" | "mes";

export function useHorizon(seed?: Date) {
  const [date, setDateState] = useState(() => {
    const today = dateOnly(new Date());
    if (isInRange(today)) return today;
    return seed ? dateOnly(seed) : parseIso(initialIso());
  });
  const [view, setView] = useState<SpanView>("dia");

  function setDate(next: Date) {
    const day = dateOnly(next);
    if (day.getTime() < RANGE_START.getTime()) {
      setDateState(dateOnly(RANGE_START));
      return;
    }
    if (day.getTime() > RANGE_END.getTime()) {
      setDateState(dateOnly(RANGE_END));
      return;
    }
    setDateState(day);
  }

  function step(dir: number) {
    if (view === "dia") setDate(addDays(date, dir));
    else if (view === "semana") setDate(addDays(date, dir * 7));
    else {
      const shifted = shiftMonth(date.getFullYear(), date.getMonth(), dir);
      const count = daysInMonth(shifted.year, shifted.month);
      setDate(new Date(shifted.year, shifted.month, Math.min(date.getDate(), count)));
    }
  }

  const week = useMemo(() => {
    const monday = mondayOnOrBefore(date);
    return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  }, [date]);

  const atStart =
    view === "dia"
      ? date.getTime() <= dateOnly(RANGE_START).getTime()
      : view === "semana"
        ? mondayOnOrBefore(date).getTime() <= mondayOnOrBefore(RANGE_START).getTime()
        : date.getFullYear() === 2026 && date.getMonth() === 9;
  const atEnd =
    view === "dia"
      ? date.getTime() >= dateOnly(RANGE_END).getTime()
      : view === "semana"
        ? mondayOnOrBefore(date).getTime() >= mondayOnOrBefore(RANGE_END).getTime()
        : date.getFullYear() === 2027 && date.getMonth() === 1;

  return { date, setDate, view, setView, step, week, atStart, atEnd };
}

export function PeriodBar({
  date,
  view,
  atStart,
  atEnd,
  onDate,
  onView,
  onStep,
  label = "Periodo",
}: {
  date: Date;
  view: SpanView;
  atStart: boolean;
  atEnd: boolean;
  onDate: (date: Date) => void;
  onView: (view: SpanView) => void;
  onStep: (dir: number) => void;
  label?: string;
}) {
  const week = Array.from({ length: 7 }, (_, index) => addDays(mondayOnOrBefore(date), index));
  const title =
    view === "dia"
      ? formatLong(date).replace(/^./, (letter) => letter.toUpperCase())
      : view === "mes"
        ? `${MONTHS[date.getMonth()]} ${date.getFullYear()}`
        : formatWeekSpan(week.filter((day) => isInRange(day)));

  return (
    <div className="mt-4" data-rise>
      <div
        className="relative grid grid-cols-3 rounded-full border border-line bg-ink-2 p-1"
        role="tablist"
        aria-label={`Vista de ${label}`}
      >
        <span
          aria-hidden
          className="period-indicator pointer-events-none absolute inset-y-1 left-1 rounded-full bg-[#c6ff3d] shadow-[0_0_18px_rgba(198,255,61,0.35)]"
          style={{
            width: "calc((100% - 0.5rem) / 3)",
            transform: `translateX(${view === "dia" ? 0 : view === "semana" ? 100 : 200}%)`,
          }}
        />
        {(
          [
            ["dia", "Día"],
            ["semana", "Semana"],
            ["mes", "Mes"],
          ] as const
        ).map(([id, name]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => onView(id)}
            className={cn(
              "relative z-10 min-h-9 rounded-full text-sm font-semibold transition-colors duration-300",
              view === id ? "text-[#0b0f05]" : "text-muted hover:text-cream",
            )}
          >
            {name}
          </button>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <Button variant="outline" size="icon" aria-label="Anterior" disabled={atStart} onClick={() => onStep(-1)}>
          ‹
        </Button>
        <p className="min-w-0 text-balance text-center font-display text-sm leading-tight tracking-tight text-[var(--color-mark)] sm:text-lg">
          {title}
        </p>
        <Button variant="outline" size="icon" aria-label="Siguiente" disabled={atEnd} onClick={() => onStep(1)}>
          ›
        </Button>
      </div>
      <label className="mt-3 flex items-center justify-between gap-3 rounded-row border border-line bg-ink-2 px-3 py-2 text-sm">
        <span className="text-muted">Ir a un día</span>
        <input
          type="date"
          value={toIso(date)}
          min={toIso(RANGE_START)}
          max={toIso(RANGE_END)}
          onChange={(event) => {
            if (!event.target.value) return;
            onDate(parseIso(event.target.value));
          }}
          className="min-h-10 rounded-row border border-line bg-ink px-2 text-cream"
        />
      </label>
    </div>
  );
}

export function MonthPicker({
  date,
  onChoose,
  caption,
}: {
  date: Date;
  onChoose: (date: Date) => void;
  caption?: (date: Date) => string;
}) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const lead = mondayLead(year, month);
  const count = daysInMonth(year, month);
  const cells: Array<Date | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div data-day-panel className="mt-4 rounded-row border border-line bg-ink-2 p-3">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-semibold text-muted">
        {WEEK_LETTERS.map((letter) => (
          <div key={letter}>{letter}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1" role="grid" aria-label={`Días de ${MONTHS[month]}`}>
        {cells.map((day, index) => {
          if (!day || !isInRange(day)) return <div key={`vacio-${index}`} className="min-h-12" />;
          const active = isSameDay(day, date);
          return (
            <button
              key={toIso(day)}
              type="button"
              onClick={() => onChoose(day)}
              aria-current={active ? "date" : undefined}
              aria-label={formatLong(day)}
              className={cn(
                "flex min-h-12 flex-col items-center justify-center rounded-row px-0.5",
                active ? "bg-cream text-ink" : "text-cream",
              )}
            >
              <span className="font-display text-base leading-none">{day.getDate()}</span>
              {caption ? (
                <span className={cn("mt-1 line-clamp-2 text-[0.58rem] leading-tight", active ? "text-ink/70" : "text-muted")}>
                  {caption(day)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
