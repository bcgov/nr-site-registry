import { LatLngBounds } from 'leaflet';
import { MAP_FLY_OPTIONS } from './mapOptions';

/** Build bounds from site coordinates (for text search fly-to-bounds). */
export function extendSearchResultBounds(
  sites: { latdeg?: number | null; longdeg?: number | null }[],
): LatLngBounds {
  const bounds = new LatLngBounds([]);
  for (const site of sites) {
    if (!site.latdeg || !site.longdeg) {
      continue;
    }
    bounds.extend({ lat: site.latdeg, lng: site.longdeg });
  }
  return bounds;
}

/**
 * When no draw tool is active (activeTool === null), map list should mirror mapSearch.
 * Returns null when a tool is active so callers skip setState.
 */
export function sitesWhenMapToolCleared<T>(
  activeTool: unknown,
  mapSearchData: T[] | undefined,
): T[] | null {
  if (activeTool !== null) {
    return null;
  }
  return mapSearchData || [];
}

export interface LeafletMapFlyToBounds {
  flyToBounds(bounds: LatLngBounds, options: typeof MAP_FLY_OPTIONS): void;
}

/** After text search results load, fit map bounds when search term is set. */
export function flyToBoundsForTextSearch(
  searchTerm: string,
  siteList: { latdeg?: number | null; longdeg?: number | null }[],
  map: LeafletMapFlyToBounds | null,
): void {
  if (!searchTerm || !map) {
    return;
  }
  const bounds = extendSearchResultBounds(siteList);
  if (bounds.isValid()) {
    map.flyToBounds(bounds, MAP_FLY_OPTIONS);
  }
}
