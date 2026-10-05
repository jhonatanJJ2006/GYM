import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { animate, stagger } from "animejs";

const reduced = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

/** Entrada escalonada de los elementos [data-stagger] dentro del contenedor. */
export function useStagger<T extends HTMLElement>(key: unknown) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const nodes = ref.current?.querySelectorAll<HTMLElement>("[data-stagger]");
    if (!nodes || nodes.length === 0 || reduced()) return;
    const anim = animate(nodes, {
      opacity: [0, 1],
      y: [18, 0],
      scale: [0.98, 1],
      duration: 520,
      delay: stagger(60),
      ease: "outCubic",
    });
    return () => {
      anim.revert();
    };
  }, [key]);
  return ref;
}

/** Contenido que se expande/colapsa animando la altura con animejs. */
export function Expand({ open, children }: { open: boolean; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(open);
  const first = useRef(true);

  useLayoutEffect(() => {
    if (open) setMounted(true);
  }, [open]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (first.current) {
      first.current = false;
      return;
    }
    if (reduced()) {
      if (!open) setMounted(false);
      return;
    }
    const full = el.scrollHeight;
    const anim = animate(el, {
      height: open ? [0, full] : [full, 0],
      opacity: open ? [0, 1] : [1, 0],
      duration: open ? 380 : 260,
      ease: open ? "outCubic" : "inCubic",
      onComplete: () => {
        el.style.height = "";
        if (!open) setMounted(false);
      },
    });
    return () => {
      anim.pause();
    };
  }, [open, mounted]);

  if (!mounted) return null;
  return (
    <div ref={ref} className="overflow-hidden">
      {children}
    </div>
  );
}
