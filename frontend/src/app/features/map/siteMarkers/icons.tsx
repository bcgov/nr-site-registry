import { Icon } from 'leaflet';
import mapMarkerDefault from './assets/map_marker_default.png';
import mapMarkerHover from './assets/map_marker_hover.png';
import mapMarkerSelected from './assets/map_marker_selected.png';

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
