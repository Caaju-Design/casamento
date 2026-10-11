"use client";

import { AroundMap, type AroundMapLabels } from "@/components/molecules/AroundMap";
import type { Place } from "@/lib/content/places";

/** Molecule `PlaceMap` — o mapa da região com um lugar só (página /lugares/<id>), já com o nome no pin e o salão enquadrado. */
export function PlaceMap({ place, labels }: { place: Place; labels: AroundMapLabels }) {
  return <AroundMap places={[place]} activeId={place.id} onSelect={() => {}} labels={labels} fitAll />;
}
