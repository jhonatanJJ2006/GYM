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
    <header data-rise className="mb-6 flex items-center gap-3">
      <BrandMark className="text-[var(--color-mark)]" />
      <div className="min-w-0">
        <p className="font-display text-[1.85rem] leading-none tracking-tight text-[var(--color-mark)]">Hierro</p>
        <p className="mt-1 text-xs text-muted">Clases, gym y comidas</p>
      </div>
    </header>
  );
}

export function PageIntro({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header data-rise className="mb-4 max-w-xl">
      <h1 className="font-display text-5xl leading-[0.92] tracking-tight text-[var(--color-mark)]">{title}</h1>
      {children ? <div className="mt-3 text-sm leading-relaxed text-muted">{children}</div> : null}
    </header>
  );
}

export function BrandAtmosphere({ page }: { page: string }) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 h-32 overflow-hidden" aria-hidden="true">
      <div className="absolute -top-40 right-[-4.5rem] opacity-25 sm:right-[-1rem]">
        <FluidOrb size={220} color={ORB_COLOR[page] ?? ORB_COLOR.cal} />
      </div>
    </div>
  );
}
