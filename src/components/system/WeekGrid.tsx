import { COURSE_SHORT, classKey } from "../../data/courses.ts";
import { mealWhen } from "../../data/meals.ts";
import { exercisePhoto, mealPhoto } from "../../data/photos.ts";
import { WEEK_LETTERS, formatLong, isInRange, isSameDay, toIso } from "../../lib/dates.ts";
import { useEffect, useRef, type KeyboardEvent } from "react";
import { animate, stagger } from "animejs";
import { buildDay, type TimelineItem } from "../../lib/schedule.ts";
import { classInterval, formatClock, formatSpan, parseClock, spanInterval } from "../../lib/time.ts";
import { cn } from "../../lib/utils.ts";
import { useModals } from "../Modals.tsx";

const START_HOUR = 5;
const END_HOUR = 25;
const HOUR_PX = 52;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

type Kind = "clase" | "trabajo" | "gym" | "comida";

const KIND_NAME: Record<Kind, string> = { clase: "Clase", trabajo: "Trabajo", gym: "Gym", comida: "Comida" };

const KIND_CLASS: Record<Kind, string> = {
  clase: "bg-block-class text-cream shadow-[inset_3px_0_0_var(--color-rail-class)]",
  trabajo: "bg-block-work text-cream shadow-[inset_3px_0_0_var(--color-rail-work)]",
  gym: "bg-block-gym text-cream shadow-[inset_3px_0_0_var(--color-rail-gym)]",
  comida: "bg-block-meal text-cream shadow-[inset_3px_0_0_var(--color-rail-meal)]",
};

function itemEnd(item: TimelineItem): number {
  if (item.kind === "clase") return classInterval(item.block.start, item.block.end).end;
  if (item.kind === "gym") return spanInterval(item.session.time).end;
  if (item.kind === "trabajo") return item.end;
  return item.meal.end ? parseClock(item.meal.end) : item.start + 25;
}

function itemLabel(item: TimelineItem): string {
  if (item.kind === "clase") return COURSE_SHORT[item.block.name];
  if (item.kind === "trabajo") return "Trabajo";
  if (item.kind === "gym") return item.session.title.split(/[·+]/)[0]?.trim() || item.session.title;
  return item.meal.role;
}

function itemThumb(item: TimelineItem): string | null {
  if (item.kind === "comida") return mealPhoto(item.meal.ingredients).src;
  if (item.kind === "gym") {
    const exercise = item.session.exercises.find((entry) => entry.name !== "Calentamiento") ?? item.session.exercises[0];
    const photo = exercise ? exercisePhoto(exercise.pose, exercise.name) : null;
    return photo?.src ?? null;
  }
  return null;
}

function itemMeta(item: TimelineItem): string {
  if (item.kind === "clase") return `${item.block.start}`;
  if (item.kind === "comida") return mealWhen(item.meal);
  return formatSpan({ start: item.start, end: itemEnd(item) });
}

function placeLanes(items: TimelineItem[]) {
  const sorted = [...items].sort((a, b) => a.start - b.start || itemEnd(a) - itemEnd(b));
  const laneEnds: number[] = [];
  const placed: { item: TimelineItem; lane: number; end: number }[] = [];
  for (const item of sorted) {
    const end = itemEnd(item);
    let lane = laneEnds.findIndex((value) => value <= item.start + 1);
    if (lane < 0) {
      lane = laneEnds.length;
      laneEnds.push(end);
    } else {
      laneEnds[lane] = end;
    }
    placed.push({ item, lane, end });
  }
  return { placed, lanes: Math.max(1, laneEnds.length) };
}

export function WeekGrid({
  days,
  kinds,
  selected,
  today,
  onSelect,
}: {
  days: Date[];
  kinds: Record<Kind, boolean>;
  selected: Date;
  today: Date;
  onSelect: (date: Date) => void;
}) {
  const height = HOURS.length * HOUR_PX;

  const headerRef = useRef<HTMLDivElement>(null);

  function onHeaderKey(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    const buttons = [...(headerRef.current?.querySelectorAll<HTMLButtonElement>("button") ?? [])].filter(
      (button) => !button.disabled,
    );
    const index = buttons.indexOf(event.currentTarget);
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
    const target = buttons[next];
    if (!target) return;
    target.focus();
    const iso = target.dataset.iso;
    if (iso) {
      const [year, month, day] = iso.split("-").map(Number);
      onSelect(new Date(year, month - 1, day));
    }
  }

  function onGridKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button[data-block]")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0 || buttons.length === 0) return;
    const day = buttons[index]?.dataset.day;
    const same = buttons.filter((button) => button.dataset.day === day);
    const pos = same.indexOf(buttons[index]!);
    const daysInGrid = [...new Set(buttons.map((button) => button.dataset.day))];
    const dayIndex = daysInGrid.indexOf(day);
    let next: HTMLButtonElement | undefined;
    if (event.key === "ArrowDown") next = same[pos + 1] ?? same[0];
    if (event.key === "ArrowUp") next = same[pos - 1] ?? same[same.length - 1];
    if (event.key === "Home") next = same[0];
    if (event.key === "End") next = same[same.length - 1];
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      const neighbor =
        event.key === "ArrowRight"
          ? daysInGrid[(dayIndex + 1) % daysInGrid.length]
          : daysInGrid[(dayIndex - 1 + daysInGrid.length) % daysInGrid.length];
      const column = buttons.filter((button) => button.dataset.day === neighbor);
      next = column[Math.min(pos, column.length - 1)] ?? column[0];
    }
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  const cols = days.length === 1 ? "grid-cols-[2.75rem_minmax(0,1fr)]" : "grid-cols-[2.5rem_repeat(7,minmax(0,1fr))]";

  return (
    <div
      className="w-full min-w-0 rounded-row border border-grid bg-ink"
      role="region"
      aria-label={days.length === 1 ? "Calendario del día" : "Calendario semanal"}
      onKeyDown={onGridKey}
    >
      <div className="w-full min-w-0">
        <div ref={headerRef} className={cn("sticky top-0 z-10 grid border-b border-grid bg-ink", cols)}>
          <div />
          {days.map((date) => {
            const inside = isInRange(date);
            const active = isSameDay(date, selected);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={toIso(date)}
                type="button"
                data-iso={toIso(date)}
                disabled={!inside}
                aria-current={active ? "date" : undefined}
                aria-label={formatLong(date)}
                onClick={() => onSelect(date)}
                onKeyDown={onHeaderKey}
                className={cn(
                  "border-l border-grid px-1 py-2 text-center",
                  active && "bg-wash",
                  !inside && "opacity-35",
                )}
              >
                <span className="block text-[0.62rem] font-medium uppercase tracking-wide text-muted">
                  {WEEK_LETTERS[(date.getDay() + 6) % 7]}
                </span>
                <span
                  className={cn(
                    "mx-auto mt-1 grid size-7 place-items-center font-display text-base leading-none",
                    active && "rounded-full bg-cream text-ink",
                    !active && isToday && "rounded-full ring-1 ring-cream text-cream",
                    !active && !isToday && "text-cream/80",
                  )}
                >
                  {date.getDate()}
                </span>
              </button>
            );
          })}
        </div>
        <div className={cn("relative grid", cols)} style={{ height }}>
          <div className="relative border-r border-grid bg-ink">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute inset-x-0 pr-1.5 text-right text-[0.62rem] tabular-nums leading-none text-muted"
                style={{ top: (hour - START_HOUR) * HOUR_PX + 4 }}
              >
                {formatClock(hour * 60)}
              </div>
            ))}
          </div>
          {days.map((date) => (
            <DayColumn key={toIso(date)} date={date} kinds={kinds} selected={isSameDay(date, selected)} height={height} />
          ))}
        </div>
      </div>
    </div>
  );
}

function DayColumn({
  date,
  kinds,
  selected,
  height,
}: {
  date: Date;
  kinds: Record<Kind, boolean>;
  selected: boolean;
  height: number;
}) {
  const modals = useModals();
  const inside = isInRange(date);
  const plan = inside ? buildDay(date) : null;
  const items = plan?.items.filter((item) => kinds[item.kind]) ?? [];
  const { placed, lanes } = placeLanes(items);
  const origin = START_HOUR * 60;

  return (
    <div
      className={cn("relative border-l border-grid", selected && "bg-wash", !inside && "opacity-40")}
      style={{
        height,
        backgroundImage: "linear-gradient(to bottom, transparent calc(100% - 1px), var(--color-grid) calc(100% - 1px))",
        backgroundSize: `100% ${HOUR_PX}px`,
      }}
    >
      {plan?.holiday ? <span className="sr-only">{plan.holiday}</span> : null}
      {placed.map(({ item, lane, end }, index) => {
        const top = ((item.start - origin) / 60) * HOUR_PX;
        const blockHeight = Math.max(16, ((end - item.start) / 60) * HOUR_PX - 2);
        const width = `calc(${100 / lanes}% - 3px)`;
        const left = `calc(${(100 / lanes) * lane}% + 1px)`;
        const thumb = itemThumb(item);
        return (
          <button
            key={`${item.kind}-${item.start}-${index}`}
            type="button"
            data-block
            data-day={toIso(date)}
            aria-label={`${formatLong(date)}, ${itemLabel(item)}, ${itemMeta(item)}`}
            onClick={() => openItem(modals, plan!.iso, plan!, item)}
            data-rise
            className={cn(
              "week-block absolute overflow-hidden rounded-block py-0.5 pl-1.5 pr-1 text-left",
              KIND_CLASS[item.kind],
            )}
            style={{ top: top + 1, height: blockHeight, width, left }}
          >
            <span className="flex min-w-0 items-start gap-1">
              {thumb ? (
                <img src={thumb} alt="" className="mt-px size-4 shrink-0 rounded-[3px] object-cover" />
              ) : null}
              <span className="min-w-0">
                <span className="block truncate text-[10px] font-medium leading-tight">{itemLabel(item)}</span>
                {blockHeight >= 32 ? (
                  <span className="block truncate text-[9px] leading-tight text-cream/80">{itemMeta(item)}</span>
                ) : null}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}


function agendaTimes(item: TimelineItem): { start: string; end: string | null } {
  if (item.kind === "clase") return { start: item.block.start, end: item.block.end };
  if (item.kind === "trabajo") return { start: formatClock(item.start), end: formatClock(item.end) };
  if (item.kind === "gym") return { start: formatClock(item.start), end: formatClock(item.end) };
  return { start: item.meal.time, end: item.meal.end ?? null };
}

function agendaLabel(item: TimelineItem): string {
  if (item.kind === "clase") return item.block.name;
  if (item.kind === "trabajo") return "Trabajo";
  if (item.kind === "gym") {
    return item.conflicts.length ? `${item.session.title} · ${item.conflicts.join(" · ")}` : item.session.title;
  }
  return item.meal.role;
}

export function DayAgenda({ day, kinds }: { day: Date; kinds: Record<Kind, boolean> }) {
  const modals = useModals();
  const plan = isInRange(day) ? buildDay(day) : null;
  const items = (plan?.items.filter((item) => kinds[item.kind]) ?? []).slice().sort((a, b) => a.start - b.start || itemEnd(a) - itemEnd(b));
  const listRef = useRef<HTMLOListElement>(null);
  const dayKey = toIso(day);
  useEffect(() => {
    const nodes = listRef.current?.querySelectorAll("[data-tl]");
    if (!nodes || nodes.length === 0) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const anim = animate(nodes, {
      opacity: [0, 1],
      translateX: [-14, 0],
      duration: 480,
      delay: stagger(55),
      ease: "outCubic",
    });
    return () => {
      anim.revert();
    };
  }, [dayKey, items.length]);

  function onKey(event: KeyboardEvent<HTMLOListElement>) {
    if (!["ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) return;
    const buttons = [...event.currentTarget.querySelectorAll<HTMLButtonElement>("button")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (index < 0 || buttons.length === 0) return;
    const next =
      event.key === "Home"
        ? buttons[0]
        : event.key === "End"
          ? buttons[buttons.length - 1]
          : event.key === "ArrowDown"
            ? (buttons[index + 1] ?? buttons[0])
            : (buttons[index - 1] ?? buttons[buttons.length - 1]);
    if (!next) return;
    event.preventDefault();
    next.focus();
  }

  return (
    <div className="w-full min-w-0" role="region" aria-label="Agenda del día">
      {plan?.holiday ? <p className="mb-2 text-sm leading-relaxed text-muted">{plan.holiday}</p> : null}
      {items.length === 0 ? (
        <p className="rounded-row border border-line bg-panel px-3 py-3 text-sm text-muted">Nada con estos filtros.</p>
      ) : (
        <ol ref={listRef} className="relative space-y-3 pl-1" onKeyDown={onKey}>
          <span aria-hidden className="pointer-events-none absolute bottom-2 left-[4.6rem] top-2 w-px bg-gradient-to-b from-white/5 via-white/15 to-white/5" />
          {items.map((item, index) => {
            const times = agendaTimes(item);
            const label = agendaLabel(item);
            const thumb = itemThumb(item);
            const when = times.end ? `${times.start} a ${times.end}` : times.start;
            const clash = item.kind === "gym" && plan!.gymConflicts.length > 0;
            return (
              <li key={`${item.kind}-${item.start}-${index}`} data-tl className="relative grid min-w-0 grid-cols-[4.25rem_minmax(0,1fr)] items-start gap-3">
                <p className="pt-2 text-right font-display text-xs tabular-nums leading-tight text-[var(--color-mark)]">
                  <span className="block text-sm font-bold text-cream">{times.start}</span>
                  {times.end ? <span className="mt-0.5 block text-muted">{times.end}</span> : null}
                </p>
                <span aria-hidden className={cn("absolute left-[4.6rem] top-3 size-2.5 -translate-x-1/2 rounded-full ring-4 ring-[var(--color-ink,#0b0b0d)]", `tl-dot-${item.kind}`)} />
                <button
                  type="button"
                  data-block
                  className={cn(
                    "tl-block week-block flex min-h-12 min-w-0 flex-col items-stretch gap-1 rounded-2xl border border-white/5 px-3 py-2.5 text-left text-cream",
                    `tl-${item.kind}`,
                    clash && "ring-1 ring-red-500/60",
                  )}
                  aria-label={`${formatLong(day)}, ${label}, ${when}`}
                  onClick={() => openItem(modals, plan!.iso, plan!, item)}
                >
                  <span className="flex min-w-0 items-start gap-2">
                    {thumb ? <img src={thumb} alt="" className="mt-0.5 size-5 shrink-0 rounded-md object-cover" /> : null}
                    <span className="min-w-0 flex-1 break-words text-sm font-semibold leading-snug">{label}</span>
                  </span>
                  <span className="text-[0.68rem] font-medium uppercase tracking-wider text-muted">{KIND_NAME[item.kind]} · {when}</span>
                  {clash ? (
                    <span className="mt-1 inline-flex w-fit items-center gap-1 rounded-full border border-amber-400/40 bg-red-500/15 px-2 py-0.5 text-[0.68rem] font-bold text-amber-300">
                      ⚠ Choca con {plan!.gymConflicts.join(", ")}
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

export function WeekAgenda({
  days,
  kinds,
  selected,
  onSelect,
}: {
  days: Date[];
  kinds: Record<Kind, boolean>;
  selected: Date;
  onSelect: (date: Date) => void;
}) {
  const modals = useModals();
  return (
    <div className="w-full min-w-0 space-y-3">
      {days.map((date) => {
        const inside = isInRange(date);
        if (!inside) return null;
        const plan = buildDay(date);
        const items = plan.items.filter((item) => kinds[item.kind]);
        const active = isSameDay(date, selected);
        return (
          <section data-rise key={toIso(date)} className={cn("min-w-0 rounded-row border border-grid", active && "bg-wash")}>
            <button
              type="button"
              onClick={() => onSelect(date)}
              aria-current={active ? "date" : undefined}
              className="flex w-full items-baseline justify-between gap-2 px-3 py-2 text-left"
            >
              <span className="text-sm font-medium">{formatLong(date)}</span>
              <span className="text-[0.62rem] uppercase tracking-wide text-muted">{WEEK_LETTERS[(date.getDay() + 6) % 7]}</span>
            </button>
            {plan.holiday ? <p className="px-3 pb-2 text-xs text-muted">{plan.holiday}</p> : null}
            {items.length === 0 ? <p className="px-3 pb-3 text-xs text-muted">Nada con estos filtros.</p> : null}
            <ul className="space-y-1 px-2 pb-2">
              {items.map((item, index) => {
                const thumb = itemThumb(item);
                return (
                  <li key={`${item.kind}-${item.start}-${index}`}>
                    <button
                      type="button"
                      onClick={() => openItem(modals, plan.iso, plan, item)}
                      className={cn(
                        "flex w-full min-w-0 items-center gap-2 rounded-block px-2 py-1.5 text-left",
                        KIND_CLASS[item.kind],
                      )}
                    >
                      {thumb ? <img src={thumb} alt="" className="size-4 shrink-0 rounded-[3px] object-cover" /> : null}
                      <span className="min-w-0 flex-1 truncate text-sm font-medium">{itemLabel(item)}</span>
                      <span className="shrink-0 text-xs tabular-nums text-cream/80">{itemMeta(item)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function openItem(
  modals: ReturnType<typeof useModals>,
  iso: string,
  plan: NonNullable<ReturnType<typeof buildDay>>,
  item: TimelineItem,
) {
  if (item.kind === "clase") {
    modals.openClass(iso, classKey(item.block));
    return;
  }
  if (item.kind === "trabajo") {
    modals.openWork(iso, item.start);
    return;
  }
  if (item.kind === "gym") {
    modals.openGym(iso);
    return;
  }
  const index = plan.meals.items.findIndex((meal) => meal.time === item.meal.time && meal.role === item.meal.role);
  modals.openMeal(plan.date.getDay(), index);
}
