import { PlaceRoute, placeMetadata, placeStaticParams, type PlaceRouteProps } from "@/lib/content/place-route";

/** Página de um lugar do "Onde ficar e aproveitar" (árabe, da direita pra esquerda). */
export const dynamicParams = false;
export const generateStaticParams = placeStaticParams;
export const generateMetadata = (props: PlaceRouteProps) => placeMetadata("ar", props);

export default function PlacePageAr(props: PlaceRouteProps) {
  return <PlaceRoute locale="ar" params={props.params} />;
}
