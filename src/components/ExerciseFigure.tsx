import { exercisePhoto } from "../data/photos.ts";
import type { PoseId } from "../data/poses.ts";
import { PhotoHero } from "./PhotoHero.tsx";

export function ExerciseFigure({ pose, label }: { pose: PoseId; label: string }) {
  const photo = exercisePhoto(pose);
  return <PhotoHero photo={{ ...photo, alt: `${label}. ${photo.alt}` }} />;
}
