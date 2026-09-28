import { PlaceIcon } from "@/components/molecules/PlaceIcon";
import type { Place, PlaceCategory } from "@/lib/content/places";

/**
 * Molecule `PlaceThumb` — miniatura do card de lugar (#hospedagem).
 * Com `place.photo` (arquivo em `public/lugares/<id>.webp`, 16:10), mostra a
 * foto com as bordas de baixo esfumadas no papel. Sem foto, mostra uma
 * "aquarela" da categoria: manchas na cor da categoria + o ícone grande,
 * pra o card nunca ficar vazio.
 */

const TONE: Record<PlaceCategory, { a: string; b: string; ink: string }> = {
  hotel: { a: "#c4d1da", b: "#8ba4b4", ink: "#374651" }, // ardósia
  cafe: { a: "#e6cebf", b: "#cd9e80", ink: "#614431" }, // caramelo
  restaurante: { a: "#f6d1b5", b: "#efa46d", ink: "#764726" }, // pêssego
  shopping: { a: "#e0ded0", b: "#c0bda3", ink: "#585646" }, // sálvia
  beleza: { a: "#f8e0b6", b: "#f3c271", ink: "#785a29" }, // amarelo
};

const MASK = {
  WebkitMaskImage: "url(/decor/capetown/mancha.webp)",
  maskImage: "url(/decor/capetown/mancha.webp)",
  WebkitMaskSize: "100% 100%",
  maskSize: "100% 100%",
  WebkitMaskRepeat: "no-repeat",
  maskRepeat: "no-repeat",
} as const;

export function PlaceThumb({ place }: { place: Place }) {
  if (place.photo) {
    return (
      <div className="relative aspect-[16/10] overflow-hidden rounded-t-[inherit]">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={place.photo} alt={place.name} loading="lazy" decoding="async" className="h-full w-full object-cover" />
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white/85 to-transparent" />
      </div>
    );
  }
  const c = TONE[place.category];
  return (
    <div aria-hidden="true" className="relative isolate aspect-[16/10] overflow-hidden rounded-t-[inherit] bg-page">
      <span className="absolute -left-[8%] -top-[20%] block h-[95%] w-[70%] -rotate-12 opacity-80" style={{ ...MASK, backgroundColor: c.a }} />
      <span className="absolute -bottom-[25%] -right-[6%] block h-[100%] w-[72%] rotate-6 opacity-70" style={{ ...MASK, backgroundColor: c.b }} />
      <span className="absolute left-[38%] top-[30%] block h-[45%] w-[34%] rotate-45 opacity-40" style={{ ...MASK, backgroundColor: c.b }} />
      <span className="absolute inset-0 flex items-center justify-center" style={{ color: c.ink }}>
        <PlaceIcon kind={place.category} className="h-14 w-14 drop-shadow-[0_2px_0_rgba(255,255,255,0.6)]" />
      </span>
    </div>
  );
}
