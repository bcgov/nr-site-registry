import type { LatLngTuple } from 'leaflet';
import type { MapSearchQueryVariables } from '../../../graphql/generated';
import { MIN_CIRCLE_RADIUS } from '../../constants/Constant';

export type MapCircleCenter = [number, number];

/** Builds GraphQL variables for mapSearch from URL/context state. */
export function buildMapSearchQueryVariables(
  searchTerm: string,
  polygonVertices: LatLngTuple[],
  center: LatLngTuple | null,
  radius: number,
  minCircleRadius: number = MIN_CIRCLE_RADIUS,
): MapSearchQueryVariables {
  const variables: MapSearchQueryVariables = {
    searchParam: searchTerm || '',
    ...(polygonVertices.length > 0 && { polygon: polygonVertices }),
  };
  if (center && radius >= minCircleRadius) {
    const circleCenter: MapCircleCenter = [center[0], center[1]];
    variables.circle = { center: circleCenter, radius };
  }
  return variables;
}
