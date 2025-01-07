import { Circle, useMap, useMapEvents } from 'react-leaflet';
import { useState } from 'react';
import { LatLngTuple, LeafletMouseEvent, Map } from 'leaflet';
import { useMapCrosshairsCursor } from '../../hooks/useMapCrossHairCursor';
import { CrosshairsTooltipMarker } from './CrossHairToolTipMarker';

interface CircleLayerProps {
  radius: number;
  onCrossHairClick: () => void;
}

export function CircleLayer({
  radius,
  onCrossHairClick,
}: Readonly<CircleLayerProps>) {
  const [center, setCenter] = useState<LatLngTuple | undefined>(undefined);
  const map = useMap();
  useMapCrosshairsCursor(map);

  useMapEvents({
    click: (ev: LeafletMouseEvent) => {
      const newCenter: LatLngTuple = [ev.latlng.lat, ev.latlng.lng];
      setCenter(newCenter);
      onCrossHairClick();
    },
  });

  const drawCircle = center && radius > 0;

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
