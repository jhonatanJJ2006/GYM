/**
 * Exporta los datos de la web (src/data y src/lib/schedule) a JSON para la app Android.
 * Uso: npx vite-node scripts/export-android-data.ts
 * Salida: android/app/src/main/assets/data/hierro.json
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { CLASSES, COURSE_COLOR, COURSE_SHORT, classKey, modeLabel, placeOf } from "../src/data/courses.ts";
import { HOLIDAYS } from "../src/data/holidays.ts";
import { MEALS, mealWhen } from "../src/data/meals.ts";
import { DISCLAIMER, KCAL_INTRO, KCAL_POINTS, PROFILE, SHOPPING, SHOPPING_NOTE } from "../src/data/nutrition.ts";
import { exercisePhoto, mealPhoto, type Photo } from "../src/data/photos.ts";
import { SESSIONS, type Session } from "../src/data/sessions.ts";
import { motionFor } from "../src/lib/coachSample.ts";
import { POSE_CLIP } from "../src/lib/coachClips.ts";
import { RANGE_END, RANGE_START, addDays } from "../src/lib/dates.ts";
import { buildDay } from "../src/lib/schedule.ts";

const photo = (p: Photo | null) =>
  p ? { file: p.src.replace(/^\/photos\//, ""), alt: p.alt, author: p.author, license: p.license, licenseUrl: p.licenseUrl, source: p.source } : null;

const cls = (b: (typeof CLASSES)[1][number]) => ({ ...b, key: classKey(b), modeLabel: modeLabel(b), place: placeOf(b), short: COURSE_SHORT[b.name], color: COURSE_COLOR[b.name] });

const sessions = Object.fromEntries(
  Object.entries(SESSIONS).map(([id, s]) => [
    id,
    { ...(s as Session), exercises: (s as Session).exercises.map((e) => ({ ...e, photo: photo(exercisePhoto(e.pose, e.name)), blurb: motionFor(e.pose).blurb })) },
  ]),
);

const meals = Object.fromEntries(
  Object.entries(MEALS).map(([dow, day]) => [dow, { total: day.total, items: day.items.map((m) => ({ ...m, end: m.end ?? null, when: mealWhen(m), photo: photo(mealPhoto(m.ingredients)) })) }]),
);

const days = [];
for (let d = RANGE_START; d.getTime() <= RANGE_END.getTime(); d = addDays(d, 1)) {
  const p = buildDay(d);
  days.push({
    iso: p.iso,
    cycleWeek: p.cycleWeek,
    inTerm: p.inTerm,
    sessionId: p.session.id,
    classes: p.classes.map(cls),
    work: p.work,
    workMinutes: p.workMinutes,
    holiday: p.holiday,
    gymConflicts: p.gymConflicts,
    banners: p.banners,
    items: p.items.map((i) => {
      if (i.kind === "clase") return { kind: i.kind, start: i.start, classKey: classKey(i.block) };
      if (i.kind === "trabajo") return { kind: i.kind, start: i.start, end: i.end };
      if (i.kind === "gym") return { kind: i.kind, start: i.start, end: i.end };
      return { kind: i.kind, start: i.start, mealIndex: p.meals.items.indexOf(i.meal) };
    }),
  });
}

const out = {
  courses: { colors: COURSE_COLOR, short: COURSE_SHORT, classes: Object.fromEntries(Object.entries(CLASSES).map(([k, v]) => [k, v.map(cls)])) },
  holidays: HOLIDAYS,
  nutrition: { profile: PROFILE, kcalIntro: KCAL_INTRO, points: KCAL_POINTS, disclaimer: DISCLAIMER, shoppingNote: SHOPPING_NOTE, shopping: SHOPPING },
  sessions,
  meals,
  poseClip: POSE_CLIP,
  days,
};
mkdirSync("android/app/src/main/assets/data", { recursive: true });
writeFileSync("android/app/src/main/assets/data/hierro.json", JSON.stringify(out));
console.log(`días: ${days.length}, poses: ${Object.keys(POSE_CLIP).length}`);
