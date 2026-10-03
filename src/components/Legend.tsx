import { COURSE_COLOR, COURSE_SHORT, type CourseName } from "../data/courses.ts";

const NAMES = Object.keys(COURSE_COLOR) as CourseName[];

export function Legend() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5" aria-label="Colores de materias">
      {NAMES.map((name) => (
        <li key={name} className="flex min-w-0 items-center gap-2 text-xs text-cream/85">
          <span className="size-2.5 shrink-0 rounded-[3px]" style={{ background: COURSE_COLOR[name] }} />
          <span className="truncate">{COURSE_SHORT[name]}</span>
        </li>
      ))}
    </ul>
  );
}
