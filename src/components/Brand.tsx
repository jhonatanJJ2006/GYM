import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { IconCalendar } from "./Icons.tsx";
import { cn } from "../lib/utils.ts";
import FluidOrb from "./ui/fluid-orb.tsx";

const ORB_COLOR: Record<string, string> = {
  cal: "#b7d4ee",
  clases: "#9ec4ee",
  semana: "#d4c6ee",
  entreno: "#f0b08a",
  comidas: "#b7dcb8",
};

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("size-11", className)} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#141210" />
      <path d="M7.6 22.2 11 8.6h10L24.4 22.2H7.6Z" fill="currentColor" />
      <path d="M11 8.6h10l-1.45 4.35H12.45L11 8.6Z" fill="#f4e4c8" />
      <path d="M13.15 16.35h5.7l.75 2.7h-7.2l.75-2.7Z" fill="#241c16" />
    </svg>
  );
}

export function AppHeader() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 flex h-14 items-center justify-between gap-3 border-b border-line bg-ink px-4 sm:px-6">
      <Link to="/" aria-label="Hierro, ir al calendario" className="grid size-10 place-items-center rounded-lg text-cream transition-colors hover:bg-panel">
        <BrandMark className="size-7 text-accent" />
      </Link>
      <p className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.25em] text-cream lg:absolute lg:left-[4.25rem]">Hierro</p>
      <div className="flex items-center gap-3">
        <p className="hidden text-xs text-muted sm:block">Clases, gym y comidas</p>
        <button
          type="button"
          aria-label="Volver arriba"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="grid size-10 place-items-center rounded-lg text-cream transition-colors hover:bg-panel"
        >
          <IconCalendar className="size-[22px]" />
        </button>
      </div>
    </header>
  );
}

export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header data-rise className="mb-6 max-w-xl">
            <h1 className="display-title">{title}</h1>
      {children ? <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div> : null}
    </header>
  );
}

export function BrandAtmosphere({ page }: { page: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-44 right-[-6rem] opacity-[0.08] sm:right-[-2rem]">
        <FluidOrb size={200} color={ORB_COLOR[page] ?? ORB_COLOR.cal} />
      </div>
    </div>
  );
}
