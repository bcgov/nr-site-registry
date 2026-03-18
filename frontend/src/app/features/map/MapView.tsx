import { useEffect, useRef, useState } from 'react';
import { LatLngBounds, LatLngTuple, Map } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import clsx from 'clsx';

import { MyLocationMarker } from './MyLocationMarker'; // Import the MyLocationMarker component

import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { MapSearch } from './MapSearch';
import {
  MapSearchQuery,
  MapSearchQueryVariables,
  useMapSearchQuery,
  useMapSearch_FindSiteBySiteIdQuery,
} from '../../../graphql/generated';
import { SiteMarkers } from './siteMarkers/SiteMarkers';
import { MapControls } from './MapControls';
import { MAP_FLY_OPTIONS, getZoom } from './mapOptions';
import {
  MapSearchQueryProvider,
  useMapSearchContext,
} from './mapSearchContext/MapSearchContext';
import { MapSearchDrawer } from './siteDrawer/MapSearchDrawer';
import { RadiusSearchLayer } from './layers/RadiusSearchLayer';
import { PolygonSearchLayer } from './layers/PolygonSearchLayer';
import { MIN_CIRCLE_RADIUS } from '../../constants/Constant';
import { MapDataLayers } from './dataLayers/MapDataLayers';
import { buildSitesToShow } from './buildSitesToShow';
import { useFlyToSelectedSite } from './useFlyToSelectedSite';

// Set the position of the marker for center of BC
const CENTER_OF_BC: LatLngTuple = [53.7267, -127.6476];

export type Site = MapSearchQuery['mapSearch']['data'][number];

/**
 * Renders a map with a marker at the supplied location
 */
function MapView() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  // Feature flag for turning OpenStreetMap tiles gray
  const osmGrayscale = false;

  const {
    searchTerm,
    activeTool,
    polygonVertices,
    center,
    radius,
    selectedSiteId,
  } = useMapSearchContext();

  const variables: MapSearchQueryVariables = {
    searchParam: searchTerm || '',
    ...(polygonVertices.length > 0 && { polygon: polygonVertices }),
  };

  if (center && radius >= MIN_CIRCLE_RADIUS) {
    variables.circle = { center, radius };
  }

  const { data, loading: sitesLoading } = useMapSearchQuery({
    variables,
    onCompleted: ({ mapSearch: { data } }) => {
      flyToSiteBounds(data);
      setSites(data);
    },
  });

  const flyToSiteBounds = (sites: Site[]) => {
    if (!searchTerm || !mapRef.current) return;

    const bounds = new LatLngBounds([]);
    sites.forEach((site) => {
      if (!site.latdeg || !site.longdeg) return;
      const lat = site.latdeg;
      const lng = site.longdeg;
      bounds.extend({ lat, lng });
    });
    if (bounds.isValid()) {
      mapRef.current.flyToBounds(bounds, MAP_FLY_OPTIONS);
    }
  };

  const mapRef = useRef<Map>(null);
  const [isLocationVisible, setLocationVisible] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const clearSites = () => setSites([]);

  const { data: selectedSiteData } = useMapSearch_FindSiteBySiteIdQuery({
    variables: { siteId: selectedSiteId ?? '' },
    skip: !selectedSiteId,
  });
  const selectedSite = selectedSiteData?.findSiteBySiteId?.data;

  const sitesToShow = buildSitesToShow(
    sites,
    selectedSiteId,
    selectedSite ?? undefined,
  );

  useFlyToSelectedSite(
    mapRef,
    selectedSiteId,
    selectedSite?.latdeg ?? undefined,
    selectedSite?.longdeg ?? undefined,
  );

  useEffect(() => {
    if (activeTool === null) {
      setSites(data?.mapSearch.data || []);
    }
  }, [activeTool]);

  return (
    <div
      className={clsx('map-view', isSmall && 'map-view--small')}
      data-testid="map-view"
    >
      <MapContainer
        center={CENTER_OF_BC}
        zoom={6}
        zoomControl={false}
        className="map-container"
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={clsx(osmGrayscale && 'osm--grayscale')}
        />
        <MapControls
          isLocationVisible={isLocationVisible}
          setLocationVisible={setLocationVisible}
        />
        {<MyLocationMarker isLocationVisible={isLocationVisible} />}
        <SiteMarkers sites={sitesToShow} />
        <RadiusSearchLayer
          onCrossHairClick={clearSites}
          sites={sites}
          setSites={setSites}
        />

        <PolygonSearchLayer />
        <MapDataLayers />
      </MapContainer>
      <MapSearch
        mapRef={mapRef}
        isLocationVisible={isLocationVisible}
        setLocationVisible={setLocationVisible}
      />

      <MapSearchDrawer
        mapRef={mapRef}
        // TODO: replace this with the query results (`data?.mapSearch.data || []`)
        // and remove `sites` state variable once radius search is fixed
        sites={sites}
        sitesLoading={sitesLoading}
        activeTool={activeTool}
      />
    </div>
  );
}

const MapViewWithProviders = () => (
  <MapSearchQueryProvider>
    <MapView />
  </MapSearchQueryProvider>
);

export default MapViewWithProviders;
