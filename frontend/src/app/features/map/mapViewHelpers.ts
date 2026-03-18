import { LatLngBounds } from 'leaflet';

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
