import { COURSE_SHORT, classKey } from "../../data/courses.ts";
import { mealWhen } from "../../data/meals.ts";
import { WEEK_LETTERS, isInRange, isSameDay, toIso } from "../../lib/dates.ts";
import { buildDay, type TimelineItem } from "../../lib/schedule.ts";
import { classInterval, formatClock, formatSpan, parseClock, spanInterval } from "../../lib/time.ts";
import { cn } from "../../lib/utils.ts";
import { useModals } from "../Modals.tsx";

const START_HOUR = 5;
const END_HOUR = 23;
const HOUR_PX = 52;
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);

type Kind = "clase" | "trabajo" | "gym" | "comida";

const KIND_CLASS: Record<Kind, string> = {
  clase: "bg-white/20 text-cream",
  trabajo: "bg-white/10 text-cream ring-1 ring-inset ring-white/30",
  gym: "bg-white/30 text-cream",
  comida: "bg-white/15 text-cream ring-1 ring-inset ring-white/20",
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
}: {
  days: Date[];
  kinds: Record<Kind, boolean>;
  selected: Date;
}) {
  const height = HOURS.length * HOUR_PX;

  return (
    <div className="overflow-x-auto rounded-[var(--radius-row)] ring-1 ring-white/10">
      <div className="min-w-[760px]">
        <div className="grid grid-cols-[3rem_repeat(7,minmax(0,1fr))] border-b border-line bg-ink">
          <div />
          {days.map((date) => {
            const inside = isInRange(date);
            const active = isSameDay(date, selected);
            return (
              <div
                key={toIso(date)}
                className={cn(
                  "border-l border-line px-1 py-1.5 text-center",
                  active && "bg-white/8",
                  !inside && "opacity-35",
                )}
              >
                <p className="text-[0.62rem] font-medium uppercase tracking-wide text-muted">
                  {WEEK_LETTERS[(date.getDay() + 6) % 7]}
                </p>
                <p className={cn("font-display text-lg leading-none", active ? "text-cream" : "text-cream/80")}>
                  {date.getDate()}
                </p>
              </div>
            );
          })}
        </div>
        <div className="relative grid grid-cols-[3rem_repeat(7,minmax(0,1fr))]" style={{ height }}>
          <div className="relative border-r border-line bg-ink">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute right-1 -translate-y-1/2 text-[0.62rem] tabular-nums text-muted"
                style={{ top: (hour - START_HOUR) * HOUR_PX }}
              >
                {formatClock(hour * 60).slice(0, 5)}
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
      className={cn("relative border-l border-line", selected && "bg-white/[0.03]", !inside && "bg-white/[0.02]")}
      style={{
        height,
        backgroundImage: "linear-gradient(to bottom, transparent 51px, var(--color-line) 52px)",
        backgroundSize: `100% ${HOUR_PX}px`,
      }}
    >
      {plan?.holiday ? <span className="sr-only">{plan.holiday}</span> : null}
      {placed.map(({ item, lane, end }) => {
        const top = ((item.start - origin) / 60) * HOUR_PX;
        const blockHeight = Math.max(16, ((end - item.start) / 60) * HOUR_PX - 2);
        const width = `calc(${100 / lanes}% - 3px)`;
        const left = `calc(${(100 / lanes) * lane}% + 1px)`;
        return (
          <button
            key={`${item.kind}-${item.start}-${lane}`}
            type="button"
            onClick={() => openItem(modals, plan!.iso, plan!, item)}
            className={cn(
              "absolute overflow-hidden rounded-[var(--radius-block)] px-1 py-0.5 text-left",
              KIND_CLASS[item.kind],
            )}
            style={{ top: top + 1, height: blockHeight, width, left }}
          >
            <span className="block truncate text-[10px] font-medium leading-tight">{itemLabel(item)}</span>
            {blockHeight >= 32 ? (
              <span className="block truncate text-[9px] leading-tight text-cream/70">{itemMeta(item)}</span>
            ) : null}
          </button>
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
