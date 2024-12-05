import { Map } from 'leaflet';
import { Drawer } from '../../../components/drawer/Drawer';
import { Site } from '../MapView';
import { FC, RefObject, useContext } from 'react';
import { MapSearchQueryParamsContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';
import { SearchResultsDrawerContent } from './SearchResultsDrawerContent';
import { SiteDetailsDrawerContent } from './SiteDetailsDrawerContent';

interface MapSearchDrawerProps {
  mapRef: RefObject<Map | null>;
  sites: Site[];
  sitesLoading: boolean;
}
export const MapSearchDrawer: FC<MapSearchDrawerProps> = ({
  mapRef,
  sites,
  sitesLoading,
}) => {
  const { selectedSiteId, searchTerm, clearQuery } = useContext(
    MapSearchQueryParamsContext,
  );

  let drawerTitle = '';
  if (searchTerm) drawerTitle = 'Search Results';
  if (selectedSiteId) drawerTitle = 'Selected Site';
  return (
    <Drawer
      isOpen={!!selectedSiteId || !!searchTerm}
      onClose={clearQuery}
      title={drawerTitle}
    >
      {searchTerm && !selectedSiteId && (
        <SearchResultsDrawerContent sites={sites} loading={sitesLoading} />
      )}
      {selectedSiteId && <SiteDetailsDrawerContent mapRef={mapRef} />}
    </Drawer>
  );
};
