import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3.5" y="4.5" width="17" height="16" rx="2" />
      <path d="M3.5 9.5h17M8 3v3M16 3v3" />
    </svg>
  );
}

export function IconWeek(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}

export function IconTrain(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.5 9.5h11M6.5 14.5h11" />
      <path d="M7 7.5v9M17 7.5v9" />
    </svg>
  );
}

export function IconMeal(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M5 4.5v7a3 3 0 0 0 6 0v-7M8 4.5v15M16 4.5c1.6 2 2 4.2 2 6.2 0 2.2-1.2 3.6-3 3.6h-1V19.5" />
    </svg>
  );
}
