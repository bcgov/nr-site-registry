import { useEffect, useRef, RefObject } from 'react';
import L, { Map } from 'leaflet';
import { Circle, Tooltip, useMap } from 'react-leaflet';

import { useMyLocation } from '../../../hooks/useMyLocation';
import { IconMarker } from './IconMarker';

import './MyLocationMarker.css';
import { useMyLocationVisible } from './map-slice';

export function myLocationIcon() {
  const size = 24;
  return L.divIcon({
    html: `<div class="my-location-pulse"></div>
    <svg width="${size}" height="${size}" viewBox="0 0 36 36" fill="none">
      <title>My location marker</title>
      <circle cx="18" cy="18" r="10" class="my-location-circle" />
    </svg>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    tooltipAnchor: [0, -size / 2],
    className: 'my-location-marker',
  });
}

const locationIcon = myLocationIcon();

interface MyLocationMarkerContentProps {
  mapRef: RefObject<Map | null>;
  isVisible: boolean;
}

function MyLocationMarkerContent({ mapRef }: MyLocationMarkerContentProps) {
  // const map = useMap();
  const hasZoomedToMyLocationRef = useRef(false);
  const { position, accuracy = 0 } = useMyLocation();

  // The first time my location changes - zoom to that location
  useEffect(() => {
    console.log('nupur - mapfef', mapRef);
    if (position && !hasZoomedToMyLocationRef.current && mapRef.current) {
      hasZoomedToMyLocationRef.current = true;
      mapRef.current.flyTo(position, Math.max(mapRef.current.getZoom(), 14), {
        animate: true,
        duration: 1,
      });
    }
  }, [mapRef, position]);

  return position ? (
    <>
      {Math.round(accuracy) >= 1 && (
        <Circle
          center={position}
          radius={Math.round(accuracy / 2)}
          className="my-location-accuracy-circle"
        />
      )}
      <IconMarker position={position} icon={locationIcon} zIndexOffset={1000}>
        <Tooltip direction="top">My location</Tooltip>
      </IconMarker>
    </>
  ) : null;
}

export function MyLocationMarker({
  mapRef,
  isVisible,
}: MyLocationMarkerContentProps) {
  //const isVisible = useMyLocationVisible();
  return isVisible ? (
    <MyLocationMarkerContent mapRef={mapRef} isVisible={isVisible} />
  ) : null;
}
