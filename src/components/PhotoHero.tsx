import { photoCredit, type Photo } from "../data/photos.ts";

export function PhotoHero({ photo }: { photo: Photo }) {
  return (
    <figure className="relative m-0 overflow-hidden bg-ink">
      <img src={photo.src} alt={photo.alt} className="block aspect-[4/3] w-full max-w-full object-cover" />
      <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 to-transparent px-3 pb-2 pt-8 text-[0.65rem] leading-snug text-white/75">
        {photoCredit(photo)}
      </figcaption>
    </figure>
  );
}
