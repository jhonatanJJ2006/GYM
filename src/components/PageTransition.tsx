import { useLayoutEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

/** Anima el contenido de cada ruta al cambiar: fade + translateY + stagger de hijos directos. */
export function PageTransition({ pathname, children }: { pathname: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;
    const page = root.firstElementChild;
    const kids = page ? ([...page.children] as HTMLElement[]) : [];
    // Evita que RiseScope vuelva a animar estos mismos nodos.
    for (const kid of kids) kid.dataset.played = "1";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || kids.length === 0) return;
    for (const kid of kids) kid.style.opacity = "0";
    const anim = animate(kids, {
      opacity: [0, 1],
      y: [28, 0],
      filter: ["blur(6px)", "blur(0px)"],
      delay: stagger(60),
      duration: 620,
      ease: "outExpo",
      onComplete: () => {
        for (const kid of kids) kid.style.removeProperty("filter");
      },
    });
    return () => {
      anim.pause();
      for (const kid of kids) {
        kid.style.opacity = "";
        kid.style.transform = "";
        kid.style.removeProperty("filter");
      }
    };
  }, [pathname]);

  return <div ref={ref}>{children}</div>;
}
