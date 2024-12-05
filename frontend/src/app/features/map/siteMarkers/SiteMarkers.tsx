import { FC, useCallback, useMemo } from 'react';
import { MapSearchQuery } from '../../../../graphql/generated';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { SiteMarker } from './SiteMarker';
import { StringParam, useQueryParam } from 'use-query-params';
import { useMap } from 'react-leaflet';

type Site = MapSearchQuery['mapSearch']['data'][number];
interface SiteMarkersProps {
  sites: Site[];
}

export const SiteMarkers: FC<SiteMarkersProps> = ({ sites }) => {
  const map = useMap();

  const [selectedSiteId, setSelectedSiteId] = useQueryParam(
    'site',
    StringParam,
  );

  const moveToSiteLocation = useCallback(
    (site: Site) => {
      if (!site.latdeg || !site.longdeg) return;

      map.flyTo(
        {
          lat: site.latdeg,
          lng: site.longdeg,
        },
        Math.max(map.getZoom(), 14),
        {
          animate: true,
          duration: 1,
        },
      );
    },
    [map],
  );

  const onSiteMarkerClick = useCallback(
    (site: Site) => {
      setSelectedSiteId(site.id);
      moveToSiteLocation(site);
    },
    [moveToSiteLocation, setSelectedSiteId],
  );

  const markers = useMemo(() => {
    return sites.map((site) => {
      if (!site.latdeg || !site.longdeg) return null;
      return (
        <SiteMarker
          key={site.id}
          isSelected={site.id === selectedSiteId}
          position={{
            lat: site.latdeg,
            lng: site.longdeg,
          }}
          onClick={() => onSiteMarkerClick(site)}
        />
      );
    });
  }, [onSiteMarkerClick, selectedSiteId, sites]);

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={80}
      spiderfyOnMaxZoom={false}
      showCoverageOnHover={false}
    >
      {markers}
    </MarkerClusterGroup>
  );
};
