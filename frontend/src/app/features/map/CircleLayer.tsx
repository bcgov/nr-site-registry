import { Circle, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useState } from 'react';
import { LatLngTuple, LeafletMouseEvent, Map } from 'leaflet';
import { useMapCrosshairsCursor } from '../../hooks/useMapCrossHairCursor';
import { CrosshairsTooltipMarker } from './CrossHairToolTipMarker';
import { Site } from './MapView';
import { getDistance } from 'geolib';

interface CircleLayerProps {
  radius: number;
  onCrossHairClick: () => void;
  sites: Site[];
  setSites: React.Dispatch<React.SetStateAction<Site[]>> | null;
}

export function CircleLayer({
  radius,
  onCrossHairClick,
  sites,
  setSites,
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

  const calculateBoundingBox = (center: LatLngTuple, radius: number) => {
    const [centerLat, centerLon] = center;
    const earthRadius = 6371e3; // Earth's radius in meters

    const latDelta = radius / earthRadius;
    const lonDelta =
      radius / (earthRadius * Math.cos((Math.PI * centerLat) / 180));

    const minLat = centerLat - (latDelta * 180) / Math.PI;
    const maxLat = centerLat + (latDelta * 180) / Math.PI;
    const minLon = centerLon - (lonDelta * 180) / Math.PI;
    const maxLon = centerLon + (lonDelta * 180) / Math.PI;

    return { minLat, maxLat, minLon, maxLon };
  };

  const findSitesWithinCircle = (
    center: LatLngTuple,
    radius: number,
    sites: Site[],
  ) => {
    if (!center) return [];
    const [centerLat, centerLon] = center;

    const { minLat, maxLat, minLon, maxLon } = calculateBoundingBox(
      center,
      radius,
    );

    // Filter sites within the bounding box
    const sitesWithinBoundingBox = sites.filter((site) => {
      return (
        site.latdeg !== null &&
        site.latdeg !== undefined &&
        site.longdeg !== null &&
        site.longdeg !== undefined &&
        site.latdeg >= minLat &&
        site.latdeg <= maxLat &&
        site.longdeg >= minLon &&
        site.longdeg <= maxLon
      );
    });

    // return sites.filter((site: any) => {
    // console.log("nupur: site is : ", site);
    //   const distance = getDistance(
    //     { latitude: centerLat, longitude: centerLon },
    //     { latitude: site.latdeg, longitude: site.longdeg }
    //   );
    //   return distance <= radius;
    // });

    const sitesWithinCircle = sitesWithinBoundingBox.filter((site) => {
      const distance =
        site.latdeg !== null && site.longdeg !== null
          ? getDistance(
              { latitude: centerLat, longitude: centerLon },
              {
                latitude: Number(site.latdeg),
                longitude: Number(site.longdeg),
              },
            )
          : 0;
      return distance <= radius;
    });

    return sitesWithinCircle;
  };

  useEffect(() => {
    if (center && radius > 0) {
      const filteredSites = findSitesWithinCircle(center, radius, sites);
      if (setSites) {
        setSites(filteredSites);
      }
    }
  }, [center, radius, sites, setSites]);

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
