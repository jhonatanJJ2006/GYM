import { useEffect, useRef, type ReactNode } from "react";
import { animate, stagger } from "animejs";

export function RiseScope({ pathname, children }: { pathname: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const play = (nodes: HTMLElement[]) => {
      const fresh = nodes.filter((node) => node.dataset.played !== "1");
      if (fresh.length === 0) return;
      for (const node of fresh) node.dataset.played = "1";
      if (reduced) return;
      animate(fresh, {
        opacity: [0, 1],
        y: [16, 0],
        delay: stagger(46, { from: "first" }),
        duration: 560,
        ease: "outCubic",
      });
    };

    if (!reduced) {
      animate(root, {
        opacity: [0.35, 1],
        x: [10, 0],
        duration: 380,
        ease: "outCubic",
      });
    }

    play([...root.querySelectorAll<HTMLElement>("[data-rise]")]);
    const mo = new MutationObserver(() => {
      play([...root.querySelectorAll<HTMLElement>("[data-rise]")]);
    });
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      mo.disconnect();
    };
  }, [pathname]);

  return (
    <div ref={ref} className="relative z-10 mx-auto min-h-dvh w-full max-w-6xl px-4 pb-32 pt-5 sm:px-6">
      {children}
    </div>
  );
}
