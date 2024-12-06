import { FC, useCallback, useContext, useMemo } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { SiteMarker } from './SiteMarker';
import { useMap } from 'react-leaflet';
import { getZoom, MAP_FLY_OPTIONS } from '../mapOptions';
import { Site } from '../MapView';
import { MapSearchQueryParamsContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';

interface SiteMarkersProps {
  sites: Site[];
}

export const SiteMarkers: FC<SiteMarkersProps> = ({ sites }) => {
  const map = useMap();

  const { selectedSiteId, setQuery } = useContext(MapSearchQueryParamsContext);

  const moveToSiteLocation = useCallback(
    (site: Site) => {
      if (!site.latdeg || !site.longdeg) return;

      map.flyTo(
        {
          lat: site.latdeg,
          lng: site.longdeg,
        },
        getZoom(map),
        MAP_FLY_OPTIONS,
      );
    },
    [map],
  );

  const onSiteMarkerClick = useCallback(
    (site: Site) => {
      setQuery({ site: site.id });
      moveToSiteLocation(site);
    },
    [moveToSiteLocation, setQuery],
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
