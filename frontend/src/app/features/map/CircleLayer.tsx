import { Circle, useMap, useMapEvents } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';
import { LatLngTuple, LeafletMouseEvent, Map } from 'leaflet';
import { useMapCrosshairsCursor } from '../../hooks/useMapCrossHairCursor';
import { CrosshairsTooltipMarker } from './CrossHairToolTipMarker';
import { Site } from './MapView';
import { getDistance } from 'geolib';
import { MIN_CIRCLE_RADIUS } from '../../constants/Constant';

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

  const previousSitesRef = useRef<Site[]>([]);

  useMapEvents({
    click: (ev: LeafletMouseEvent) => {
      const newCenter: LatLngTuple = [ev.latlng.lat, ev.latlng.lng];
      setCenter(newCenter);
      previousSitesRef.current = sites;
      onCrossHairClick();
    },
  });

  const calculateBoundingBox = (center: LatLngTuple, radius: number) => {
    console.log('nupur: center is : ', center);
    const [centerLat, centerLon] = center;
    console.log('nupur: centerLat is : ', centerLat);
    console.log('nupur: centerLon is : ', centerLon);
    const earthRadius = 6371e3; // Earth's radius in meters

    /*latDelta: The change in latitude (latDelta) is calculated by dividing the radius by the Earth's radius.
     * This gives the angular distance in radians.
     * lonDelta: The change in longitude (lonDelta) is calculated similarly but adjusted by the cosine of the latitude to account for the Earth's curvature.
     * The angular distances are converted from radians to degrees by multiplying by 180 and dividing by π.
     * Bounding Box Calculation: The minimum and maximum latitudes and longitudes are calculated by subtracting and adding the deltas to the center coordinates.
     */
    const latDelta = radius / earthRadius;

    const lonDelta =
      radius / (earthRadius * Math.cos((Math.PI * centerLat) / 180));

    const minLat = centerLat - (latDelta * 180) / Math.PI;
    const maxLat = centerLat + (latDelta * 180) / Math.PI;
    const minLon = centerLon - (lonDelta * 180) / Math.PI;
    const maxLon = centerLon + (lonDelta * 180) / Math.PI;
    console.log(
      'nupur: minLat is : ',
      minLat,
      ' , maxLat is : ',
      maxLat,
      ' , minLon is : ',
      minLon,
      ' , maxLon is : ',
      maxLon,
    );
    return { minLat, maxLat, minLon, maxLon };
  };

  const findSitesWithinCircle = (
    center: LatLngTuple,
    radius: number,
    prevSites: Site[],
  ) => {
    if (!center) return [];
    const [centerLat, centerLon] = center;
    console.log('nupur: sites(previousSiteRef.current) are is : ', sites);
    const { minLat, maxLat, minLon, maxLon } = calculateBoundingBox(
      center,
      radius,
    );

    // Filter sites within the bounding box
    const sitesWithinBoundingBox = prevSites.filter((site) => {
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
    console.log(
      'nupur: sitesWithinBoundingBox is : ',
      sitesWithinBoundingBox.length,
    );

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
    console.log('nupur: sitesWithinCircle is : ', sitesWithinCircle.length);
    return sitesWithinCircle;
  };

  useEffect(() => {
    if (center && radius > MIN_CIRCLE_RADIUS) {
      const filteredSites = findSitesWithinCircle(
        center,
        radius,
        previousSitesRef.current,
      );
      console.log('nupur: filteredSites is : ', filteredSites.length);
      if (setSites) {
        setSites(filteredSites);
      }
    }
  }, [center, radius]);

  const drawCircle = center && radius > 500;

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
