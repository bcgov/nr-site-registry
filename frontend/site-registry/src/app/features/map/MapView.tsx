import { LatLngTuple } from 'leaflet';
import { MapContainer, TileLayer } from 'react-leaflet';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import clsx from 'clsx';

//import { env } from '@/env'
//import MapSearch from './MapSearch'
import { MyLocationMarker } from './MyLocationMarker'; // Import the MyLocationMarker component

import 'leaflet/dist/leaflet.css';
import './MapView.css';
import { MapSearch } from './MapSearch';
import { useMapSearchQuery } from '../../../graphql/generated';
import { SiteMarkers } from './SiteMarkers';

// Set the position of the marker for center of BC
const CENTER_OF_BC: LatLngTuple = [53.7267, -127.6476];

/**
 * Renders a map with a marker at the supplied location
 */
function MapView() {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  // Feature flag for turning OpenStreetMap tiles gray
  const osmGrayscale = false;

  const { data } = useMapSearchQuery({
    variables: {
      searchParam: '',
    },
  });

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
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className={clsx(osmGrayscale && 'osm--grayscale')}
        />
        {/* <MyLocationMarker/> */}
        <SiteMarkers sites={data?.searchSites.sites || []} />
      </MapContainer>
      <MapSearch />
    </div>
  );
}

export default MapView;
