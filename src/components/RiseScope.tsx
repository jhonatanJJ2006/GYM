import { useEffect, useRef, type ReactNode } from "react";

export function RiseScope({ pathname, children }: { pathname: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add("rise-in");
          io.unobserve(entry.target);
        }
      },
      { threshold: 0.14, rootMargin: "0px 0px -4% 0px" },
    );

    const scan = () => {
      for (const node of root.querySelectorAll<HTMLElement>("[data-rise]:not(.rise-in)")) io.observe(node);
    };

    scan();
    const mo = new MutationObserver(scan);
    mo.observe(root, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return (
    <div ref={ref} className="relative z-10 mx-auto min-h-dvh w-full max-w-6xl px-4 pb-32 pt-5 sm:px-6">
      {children}
    </div>
  );
}
