import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils.ts";
import { IconCalendar, IconMeal, IconTrain, IconWeek } from "./Icons.tsx";

const LINKS = [
  { to: "/", label: "Calendario", icon: IconCalendar, end: true },
  { to: "/semana", label: "Semana", icon: IconWeek, end: false },
  { to: "/entreno", label: "Entreno", icon: IconTrain, end: false },
  { to: "/comidas", label: "Comidas", icon: IconMeal, end: false },
] as const;

export function BottomNav() {
  return (
    <nav aria-label="Secciones" className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.7rem,env(safe-area-inset-bottom))]">
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1 rounded-[1.7rem] bg-[#14131b]/95 p-1.5 shadow-[0_16px_40px_rgb(0_0_0/0.45)] ring-1 ring-white/10 backdrop-blur-xl">
        {LINKS.map((link) => (
          <li key={link.to}>
            <NavLink
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1.25rem] text-[0.68rem] font-semibold",
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
