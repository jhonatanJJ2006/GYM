import { courseColor, modeLabel, placeOf } from "../data/courses.ts";
import { sessionColor } from "../data/sessions.ts";
import type { DayPlan, TimelineItem } from "../lib/schedule.ts";
import { formatClock, formatDuration, formatSpan } from "../lib/time.ts";
import { ExerciseList, MealDetail } from "./Recipe.tsx";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion.tsx";

function stamp(item: TimelineItem): string {
  if (item.kind === "clase") return item.block.start;
  if (item.kind === "comida") return item.meal.time.padStart(5, "0");
  return formatClock(item.start);
}

export function Timeline({ plan }: { plan: DayPlan }) {
  const workCount = plan.items.filter((item) => item.kind === "trabajo").length;

  return (
    <ol className="relative">
      {plan.items.map((item, index) => {
        const workNumber =
          item.kind === "trabajo" ? plan.items.slice(0, index + 1).filter((entry) => entry.kind === "trabajo").length : 0;
        return (
          <li key={`${item.kind}-${item.start}-${index}`} className="grid grid-cols-[3.4rem_1fr] gap-2">
            <time className="pt-4 text-right text-xs font-semibold tabular-nums text-muted">{stamp(item)}</time>
            <div className="relative border-l border-white/10 pb-3 pl-3">
              <span className="absolute -left-[5px] top-5 size-2.5 rounded-full bg-cream" />
              <Event item={item} workNumber={workNumber} workCount={workCount} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function Event({ item, workNumber, workCount }: { item: TimelineItem; workNumber: number; workCount: number }) {
  if (item.kind === "clase") {
    const color = courseColor(item.block.name);
    const extra = [item.block.nrc ? `NRC ${item.block.nrc}` : "", item.block.professor].filter(Boolean).join(" · ");
    const mode = modeLabel(item.block);
    const place = placeOf(item.block);
    const where = mode === "Sin salón" ? `${item.block.type} · ${place}` : `${mode} · ${item.block.type} · ${place}`;
    return (
      <article className="rounded-2xl bg-panel px-3 py-3">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
          Clase · {item.block.start}–{item.block.end}
        </p>
        <h3 className="mt-1 font-display text-lg leading-tight">{item.block.name}</h3>
        <p className="mt-1 text-sm text-cream/80">{where}</p>
        {extra ? <p className="mt-1 text-sm text-muted">{extra}</p> : null}
      </article>
    );
  }

  if (item.kind === "trabajo") {
    return (
      <article className="rounded-2xl bg-work/10 px-3 py-3 ring-1 ring-work/20">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-work">
          Trabajo · {formatSpan({ start: item.start, end: item.end })}
        </p>
        <h3 className="mt-1 font-display text-lg leading-tight">
          Bloque {workNumber} de {workCount}
        </h3>
        <p className="mt-1 text-sm text-cream/80">
          {formatDuration(item.end - item.start)}. Hueco libre: no coincide con una clase ni con el gym.
        </p>
      </article>
    );
  }

  if (item.kind === "gym") {
    const color = sessionColor(item.session);
    return (
      <article className="rounded-2xl bg-panel px-3 py-3" style={{ boxShadow: `inset 3px 0 0 ${color}` }}>
        <Accordion type="single" collapsible>
          <AccordionItem value="gym" className="border-0">
            <AccordionTrigger className="min-h-14">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em]" style={{ color }}>
                Gym · {item.session.time}
              </p>
              <h3 className="mt-1 font-display text-lg leading-tight">{item.session.title}</h3>
              <p className="mt-1 text-sm text-muted">Abrir ejercicios · {item.session.minutesLabel}</p>
            </AccordionTrigger>
            <AccordionContent>
              <p className="mb-2 text-sm leading-relaxed text-cream/80">{item.session.note}</p>
              <ExerciseList exercises={item.session.exercises} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </article>
    );
  }

  return (
    <article className="rounded-2xl bg-meal/10 px-3 py-3 ring-1 ring-meal/20">
      <Accordion type="single" collapsible>
        <AccordionItem value="meal" className="border-0">
          <AccordionTrigger className="min-h-14">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-meal">Comida · {item.meal.time}</p>
            <h3 className="mt-1 font-display text-lg leading-tight">{item.meal.role}</h3>
            <p className="mt-1 text-sm text-muted">
              ~{item.meal.kcal} kcal · ~{item.meal.protein} g de proteína
            </p>
          </AccordionTrigger>
          <AccordionContent>
            <MealDetail meal={item.meal} />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </article>
  );
}
