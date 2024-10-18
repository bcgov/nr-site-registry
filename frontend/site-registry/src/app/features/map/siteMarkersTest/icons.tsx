import L from 'leaflet';
import mapMarkerDefault from './assets/map_marker_default.png';
import mapMarkerHover from './assets/map_marker_hover.png';
import mapMarkerSelected from './assets/map_marker_selected.png';

export const mapIconDefault = new L.Icon({
  iconUrl: mapMarkerDefault,
  iconSize: [50, 65],
  iconAnchor: [25, 65],
});

export const mapIconHover = new L.Icon({
  iconUrl: mapMarkerHover,
  iconSize: [55, 75],
  iconAnchor: [27.5, 75],
});

export const mapIconSelected = new L.Icon({
  iconUrl: mapMarkerSelected,
  iconSize: [55, 75],
  iconAnchor: [27.5, 75],
});
