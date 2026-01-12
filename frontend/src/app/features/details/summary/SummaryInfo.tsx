import React from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
// @ts-ignore
import SummaryForm from './SummaryForm';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';
import { MapContainer } from 'react-leaflet';
import { TileLayer } from 'react-leaflet';
import { SiteMarker } from '../../map/siteMarkers/SiteMarker';
import 'leaflet/dist/leaflet.css';
import { IFormField } from '../../../components/input-controls/IFormField';
import { Button } from '../../../components/button/Button';
import { useNavigate } from 'react-router-dom';

export interface ISummaryInfo {
  siteId?: string;
  summaryFormRows: IFormField[][];
  siteData: any;
  edit: boolean;
  srMode: boolean;
  handleInputChange: (graphQLPropertyName: any, value: any) => void;
  approveRejectHandler?: (approved: boolean) => void;
  showApproveRejectSection?: boolean;
}

const SummaryInfo: React.FC<ISummaryInfo> = ({
  summaryFormRows,
  siteId,
  siteData,
  edit,
  srMode,
  handleInputChange,
  approveRejectHandler,
  showApproveRejectSection,
}) => {
  const navigate = useNavigate();
  showApproveRejectSection = showApproveRejectSection ?? false;

  approveRejectHandler = approveRejectHandler ?? (() => {});
  return (
    <PanelWithUpDown
      label={
        siteId ? (
          <div className="d-flex gap-4 align-items-center">
            Location Details
            <Button
              variant="secondary"
              size="small"
              onClick={() => navigate(`/map?site=${siteId}`)}
            >
              View on Map
            </Button>
          </div>
        ) : (
          'Location Details'
        )
      }
      isDefaultOpen={true}
      secondChild={
        <div className="row w-100">
          {siteData && !!siteId?.trim() && (
            <div className="col-lg-6 col-md-6 col-sm-12">
              <MapContainer
                center={{
                  lat: siteData?.latdeg,
                  lng: siteData?.longdeg,
                }}
                zoom={14}
                zoomControl={false}
                className="map-container"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <SiteMarker
                  position={{
                    lat: siteData?.latdeg,
                    lng: siteData?.longdeg,
                  }}
                />
              </MapContainer>
            </div>
          )}

          <div
            className={`${!!siteId?.trim() ? 'col-lg-6 col-md-6 col-sm-12' : 'col-12'}`}
          >
            <SummaryForm
              formRows={summaryFormRows}
              sitesDetails={siteData ?? {}}
              edit={edit}
              srMode={srMode}
              changeHandler={handleInputChange}
            />
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
