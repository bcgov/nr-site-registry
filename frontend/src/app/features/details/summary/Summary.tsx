import { useEffect, useState } from 'react';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { AppDispatch } from '../../../Store';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetSiteDetails,
  selectSiteDetails,
  selectSiteInsights,
  siteDetailsMode,
  trackChanges,
  updateSiteDetail,
} from '../../site/dto/SiteSlice';
import {
  getFieldLabel,
  ChangeContext,
} from '../../../helpers/fieldLabelMapper';
import { RequestStatus } from '../../../helpers/requests/status';
import Table from '../../../components/table/Table';
import './Summary.css';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { isUserOfType, UserRoleType } from '../../../helpers/utility';
import {
  getSiteSummaryEdits,
  setupSiteSummaryForSaving,
  saveRequestStatus,
} from '../SaveSiteDetailsSlice';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';

import { useParams } from 'react-router-dom';
import SummaryInfo from './SummaryInfo';
import { hasUserPurchasedSnapshot } from '../snapshot/SnapshotSlice';
import { GetSummaryConfig } from './SummaryConfig';
import PurchaseAccessPrompt from '../navigation/PurchaseAccessPrompt';

const Summary = () => {
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const {
    summaryFormRows,
    locationDescription,
    summaryColumns,
    createSiteFormRows,
    summaryActivityColumns,
  } = GetSummaryConfig();

  const isUserPurchasedSite = useSelector(hasUserPurchasedSnapshot);
  const detailsMode = useSelector(siteDetailsMode);
  const details = useSelector(selectSiteDetails);
  const savedEdits = useSelector(getSiteSummaryEdits);
  const insights = useSelector(selectSiteInsights);
  const resetDetails = useSelector(resetSiteDetails);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const userPurchasedSnapshot = useSelector(hasUserPurchasedSnapshot);

  const [parcelSearchTerm, SetParcelSearchTeam] = useState('');
  const [editSiteDetailsObject, setEditSiteDetailsObject] = useState(details);
  const [edit, setEdit] = useState(false);
  const [srMode, setSRMode] = useState(false);
  const [summaryForm, setSummaryForm] = useState(summaryFormRows);

  // State Initializations
  const initialParcelIds = [0];

  const [parcelIds, setParcelIds] = useState(initialParcelIds);

  useEffect(() => {
    if (savedEdits) {
      setEditSiteDetailsObject(savedEdits);
    }
  }, [savedEdits]);

  useEffect(() => {
    if (resetDetails) {
      setEditSiteDetailsObject(details);
    }
  }, [resetDetails]);

  useEffect(() => {
    if (saveSiteDetailsRequestStatus === RequestStatus.success) {
      setEditSiteDetailsObject(details);
    } else if (savedEdits) {
      setEditSiteDetailsObject(savedEdits);
    } else {
      setEditSiteDetailsObject(details);
    }
  }, [savedEdits, details, saveSiteDetailsRequestStatus]);

  useEffect(() => {
    if (detailsMode === SiteDetailsMode.EditMode) {
      setEdit(true);
      setSRMode(false);
    } else if (detailsMode === SiteDetailsMode.SRMode) {
      setSRMode(true);
      setEdit(false);
    } else {
      setEdit(false);
      setSRMode(false);
    }
  }, [detailsMode]);

  useEffect(() => {
    if (
      (isUserOfType(UserRoleType.CLIENT) && userPurchasedSnapshot) ||
      isUserOfType(UserRoleType.INTERNAL) ||
      isUserOfType(UserRoleType.SR)
    ) {
      const newRows = [...summaryFormRows];
      newRows.splice(summaryFormRows.length, 0, locationDescription);
      setSummaryForm(newRows);
    }
  }, [userPurchasedSnapshot]);

  // Utility Functions
  const handleInputChange = (graphQLPropertyName: any, value: any) => {
    const trackerLabel = getFieldLabel(graphQLPropertyName);
    if (detailsMode === SiteDetailsMode.SRMode) {
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        trackerLabel,
        ChangeContext.SITE_LOCATION_SR,
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    } else {
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        trackerLabel,
        ChangeContext.SITE_LOCATION,
      );
      dispatch(trackChanges(tracker.toPlainObject()));

      const newState = {
        ...editSiteDetailsObject,
        [graphQLPropertyName]: value,
        provState: 'BC',
      };

      dispatch(
        updateSiteDetail({
          ...newState,
          apiAction: !id?.trim()
            ? UserActionEnum.added
            : UserActionEnum.updated,
          srAction: SRApprovalStatusEnum.Pending,
        }),
      );
      dispatch(
        setupSiteSummaryForSaving({
          ...newState,
          apiAction: !id?.trim()
            ? UserActionEnum.added
            : UserActionEnum.updated,
          srAction: SRApprovalStatusEnum.Pending,
        }),
      );

      setEditSiteDetailsObject(newState);
    }
  };

  const handleParcelIdDelete = (pid: any) => {
    const tracker = new ChangeTracker(
      IChangeType.Deleted,
      getFieldLabel('pid') + ' ' + pid,
      ChangeContext.SITE_LOCATION,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
    setParcelIds(parcelIds.filter((x) => x !== pid));
  };

  const handleAddNewParcelId = (pid: string) => {
    const tracker = new ChangeTracker(
      IChangeType.Added,
      getFieldLabel('pid') + ' ' + pid,
      ChangeContext.SITE_LOCATION,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
    let parcelIdsLocal = [...parcelIds, parseInt(pid)];
    //parcelIdsLocal.push();
    setParcelIds(parcelIdsLocal);
  };

  return (
    <div className="summary-section-details">
      <SummaryInfo
        summaryFormRows={!id?.trim() ? createSiteFormRows : summaryForm}
        siteId={id}
        siteData={editSiteDetailsObject}
        edit={edit}
        srMode={srMode}
        handleInputChange={handleInputChange}
      />

      {/* 
        {
          <PanelWithUpDown
            label="Parcel ID(s)"
            secondChild={
              !edit ? (
                <div>{parcelIds.join(', ')}</div>
              ) : (
                <div className="parcel-container">
                  <div>
                    <SearchInput
                      label={''}
                      searchTerm={parcelSearchTerm}
                      clearSearch={() => {
                        SetParcelSearchTeam('');
                      }}
                      handleSearchChange={(e) => {
                        SetParcelSearchTeam(e.target.value || '');
                      }}
                      options={['1213', '12313', '123132']}
                      optionSelectHandler={(value) => {
                        handleAddNewParcelId(value);
                      }}
                      createNewLabel=" Parcel ID"
                      createNewHandler={handleAddNewParcelId}
                    />
                  </div>
                  <div className="parcel-edit-div">
                    {parcelIds.map((pid) => (
                      <CustomPillButton
                        key={pid}
                        label={pid}
                        clickHandler={() => handleParcelIdDelete(pid)}
                      />
                    ))}
                  </div>
                </div>
              )
            }
          />
        }  
        {isUserPurchasedSite && (
          <div className="summary-details-border">
            <span className="summary-details-header">Activity Log</span>
            <div className="col-12">
              <Table
                label="Activity Log"
                isLoading={RequestStatus.success}
                columns={summaryActivityColumns}
                data={activityData}
                totalResults={activityData.length}
                allowRowsSelect={false}
                showPageOptions={false}
                changeHandler={() => {}}
                editMode={false}
                idColumnName="id"
              />
            </div>
          </div>
      )} 
      */}

      {id && (
        <div className="">
          <div className="summary-details-border">
            <span className="summary-details-header">Summary Details</span>
          </div>
          <div className="col-12 overflow-auto w-100">
            <Table
              label="Summary Details"
              isLoading={RequestStatus.success}
              columns={summaryColumns}
              data={[insights]}
              totalResults={0}
              allowRowsSelect={false}
              showPageOptions={false}
              changeHandler={() => {}}
              editMode={false}
              idColumnName="id"
            />
          </div>
        </div>
      )}
      {id && isUserOfType(UserRoleType.CLIENT) && !isUserPurchasedSite && (
        <PurchaseAccessPrompt />
      )}
    </div>
  );
};

export default Summary;
