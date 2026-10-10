import type { ReactNode } from "react";
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
    <header data-rise className="-mx-4 mb-6 flex h-14 items-center justify-between gap-3 border-b border-line px-4 sm:-mx-6 sm:px-6">
      <div className="flex items-center gap-2.5">
        <BrandMark className="size-8 text-accent" />
        <p className="font-display text-xl font-extrabold uppercase leading-none tracking-[0.2em] text-cream">Hierro</p>
      </div>
      <p className="text-xs text-muted">Clases, gym y comidas</p>
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
