import { Map } from 'leaflet';

export const MAP_FLY_OPTIONS = { animate: true, duration: 1 };

export const getZoom = (mapObject: Map) => Math.max(mapObject.getZoom(), 14);
