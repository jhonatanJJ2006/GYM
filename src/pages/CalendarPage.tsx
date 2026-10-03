import { useState } from "react";
import { Legend } from "../components/Legend.tsx";
import { Timeline } from "../components/Timeline.tsx";
import { Button } from "../components/ui/button.tsx";
import { sessionColor } from "../data/sessions.ts";
import {
  MONTHS,
  WEEK_LETTERS,
  addDays,
  canGoNextMonth,
  canGoPrevMonth,
  daysInMonth,
  formatLong,
  initialIso,
  isInRange,
  isInTerm,
  isSameDay,
  mondayLead,
  parseIso,
  shiftMonth,
  toIso,
} from "../lib/dates.ts";
import { buildDay } from "../lib/schedule.ts";
import { formatDuration } from "../lib/time.ts";
import { cn } from "../lib/utils.ts";

function weekContaining(date: Date): Date[] {
  const monday = addDays(date, -((date.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, index) => addDays(monday, index));
}

export function CalendarPage() {
  const initial = parseIso(initialIso());
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [selectedIso, setSelectedIso] = useState(initialIso());
  const [weekMode, setWeekMode] = useState(false);
  const [today] = useState(() => new Date());

  const selected = parseIso(selectedIso);
  const plan = buildDay(selected);
  const color = sessionColor(plan.session);
  const lead = mondayLead(year, month);
  const count = daysInMonth(year, month);
  const cells: Array<Date | null> = [
    ...Array.from({ length: lead }, () => null),
    ...Array.from({ length: count }, (_, index) => new Date(year, month, index + 1)),
  ];
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: Array<Array<Date | null>> = [];
  for (let index = 0; index < cells.length; index += 7) weeks.push(cells.slice(index, index + 7));

  function move(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  function choose(iso: string, date: Date) {
    setSelectedIso(iso);
    setYear(date.getFullYear());
    setMonth(date.getMonth());
    if (window.matchMedia("(max-width: 1023px)").matches) {
      setWeekMode(true);
      requestAnimationFrame(() => {
        document.getElementById("detalle")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }

  function shiftWeek(delta: number) {
    const next = addDays(selected, delta * 7);
    if (!isInRange(next)) return;
    setSelectedIso(toIso(next));
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  }

  return (
    <div className="lg:grid lg:grid-cols-[minmax(0,0.92fr)_minmax(0,1.08fr)] lg:items-start lg:gap-10">
      <section>
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-sm tracking-wide text-muted">Hierro</p>
            <h1 className="font-display text-[2.6rem] capitalize leading-none tracking-tight">{MONTHS[month]}</h1>
            <p className="mt-1 text-sm text-muted">{year} · 1 oct – 28 feb</p>
          </div>
          <div className={cn("flex gap-2", weekMode && "max-lg:hidden")}>
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl"
              aria-label="Mes anterior"
              disabled={!canGoPrevMonth(year, month)}
              onClick={() => move(-1)}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="rounded-2xl"
              aria-label="Mes siguiente"
              disabled={!canGoNextMonth(year, month)}
              onClick={() => move(1)}
            >
              ›
            </Button>
          </div>
        </div>

        <div className={cn(weekMode && "hidden lg:block")}>
          <MonthGrid
            weeks={weeks}
            selectedIso={selectedIso}
            today={today}
            label={`${MONTHS[month]} de ${year}`}
            onChoose={choose}
          />
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Toca un día para ver clases, trabajo, gym y comidas en orden. La raya de color es el entreno.
          </p>
        </div>

        {weekMode ? (
          <div className="lg:hidden">
            <div className="mb-2 flex items-center justify-between gap-2">
              <button
                type="button"
                className="min-h-11 rounded-full px-3 text-sm font-semibold text-accent"
                onClick={() => setWeekMode(false)}
              >
                Ver el mes
              </button>
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="rounded-2xl" aria-label="Semana anterior" onClick={() => shiftWeek(-1)}>
                  ‹
                </Button>
                <Button variant="outline" size="icon" className="rounded-2xl" aria-label="Semana siguiente" onClick={() => shiftWeek(1)}>
                  ›
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weekContaining(selected).map((date) => {
                const iso = toIso(date);
                const inside = isInRange(date);
                const active = iso === selectedIso;
                const dayPlan = inside ? buildDay(date) : null;
                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={!inside}
                    onClick={() => choose(iso, date)}
                    className={cn(
                      "flex min-h-16 flex-col items-center justify-center rounded-2xl",
                      active ? "bg-accent text-ink" : "bg-panel text-cream",
                      !inside && "opacity-30",
                    )}
                  >
                    <span className="text-[0.62rem] font-semibold">{WEEK_LETTERS[(date.getDay() + 6) % 7]}</span>
                    <span className="font-display text-lg leading-none">{date.getDate()}</span>
                    {dayPlan ? (
                      <span
                        className={cn("mt-1 h-1 w-4 rounded-full", active && "bg-ink/40")}
                        style={active ? undefined : { background: sessionColor(dayPlan.session) }}
                      />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <details className="mt-4 rounded-2xl bg-panel">
          <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">Colores de las materias</summary>
          <div className="px-4 pb-4">
            <Legend />
          </div>
        </details>
      </section>

      <section id="detalle" className="mt-8 scroll-mt-3 lg:mt-0">
        <header className="mb-4">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
            Semana {plan.cycleWeek} de 4
            {plan.date.getDay() === 4 ? ` · hombro + ${plan.cycleWeek === 1 || plan.cycleWeek === 3 ? "tríceps" : "bíceps"}` : ""}
          </p>
          <h2 className="font-display text-[1.7rem] leading-tight tracking-tight">
            {formatLong(plan.date).replace(/^./, (letter) => letter.toUpperCase())}
          </h2>
          <p className="mt-1 font-display text-2xl leading-none" style={{ color }}>
            {plan.session.title}
          </p>
          <p className="mt-1 text-sm font-semibold tabular-nums text-cream/75">{plan.session.time}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full bg-panel px-3 py-1.5">
              {plan.workMinutes === 0 ? "Sin trabajo" : `Trabajo ${formatDuration(plan.workMinutes)}`}
            </span>
            <span className="rounded-full bg-panel px-3 py-1.5">
              {plan.classes.length === 0 ? "Sin clases" : `${plan.classes.length} clases`}
            </span>
            <span className="rounded-full bg-panel px-3 py-1.5">~{plan.meals.total}</span>
          </div>
        </header>

        {plan.banners.map((banner) => (
          <p key={banner} className="mb-3 rounded-2xl bg-warn/10 px-3 py-3 text-sm leading-relaxed text-warn">
            {banner}
          </p>
        ))}
        <Timeline plan={plan} />
        <p className="mt-2 text-xs leading-relaxed text-muted">Meta del plan: 2800 kcal y 135 g de proteína. Toca el gym o una comida para abrirlos.</p>
      </section>
    </div>
  );
}

function MonthGrid({
  weeks,
  selectedIso,
  today,
  label,
  onChoose,
}: {
  weeks: Array<Array<Date | null>>;
  selectedIso: string;
  today: Date;
  label: string;
  onChoose: (iso: string, date: Date) => void;
}) {
  return (
    <div role="grid" aria-label={`Calendario de ${label}`}>
      <div role="row" className="mb-1 grid grid-cols-7">
        {WEEK_LETTERS.map((letter) => (
          <div key={letter} role="columnheader" className="pb-1 text-center text-[0.68rem] font-semibold text-muted">
            {letter}
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} role="row" className="grid grid-cols-7 gap-1">
            {week.map((date, dayIndex) => {
              if (!date) return <div key={`vacio-${weekIndex}-${dayIndex}`} role="gridcell" />;
              const iso = toIso(date);
              const dayPlan = buildDay(date);
              const active = iso === selectedIso;
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={iso}
                  type="button"
                  role="gridcell"
                  aria-selected={active}
                  aria-label={`${formatLong(date)}, semana ${dayPlan.cycleWeek}, ${dayPlan.session.title}${dayPlan.holiday ? ", feriado" : ""}`}
                  onClick={() => onChoose(iso, date)}
                  className={cn(
                    "relative flex min-h-[3.35rem] flex-col items-center justify-center rounded-2xl",
                    active ? "bg-accent text-ink" : "bg-panel text-cream",
                    !active && !isInTerm(date) && "text-muted",
                    !active && isToday && "ring-1 ring-accent",
                  )}
                >
                  {dayPlan.holiday ? (
                    <span className={cn("absolute right-1.5 top-1.5 size-1.5 rounded-full", active ? "bg-ink" : "bg-warn")} />
                  ) : null}
                  <span className="font-display text-lg leading-none">{date.getDate()}</span>
                  <span
                    className={cn("mt-1 h-1 w-4 rounded-full", active && "bg-ink/35")}
                    style={active ? undefined : { background: sessionColor(dayPlan.session) }}
                  />
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
