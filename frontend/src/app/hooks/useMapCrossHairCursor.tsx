import { useEffect } from 'react';
import L from 'leaflet';

export function useMapCrosshairsCursor(map: L.Map, enabled = true) {
  // Show crosshairs cursor
  useEffect(() => {
    const container = map.getContainer();
    if (container) {
      if (enabled) {
        L.DomUtil.addClass(container, 'crosshairs-cursor');
      }
      return () => {
        L.DomUtil.removeClass(container, 'crosshairs-cursor');
      };
    }
  }, [map, enabled]);

  return null;
}
