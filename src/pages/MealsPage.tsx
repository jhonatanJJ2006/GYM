import { useEffect, useState } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { useModals } from "../components/Modals.tsx";
import { MonthPicker, PeriodBar, useHorizon } from "../components/PeriodBar.tsx";
import { Expand, useStagger } from "../components/Motion.tsx";
import { MealThumb } from "../components/system/Thumbnail.tsx";
import { Button } from "../components/ui/button.tsx";
import { MEALS, mealWhen, type Meal } from "../data/meals.ts";
import { DISCLAIMER, KCAL_INTRO, KCAL_POINTS, PROFILE, SHOPPING, SHOPPING_NOTE } from "../data/nutrition.ts";
import { DOW_LONG, toIso } from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";

const STORAGE_KEY = "hierro-compra";

function readChecks(): boolean[] {
  const empty = Array.from({ length: SHOPPING.length }, () => false);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty;
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed) || parsed.length !== SHOPPING.length) return empty;
    return parsed.map((value) => value === true);
  } catch {
    return empty;
  }
}

export function MealsPage() {
  const modals = useModals();
  const horizon = useHorizon();
  const [checks, setChecks] = useState<boolean[]>(readChecks);
  const done = checks.filter(Boolean).length;
  const shown = horizon.view === "semana" ? horizon.week : [horizon.date];
  const listRef = useStagger<HTMLDivElement>(`${horizon.view}-${toIso(horizon.date)}`);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(checks));
  }, [checks]);

  return (
    <div>
      <PageIntro title="Comidas">
        Meta ~{PROFILE.kcal} kcal y {PROFILE.protein} g de proteína. Estimación para {PROFILE.weightKg} kg y{" "}
        {PROFILE.heightM} m, IMC ~{PROFILE.bmi}.
      </PageIntro>

      <dl data-rise className="mt-5 grid grid-cols-3 gap-2">
        <div className="card px-3 py-3">
          <dt className="text-xs text-muted">Kcal</dt>
          <dd className="mt-1 font-display text-2xl leading-none text-[var(--color-mark)]">{PROFILE.kcal}</dd>
        </div>
        <div className="card px-3 py-3">
          <dt className="text-xs text-muted">Proteína</dt>
          <dd className="mt-1 font-display text-2xl leading-none text-[var(--color-mark)]">{PROFILE.protein} g</dd>
        </div>
        <div className="card px-3 py-3">
          <dt className="text-xs text-muted">IMC</dt>
          <dd className="mt-1 font-display text-2xl leading-none text-[var(--color-mark)]">~{PROFILE.bmi}</dd>
        </div>
      </dl>

      <PeriodBar
        label="comidas"
        date={horizon.date}
        view={horizon.view}
        atStart={horizon.atStart}
        atEnd={horizon.atEnd}
        onDate={horizon.setDate}
        onView={horizon.setView}
        onStep={horizon.step}
      />

      {horizon.view === "mes" ? <MonthPicker date={horizon.date} onChoose={horizon.setDate} caption={() => "plato"} /> : null}

      <section data-rise className="mt-8">
        <h2 className="display-title text-2xl">En el plato</h2>
        <p className="mt-1 text-sm text-muted">
          Estimación, no consejo médico. Lunes, jueves y viernes: pre-entreno ligero 6:15–6:30 en casa y post-entreno
          para llevar (tupper preparado la noche anterior) a las 9:00, antes de las clases de las 10:00. Martes,
          miércoles y fin de semana: desayuno 5:30–6:00. Meta ~{PROFILE.kcal} kcal y {PROFILE.protein} g de proteína.
        </p>
        <div ref={listRef} className={horizon.view === "semana" ? "mt-4 grid gap-4 xl:grid-cols-2" : "mt-4"}>
          {shown.map((item) => {
            const itemDow = item.getDay();
            const menu = MEALS[itemDow];
            return (
              <div key={toIso(item)} data-day-panel>
                <p className="text-sm font-semibold text-cream/85">
                  {DOW_LONG[itemDow].replace(/^./, (letter) => letter.toUpperCase())} {item.getDate()} · ~{menu.total}
                </p>
                <ul className={cn("mt-2 space-y-2", horizon.view !== "semana" && "lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 2xl:grid-cols-3")}>
                  {menu.items.map((meal, index) => (
                    <li key={`${toIso(item)}-${meal.time}-${meal.role}`} data-stagger>
                      <MealCard meal={meal} onOpen={() => modals.openMeal(itemDow, index)} />
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </section>

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
      <section data-rise className="mt-8">
        <h2 className="display-title text-2xl">De dónde salen las 2800 kcal</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{KCAL_INTRO}</p>
        <ol className="mt-4 space-y-3">
          {KCAL_POINTS.map((point, index) => (
            <li key={point.lead} className="grid grid-cols-[1.8rem_1fr] gap-2 text-sm leading-relaxed">
              <span className="font-display text-[var(--color-mark)]">{index + 1}</span>
              <span>
                <span className="font-semibold">{point.lead} </span>
                {point.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section data-rise className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="display-title text-2xl">Compra de la semana</h2>
          <Button
            variant="ghost"
            className="h-11 px-3 text-xs"
            onClick={() => setChecks(Array.from({ length: SHOPPING.length }, () => false))}
          >
            Vaciar
          </Button>
        </div>
        <p className="mt-1 text-sm text-muted">
          {SHOPPING_NOTE} {done} de {SHOPPING.length} marcados.
        </p>
        <ul className="mt-3 overflow-hidden rounded-row border border-line bg-panel">
          {SHOPPING.map((row, index) => (
            <li key={row.item} className="border-b border-line last:border-0">
              <label className="flex min-h-14 items-center gap-3 px-3">
                <input
                  type="checkbox"
                  className="size-5 shrink-0 accent-accent"
                  checked={checks[index] ?? false}
                  onChange={() =>
                    setChecks((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)))
                  }
                />
                <span className="min-w-0 py-2">
                  <span className={cn("block text-sm font-semibold", checks[index] && "text-muted line-through")}>
                    {row.item}
                  </span>
                  <span className="block text-sm text-muted">{row.amount}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-muted">{DISCLAIMER}</p>
    </div>
  );
}

function MealCard({ meal, onOpen }: { meal: Meal; onOpen: () => void }) {
  const [open, setOpen] = useState(false);
  const takeaway = /para llevar/i.test(meal.role);
  return (
    <article className="card overflow-hidden border-l-4 border-l-[#ff9f43] p-3">
      <div className="flex items-start gap-3">
        <button type="button" onClick={onOpen} className="shrink-0" aria-label={`Ver ${meal.role}`}>
          <MealThumb ingredients={meal.ingredients} />
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" onClick={onOpen} className="min-w-0 break-words text-left text-sm font-bold leading-snug text-cream">
              {meal.role}
            </button>
            {takeaway ? <span className="chip chip-sky">Para llevar</span> : null}
          </div>
          <p className="mt-0.5 text-xs text-muted">{mealWhen(meal)}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <span className="chip chip-orange">{meal.kcal} kcal</span>
            <span className="chip chip-lime">{meal.protein} g proteína</span>
          </div>
        </div>
      </div>
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="mt-3 flex w-full items-center justify-between rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-cream/85"
      >
        {open ? "Ocultar receta" : "Ingredientes y pasos"}
        <span className={cn("transition-transform duration-300", open && "rotate-180")}>▾</span>
      </button>
      <Expand open={open}>
        <div className="grid gap-3 pt-3 text-sm sm:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#f0b08a]">Ingredientes</p>
            <ul className="mt-1 list-disc space-y-0.5 pl-4 text-cream/85">
              {meal.ingredients.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-[#f0b08a]">Pasos</p>
            <ol className="mt-1 list-decimal space-y-0.5 pl-4 text-cream/85">
              {meal.steps.map((entry) => (
                <li key={entry}>{entry}</li>
              ))}
            </ol>
          </div>
        </div>
      </Expand>
    </article>
  );
}
