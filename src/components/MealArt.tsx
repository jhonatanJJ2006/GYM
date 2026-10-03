import { mealPhoto } from "../data/photos.ts";
import { PhotoHero } from "./PhotoHero.tsx";

export function MealArt({ ingredients, label }: { ingredients: readonly string[]; label: string }) {
  const photo = mealPhoto(ingredients);
  return <PhotoHero photo={{ ...photo, alt: `${label}. ${photo.alt}` }} />;
}
