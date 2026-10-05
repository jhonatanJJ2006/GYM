import { exercisePhoto, photoCredit } from "../data/photos.ts";
import type { PoseId } from "../data/poses.ts";
import { CoachView } from "./CoachView.tsx";

/**
 * Medio principal de un ejercicio: siempre el coach 3D. La foto, si existe,
 * queda como referencia pequeña en la esquina; nunca sustituye al 3D.
 */
export function ExerciseFigure({ pose, label, showPhoto = true }: { pose: PoseId; label: string; showPhoto?: boolean }) {
  const photo = showPhoto ? exercisePhoto(pose, label) : null;
  return (
    <figure className="relative m-0 overflow-hidden bg-ink">
      <CoachView pose={pose} label={label} hero className="block aspect-[4/3] w-full" />
      {photo ? (
        <img
          src={photo.src}
          alt={`Foto de referencia: ${photo.alt}`}
          title={photoCredit(photo)}
          loading="lazy"
          className="absolute bottom-2 right-2 size-16 rounded-row object-cover opacity-90 ring-1 ring-line"
        />
      ) : null}
    </figure>
  );
}
