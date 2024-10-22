import React from 'react';
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
// const Map: any = require('../../../../../node_modules/react-parcelmap-bc/dist/Map').default;
// @ts-ignore
import Map from '../../../../../node_modules/react-parcelmap-bc/dist/Map';
import SummaryForm from '../SummaryForm';
import { ApproveRejectButtons } from '../../../components/approve/ApproveReject';

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

  return (
    <PanelWithUpDown
      label="Location Details"
      secondChild={
        <div className="row w-100">
          <div className="col-12 col-lg-6">
            {/* <Map callback={() => {}} initLocation={location} readOnly={true} /> */}
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
