import { useEffect, useState } from "react";
import { MealArt } from "../components/MealArt.tsx";
import { useModals } from "../components/Modals.tsx";
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
      <p className="font-display text-sm tracking-wide text-muted">Hierro</p>
      <h1 className="font-display text-[2.6rem] leading-none tracking-tight">Comidas</h1>
      <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted">
        Meta ~{PROFILE.kcal} kcal y {PROFILE.protein} g de proteína. Estimación para {PROFILE.weightKg} kg y{" "}
        {PROFILE.heightM} m, IMC ~{PROFILE.bmi}.
      </p>

      <dl className="mt-5 grid grid-cols-3 gap-2">
        <div className="rounded-[1.4rem] bg-accent px-3 py-4 text-ink">
          <dt className="text-sm font-semibold">Kcal</dt>
          <dd className="font-display text-3xl leading-none">{PROFILE.kcal}</dd>
        </div>
        <div className="rounded-[1.4rem] bg-panel px-3 py-4 ring-1 ring-white/8">
          <dt className="text-sm text-muted">Proteína</dt>
          <dd className="font-display text-3xl leading-none">{PROFILE.protein} g</dd>
        </div>
        <div className="rounded-[1.4rem] bg-panel px-3 py-4 ring-1 ring-white/8">
          <dt className="text-sm text-muted">IMC</dt>
          <dd className="font-display text-3xl leading-none">~{PROFILE.bmi}</dd>
        </div>
      </dl>

      <section className="mt-8">
        <h2 className="font-display text-2xl tracking-tight">Hoy en el plato</h2>
        <p className="mt-1 text-sm text-muted">
          El desayuno es de 5:30 a 6:00. El jueves el pre-entreno sigue a las 19:00.
        </p>
        <div className="mt-3 grid grid-cols-7 gap-1">
          {WEEKDAY_MEAL_ORDER.map((value, index) => (
            <button
              key={value}
              type="button"
              aria-pressed={dow === value}
              onClick={() => setDow(value)}
              className={cn(
                "min-h-12 rounded-2xl text-xs font-semibold",
                dow === value ? "bg-accent text-ink" : "bg-panel text-cream",
              )}
            >
              {LABELS[index]}
            </button>
          ))}
        </div>
        <p className="mt-3 text-sm text-cream/85">
          {DOW_LONG[dow].replace(/^./, (letter) => letter.toUpperCase())} · ~{day.total}
        </p>
        <ul className="mt-3 space-y-2">
          {day.items.map((meal, index) => (
            <li key={`${dow}-${meal.time}-${meal.role}`}>
              <button
                type="button"
                onClick={() => modals.openMeal(dow, index)}
                className="w-full overflow-hidden rounded-[1.6rem] bg-panel text-left ring-1 ring-white/8"
              >
                <MealArt ingredients={meal.ingredients} label={meal.role} />
                <span className="block px-4 py-4">
                  <span className="block text-sm text-meal">{mealWhen(meal)}</span>
                  <span className="mt-1 block font-display text-2xl leading-tight">{meal.role}</span>
                  <span className="text-sm text-muted">
                    ~{meal.kcal} kcal · ~{meal.protein} g
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="font-display text-2xl tracking-tight">De dónde salen las 2800 kcal</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">{KCAL_INTRO}</p>
        <ol className="mt-4 space-y-3">
          {KCAL_POINTS.map((point, index) => (
            <li key={point.lead} className="grid grid-cols-[1.8rem_1fr] gap-2 text-sm leading-relaxed">
              <span className="font-display text-accent">{index + 1}</span>
              <span>
                <span className="font-semibold">{point.lead} </span>
                {point.text}
              </span>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-8">
        <div className="flex items-end justify-between gap-3">
          <h2 className="font-display text-2xl tracking-tight">Compra de la semana</h2>
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
        <ul className="mt-3 overflow-hidden rounded-[1.4rem] bg-panel">
          {SHOPPING.map((row, index) => (
            <li key={row.item} className="border-b border-white/8 last:border-0">
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
