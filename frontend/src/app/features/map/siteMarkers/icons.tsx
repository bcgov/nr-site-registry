import L, { Icon, DivIcon } from 'leaflet';
import mapMarkerDefault from './assets/map_marker_default.png';
import mapMarkerHover from './assets/map_marker_hover.png';
import mapMarkerSelected from './assets/map_marker_selected.png';
import crosshairsSvg from './assets/crosshairsSvg.svg';

export const mapMarkerIconDefault = new Icon({
  iconUrl: mapMarkerDefault,
  iconSize: [50, 65],
  iconAnchor: [25, 65],
});

export const mapMarkerIconHover = new Icon({
  iconUrl: mapMarkerHover,
  iconSize: [55, 75],
  iconAnchor: [27.5, 75],
});

export const mapMarkerIconSelected = new Icon({
  iconUrl: mapMarkerSelected,
  iconSize: [55, 75],
  iconAnchor: [27.5, 75],
});

// Used by Polygon and Point search tools
export const crosshairsIcon = new Icon({
  iconUrl: crosshairsSvg,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  // relative to iconAnchor
  popupAnchor: [32, 0],
  tooltipAnchor: [32, 0],
  className: 'crosshairs-icon',
});

export const emptyIcon = new DivIcon({
  html: '<span/>',
  className: 'empty-icon',
  iconSize: [0, 0],
});
