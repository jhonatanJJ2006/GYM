import { FOOD_LABEL, foodsIn, type FoodId } from "../data/plate.ts";

const INK = "#3a2a22";

function Eggs() {
  return (
    <g>
      <path
        d="M-28 -6c-6 14 2 24 16 22 12 4 26-6 24-18 0-10-10-16-22-12-6-6-14-4-18 8z"
        fill="#fffaf3"
        stroke={INK}
        strokeWidth="1.6"
      />
      <circle cx="-6" cy="2" r="7" fill="#f5b000" stroke="#c47e00" strokeWidth="1" />
      <circle cx="-8" cy="0" r="2.2" fill="#fff3c4" />
      <path
        d="M6 -2c-2 12 8 20 20 16 10 2 18-8 14-16-2-8-12-12-20-6-4-4-12-2-14 6z"
        fill="#fffaf3"
        stroke={INK}
        strokeWidth="1.6"
      />
      <circle cx="22" cy="4" r="6.5" fill="#f6b51a" stroke="#c47e00" strokeWidth="1" />
      <circle cx="20" cy="2" r="2" fill="#fff3c4" />
    </g>
  );
}

function Oats() {
  return (
    <g>
      <path d="M-26 4c0 16 12 26 26 26s26-10 26-26" fill="#f4efe6" stroke={INK} strokeWidth="1.6" />
      <ellipse cx="0" cy="2" rx="26" ry="10" fill="#e7d3a8" stroke={INK} strokeWidth="1.6" />
      <path d="M-16 2h6M-6 -2h8M6 3h7M-10 6h5" stroke="#c4a46a" strokeWidth="1.4" strokeLinecap="round" />
      <ellipse cx="-8" cy="-1" rx="7" ry="3" fill="#f3e2bc" opacity="0.7" />
    </g>
  );
}

function Milk() {
  return (
    <g>
      <path d="M-12 -28h24l4 46H-16z" fill="#f7fbff" stroke={INK} strokeWidth="1.6" />
      <path d="M-14 2h30l2 16H-16z" fill="#fff" />
      <path d="M-6 -24h4v40" stroke="#fff" strokeWidth="3" opacity="0.8" />
      <path d="M-16 -28h8l-2 8h-8z" fill="#dce8f5" stroke={INK} strokeWidth="1.2" />
    </g>
  );
}

function Banana() {
  return (
    <g>
      <path
        d="M-6 30C-22 8-20-18 8-30c2 12-2 24 2 36 0 6-8 8-16-6z"
        fill="#ffe14a"
        stroke="#d7a40a"
        strokeWidth="1.6"
      />
      <path d="M-2 22C-8 10-8-6 4-16" fill="none" stroke="#fff4a8" strokeWidth="2" />
      <path d="M8 -30c6-8 12-6 8 0" fill="none" stroke="#5d8a32" strokeWidth="2" strokeLinecap="round" />
    </g>
  );
}

function Yogurt() {
  return (
    <g>
      <path d="M-22 -8h44l-6 28H-16z" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <ellipse cx="0" cy="-8" rx="22" ry="7" fill="#fff" stroke={INK} strokeWidth="1.6" />
      <path d="M-8 -18c6-10 14-8 12 2" fill="none" stroke="#c9c9c9" strokeWidth="2" />
      <ellipse cx="6" cy="-4" rx="6" ry="2" fill="#f4f4f4" />
    </g>
  );
}

function Peanut() {
  return (
    <g fill="#d7a15a" stroke="#8a5a28" strokeWidth="1.2">
      <ellipse cx="-10" cy="2" rx="8" ry="5" transform="rotate(-20 -10 2)" />
      <ellipse cx="2" cy="-4" rx="8" ry="5" transform="rotate(15 2 -4)" />
      <ellipse cx="12" cy="6" rx="7" ry="4.5" transform="rotate(-10 12 6)" />
      <ellipse cx="0" cy="8" rx="7" ry="4" />
    </g>
  );
}

function Bread({ honey = false }: { honey?: boolean }) {
  return (
    <g>
      <path d="M-24 -2c0-12 10-18 24-18s24 6 24 18v16H-24z" fill="#e7b56a" stroke={INK} strokeWidth="1.6" />
      <path d="M-24 6h48" stroke="#c4893d" strokeWidth="3" />
      <path d="M-18 -8c6-6 14-8 22-4" fill="none" stroke="#f0d7a4" strokeWidth="2" />
      {honey ? <path d="M-8 8c6 6 14 4 18-2 2 8-4 12-12 10-6 0-10-4-6-8z" fill="#f0a000" /> : null}
    </g>
  );
}

function Apple() {
  return (
    <g>
      <circle cx="0" cy="4" r="16" fill="#e23b3b" stroke={INK} strokeWidth="1.4" />
      <path d="M0 -12c2-8 8-10 10-8" fill="none" stroke="#6a8f3a" strokeWidth="2" />
      <ellipse cx="6" cy="-14" rx="6" ry="3" fill="#6a8f3a" transform="rotate(-30 6 -14)" />
      <ellipse cx="-4" cy="0" rx="4" ry="7" fill="#fff" opacity="0.25" />
    </g>
  );
}

function Chicken() {
  return (
    <g>
      <path
        d="M-26 -2c2-14 18-20 32-12 12 4 18 16 12 26-8 8-22 10-34 4-10-4-14-10-10-18z"
        fill="#e8b48a"
        stroke={INK}
        strokeWidth="1.6"
      />
      <path d="M-14 2h16M-8 10h18M-16 -4h12" stroke="#c4845a" strokeWidth="1.6" strokeLinecap="round" />
      <ellipse cx="-6" cy="-4" rx="8" ry="4" fill="#f3d2b4" opacity="0.55" />
    </g>
  );
}

function Rice() {
  return (
    <g>
      <ellipse cx="0" cy="6" rx="34" ry="16" fill="#f7f4ee" stroke={INK} strokeWidth="1.4" />
      <ellipse cx="0" cy="2" rx="28" ry="12" fill="#fff" />
      {[-16, -8, 0, 8, 16].map((x) => (
        <ellipse key={x} cx={x} cy={2 + (x % 3)} rx="2.1" ry="1.3" fill="#efe8dc" stroke="#ddd2c2" />
      ))}
      {[-12, -2, 8].map((x) => (
        <ellipse key={`b-${x}`} cx={x} cy={8} rx="2" ry="1.2" fill="#efe8dc" stroke="#ddd2c2" />
      ))}
    </g>
  );
}

function Stew({ tone }: { tone: string }) {
  return (
    <g>
      <path d="M-24 0c0 14 10 22 24 22s24-8 24-22" fill="#f3efe8" stroke={INK} strokeWidth="1.5" />
      <ellipse cx="0" cy="0" rx="24" ry="9" fill={tone} stroke={INK} strokeWidth="1.3" />
      {[-10, -2, 6, 12, -6, 2].map((x, index) => (
        <circle key={x} cx={x} cy={index % 2 === 0 ? -1 : 3} r="2.2" fill={index % 2 ? "#6b3a28" : "#8a4b30"} />
      ))}
    </g>
  );
}

function Tomato() {
  return (
    <g>
      <ellipse cx="-8" cy="2" rx="10" ry="8" fill="#e23d3d" stroke={INK} strokeWidth="1.2" />
      <ellipse cx="8" cy="4" rx="11" ry="8" fill="#ef4d45" stroke={INK} strokeWidth="1.2" />
      <path d="M-2 -8c4-6 10-4 8 2" fill="#3f8f45" stroke="#2f6b34" />
      <ellipse cx="-10" cy="0" rx="3" ry="4" fill="#fff" opacity="0.25" />
    </g>
  );
}

function Honey() {
  return (
    <g>
      <path d="M-8 -16c8 10 8 18 0 28-8-10-8-18 0-28z" fill="#f0a000" stroke="#c47c00" strokeWidth="1.2" />
      <ellipse cx="0" cy="12" rx="10" ry="4" fill="#e09000" />
    </g>
  );
}

function Tuna() {
  return (
    <g>
      <ellipse cx="0" cy="8" rx="22" ry="8" fill="#c5c8ce" stroke={INK} strokeWidth="1.3" />
      <path d="M-22 8V-2c0-8 10-14 22-14s22 6 22 14v10" fill="#d5d8de" stroke={INK} strokeWidth="1.3" />
      <ellipse cx="0" cy="-6" rx="16" ry="7" fill="#e7b7b0" stroke="#c48984" />
      <path d="M-8 -6c4 3 10 3 16 0" fill="none" stroke="#c47d78" strokeWidth="1.2" />
    </g>
  );
}

function Cheese() {
  return (
    <g>
      <path d="M-20 8 0-16 22 8z" fill="#fffaf3" stroke={INK} strokeWidth="1.5" />
      <path d="M-20 8h42" stroke={INK} strokeWidth="1.5" />
      <circle cx="-4" cy="0" r="2" fill="#f0e2c8" />
      <circle cx="8" cy="2" r="1.6" fill="#f0e2c8" />
    </g>
  );
}

function Avocado() {
  return (
    <g>
      <path d="M0 -22c12 4 18 16 14 28-6 10-22 10-28 0C-18-6-12-18 0-22z" fill="#7dae4e" stroke="#4e7a32" strokeWidth="1.4" />
      <ellipse cx="0" cy="6" rx="8" ry="10" fill="#d6ec9a" />
      <circle cx="0" cy="6" r="4.5" fill="#6b3e22" />
    </g>
  );
}

function Beef() {
  return (
    <g>
      <ellipse cx="-8" cy="2" rx="14" ry="9" fill="#8d4b32" stroke="#5c2e1e" strokeWidth="1.2" />
      <ellipse cx="10" cy="4" rx="12" ry="8" fill="#a15a3c" stroke="#5c2e1e" strokeWidth="1.2" />
      <ellipse cx="0" cy="-4" rx="10" ry="7" fill="#c47852" stroke="#5c2e1e" strokeWidth="1.2" />
      <path d="M-12 0c4 2 8 1 12-1" stroke="#e7b498" strokeWidth="1.2" fill="none" />
    </g>
  );
}

function Potato({ orange = false }: { orange?: boolean }) {
  const fill = orange ? "#ef8a2f" : "#e6c27a";
  const edge = orange ? "#c46212" : "#b48a42";
  return (
    <g>
      <ellipse cx="-8" cy="2" rx="14" ry="10" fill={fill} stroke={edge} strokeWidth="1.3" />
      <ellipse cx="10" cy="4" rx="12" ry="9" fill={fill} stroke={edge} strokeWidth="1.3" />
      <path d="M-14 2c6-6 14-6 20-2" fill="none" stroke="#fff" strokeWidth="1.5" opacity="0.35" />
    </g>
  );
}

function Broccoli() {
  return (
    <g>
      <path d="M-4 16c0-10 8-12 8-12s8 2 8 12" fill="#6a8f3a" stroke="#3f6a24" />
      <circle cx="-10" cy="-2" r="9" fill="#5fa83a" stroke="#2f6b24" />
      <circle cx="2" cy="-8" r="10" fill="#6fba44" stroke="#2f6b24" />
      <circle cx="14" cy="0" r="8" fill="#4f9834" stroke="#2f6b24" />
      <circle cx="-2" cy="2" r="7" fill="#7dcc4e" stroke="#2f6b24" />
    </g>
  );
}

function Pasta() {
  return (
    <g fill="none" stroke="#f0c14a" strokeWidth="2.4" strokeLinecap="round">
      <path d="M-18 6c8-14 18-14 26 0" />
      <path d="M-14 10c8-16 20-16 28 0" />
      <path d="M-20 2c10-12 22-12 32 2" />
      <path d="M-8 8c6-8 14-8 20 2" stroke="#d7a428" />
    </g>
  );
}

function Plantain() {
  return (
    <g>
      <path d="M-20 6c6-16 20-20 32-8 4 10-2 18-14 18-12 2-20-2-18-10z" fill="#7ea84a" stroke="#4d7328" strokeWidth="1.4" />
      <path d="M-16 4c8-8 18-8 26-2" fill="none" stroke="#c5e08a" strokeWidth="1.6" />
      <path d="M8 8c4-10 10-12 16-8" fill="#6e9840" stroke="#4d7328" />
    </g>
  );
}

function Corn() {
  return (
    <g>
      <ellipse cx="0" cy="2" rx="12" ry="20" fill="#f2d23a" stroke="#c9a20e" strokeWidth="1.3" />
      {[-8, 0, 8].map((x) =>
        [-10, -2, 6].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="2.3" fill="#ffe56a" stroke="#e0b41a" />),
      )}
      <path d="M-14 8c4 16 24 16 28 0" fill="#6a8f3a" stroke="#3f6a24" />
    </g>
  );
}

function Orange() {
  return (
    <g>
      <circle cx="0" cy="2" r="16" fill="#f39a1f" stroke="#d87a0a" strokeWidth="1.4" />
      <path d="M0 -8v20M-10 2h20" stroke="#ffe0a8" strokeWidth="1.2" />
      <path d="M0 -14c4-6 8-6 8-2" fill="none" stroke="#5d8a32" strokeWidth="2" />
    </g>
  );
}

function Sprite({ id, honey }: { id: FoodId; honey?: boolean }) {
  switch (id) {
    case "egg":
      return <Eggs />;
    case "oats":
      return <Oats />;
    case "milk":
      return <Milk />;
    case "banana":
      return <Banana />;
    case "yogurt":
      return <Yogurt />;
    case "peanut":
      return <Peanut />;
    case "bread":
      return <Bread honey={honey} />;
    case "apple":
      return <Apple />;
    case "chicken":
      return <Chicken />;
    case "rice":
      return <Rice />;
    case "lentil":
      return <Stew tone="#c4844a" />;
    case "bean":
      return <Stew tone="#7a3b32" />;
    case "tomato":
      return <Tomato />;
    case "honey":
      return <Honey />;
    case "tuna":
      return <Tuna />;
    case "cheese":
      return <Cheese />;
    case "avocado":
      return <Avocado />;
    case "beef":
      return <Beef />;
    case "potato":
      return <Potato />;
    case "sweet":
      return <Potato orange />;
    case "broccoli":
      return <Broccoli />;
    case "pasta":
      return <Pasta />;
    case "plantain":
      return <Plantain />;
    case "corn":
      return <Corn />;
    case "orange":
      return <Orange />;
    default:
      return null;
  }
}

const BOWL = new Set<FoodId>(["oats", "yogurt"]);
const DRINK = new Set<FoodId>(["milk"]);
const FRUIT = new Set<FoodId>(["banana", "apple", "orange"]);
const BASE = new Set<FoodId>(["rice", "pasta", "potato", "sweet", "plantain", "corn"]);
const PROTEIN = new Set<FoodId>(["chicken", "beef", "tuna", "egg"]);

function shadow(x: number, y: number) {
  return <ellipse cx={x} cy={y + 18} rx="26" ry="6" fill="#000" opacity="0.12" />;
}

export function MealArt({ ingredients, label }: { ingredients: readonly string[]; label: string }) {
  const foods = foodsIn(ingredients);
  const honey = foods.includes("honey");
  const bowls = foods.filter((id) => BOWL.has(id));
  const drinks = foods.filter((id) => DRINK.has(id));
  const fruits = foods.filter((id) => FRUIT.has(id));
  const breads = foods.filter((id) => id === "bread");
  const bases = foods.filter((id) => BASE.has(id));
  const proteins = foods.filter((id) => PROTEIN.has(id));
  const sides = foods.filter((id) => !BOWL.has(id) && !DRINK.has(id) && !FRUIT.has(id) && id !== "bread" && !BASE.has(id) && !PROTEIN.has(id) && id !== "honey");
  const bowlMeal = bowls.length > 0 && bases.length === 0;
  const placed: { id: FoodId; x: number; y: number; s: number }[] = [];

  if (bowlMeal) {
    bowls.forEach((id, index) => placed.push({ id, x: 132 + index * 8, y: 132, s: 1.45 }));
    proteins.forEach((id) => placed.push({ id, x: 248, y: 148, s: 1 }));
    sides.forEach((id, index) => placed.push({ id, x: 210, y: 92 + index * 28, s: 0.8 }));
  } else {
    bases.forEach((id, index) => placed.push({ id, x: 150 + index * 36, y: 148 - index * 8, s: index === 0 ? 1.2 : 0.95 }));
    proteins.forEach((id, index) => placed.push({ id, x: 156 + index * 18, y: 118, s: 1.15 }));
    const spots: [number, number][] = [
      [236, 118],
      [96, 156],
      [228, 168],
      [108, 108],
      [250, 150],
    ];
    sides.forEach((id, index) => {
      const spot = spots[index] ?? [120, 96];
      placed.push({ id, x: spot[0], y: spot[1], s: 0.9 });
    });
  }

  const aside = [...fruits, ...breads, ...drinks];
  aside.forEach((id, index) => placed.push({ id, x: 336, y: 58 + index * 62, s: 0.92 }));
  if (honey && !breads.length) placed.push({ id: "honey", x: bowlMeal ? 200 : 250, y: 78, s: 0.8 });

  const caption = foods.map((id) => FOOD_LABEL[id]).join(", ");

  return (
    <svg
      viewBox="0 0 400 250"
      width={400}
      height={250}
      role="img"
      aria-label={caption ? `Plato de ${label}: ${caption}` : `Plato de ${label}`}
      className="block h-auto w-full max-w-full"
    >
      <rect width="400" height="250" rx="28" fill="#2a211c" />
      <rect x="14" y="14" width="372" height="222" rx="22" fill="#3b2b24" />
      <ellipse cx={bowlMeal ? 160 : 176} cy="142" rx="132" ry="74" fill="#c4a88a" opacity="0.28" />
      {bowlMeal ? (
        <g>
          <ellipse cx="150" cy="156" rx="78" ry="36" fill="#d9d0c4" />
          <ellipse cx="150" cy="152" rx="68" ry="28" fill="#f7f3ec" />
          {proteins.length ? (
            <g>
              <ellipse cx="250" cy="168" rx="52" ry="26" fill="#d9d0c4" />
              <ellipse cx="250" cy="164" rx="44" ry="20" fill="#fffdfb" />
            </g>
          ) : null}
        </g>
      ) : (
        <g>
          <ellipse cx="176" cy="150" rx="112" ry="68" fill="#cfc6ba" />
          <ellipse cx="176" cy="146" rx="100" ry="58" fill="#f7f3ec" />
          <ellipse cx="176" cy="146" rx="78" ry="44" fill="#fffdfb" />
        </g>
      )}
      {placed.map((item) => (
        <g key={`${item.id}-${item.x}`}>
          {shadow(item.x, item.y)}
          <g transform={`translate(${item.x} ${item.y}) scale(${item.s})`}>
            <Sprite id={item.id} honey={honey && item.id === "bread"} />
          </g>
        </g>
      ))}
    </svg>
  );
}
