import React, { useContext, useEffect, useRef } from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
// const Map: any = require('../../../../../node_modules/react-parcelmap-bc/dist/Map').default;
// @ts-ignore
import SummaryForm from '../SummaryForm';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';
import { MapContainer, useMap } from 'react-leaflet';
import { TileLayer } from 'react-leaflet';
import { SiteMarker } from '../../map/siteMarkers/SiteMarker';
import './Summary.css';
import 'leaflet/dist/leaflet.css';
import { set } from 'date-fns';

export interface ISummaryInfo {
  siteData: any;
  edit: boolean;
  srMode: boolean;
  handleInputChange: (graphQLPropertyName: any, value: any) => void;
  approveRejectHandler?: (approved: boolean) => void;
  showApproveRejectSection?: boolean;
}

const SummaryInfo: React.FC<ISummaryInfo> = ({
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

  return (
    <PanelWithUpDown
      label="Location Details"
      secondChild={
        <div className="row w-100">
          <div className="col-12 col-lg-6">
            <MapContainer
              center={{
                lat: siteData.latdeg,
                lng: siteData.longdeg,
              }}
              zoom={6}
              zoomControl={false}
              className="map-container"
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <SiteMarker
                position={{
                  lat: siteData.latdeg,
                  lng: siteData.longdeg,
                }}
              />
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
