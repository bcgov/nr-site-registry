import { FC, memo, useState } from 'react';
import { IconMarker } from '../IconMarker';
import { LatLngLiteral } from 'leaflet';
import { mapIconDefault, mapIconHover, mapIconSelected } from './icons';

interface SiteMarkerProps {
  position: LatLngLiteral;
  onClick?: () => void;
  isSelected?: boolean;
}
const SiteMarkerBase: FC<SiteMarkerProps> = ({
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

export const SiteMarker = memo(SiteMarkerBase, (prevProps, nextProps) => {
  return (
    prevProps.isSelected === nextProps.isSelected &&
    prevProps.position.lat === nextProps.position.lat &&
    prevProps.position.lng === nextProps.position.lng
  );
});
