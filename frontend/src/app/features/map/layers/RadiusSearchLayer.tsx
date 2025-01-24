import { Circle, useMap, useMapEvents } from 'react-leaflet';
import { ActiveToolEnum } from '../../../constants/Constant';
import { useMapCrosshairsCursor } from '../../../hooks/useMapCrossHairCursor';
import { CircleLayer } from '../CircleLayer';
import { Site } from '../MapView';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';
import { LatLngTuple, LeafletMouseEvent } from 'leaflet';
import { CrosshairsTooltipMarker } from '../CrossHairToolTipMarker';

interface RadiusSearchLayerProps {
  onCrossHairClick: () => void;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>> | null;
}
export function RadiusSearchLayer({
  onCrossHairClick,
}: Readonly<RadiusSearchLayerProps>) {
  const { center, radius, onRadiusCrossHairClick, activeTool } =
    useMapSearchContext();
  const map = useMap();

  useMapCrosshairsCursor(map);

  useMapEvents({
    click: (ev: LeafletMouseEvent) => {
      const newCenter: LatLngTuple = [ev.latlng.lat, ev.latlng.lng];
      onRadiusCrossHairClick(newCenter);
      onCrossHairClick();
    },
  });
  const drawCircle = center && radius > 500;

  if (activeTool === ActiveToolEnum.radiusSearch) {
    return (
      <>
        <CrosshairsTooltipMarker center={center}>
          Click to place center point
        </CrosshairsTooltipMarker>
        {drawCircle && (
          <Circle
            center={center}
            radius={radius}
            stroke
            fill
            className="point-search-circle"
          />
        )}
      </>
    );
  }
  return null;
}
