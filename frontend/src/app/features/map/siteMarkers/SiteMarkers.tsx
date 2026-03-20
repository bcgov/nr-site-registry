import { FC, useCallback, useMemo, type ReactNode } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { SiteMarker } from './SiteMarker';
import { useMap } from 'react-leaflet';
import { getZoom, MAP_FLY_OPTIONS } from '../mapOptions';
import { Site } from '../MapView';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';

interface SiteMarkersProps {
  sites: Site[];
}

export const SiteMarkers: FC<SiteMarkersProps> = ({ sites }) => {
  const map = useMap();

  const { selectedSiteId, setQuery } = useMapSearchContext();

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

  const { selectedMarker, clusterMarkers } = useMemo(() => {
    const restMarkers: React.ReactNode[] = [];
    const selectedSite = sites.find(
      (site) =>
        site.latdeg != null &&
        site.longdeg != null &&
        String(site.id) === String(selectedSiteId),
    );
    sites.forEach((site) => {
      if (!site.latdeg || !site.longdeg) return;
      const isSelected = String(site.id) === String(selectedSiteId);
      if (!isSelected) {
        restMarkers.push(
          <SiteMarker
            key={site.id}
            isSelected={false}
            position={{
              lat: site.latdeg,
              lng: site.longdeg,
            }}
            onClick={() => onSiteMarkerClick(site)}
          />,
        );
      }
    });
    let selectedMarkerNode: ReactNode = null;
    if (selectedSite) {
      selectedMarkerNode = (
        <SiteMarker
          key={selectedSite.id}
          isSelected={true}
          position={{
            lat: selectedSite.latdeg ?? 0,
            lng: selectedSite.longdeg ?? 0,
          }}
          onClick={() => onSiteMarkerClick(selectedSite)}
        />
      );
    }
    return {
      selectedMarker: selectedMarkerNode,
      clusterMarkers: restMarkers,
    };
  }, [onSiteMarkerClick, selectedSiteId, sites]);

  return (
    <>
      {selectedMarker}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={80}
        spiderfyOnMaxZoom={false}
        showCoverageOnHover={false}
      >
        {clusterMarkers}
      </MarkerClusterGroup>
    </>
  );
};
