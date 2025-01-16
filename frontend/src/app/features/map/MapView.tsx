import { useContext, useEffect, useRef, useState } from 'react';
import { LatLngBounds, LatLngTuple, Map } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import clsx from 'clsx';

import { MyLocationMarker } from './MyLocationMarker'; // Import the MyLocationMarker component

import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { MapSearch } from './MapSearch';
import { MapSearchQuery, useMapSearchQuery } from '../../../graphql/generated';
import { SiteMarkers } from './siteMarkers/SiteMarkers';
import { MapControls } from './MapControls';
import { MAP_FLY_OPTIONS } from './mapOptions';
import {
  MapSearchQueryParamsContext,
  MapSearchQueryProvider,
} from './mapSearchQueryParamsContext/MapSearchQueryParamsContext';
import { MapSearchDrawer } from './siteDrawer/MapSearchDrawer';
import { ActiveToolEnum, MIN_CIRCLE_RADIUS } from '../../constants/Constant';
import { RadiusSearchLayer } from './layers/RadiusSearchLayer';

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

  const { searchTerm } = useContext(MapSearchQueryParamsContext);

  const { data, loading: sitesLoading } = useMapSearchQuery({
    variables: {
      searchParam: searchTerm || '',
    },
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
  const [radius, setRadius] = useState(MIN_CIRCLE_RADIUS);
  const [activeTool, setActiveTool] = useState<ActiveToolEnum | null>(null);
  const [sites, setSites] = useState<Site[]>([]);
  const clearSites = () => setSites([]);

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
        <SiteMarkers sites={sites} />
        <RadiusSearchLayer
          activeTool={activeTool}
          radius={radius}
          onCrossHairClick={clearSites}
        />
      </MapContainer>
      <MapSearch
        mapRef={mapRef}
        isLocationVisible={isLocationVisible}
        setLocationVisible={setLocationVisible}
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        radius={radius}
        setRadius={setRadius}
      />

      <MapSearchDrawer
        mapRef={mapRef}
        sites={data?.mapSearch.data || []}
        sitesLoading={sitesLoading}
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
