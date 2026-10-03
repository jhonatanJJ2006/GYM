import { COURSE_SHORT, type CourseName } from "../data/courses.ts";

const NAMES = Object.keys(COURSE_SHORT) as CourseName[];

export function Legend() {
  return (
    <ul className="grid grid-cols-2 gap-x-3 gap-y-1.5" aria-label="Materias">
      {NAMES.map((name) => (
        <li key={name} className="truncate text-xs text-cream/85">
          {COURSE_SHORT[name]}
        </li>
      ))}
    </ul>
  );
}
