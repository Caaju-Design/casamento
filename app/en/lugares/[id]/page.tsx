import { PlaceRoute, placeMetadata, placeStaticParams, type PlaceRouteProps } from "@/lib/content/place-route";

/** Página de um lugar do "Onde ficar e aproveitar" (inglês). */
export const dynamicParams = false;
export const generateStaticParams = placeStaticParams;
export const generateMetadata = (props: PlaceRouteProps) => placeMetadata("en", props);

export default function PlacePageEn(props: PlaceRouteProps) {
  return <PlaceRoute locale="en" params={props.params} />;
}
