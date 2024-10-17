import { FC } from 'react';
import { MapSearchQuery } from '../../../../graphql/generated';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { SiteMarker } from './SiteMarker';
import { StringParam, useQueryParam } from 'use-query-params';
import { useMap } from 'react-leaflet';

type Site = MapSearchQuery['searchSites']['sites'][number];
interface SiteMarkersProps {
  sites: Site[];
}

export const SiteMarkers: FC<SiteMarkersProps> = ({ sites }) => {
  const map = useMap();

  const [selectedSiteId, setSelectedSiteId] = useQueryParam(
    'site',
    StringParam,
  );

  const onSiteMarkerClick = (site: Site) => {
    setSelectedSiteId(site.id, 'replace');
    moveToSiteLocation(site);
  };

  const moveToSiteLocation = (site: Site) => {
    map.flyTo(
      {
        lat: site.latdeg || 0,
        lng: site.longdeg ? site.longdeg * -1 : 0,
      },
      Math.max(map.getZoom(), 14),
      {
        animate: true,
        duration: 1,
      },
    );
  };

  return (
    <MarkerClusterGroup
      chunkedLoading
      maxClusterRadius={20}
      spiderfyOnMaxZoom
      showCoverageOnHover
    >
      {sites.map((site) => (
        <SiteMarker
          key={site.id}
          isSelected={site.id === selectedSiteId}
          position={{
            lat: site.latdeg || 0,
            lng: site.longdeg ? site.longdeg * -1 : 0,
          }}
          onClick={() => onSiteMarkerClick(site)}
        />
      ))}
    </MarkerClusterGroup>
  );
};
