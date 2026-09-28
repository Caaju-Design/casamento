import type { PlaceCategory } from "@/lib/content/places";

/** Ícones de traço simples por categoria (cama, xícara, talheres, sacola, tesoura) + coração do salão. */
export const ICON_PATHS: Record<PlaceCategory | "venue", string> = {
  hotel: '<path d="M3 18v-7m0 3h18v4M21 14v-2a3 3 0 0 0-3-3h-6v5"/><circle cx="7.5" cy="10.5" r="1.8"/>',
  cafe: '<path d="M4 9h12v4a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5z"/><path d="M16 10h1.5a2.5 2.5 0 0 1 0 5H16"/><path d="M8 3.5c0 1 1 1 1 2s-1 1-1 2M12 3.5c0 1 1 1 1 2s-1 1-1 2"/>',
  restaurante: '<path d="M7 3v8m-2.5-8v4a2.5 2.5 0 0 0 5 0V3M7 11v10"/><path d="M17 21V3c-2 0-3.5 2.5-3.5 6s1.5 4 3.5 4"/>',
  shopping: '<path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  beleza: '<circle cx="6.5" cy="17.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/><path d="M8.3 15.8 18 4M15.7 15.8 6 4"/>',
  venue: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
};

export function PlaceIcon({ kind, className = "h-5 w-5" }: { kind: PlaceCategory | "venue"; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: ICON_PATHS[kind] }}
    />
  );
}
