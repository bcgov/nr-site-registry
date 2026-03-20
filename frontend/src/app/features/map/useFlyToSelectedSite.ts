import { RefObject, useEffect, useRef } from 'react';
import { Map } from 'leaflet';
import { MAP_FLY_OPTIONS, getZoom } from './mapOptions';

/**
 * Fly the map to the selected site once per selectedSiteId when coords load.
 */
export function useFlyToSelectedSite(
  mapRef: RefObject<Map | null>,
  selectedSiteId: string | null | undefined,
  latdeg: number | null | undefined,
  longdeg: number | null | undefined,
): void {
  const hasFlownToSelectedSiteRef = useRef<string | null>(null);
  useEffect(() => {
    if (!selectedSiteId) {
      hasFlownToSelectedSiteRef.current = null;
      return;
    }
    if (!latdeg || !longdeg || !mapRef.current) {
      return;
    }
    if (hasFlownToSelectedSiteRef.current === selectedSiteId) {
      return;
    }
    hasFlownToSelectedSiteRef.current = selectedSiteId;
    mapRef.current.flyTo(
      { lat: latdeg, lng: longdeg },
      getZoom(mapRef.current),
      MAP_FLY_OPTIONS,
    );
  }, [mapRef, selectedSiteId, latdeg, longdeg]);
}
