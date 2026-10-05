import { useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { animate } from "animejs";
import { cn } from "../lib/utils.ts";
import { IconCalendar, IconClasses, IconMeal, IconTrain, IconWeek } from "./Icons.tsx";

const LINKS = [
  { to: "/", label: "Calendario", icon: IconCalendar, end: true },
  { to: "/clases", label: "Clases", icon: IconClasses, end: false },
  { to: "/semana", label: "Semana", icon: IconWeek, end: false },
  { to: "/entreno", label: "Entreno", icon: IconTrain, end: false },
  { to: "/comidas", label: "Comidas", icon: IconMeal, end: false },
] as const;

function activeIndex(pathname: string): number {
  const index = LINKS.findIndex((link) => !link.end && pathname.startsWith(link.to));
  return index < 0 ? 0 : index;
}

export function BottomNav() {
  const { pathname } = useLocation();
  const index = activeIndex(pathname);
  const pill = useRef<HTMLSpanElement>(null);
  const first = useRef(true);

  useEffect(() => {
    const node = pill.current;
    if (!node) return;
    const target = `${index * 100}%`;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (first.current || reduced) {
      first.current = false;
      node.style.transform = `translateX(${target})`;
      return;
    }
    const anim = animate(node, {
      x: target,
      scaleX: [1.35, 1],
      scaleY: [0.82, 1],
      duration: 520,
      ease: "outElastic(1, .7)",
    });
    return () => {
      anim.pause();
    };
  }, [index]);

  return (
    <nav
      aria-label="Secciones"
      className="fixed inset-x-0 bottom-0 z-40 px-3 pb-[max(0.6rem,env(safe-area-inset-bottom))]"
    >
      <ul className="glass-nav relative mx-auto grid max-w-md grid-cols-5 rounded-[1.4rem] p-1.5">
        <span aria-hidden="true" className="pointer-events-none absolute inset-y-1.5 left-1.5 w-[calc((100%-0.75rem)/5)]">
          <span ref={pill} className="nav-pill absolute inset-0 block rounded-[1rem] will-change-transform" />
        </span>
        {LINKS.map((link, i) => (
          <li key={link.to} className="relative z-10">
            <NavLink
              to={link.to}
              end={link.end}
              className={cn(
                "flex min-h-14 flex-col items-center justify-center gap-0.5 rounded-[1rem] px-0.5 text-center text-[0.62rem] font-semibold leading-tight transition-colors duration-300",
                i === index ? "text-[var(--color-accent-ink)]" : "text-muted hover:text-cream",
              )}
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
