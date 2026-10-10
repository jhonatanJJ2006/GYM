import { describe, expect, it } from "vitest";
import { MEALS } from "../data/meals.ts";
import { intakeFor, isoWeek, parseRest, parseSets, weekStats } from "./progress.ts";
import { toIso } from "./dates.ts";

describe("isoWeek", () => {
  it("calcula la semana ISO", () => {
    expect(isoWeek(new Date(2026, 9, 10))).toBe(41);
    expect(isoWeek(new Date(2027, 0, 1))).toBe(53);
    expect(isoWeek(new Date(2027, 0, 4))).toBe(1);
  });
});

describe("intakeFor", () => {
  it("suma solo las comidas marcadas", () => {
    const day = new Date(2026, 9, 12);
    const menu = MEALS[day.getDay()];
    const result = intakeFor(day, { [toIso(day)]: [0] });
    expect(result.kcal).toBe(menu.items[0]!.kcal);
    expect(result.protein).toBe(menu.items[0]!.protein);
    expect(result.targetKcal).toBe(menu.items.reduce((sum, meal) => sum + meal.kcal, 0));
    expect(result.eaten).toBe(1);
  });
});

describe("weekStats", () => {
  it("es 0 sin registros y no cuenta días futuros", () => {
    const monday = new Date(2026, 9, 12);
    const stats = weekStats(monday, monday, {}, {});
    expect(stats.days).toBe(1);
    expect(stats.compliance).toBe(0);
  });
});

describe("series y descanso", () => {
  it("lee series y descanso del texto", () => {
    expect(parseSets("4 series · 12–15 repeticiones · descanso 45 s")).toBe(4);
    expect(parseRest("4 series · 12–15 repeticiones · descanso 45 s")).toBe(45);
    expect(parseRest("3 series · descanso 2 min")).toBe(120);
    expect(parseRest("sin dato")).toBe(60);
  });
});
