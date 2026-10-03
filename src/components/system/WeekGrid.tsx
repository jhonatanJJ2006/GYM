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
  clase: "bg-block-class text-cream",
  trabajo: "bg-block-work text-cream ring-1 ring-inset ring-line",
  gym: "bg-block-gym text-cream",
  comida: "bg-block-meal text-cream ring-1 ring-inset ring-line",
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

  return (
    <div className="overflow-x-auto rounded-row border border-line bg-ink">
      <div className="min-w-[760px]">
        <div className="sticky top-0 z-10 grid grid-cols-[3.25rem_repeat(7,minmax(0,1fr))] border-b border-line bg-ink">
          <div />
          {days.map((date) => {
            const inside = isInRange(date);
            const active = isSameDay(date, selected);
            const isToday = isSameDay(date, today);
            return (
              <button
                key={toIso(date)}
                type="button"
                disabled={!inside}
                onClick={() => onSelect(date)}
                className={cn(
                  "border-l border-line px-1 py-2 text-center",
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
        <div className="relative grid grid-cols-[3.25rem_repeat(7,minmax(0,1fr))]" style={{ height }}>
          <div className="relative border-r border-line bg-ink">
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
      className={cn("relative border-l border-line", selected && "bg-wash", !inside && "opacity-40")}
      style={{
        height,
        backgroundImage: "linear-gradient(to bottom, transparent calc(100% - 1px), var(--color-line) calc(100% - 1px))",
        backgroundSize: `100% ${HOUR_PX}px`,
      }}
    >
      {plan?.holiday ? <span className="sr-only">{plan.holiday}</span> : null}
      {placed.map(({ item, lane, end }, index) => {
        const top = ((item.start - origin) / 60) * HOUR_PX;
        const blockHeight = Math.max(16, ((end - item.start) / 60) * HOUR_PX - 2);
        const width = `calc(${100 / lanes}% - 3px)`;
        const left = `calc(${(100 / lanes) * lane}% + 1px)`;
        return (
          <button
            key={`${item.kind}-${item.start}-${index}`}
            type="button"
            onClick={() => openItem(modals, plan!.iso, plan!, item)}
            className={cn(
              "absolute overflow-hidden rounded-block px-1 py-0.5 text-left",
              KIND_CLASS[item.kind],
            )}
            style={{ top: top + 1, height: blockHeight, width, left }}
          >
            <span className="block truncate text-[10px] font-medium leading-tight">{itemLabel(item)}</span>
            {blockHeight >= 32 ? (
              <span className="block truncate text-[9px] leading-tight text-muted">{itemMeta(item)}</span>
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
