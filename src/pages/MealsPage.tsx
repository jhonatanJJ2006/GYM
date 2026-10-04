import { useEffect, useState } from "react";
import { PageIntro } from "../components/Brand.tsx";
import { useModals } from "../components/Modals.tsx";
import { CompactRow } from "../components/system/CompactRow.tsx";
import { MealThumb } from "../components/system/Thumbnail.tsx";
import { Button } from "../components/ui/button.tsx";
import { MEALS, WEEKDAY_MEAL_ORDER, mealWhen } from "../data/meals.ts";
import { DISCLAIMER, KCAL_INTRO, KCAL_POINTS, PROFILE, SHOPPING, SHOPPING_NOTE } from "../data/nutrition.ts";
import { DOW_LONG, initialIso, parseIso } from "../lib/dates.ts";
import { cn } from "../lib/utils.ts";

const LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
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
  const [dow, setDow] = useState(() => parseIso(initialIso()).getDay());
  const [checks, setChecks] = useState<boolean[]>(readChecks);
  const day = MEALS[dow];
  const done = checks.filter(Boolean).length;

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
        <div className="rounded-row border border-line bg-panel px-3 py-3">
          <dt className="text-xs text-muted">Kcal</dt>
          <dd className="mt-1 font-display text-2xl leading-none text-[var(--color-mark)]">{PROFILE.kcal}</dd>
        </div>
        <div className="rounded-row border border-line bg-panel px-3 py-3">
          <dt className="text-xs text-muted">Proteína</dt>
          <dd className="mt-1 font-display text-2xl leading-none text-[var(--color-mark)]">{PROFILE.protein} g</dd>
        </div>
        <div className="rounded-row border border-line bg-panel px-3 py-3">
          <dt className="text-xs text-muted">IMC</dt>
          <dd className="mt-1 font-display text-2xl leading-none text-[var(--color-mark)]">~{PROFILE.bmi}</dd>
        </div>
      </dl>

      <section data-rise className="mt-8">
        <h2 className="font-display text-2xl tracking-tight text-[var(--color-mark)]">Hoy en el plato</h2>
        <p className="mt-1 text-sm text-muted">
          El desayuno es de 5:30 a 6:00. El jueves el pre-entreno sigue a las 19:00.
        </p>
        <div
          className="mt-3 grid grid-cols-7 gap-1"
          role="group"
          aria-label="Día de comidas"
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
            const value = WEEKDAY_MEAL_ORDER[next];
            if (value != null) setDow(value);
          }}
        >
          {WEEKDAY_MEAL_ORDER.map((value, index) => (
            <button
              key={value}
              type="button"
              aria-pressed={dow === value}
              onClick={() => setDow(value)}
              className={cn(
                "min-h-10 rounded-row text-xs font-medium",
                dow === value ? "bg-panel-2 text-cream ring-1 ring-cream" : "text-muted",
              )}
            >
              {LABELS[index]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-cream/85">
          {DOW_LONG[dow].replace(/^./, (letter) => letter.toUpperCase())} · ~{day.total}
        </p>
        <ul className="mt-3 space-y-1">
          {day.items.map((meal, index) => (
            <li key={`${dow}-${meal.time}-${meal.role}`}>
              <CompactRow
                title={meal.role}
                meta={mealWhen(meal)}
                thumb={<MealThumb ingredients={meal.ingredients} />}
                className="shadow-[inset_3px_0_0_var(--color-rail-meal)]"
                onClick={() => modals.openMeal(dow, index)}
              />
            </li>
          ))}
        </ul>
      </section>

      <section data-rise className="mt-8">
        <h2 className="font-display text-2xl tracking-tight text-[var(--color-mark)]">De dónde salen las 2800 kcal</h2>
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
          <h2 className="font-display text-2xl tracking-tight text-[var(--color-mark)]">Compra de la semana</h2>
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

      <p className="mt-6 text-sm leading-relaxed text-muted">{DISCLAIMER}</p>
    </div>
  );
}
