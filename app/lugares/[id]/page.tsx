import { PlaceRoute, placeMetadata, placeStaticParams, type PlaceRouteProps } from "@/lib/content/place-route";

/** Página de um lugar do "Onde ficar e aproveitar" (português). */
export const dynamicParams = false;
export const generateStaticParams = placeStaticParams;
export const generateMetadata = (props: PlaceRouteProps) => placeMetadata("pt", props);

export default function PlacePage(props: PlaceRouteProps) {
  return <PlaceRoute locale="pt" params={props.params} />;
}
