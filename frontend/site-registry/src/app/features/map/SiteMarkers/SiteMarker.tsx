import { FC, useState } from 'react';
import { IconMarker } from '../IconMarker';
import L, { LatLngLiteral } from 'leaflet';

import mapMarkerDefault from './assets/map_marker_default.png';
import mapMarkerHover from './assets/map_marker_hover.png';
import mapMarkerSelected from './assets/map_marker_selected.png';

const mapIconDefault = new L.Icon({
  iconUrl: mapMarkerDefault,
  iconSize: [50, 65],
  iconAnchor: [25, 65],
});

const mapIconHover = new L.Icon({
  iconUrl: mapMarkerHover,
  iconSize: [55, 75],
  iconAnchor: [27.5, 75],
});

const mapIconSelected = new L.Icon({
  iconUrl: mapMarkerSelected,
  iconSize: [55, 75],
  iconAnchor: [27.5, 75],
});

interface SiteMarkerProps {
  position: LatLngLiteral;
  onClick: () => void;
  isSelected?: boolean;
}
export const SiteMarker: FC<SiteMarkerProps> = ({
  position,
  onClick,
  isSelected = false,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  let icon = isHovered ? mapIconHover : mapIconDefault;
  if (isSelected) {
    icon = mapIconSelected;
  }
  return (
    <IconMarker
      position={position}
      icon={icon}
      onClick={onClick}
      onHover={setIsHovered}
    />
  );
};
