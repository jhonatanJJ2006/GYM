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
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 rounded-[1.8rem] bg-[#07080a]/95 p-1.5 shadow-[0_16px_50px_rgb(0_0_0/0.55)] ring-1 ring-white/10 backdrop-blur-xl">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] px-0.5 text-center text-[0.62rem] font-semibold leading-tight",
                  isActive ? "bg-accent text-ink" : "text-muted",
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
