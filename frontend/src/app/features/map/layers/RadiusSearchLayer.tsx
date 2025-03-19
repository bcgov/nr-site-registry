import { Circle, useMap, useMapEvents } from 'react-leaflet';
import { ActiveToolEnum, MIN_CIRCLE_RADIUS } from '../../../constants/Constant';
import { useMapCrosshairsCursor } from '../../../hooks/useMapCrossHairCursor';
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
  const { center, radius, setCenterOnCrossHairClick, activeTool } =
    useMapSearchContext();
  const map = useMap();

  const radiusSearchEnabled = activeTool === ActiveToolEnum.radiusSearch;

  useMapCrosshairsCursor(map, radiusSearchEnabled);

  useMapEvents({
    click: (ev: LeafletMouseEvent) => {
      if (!radiusSearchEnabled) return;
      const newCenter: LatLngTuple = [ev.latlng.lat, ev.latlng.lng];
      setCenterOnCrossHairClick(newCenter);
      onCrossHairClick();
    },
  });

  const drawCircle = center && radius >= MIN_CIRCLE_RADIUS;

  if (radiusSearchEnabled) {
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
