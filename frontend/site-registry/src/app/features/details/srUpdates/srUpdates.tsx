import React, { useEffect, useLayoutEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import { currentSiteId, saveRequestStatus } from '../SaveSiteDetailsSlice';
import {
  fetchPendingAssociatedSites,
  fetchPendingDocumentsForApproval,
  fetchPendingLandUses,
  fetchPendingSiteDisclosure,
  fetchPendingSiteNotationBySiteId,
  fetchPendingSiteParticipantsForApproval,
  fetchPendingSitesDetailsFprApproval,
  resetAllData,
  resetRequestStatus,
  selectAssociatedSites,
  selectDisclosure,
  selectDocuments,
  selectLandUsesData,
  selectNotationData,
  selectSiteParticipants,
  selectSiteSummary,
  updateRequestStatus,
  updateSiteDetailsForApproval,
} from './srUpdatesSlice';
import Summary from '../summary/Summary';
import SummaryInfo from '../summary/SummaryInfo';
import ApproveReject from '../../../components/approve/ApproveReject';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { RequestStatus } from '../../../helpers/requests/status';
import Notation from '../notations/Notation';
import { UserMode } from '../../../helpers/requests/userMode';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { UserType } from '../../../helpers/requests/userType';
import GetNotationConfig from '../notations/NotationsConfig';
import {
  notationClassDrpdown,
  notationParticipantRoleDrpdown,
  notationTypeDrpdown,
} from '../dropdowns/DropdownSlice';
import {
  showNotification,
  UpdateDisplayTypeParams,
  updateFields,
} from '../../../helpers/utility';
import { FormFieldType, IFormField } from '../../../components/input-controls/IFormField';
import { siteParticipants } from '../participants/ParticipantSlice';
import ParticipantTable from '../participants/ParticipantTable';
import GetConfig from '../participants/ParticipantConfig';
import LandUseTable from '../landUses/LandUseTable';
import { ColumnConfigForLandUses } from '../landUses/LandUses';
import Document from '../documents/Document';
import { siteDetailsMode } from '../../site/dto/SiteSlice';
import { GetDocumentsConfig } from '../documents/DocumentsConfig';
import DisclosureComponent from '../disclosure/DisclosureComponent';
import {
  disclosureCommentsConfig,
  disclosureScheduleExternalConfig,
  disclosureScheduleInternalConfig,
  disclosureStatementConfig,
} from '../disclosure/DisclosureConfig';
import AssociateSiteComponent from '../associates/AssociateSiteComponent';
import { GetAssociateConfig } from '../associates/AssociateConfig';
import { useParams } from 'react-router-dom';
import "./srUpdates.css"
import { TickIcon, XmarkIcon } from '../../../components/common/icon';
import { ColumnSize } from '../../../components/table/TableColumn';

const SRUpdates = () => {
  const {
    participantColumnInternal,
    participantColumnExternal,
    srVisibilityParcticConfig,
  } = GetConfig();

  const {
    associateColumnExternal,
    associateColumnInternal,
    associateColumnInternalSRandViewMode,
    srVisibilityAssocConfig,
  } = GetAssociateConfig();

  const {
    documentFirstChildFormRowsForExternal,
    documentFirstChildFormRows,
    documentFormRows,
  } = GetDocumentsConfig() || {};

  const [internalRow, setInternalRow] = useState(participantColumnInternal);
  const [externalRow, setExternalRow] = useState(participantColumnExternal);


  useEffect(()=>{

    setInternalRow([
      ...participantColumnInternal,
      {
        id: 7,
        displayName: '',
        active: true,
        graphQLPropertyName: 'psnorgId',
        columnSize: ColumnSize.Default,
        displayType: {
          type: FormFieldType.IconButton,
          label: '',
          placeholder: 'Approve',
          graphQLPropertyName: 'psnorgId',
          value: '',      
          tableMode: true,
          customIcon: <TickIcon/>,
          customLinkValue: 'Approve',
          customInputTextCss:'approve-tick-icon'
        },
      },
      {
        id: 8,
        displayName: '',
        active: true,
        graphQLPropertyName: 'psnorgId',
        columnSize: ColumnSize.Default,
        displayType: {
          type: FormFieldType.IconButton,
          label: '',
          placeholder: 'Not Public',
          graphQLPropertyName: 'psnorgId',
          value: '',      
          tableMode: true,
          customIcon: <XmarkIcon/>,
          customLinkValue: 'Not Public',
          customInputTextCss:'close-tick-icon'
        },
      }
    ])

  },[internalRow])

  const landUsesColumn = ColumnConfigForLandUses();

  const {
    notationFormRowsInternal,
    notationFormRowsFirstChild,
    notationFormRowsFirstChildIsRequired,
    notationColumnInternal,
    srVisibilityConfig,
  } = GetNotationConfig();

  const notationTypeDropdownData = useSelector(notationTypeDrpdown);

  const [notationFormRowsInternalLocal, SetNotationFormRowsInternalLocal] =
    useState(notationFormRowsInternal);

  const notationClass = useSelector(notationClassDrpdown);

  useEffect(() => {
    console.log('notationTypeDropdownData', notationTypeDropdownData);

    const indexToUpdateExt = notationFormRowsInternal.findIndex((row) =>
      row.some((field) => field.graphQLPropertyName === 'etypCode'),
    );

    let paramsExt: UpdateDisplayTypeParams = {
      indexToUpdate: indexToUpdateExt,
      updates: {
        options: notationTypeDropdownData.data,
      },
    };

    SetNotationFormRowsInternalLocal(
      updateFields(notationFormRowsInternal, paramsExt),
    );
  }, [notationTypeDropdownData]);

  useEffect(() => {
    console.log('notationFormRowsInternalLocal', notationFormRowsInternalLocal);
  }, notationFormRowsInternalLocal);

  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();
  const [siteId,SetSiteId] = useState<string>('');

  useEffect(()=>{
    if(id!== undefined)
    SetSiteId(id);
  },[id])

  const siteSummaryData = useSelector(selectSiteSummary);
  const notationData = useSelector(selectNotationData);
  const siteParticipantData = useSelector(selectSiteParticipants);
  const landUsesData = useSelector(selectLandUsesData);
  const documentsData = useSelector(selectDocuments);
  const disclosureData = useSelector(selectDisclosure);
  const associatedSitesData = useSelector(selectAssociatedSites);

  const updateRequestStatusFromState = useSelector(updateRequestStatus);

  const saveRequestStatusFromState = useSelector(saveRequestStatus);

  useEffect(() => {
    console.log('updateRequestStatusFromState',updateRequestStatusFromState)
    if (updateRequestStatusFromState === RequestStatus.success) {

      showNotification(
        updateRequestStatusFromState,
        'Successfully updated',
        'Failed to update',
      );
      
      dispatch(resetRequestStatus(null));

      dispatch(resetAllData(null));

      dispatch(
        fetchPendingSitesDetailsFprApproval({ siteId, showPending: true }),
      );
     
      dispatch(fetchPendingSiteNotationBySiteId({ siteId, showPending: true }));
      dispatch(
        fetchPendingSiteParticipantsForApproval({ siteId, showPending: true }),
      );
  
      dispatch(
        fetchPendingLandUses({
          siteId,
          searchTerm: '',
          sortDirection: 'ASC',
          showPending: true,
        }),
      );
  
      dispatch(fetchPendingDocumentsForApproval({ siteId, showPending: true }));
  
      dispatch(fetchPendingSiteDisclosure({ siteId, showPending: true }));
  
      dispatch(fetchPendingAssociatedSites({ siteId, showPending: true }));
    }
  }, [updateRequestStatusFromState]);

  useEffect(() => {
    console.log('associatedSitesData', associatedSitesData);
  }, [associatedSitesData]);


  useEffect(()=>{
    console.log('saveRequestStatusFromState',saveRequestStatusFromState)
  

  },[saveRequestStatusFromState])


  useEffect(() => {

    if(siteId !== "")
    {

    dispatch(
      fetchPendingSitesDetailsFprApproval({ siteId, showPending: true }),
    );
   
    dispatch(fetchPendingSiteNotationBySiteId({ siteId, showPending: true }));
    dispatch(
      fetchPendingSiteParticipantsForApproval({ siteId, showPending: true }),
    );

    dispatch(
      fetchPendingLandUses({
        siteId,
        searchTerm: '',
        sortDirection: 'ASC',
        showPending: true,
      }),
    );

    dispatch(fetchPendingDocumentsForApproval({ siteId, showPending: true }));

    dispatch(fetchPendingSiteDisclosure({ siteId, showPending: true }));

    dispatch(fetchPendingAssociatedSites({ siteId, showPending: true }));
  }
  }, [siteId]);

  const handleChange = (event: any) => {
    console.log('No Change Hanlder Required Here', event);
  };
  const handleAndReturnBoolean = (event: any): boolean => {
    console.log('No Change Hanlder Required Here', event);
    return true;
  };

  const getSiteDetailsToBeSaved = () => {
    return {
      events: null,
      siteParticipants: null,
      documents: null,
      siteAssociations: null,
      subDivisions: null,
      landHistories: null,
      profiles: null,
      sitesSummary: null,
      siteId: siteId,
    };
  };

  const summaryApproveRejectHandler = (approved: boolean) => {
    let saveDTO = null;

    if (approved) {
      const updatedSummaryEntity = {
        ...siteSummaryData,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Public,
      };
      saveDTO = {
        ...getSiteDetailsToBeSaved(),
        sitesSummary: updatedSummaryEntity,
      };

   
    } else {
      const updatedSummaryEntity = {
        ...siteSummaryData,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Private,
      };
      saveDTO = {
        ...getSiteDetailsToBeSaved(),
        sitesSummary: updatedSummaryEntity,
      };

    
    }

    dispatch(updateSiteDetailsForApproval(saveDTO));
  };

  const updateOptionsBasedOnMetaData = (
    rows: IFormField[][],
    metaData: any,
    fallbackMetaDataKey: string,
  ) => {
    return rows.map((items) =>
      items.map((row) => {
        if (row.graphQLPropertyName === 'etypCode') {
          const metaKey = metaData ? metaData[fallbackMetaDataKey] : null;
          const dropdownDto = notationTypeDropdownData.data.find(
            (item: any) => item.metaData === metaKey,
          )?.dropdownDto;
          return {
            ...row,
            options: dropdownDto || row.options, // Fallback to existing options if dropdownDto is not found
          };
        }
        if (row.graphQLPropertyName === 'eclsCode') {
          return {
            ...row,
            options: notationClass.data || [],
          };
        }
        // if (row.graphQLPropertyName === 'psnorgId') {
        //   return {
        //     ...row,
        //     options: ministryContactOptions || [],
        //   };
        // }
        return row;
      }),
    );
  };

  const handleNotationFormRowsInternal = (metaData?: any) => {
    return updateOptionsBasedOnMetaData(
      notationFormRowsInternal,
      metaData,
      'eclsCode',
    );
  };

  const handleNotationFormRowFirstChild = (metaData?: any) => {
    if (metaData && metaData.requiredDate) {
      return updateOptionsBasedOnMetaData(
        notationFormRowsFirstChildIsRequired,
        metaData,
        'eclsCode',
      );
    } else {
      return updateOptionsBasedOnMetaData(
        notationFormRowsFirstChild,
        metaData,
        'eclsCode',
      );
    }
  };

  const [location, setLocation] = useState([48.46762, -123.25458]);
  return (
    <div>
      {siteSummaryData && (
        <ApproveReject name="Summary">
          <SummaryInfo
            siteData={siteSummaryData}
            location={location}
            edit={false}
            srMode={false}
            handleInputChange={handleChange}
            approveRejectHandler={summaryApproveRejectHandler}
            showApproveRejectSection={true}
          />
        </ApproveReject>
      )}

      
        {notationData &&
          notationData.map((notation: any, index: number) => {
            return (
              <ApproveReject name="Notations">
              <Notation
                index={index}
                notation={notation}
                handleNotationFormRowExternal={handleChange}
                viewMode={SiteDetailsMode.ViewOnlyMode}
                handleNotationFormRowFirstChild={
                  handleNotationFormRowFirstChild
                }
                handleChangeNotationFormRow={handleChange}
                handleInputChange={handleChange}
                userType={UserType.Internal}
                handleNotationFormRowsInternal={handleNotationFormRowsInternal}
                handleTableChange={handleChange}
                handleWidgetCheckBox={handleChange}
                internalTableColumn={notationColumnInternal}
                externalTableColumn={[]}
                handleTableSort={handleChange}
                loading={RequestStatus.success}
                handleAddParticipant={handleChange}
                isAnyParticipantSelected={handleAndReturnBoolean}
                handleRemoveParticipant={handleChange}
                srVisibilityConfig={srVisibilityConfig}
                handleItemClick={handleChange}
                showApproveRejectSection={true}
              />
              </ApproveReject>
            );
          })}
      

      {siteParticipantData && siteParticipantData.length > 0 && (<ApproveReject name="Participants">        
          <ParticipantTable
            handleTableChange={handleChange}
            handleWidgetCheckBox={handleChange}
            internalRow={internalRow}
            externalRow={externalRow}
            userType={UserType.Internal}
            formData={siteParticipantData}
            status={RequestStatus.success}
            viewMode={SiteDetailsMode.ViewOnlyMode}
            handleTableSort={handleChange}
            handleAddParticipant={() => {}}
            selectedRows={siteParticipantData}
            handleRemoveParticipant={handleChange}
            srVisibilityParcticConfig={srVisibilityParcticConfig}
            handleItemClick={handleChange}
            showApproveRejectSection={true}
          />
          </ApproveReject>
        )}
      

     
        {documentsData &&
          documentsData.map((document: any, index: number) => {
            return (
              <ApproveReject name="Documents">
              <Document
                index={index}
                userType={UserType.Internal}
                mode={SiteDetailsMode.ViewOnlyMode}
                documentFirstChildFormRows={documentFirstChildFormRows}
                externalRow={documentFirstChildFormRowsForExternal}
                viewMode={SiteDetailsMode.ViewOnlyMode}
                handleInputChange={handleChange}
                document={document}
                srTimeStamp={'Sent to SR on June 2nd, 2013'}
                handleViewOnline={() => {}}
                handleDownload={() => {}}
                handleFileReplace={handleChange}
                handleFileDelete={handleChange}
                key={Date.now()}
                internalRow={documentFormRows}
                showApproveRejectSection={true}
              />
               </ApproveReject>
            );
          })}
     

      {associatedSitesData && associatedSitesData.length > 0 && (
        <ApproveReject name="Site Associations">
          <AssociateSiteComponent
            handleTableChange={handleChange}
            handleWidgetCheckBox={handleChange}
            userType={UserType.Internal} 
            viewMode={SiteDetailsMode.ViewOnlyMode}
            internalRow={internalRow}
            associateColumnInternalSRandViewMode={associateColumnInternalSRandViewMode}
            associateColumnExternal={associateColumnExternal}
            formData={associatedSitesData}
            loading={RequestStatus.success}
            handleTableSort={handleChange}
            handleAddAssociate={handleChange} 
            selectedRows={[]}
            handleRemoveAssociate={()=>{}} 
            srVisibilityAssocConfig={srVisibilityAssocConfig}
            handleItemClick={handleChange}
            showApproveRejectSection={true}
          />
        </ApproveReject>
      )}

      {landUsesData && (
        <ApproveReject name="LandUses">
          <LandUseTable
            fetchRequestStatus={RequestStatus.success}
            landUsesData={landUsesData}
            columns={landUsesColumn}
            showApproveRejectSection={true}
          />
        </ApproveReject>
      )}

      {/* <ApproveReject name="Parcel Description">pending</ApproveReject> */}

      {disclosureData && (
        <ApproveReject name="Disclosure">
          <DisclosureComponent
            viewMode={SiteDetailsMode.ViewOnlyMode}
            userType={UserType.Internal}
            handleWidgetCheckBox={handleChange}
            formData={disclosureData}
            disclosureStatementConfig={disclosureStatementConfig}
            handleInputChange={(
              id: any,
              name: any,
              value: string | [Date, Date],
            ) => {}}
            handleTableChange={handleChange}
            disclosureScheduleInternalConfig={disclosureScheduleInternalConfig}
            disclosureScheduleExternalConfig={disclosureScheduleExternalConfig}
            loading={RequestStatus.success}
            handleTableSort={handleChange}
            handleAddDisclosureSchedule={handleChange}
            isAnyDisclosureScheduleSelected={(event:any)=>{return false}}
            handleRemoveDisclosureSchedule={handleChange} 
            srVisibilityConfig={srVisibilityConfig} 
            handleItemClick={handleChange} 
            disclosureCommentsConfig={disclosureCommentsConfig}
            showApproveRejectSection={true}
          />
        </ApproveReject>
      )}

    </div>
  );
};

export default SRUpdates;
