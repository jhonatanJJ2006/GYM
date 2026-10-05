import { useEffect, useState } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { Legend } from "../components/Legend.tsx";
import { DayAgenda, WeekAgenda, WeekGrid } from "../components/system/WeekGrid.tsx";
import { Button } from "../components/ui/button.tsx";
import {
  MONTHS,
  WEEK_LETTERS,
  addDays,
  canGoNextMonth,
  canGoPrevMonth,
  daysInMonth,
  formatLong,
  formatWeekSpan,
  RANGE_END,
  RANGE_START,
  initialIso,
  isInRange,
  isInTerm,
  isSameDay,
  mondayLead,
  mondayOnOrBefore,
  parseIso,
  shiftMonth,
  toIso,
  weeksCoveringRange,
} from "../lib/dates.ts";
import { buildDay } from "../lib/schedule.ts";
import { cn } from "../lib/utils.ts";

const FILTERS = [
  { id: "clase", label: "Clases", dot: "bg-rail-class" },
  { id: "trabajo", label: "Trabajo", dot: "bg-rail-work" },
  { id: "gym", label: "Gym", dot: "bg-rail-gym" },
  { id: "comida", label: "Comidas", dot: "bg-rail-meal" },
] as const;

type Kind = (typeof FILTERS)[number]["id"];

export function CalendarPage() {
  const weeks = weeksCoveringRange();
  const initial = parseIso(initialIso());
  const [cursor, setCursor] = useState(initial);
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [narrow, setNarrow] = useState(() => window.matchMedia("(max-width: 767px)").matches);
  const [view, setView] = useState<"dia" | "semana" | "mes">(() =>
    window.matchMedia("(max-width: 767px)").matches ? "dia" : "semana",
  );
  const [kinds, setKinds] = useState<Record<Kind, boolean>>({
    clase: true,
    trabajo: true,
    gym: true,
    comida: true,
  });
  const [today] = useState(() => new Date());

  useEffect(() => {
    const query = window.matchMedia("(max-width: 767px)");
    const onChange = () => setNarrow(query.matches);
    onChange();
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  const monday = mondayOnOrBefore(cursor);
  const week = Array.from({ length: 7 }, (_, index) => addDays(monday, index));
  const weekIndex = weeks.findIndex((item) => isSameDay(item[0] ?? monday, monday));

  function goWeek(delta: number) {
    const nextIndex = weekIndex + delta;
    const nextWeek = weeks[nextIndex];
    if (!nextWeek) return;
    const sameWeekday = nextWeek.find((date) => date.getDay() === cursor.getDay() && isInRange(date));
    const fallback = nextWeek.find((date) => isInRange(date));
    const next = sameWeekday ?? fallback;
    if (!next) return;
    setCursor(next);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  function choose(date: Date) {
    if (!isInRange(date)) return;
    setCursor(date);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
  }

  function moveMonth(delta: number) {
    if (delta < 0 && !canGoPrevMonth(year, month)) return;
    if (delta > 0 && !canGoNextMonth(year, month)) return;
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
    const count = daysInMonth(next.year, next.month);
    for (let day = Math.min(cursor.getDate(), count); day >= 1; day -= 1) {
      const date = new Date(next.year, next.month, day);
      if (isInRange(date)) {
        setCursor(date);
        return;
      }
    }
  }

  function goDay(delta: number) {
    const next = addDays(cursor, delta);
    if (!isInRange(next)) return;
    choose(next);
  }

  const active = FILTERS.filter((item) => kinds[item.id]);

  return (
    <div>
      <PageIntro title="Calendario">Día, semana o mes · 1 oct – 28 feb</PageIntro>

      <div className="mb-3 grid grid-cols-3 gap-1" role="tablist" aria-label="Vista del calendario">
        {(
          [
            ["dia", "Día"],
            ["semana", "Semana"],
            ["mes", "Mes"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={view === id}
            onClick={() => setView(id)}
            className={cn(
              "min-h-9 rounded-row text-sm font-medium",
              view === id ? "bg-panel-2 text-cream ring-1 ring-cream" : "text-muted",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <label className="mb-3 flex items-center justify-between gap-3 rounded-row border border-line bg-ink-2 px-3 py-2 text-sm">
        <span className="text-muted">Ir a un día</span>
        <input
          type="date"
          value={toIso(cursor)}
          min={toIso(RANGE_START)}
          max={toIso(RANGE_END)}
          onChange={(event) => {
            if (!event.target.value) return;
            choose(parseIso(event.target.value));
          }}
          className="min-h-10 rounded-row border border-line bg-ink px-2 text-cream"
        />
      </label>

      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-ink/95 px-4 py-2 sm:-mx-6 sm:px-6">
        <div
          className="grid grid-cols-4 gap-1"
          role="group"
          aria-label="Filtros del calendario"
          onKeyDown={(event) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
            const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
            const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
            if (index < 0 || buttons.length === 0) return;
            const next =
              event.key === "Home"
                ? 0
                : event.key === "End"
                  ? buttons.length - 1
                  : event.key === "ArrowRight"
                    ? (index + 1) % buttons.length
                    : (index - 1 + buttons.length) % buttons.length;
            event.preventDefault();
            buttons[next]?.focus();
          }}
        >
          {FILTERS.map((filter) => {
            const on = kinds[filter.id];
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={on}
                onClick={() => setKinds((current) => ({ ...current, [filter.id]: !current[filter.id] }))}
                className={cn(
                  "min-h-9 rounded-row text-xs font-medium",
                  on ? "bg-panel-2 text-cream ring-1 ring-cream" : "text-muted",
                )}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          size="icon"
          aria-label={view === "dia" ? "Día anterior" : view === "mes" ? "Mes anterior" : "Semana anterior"}
          disabled={view === "dia" ? !isInRange(addDays(cursor, -1)) : view === "mes" ? !canGoPrevMonth(year, month) : weekIndex <= 0}
          onClick={() => (view === "dia" ? goDay(-1) : view === "mes" ? moveMonth(-1) : goWeek(-1))}
        >
          ‹
        </Button>
        <p className="min-w-0 text-balance text-center font-display text-sm leading-tight tracking-tight text-[var(--color-mark)] sm:text-lg">
          {view === "dia"
            ? formatLong(cursor).replace(/^./, (letter) => letter.toUpperCase())
            : view === "mes"
              ? `${MONTHS[month]} ${year}`
              : formatWeekSpan(week.filter((date) => isInRange(date)))}
        </p>
        <Button
          variant="outline"
          size="icon"
          aria-label={view === "dia" ? "Día siguiente" : view === "mes" ? "Mes siguiente" : "Semana siguiente"}
          disabled={
            view === "dia"
              ? !isInRange(addDays(cursor, 1))
              : view === "mes"
                ? !canGoNextMonth(year, month)
                : weekIndex < 0 || weekIndex >= weeks.length - 1
          }
          onClick={() => (view === "dia" ? goDay(1) : view === "mes" ? moveMonth(1) : goWeek(1))}
        >
          ›
        </Button>
      </div>

      {view === "dia" ? <div data-day-panel><DayAgenda day={cursor} kinds={kinds} /></div> : null}

      {view === "semana" && narrow ? (
        <WeekAgenda days={week} kinds={kinds} selected={cursor} onSelect={choose} />
      ) : null}
      {view === "semana" && !narrow ? (
        <WeekGrid days={week} kinds={kinds} selected={cursor} today={today} onSelect={choose} />
      ) : null}

      {view === "mes" ? (
        <>
          <MonthJump
            year={year}
            month={month}
            selected={cursor}
            today={today}
            kinds={kinds}
            onChoose={choose}
          />
          <div className="mt-3">
            <WeekAgenda days={[cursor]} kinds={kinds} selected={cursor} onSelect={choose} />
          </div>
        </>
      ) : null}

      {active.length === 0 ? (
        <p className="mt-4 rounded-row border border-line bg-panel px-3 py-3 text-sm text-muted">Activa al menos un tipo para ver el día.</p>
      ) : null}

      <details data-rise className="mt-4 rounded-row border border-line bg-panel">
        <summary className="flex min-h-11 cursor-pointer items-center px-4 text-sm font-semibold">Materias</summary>
        <div className="px-4 pb-4">
          <Legend />
        </div>
      </details>
    </div>
  );
}

const DOT: Record<Kind, string> = {
  clase: "bg-rail-class",
  trabajo: "bg-rail-work",
  gym: "bg-rail-gym",
  comida: "bg-rail-meal",
};

function MonthJump({
  year,
  month,
  selected,
  today,
  kinds,
  onChoose,
}: {
  year: number;
  month: number;
  selected: Date;
  today: Date;
  kinds: Record<Kind, boolean>;
  onChoose: (date: Date) => void;
}) {
  const lead = mondayLead(year, month);
  const count = daysInMonth(year, month);
  const cells: Array<Date | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div data-rise className="mb-4 rounded-row border border-line bg-ink-2 p-3">
      <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-semibold text-muted">
        {WEEK_LETTERS.map((letter) => (
          <div key={letter}>{letter}</div>
        ))}
      </div>
      <div
        className="mt-1 grid grid-cols-7 gap-1"
        role="grid"
        aria-label={`Días de ${MONTHS[month]}`}
        onKeyDown={(event) => {
          const step = event.key === "ArrowLeft" ? -1 : event.key === "ArrowRight" ? 1 : event.key === "ArrowUp" ? -7 : event.key === "ArrowDown" ? 7 : 0;
          const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
          if (event.key === "Home" || event.key === "End") {
            event.preventDefault();
            buttons[event.key === "Home" ? 0 : buttons.length - 1]?.focus();
            return;
          }
          if (!step) return;
          const current = document.activeElement;
          if (!(current instanceof HTMLButtonElement) || !current.dataset.iso) return;
          let cursor = addDays(parseIso(current.dataset.iso), step);
          for (let hop = 0; hop < 21; hop += 1) {
            const target = buttons.find((button) => button.dataset.iso === toIso(cursor));
            if (target) {
              event.preventDefault();
              target.focus();
              return;
            }
            cursor = addDays(cursor, step > 0 ? 1 : -1);
          }
        }}
      >
        {cells.map((date, index) => {
          if (!date || !isInRange(date)) return <div key={`vacio-${index}`} className="min-h-10" />;
          const plan = buildDay(date);
          const active = isSameDay(date, selected);
          return (
            <button
              key={toIso(date)}
              type="button"
              data-iso={toIso(date)}
              onClick={() => onChoose(date)}
              aria-current={active ? "date" : undefined}
              aria-label={formatLong(date)}
              className={cn(
                "flex min-h-10 flex-col items-center justify-center rounded-row",
                active ? "bg-cream text-ink" : "text-cream",
                !active && !isInTerm(date) && "text-muted",
                !active && isSameDay(date, today) && "ring-1 ring-cream",
              )}
            >
              <span className="font-display text-base leading-none">{date.getDate()}</span>
              <span className="mt-1 flex h-1 justify-center gap-0.5">
                {plan.items
                  .filter((item) => kinds[item.kind])
                  .filter((item, index, list) => list.findIndex((other) => other.kind === item.kind) === index)
                  .slice(0, 3)
                  .map((item) => (
                    <span key={item.kind} className={cn("size-1 rounded-full", DOT[item.kind])} />
                  ))}
              </span>
              {plan.holiday ? <span className="sr-only">feriado</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
