import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils.ts";
import { IconCalendar, IconClasses, IconMeal, IconTrain, IconWeek } from "./Icons.tsx";

const LINKS = [
  { to: "/", label: "Calendario", icon: IconCalendar, end: true },
  { to: "/clases", label: "Clases", icon: IconClasses, end: false },
  { to: "/semana", label: "Semana", icon: IconWeek, end: false },
  { to: "/entreno", label: "Entreno", icon: IconTrain, end: false },
  { to: "/comidas", label: "Comidas", icon: IconMeal, end: false },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-ink/95 backdrop-blur pb-[max(0.35rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto grid max-w-6xl grid-cols-5">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 px-0.5 text-center text-[0.62rem] font-medium leading-tight",
                  isActive ? "text-cream" : "text-muted",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <link.icon className="size-5" />
                  <span>{link.label}</span>
                  <span className="sr-only">{isActive ? "sección actual" : ""}</span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
