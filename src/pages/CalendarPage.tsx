import { useState } from "react";
import { Legend } from "../components/Legend.tsx";
import { ExerciseFigure } from "../components/ExerciseFigure.tsx";
import { MealArt } from "../components/MealArt.tsx";
import { useModals } from "../components/Modals.tsx";
import { Button } from "../components/ui/button.tsx";
import { classKey, courseColor, placeOf } from "../data/courses.ts";
import { mealWhen } from "../data/meals.ts";
import { sessionColor, sessionFor } from "../data/sessions.ts";
import {
  MONTHS,
  WEEK_LETTERS,
  addDays,
  canGoNextMonth,
  canGoPrevMonth,
  daysInMonth,
  formatLong,
  formatWeekSpan,
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
import { buildDay, type DayPlan, type TimelineItem } from "../lib/schedule.ts";
import { formatDuration, formatSpan } from "../lib/time.ts";
import { cn } from "../lib/utils.ts";

const FILTERS = [
  { id: "clase", label: "Clases" },
  { id: "trabajo", label: "Trabajo" },
  { id: "gym", label: "Gym" },
  { id: "comida", label: "Comidas" },
] as const;

type Kind = (typeof FILTERS)[number]["id"];

const FILTER_COLOR: Record<Kind, string> = {
  clase: "#6ea8fe",
  trabajo: "#c5d0ff",
  gym: "#ff7a59",
  comida: "#f3b7c9",
};

export function CalendarPage() {
  const weeks = weeksCoveringRange();
  const initial = parseIso(initialIso());
  const [cursor, setCursor] = useState(initial);
  const [year, setYear] = useState(initial.getFullYear());
  const [month, setMonth] = useState(initial.getMonth());
  const [monthOpen, setMonthOpen] = useState(false);
  const [kinds, setKinds] = useState<Record<Kind, boolean>>({
    clase: true,
    trabajo: true,
    gym: true,
    comida: true,
  });
  const [today] = useState(() => new Date());

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
    setMonthOpen(false);
  }

  function moveMonth(delta: number) {
    const next = shiftMonth(year, month, delta);
    setYear(next.year);
    setMonth(next.month);
  }

  const active = FILTERS.filter((item) => kinds[item.id]);

  return (
    <div>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <p className="font-display text-sm tracking-wide text-muted">Hierro</p>
          <h1 className="font-display text-[2.6rem] leading-none tracking-tight">Calendario</h1>
          <p className="mt-1 text-sm text-muted">Clases, trabajo, gym y comidas · 1 oct – 28 feb</p>
        </div>
        <Button variant="outline" className="rounded-2xl" onClick={() => setMonthOpen((value) => !value)}>
          {monthOpen ? "Cerrar mes" : "Elegir día"}
        </Button>
      </div>

      <div className="sticky top-0 z-20 -mx-4 mb-4 bg-ink/90 px-4 py-2 backdrop-blur sm:-mx-6 sm:px-6">
        <div className="grid grid-cols-4 gap-1" role="group" aria-label="Filtros del calendario">
          {FILTERS.map((filter) => {
            const on = kinds[filter.id];
            return (
              <button
                key={filter.id}
                type="button"
                aria-pressed={on}
                onClick={() => setKinds((current) => ({ ...current, [filter.id]: !current[filter.id] }))}
                className={cn(
                  "min-h-12 rounded-full text-xs font-semibold",
                  on ? "text-ink" : "bg-panel text-muted",
                )}
                style={on ? { background: FILTER_COLOR[filter.id] } : undefined}
              >
                {filter.label}
              </button>
            );
          })}
        </div>
      </div>

      {monthOpen ? (
        <MonthJump
          year={year}
          month={month}
          selected={cursor}
          today={today}
          onMove={moveMonth}
          onChoose={choose}
        />
      ) : null}

      <div className="mb-3 flex items-center justify-between gap-3">
        <Button variant="outline" size="icon" className="rounded-2xl" aria-label="Semana anterior" disabled={weekIndex <= 0} onClick={() => goWeek(-1)}>
          ‹
        </Button>
        <p className="text-center font-display text-2xl leading-none">{formatWeekSpan(week.filter((date) => isInRange(date)))}</p>
        <Button
          variant="outline"
          size="icon"
          className="rounded-2xl"
          aria-label="Semana siguiente"
          disabled={weekIndex < 0 || weekIndex >= weeks.length - 1}
          onClick={() => goWeek(1)}
        >
          ›
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1 lg:hidden">
        {week.map((date) => {
          const inside = isInRange(date);
          const activeDay = isSameDay(date, cursor);
          return (
            <button
              key={toIso(date)}
              type="button"
              disabled={!inside}
              onClick={() => choose(date)}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center rounded-2xl",
                activeDay ? "bg-accent text-ink" : "bg-panel text-cream",
                !inside && "opacity-30",
              )}
            >
              <span className="text-[0.62rem] font-semibold">{WEEK_LETTERS[(date.getDay() + 6) % 7]}</span>
              <span className="font-display text-lg leading-none">{date.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 lg:hidden">
        {isInRange(cursor) ? <DayColumn date={cursor} kinds={kinds} featured /> : null}
      </div>

      <div className="mt-2 hidden gap-2 lg:grid lg:grid-cols-7 lg:items-start">
        {week.map((date) =>
          isInRange(date) ? (
            <DayColumn key={toIso(date)} date={date} kinds={kinds} selected={isSameDay(date, cursor)} />
          ) : (
            <div key={toIso(date)} />
          ),
        )}
      </div>

      {active.length === 0 ? (
        <p className="mt-4 rounded-2xl bg-panel px-3 py-3 text-sm text-muted">Activa al menos un tipo para ver el día.</p>
      ) : null}

      <details className="mt-4 rounded-2xl bg-panel">
        <summary className="flex min-h-12 cursor-pointer items-center px-4 text-sm font-semibold">Colores de las materias</summary>
        <div className="px-4 pb-4">
          <Legend />
        </div>
      </details>
    </div>
  );
}

function DayColumn({
  date,
  kinds,
  featured = false,
  selected = false,
}: {
  date: Date;
  kinds: Record<Kind, boolean>;
  featured?: boolean;
  selected?: boolean;
}) {
  const modals = useModals();
  const plan = buildDay(date);
  const items = plan.items.filter((item) => kinds[item.kind]);
  const iso = plan.iso;

  return (
    <section className={cn("min-w-0 overflow-hidden rounded-[1.4rem] bg-ink-2 p-2", selected && "ring-1 ring-accent", featured && "p-3")}>
      <button type="button" onClick={() => modals.openDay(iso)} className="w-full rounded-2xl px-1 py-2 text-left">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-muted">
          {WEEK_LETTERS[(date.getDay() + 6) % 7]}
        </p>
        <h2 className="font-display text-2xl leading-none">{date.getDate()}</h2>
        <p className="mt-1 text-xs font-semibold" style={{ color: sessionColor(plan.session) }}>
          {plan.session.short} · {plan.session.time}
        </p>
      </button>
      {plan.holiday ? <p className="px-1 text-xs leading-relaxed text-warn">{plan.holiday}</p> : null}
      {items.length === 0 ? <p className="px-1 py-3 text-xs text-muted">Nada con estos filtros.</p> : null}
      <ul className="mt-2 space-y-2">
        {items.map((item, index) => (
          <li key={`${item.kind}-${item.start}-${index}`}>
            <AgendaCard item={item} plan={plan} featured={featured} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function AgendaCard({ item, plan, featured }: { item: TimelineItem; plan: DayPlan; featured: boolean }) {
  const modals = useModals();
  if (item.kind === "clase") {
    return (
      <button
        type="button"
        onClick={() => modals.openClass(plan.iso, classKey(item.block))}
        className="w-full rounded-2xl bg-panel px-2 py-2 text-left"
        style={{ boxShadow: `inset 3px 0 0 ${courseColor(item.block.name)}` }}
      >
        <span className="block text-[0.68rem] font-semibold tabular-nums" style={{ color: courseColor(item.block.name) }}>
          {item.block.start}–{item.block.end}
        </span>
        <span className="mt-0.5 block text-sm font-semibold leading-snug">{item.block.name}</span>
        {featured ? <span className="mt-0.5 block text-xs text-muted">{item.block.type} · {placeOf(item.block)}</span> : null}
        {plan.holiday ? <span className="mt-1 block text-xs font-semibold text-warn">Puede suspenderse</span> : null}
      </button>
    );
  }
  if (item.kind === "trabajo") {
    const works = plan.work;
    const number = works.findIndex((block) => block.start === item.start) + 1;
    return (
      <button
        type="button"
        onClick={() => modals.openWork(plan.iso, item.start)}
        className="w-full rounded-2xl bg-work/10 px-2 py-2 text-left ring-1 ring-work/25"
      >
        <span className="block text-[0.68rem] font-semibold text-work">{formatSpan({ start: item.start, end: item.end })}</span>
        <span className="mt-0.5 block text-sm font-semibold">
          Trabajo {number} de {works.length}
        </span>
        {featured ? <span className="mt-0.5 block text-xs text-muted">{formatDuration(item.end - item.start)}</span> : null}
      </button>
    );
  }
  if (item.kind === "gym") {
    const hero = item.session.exercises.find((exercise) => exercise.name !== "Calentamiento") ?? item.session.exercises[0];
    return (
      <button
        type="button"
        onClick={() => modals.openGym(plan.iso)}
        className="w-full overflow-hidden rounded-[1.3rem] bg-panel text-left"
        style={{ boxShadow: `inset 3px 0 0 ${sessionColor(item.session)}` }}
      >
        <ExerciseFigure pose={hero.pose} label={item.session.title} />
        <span className="block px-2 py-2">
        <span className="block text-xs" style={{ color: sessionColor(item.session) }}>
          {item.session.time}
        </span>
        <span className="block text-sm font-semibold leading-snug">{item.session.title}</span>
        </span>
      </button>
    );
  }
  const index = plan.meals.items.findIndex((meal) => meal.time === item.meal.time && meal.role === item.meal.role);
  return (
    <button
      type="button"
      onClick={() => modals.openMeal(plan.date.getDay(), index)}
      className="w-full overflow-hidden rounded-[1.3rem] bg-panel text-left ring-1 ring-meal/25"
    >
      <MealArt ingredients={item.meal.ingredients} label={item.meal.role} />
      <span className="block px-2 py-2">
      <span className="block text-xs font-semibold text-meal">{mealWhen(item.meal)}</span>
      <span className="block text-sm font-semibold leading-snug">{item.meal.role}</span>
      </span>
    </button>
  );
}

function MonthJump({
  year,
  month,
  selected,
  today,
  onMove,
  onChoose,
}: {
  year: number;
  month: number;
  selected: Date;
  today: Date;
  onMove: (delta: number) => void;
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
    <div className="mb-4 rounded-[1.4rem] bg-ink-2 p-3">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-2xl capitalize">{MONTHS[month]}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" className="rounded-2xl" aria-label="Mes anterior" disabled={!canGoPrevMonth(year, month)} onClick={() => onMove(-1)}>
            ‹
          </Button>
          <Button variant="outline" size="icon" className="rounded-2xl" aria-label="Mes siguiente" disabled={!canGoNextMonth(year, month)} onClick={() => onMove(1)}>
            ›
          </Button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-[0.68rem] font-semibold text-muted">
        {WEEK_LETTERS.map((letter) => (
          <div key={letter}>{letter}</div>
        ))}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {cells.map((date, index) => {
          if (!date || !isInRange(date)) return <div key={`vacio-${index}`} className="min-h-11" />;
          const plan = buildDay(date);
          const active = isSameDay(date, selected);
          return (
            <button
              key={toIso(date)}
              type="button"
              onClick={() => onChoose(date)}
              aria-label={formatLong(date)}
              className={cn(
                "flex min-h-11 flex-col items-center justify-center rounded-xl",
                active ? "bg-accent text-ink" : "bg-panel text-cream",
                !active && !isInTerm(date) && "text-muted",
                !active && isSameDay(date, today) && "ring-1 ring-accent",
              )}
            >
              <span className="font-display text-base leading-none">{date.getDate()}</span>
              <span className="mt-1 h-1 w-4 rounded-full" style={{ background: active ? "transparent" : sessionColor(sessionFor(date)) }} />
              {plan.holiday ? <span className="sr-only">feriado</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
