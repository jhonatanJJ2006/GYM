import type { ReactNode } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Fila corta de una sola línea: título y, si cabe, un dato a la derecha.
 * El detalle (salón, profesor, descripción, foto grande) no va aquí.
 */
export function CompactRow({
  title,
  meta,
  thumb,
  onClick,
  className,
}: {
  title: string;
  meta?: string;
  thumb?: ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex h-11 w-full min-w-0 items-center gap-2 rounded-[var(--radius-row)] bg-panel px-2 text-left ring-1 ring-white/10",
        className,
      )}
    >
      {thumb}
      <span className="min-w-0 flex-1 truncate text-sm font-medium">{title}</span>
      {meta ? <span className="max-w-[46%] shrink truncate text-xs tabular-nums text-muted">{meta}</span> : null}
    </button>
  );
}
