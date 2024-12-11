import React, { useContext, useEffect, useRef } from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
// const Map: any = require('../../../../../node_modules/react-parcelmap-bc/dist/Map').default;
// @ts-ignore
import { Map } from 'leaflet';
import SummaryForm from '../SummaryForm';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';
import { MapContainer, useMap } from 'react-leaflet';
import { SiteMarkers } from '../../map/siteMarkers/SiteMarkers';
import { LatLngBounds, LatLngTuple } from 'leaflet';
import { TileLayer } from 'react-leaflet';
import { SiteMarker } from '../../map/siteMarkers/SiteMarker';
import './Summary.css';
import 'leaflet/dist/leaflet.css';
import { useMediaQuery, useTheme } from '@mui/material';
import { MAP_FLY_OPTIONS, getZoom } from '../../map/mapOptions';
import { get } from 'http';
import { MapSearchQueryParamsContext } from '../../map/mapSearchQueryParamsContext/MapSearchQueryParamsContext';
import {
  useMapSearchQuery,
  useMapSearch_FindSiteBySiteIdQuery,
} from '../../../../graphql/generated';
import { Site } from '../../map/MapView';
import { set } from 'date-fns';

export interface ISummaryInfo {
  location: any;
  siteData: any;
  edit: boolean;
  srMode: boolean;
  handleInputChange: (graphQLPropertyName: any, value: any) => void;
  approveRejectHandler?: (approved: boolean) => void;
  showApproveRejectSection?: boolean;
}

const SummaryInfo: React.FC<ISummaryInfo> = ({
  location,
  siteData,
  edit,
  srMode,
  handleInputChange,
  approveRejectHandler,
  showApproveRejectSection,
}) => {
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler =
    approveRejectHandler ??
    (() => {
      console.log('Approve Handler Not Provided');
    });

  const CENTER_OF_BC: LatLngTuple = [53.7267, -127.6476];

  const { data } = useMapSearch_FindSiteBySiteIdQuery({
    variables: { siteId: siteData.id },
  });

  const selectedSiteData = data?.findSiteBySiteId.data;
  const mapRef = useRef<Map>(null);
  const map_fly_options = { animate: false, duration: 0.2 };

  const MapWithMarker = ({ site }: { site: any }) => {
    const map = useMap();

    useEffect(() => {
      if (!site.latdeg || !site.longdeg) return;
      map.flyTo(
        {
          lat: site.latdeg,
          lng: site.longdeg,
        },
        getZoom(map),
        map_fly_options,
      );
    }),
      [site, map];

    return (
      site && <SiteMarker position={{ lat: site.latdeg, lng: site.longdeg }} />
    );
  };

  return (
    <PanelWithUpDown
      label="Location Details"
      secondChild={
        <div className="row w-100">
          <div className="col-12 col-lg-6">
            <MapContainer
              center={CENTER_OF_BC}
              zoom={6}
              zoomControl={false}
              ref={mapRef}
              className="map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {<MapWithMarker site={selectedSiteData} />}
            </MapContainer>
          </div>

          <div className="col-12 col-lg-6">
            {siteData != null && (
              <SummaryForm
                sitesDetails={siteData}
                edit={edit}
                srMode={srMode}
                changeHandler={handleInputChange}
              />
            )}
          </div>
          {showApproveRejectSection && (
            <ApproveRejectButtons approveRejectHandler={approveRejectHandler} />
          )}
        </div>
      }
    />
  );
};

export default SummaryInfo;
