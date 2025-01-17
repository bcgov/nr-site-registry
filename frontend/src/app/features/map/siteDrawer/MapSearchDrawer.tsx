import { Map } from 'leaflet';
import { Drawer } from '../../../components/drawer/Drawer';
import { Site } from '../MapView';
import { FC, RefObject } from 'react';
import { useMapSearchContext } from '../mapSearchQueryParamsContext/MapSearchQueryParamsContext';
import { SearchResultsDrawerContent } from './SearchResultsDrawerContent';
import { SiteDetailsDrawerContent } from './SiteDetailsDrawerContent';
import { ActiveToolEnum } from '../../../constants/Constant';

interface MapSearchDrawerProps {
  mapRef: RefObject<Map | null>;
  sites: Site[];
  sitesLoading: boolean;
  activeTool: ActiveToolEnum | null;
  radius: number;
}
export const MapSearchDrawer: FC<MapSearchDrawerProps> = ({
  mapRef,
  sites,
  sitesLoading,
  activeTool,
  radius,
}) => {
  const { selectedSiteId, searchTerm, clearQuery } = useMapSearchContext();

  let drawerTitle = '';
  if (searchTerm) drawerTitle = 'Search Results';
  if (selectedSiteId) drawerTitle = 'Selected Site';
  if (activeTool === ActiveToolEnum.radiusSearch && radius > 500)
    drawerTitle = 'Radius Search';
  return (
    <Drawer
      isOpen={
        !!selectedSiteId ||
        !!searchTerm ||
        (activeTool === ActiveToolEnum.radiusSearch &&
          sites.length > 0 &&
          radius > 500)
      }
      onClose={clearQuery}
      title={drawerTitle}
    >
      {searchTerm && !selectedSiteId && (
        <SearchResultsDrawerContent
          siteIds={sites.map((site) => site.id)}
          loading={sitesLoading}
        />
      )}
      {!searchTerm &&
        !selectedSiteId &&
        activeTool === ActiveToolEnum.radiusSearch &&
        radius > 500 && (
          <SearchResultsDrawerContent
            siteIds={sites.map((site) => site.id)}
            loading={sitesLoading}
          />
        )}
      {selectedSiteId && <SiteDetailsDrawerContent mapRef={mapRef} />}
    </Drawer>
  );
};
