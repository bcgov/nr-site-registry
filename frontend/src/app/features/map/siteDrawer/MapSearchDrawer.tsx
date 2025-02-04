import { Map } from 'leaflet';
import { Drawer } from '../../../components/drawer/Drawer';
import { Site } from '../MapView';
import { FC, RefObject } from 'react';
import { useMapSearchContext } from '../mapSearchContext/MapSearchContext';
import { SearchResultsDrawerContent } from './SearchResultsDrawerContent';
import { SiteDetailsDrawerContent } from './SiteDetailsDrawerContent';
import { ActiveToolEnum, MIN_CIRCLE_RADIUS } from '../../../constants/Constant';

interface MapSearchDrawerProps {
  mapRef: RefObject<Map | null>;
  sites: Site[];
  sitesLoading: boolean;
  activeTool: ActiveToolEnum | null;
}
export const MapSearchDrawer: FC<MapSearchDrawerProps> = ({
  mapRef,
  sites,
  sitesLoading,
  activeTool,
}) => {
  const { selectedSiteId, searchTerm, clearQuery, polygonVertices, radius } =
    useMapSearchContext();

  const isPolygonValid = polygonVertices.length > 2;

  let drawerTitle = '';
  if (searchTerm) drawerTitle = 'Search Results';
  if (selectedSiteId) drawerTitle = 'Selected Site';
  if (activeTool === ActiveToolEnum.radiusSearch && radius > 500)
    drawerTitle = 'Radius Search';
  if (activeTool === ActiveToolEnum.polygonSearch)
    drawerTitle = 'Search Results';
  return (
    <Drawer
      isOpen={
        !!selectedSiteId ||
        !!searchTerm ||
        isPolygonValid ||
        (activeTool === ActiveToolEnum.radiusSearch &&
          sites.length > 0 &&
          radius > MIN_CIRCLE_RADIUS)
      }
      onClose={clearQuery}
      title={drawerTitle}
    >
      {(searchTerm || isPolygonValid) && !selectedSiteId && (
        <SearchResultsDrawerContent
          siteIds={sites.map((site) => site.id)}
          loading={sitesLoading}
        />
      )}
      {!searchTerm &&
        !selectedSiteId &&
        activeTool === ActiveToolEnum.radiusSearch &&
        radius >= MIN_CIRCLE_RADIUS && (
          <SearchResultsDrawerContent
            siteIds={sites.map((site) => site.id)}
            loading={sitesLoading}
          />
        )}
      {selectedSiteId && <SiteDetailsDrawerContent mapRef={mapRef} />}
    </Drawer>
  );
};
