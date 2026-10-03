import type { CSSProperties, ReactNode } from "react";
import { cn } from "../../lib/utils.ts";

/**
 * Fila corta: título y, si cabe, un dato a la derecha.
 * El detalle (salón, profesor, descripción, foto grande) no va aquí.
 * `wrap` deja el título entero: crece la fila, sin ellipsis.
 */
export function CompactRow({
  title,
  meta,
  thumb,
  onClick,
  className,
  wrap = false,
  accent,
}: {
  title: string;
  meta?: string;
  thumb?: ReactNode;
  onClick: () => void;
  className?: string;
  wrap?: boolean;
  accent?: string;
}) {
  const accentStyle: CSSProperties | undefined = accent
    ? {
        backgroundColor: `color-mix(in srgb, ${accent} 26%, var(--color-panel))`,
        boxShadow: `inset 3px 0 0 ${accent}`,
      }
    : undefined;

  return (
    <button
      type="button"
      onClick={onClick}
      style={accentStyle}
      className={cn(
        "relative flex w-full min-w-0 gap-2.5 rounded-row border border-line bg-panel px-2.5 text-left focus-visible:z-10",
        wrap ? "min-h-11 items-start py-2" : "h-11 items-center",
        className,
      )}
    >
      {thumb}
      <span className={cn("min-w-0 flex-1 text-sm font-medium text-cream", wrap ? "break-words" : "truncate")}>{title}</span>
      {meta ? (
        <span className={cn("shrink-0 text-xs tabular-nums text-muted", wrap ? "whitespace-nowrap pt-0.5" : "max-w-[46%] truncate")}>
          {meta}
        </span>
      ) : null}
    </button>
  );
}
