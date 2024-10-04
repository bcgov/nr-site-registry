import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import { saveRequestStatus } from '../SaveSiteDetailsSlice';
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
import SummaryInfo from '../summary/SummaryInfo';
import ApproveReject from '../../../components/approve/ApproveReject';
import { UserActionEnum } from '../../../common/userActionEnum';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { RequestStatus } from '../../../helpers/requests/status';
import Notation from '../notations/Notation';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { UserType } from '../../../helpers/requests/userType';
import GetNotationConfig from '../notations/NotationsConfig';
import {
  ministryContactDrpdown,
  notationClassDrpdown,
  notationParticipantRoleDrpdown,
  notationTypeDrpdown,
  participantRoleDrpdown,
} from '../dropdowns/DropdownSlice';
import {
  showNotification,
  UpdateDisplayTypeParams,
  updateFields,
  updateTableColumn,
} from '../../../helpers/utility';
import {
  FormFieldType,
  IFormField,
} from '../../../components/input-controls/IFormField';
import ParticipantTable from '../participants/ParticipantTable';
import GetConfig from '../participants/ParticipantConfig';
import Document from '../documents/Document';
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
import './srUpdates.css';
import { TickIcon, XmarkIcon } from '../../../components/common/icon';
import { ColumnSize } from '../../../components/table/TableColumn';
import LandUseTable from '../landUses/LandUseTable';
import {
  fetchLandUseCodes,
  selectLandUseCodes,
} from '../landUses/LandUsesSlice';
import { getLandUseColumns } from '../landUses/LandUseColumnConfiguration';

const SRUpdates = () => {
  const siteSummaryData = useSelector(selectSiteSummary);
  const notationData = useSelector(selectNotationData);
  const siteParticipantData = useSelector(selectSiteParticipants);
  const landUsesData = useSelector(selectLandUsesData);
  const documentsData = useSelector(selectDocuments);
  const disclosureData = useSelector(selectDisclosure);
  const associatedSitesData = useSelector(selectAssociatedSites);

  const updateRequestStatusFromState = useSelector(updateRequestStatus);

  const saveRequestStatusFromState = useSelector(saveRequestStatus);

  const notationParticipantRole = useSelector(notationParticipantRoleDrpdown);

  const ministryContact = useSelector(ministryContactDrpdown);
  const [ministryContactOptions, setMinistryContactOptions] = useState([]);

  const particRoleDropdwn = useSelector(participantRoleDrpdown);

  const {
    participantColumnInternal,
    participantColumnExternal,
    srVisibilityParcticConfig,
  } = GetConfig();

  const {
    associateColumnExternal,
    associateColumnInternalSRandViewMode,
    srVisibilityAssocConfig,
  } = GetAssociateConfig();

  const {
    documentFirstChildFormRowsForExternal,
    documentFirstChildFormRows,
    documentFormRows,
  } = GetDocumentsConfig() || {};

  const [internalRow, setInternalRow] = useState([
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
        customIcon: <TickIcon />,
        customLinkValue: 'Approve',
        customInputTextCss: 'approve-tick-icon',
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
        customIcon: <XmarkIcon />,
        customLinkValue: 'Not Public',
        customInputTextCss: 'close-tick-icon',
      },
    },
  ]);

  useEffect(() => {
    if (particRoleDropdwn) {
      const indexToUpdate = participantColumnInternal.findIndex(
        (item) => item.displayType?.graphQLPropertyName === 'prCode',
      );
      let params: UpdateDisplayTypeParams = {
        indexToUpdate: indexToUpdate,
        updates: {
          options: particRoleDropdwn.data,
        },
      };
      setInternalRow(updateTableColumn(internalRow, params));
    }
  }, [particRoleDropdwn]);

  const [externalRow, setExternalRow] = useState(participantColumnExternal);

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

  const [notationColumnInternalLocal, SetNotationColumnInternalLocal] =
    useState(notationColumnInternal);

  const notationClass = useSelector(notationClassDrpdown);

  useEffect(() => {
    console.log('notationTypeDropdownData', notationTypeDropdownData);

    const indexToUpdateExt = notationFormRowsInternal.findIndex((row) =>
      row.some((field) => field.graphQLPropertyName === 'etypCode'),
    );

    if (notationParticipantRole) {
      setMinistryContactOptions(ministryContact.data);
      const indexToUpdate = notationColumnInternal.findIndex(
        (item) => item.displayType?.graphQLPropertyName === 'eprCode',
      );

      const updateParams = {
        indexToUpdate,
        updates: {
          options: notationParticipantRole.data || [],
        },
      };

      SetNotationColumnInternalLocal((prev) =>
        updateTableColumn(prev, updateParams),
      );
    }

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
    if (notationData) {
      const psnOrgs = notationData.flatMap((item: any) =>
        Array.isArray(item.notationParticipant)
          ? item.notationParticipant.map((participant: any) => ({
              key: participant.psnorgId,
              value: participant.displayName,
            }))
          : [],
      );

      const uniquePsnOrgs: any = Array.from(
        new Map(psnOrgs.map((item: any) => [item.key, item])).values(),
      );
      //setOptions(uniquePsnOrgs);

      SetNotationColumnInternalLocal((prev) =>
        updateTableColumn(prev, {
          indexToUpdate: prev.findIndex(
            (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
          ),
          updates: {
            isLoading: RequestStatus.success,
            options: uniquePsnOrgs,
          },
        }),
      );
    }
  }, [notationData]);

  useEffect(() => {
    if (siteParticipantData) {
      const uniquePsnOrgs: any = Array.from(
        new Map(
          siteParticipantData.map((item: any) => [
            item.psnorgId,
            { key: item.psnorgId, value: item.displayName },
          ]),
        ).values(),
      );

      let params: UpdateDisplayTypeParams = {
        indexToUpdate: participantColumnInternal.findIndex(
          (item) => item.displayType?.graphQLPropertyName === 'psnorgId',
        ),
        updates: {
          isLoading: RequestStatus.success,
          options: uniquePsnOrgs,
        },
      };
      setInternalRow(updateTableColumn(internalRow, params));
    }
  }, [siteParticipantData]);

  const dispatch = useDispatch<AppDispatch>();
  const { id } = useParams();
  const [siteId, SetSiteId] = useState<string>('');

  useEffect(() => {
    if (id !== undefined) SetSiteId(id);
  }, [id]);

  //console.log("notationParticipantRole",notationParticipantRole)

  useEffect(() => {
    console.log('updateRequestStatusFromState', updateRequestStatusFromState);
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

  useEffect(() => {
    console.log('saveRequestStatusFromState', saveRequestStatusFromState);
  }, [saveRequestStatusFromState]);

  useEffect(() => {
    if (siteId !== '') {
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

      dispatch(fetchLandUseCodes());
    }
  }, [siteId]);

  const handleChange = (event: any) => {
    console.log('No Change Hanlder Required Here', event);
  };
  const handleAndReturnBoolean = (event: any): boolean => {
    console.log('No Change Hanlder Required Here', event);
    return true;
  };

  const getDefaultObjectForSaving = () => {
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

  const { landUseCodes } = useSelector(selectLandUseCodes);

  const [landUseTableColumn, SetLandUseTableColumns] = useState<any>();

  useEffect(() => {
    let tableConfiguration = getLandUseColumns(landUseCodes, false);

    let updatedTableConfiguration = [
      ...tableConfiguration,
      {
        id: 7,
        displayName: '',
        active: true,
        graphQLPropertyName: 'approved',
        columnSize: ColumnSize.Default,
        displayType: {
          type: FormFieldType.IconButton,
          label: '',
          placeholder: 'Approve',
          graphQLPropertyName: SRApprovalStatusEnum.Public,
          value: '',
          tableMode: true,
          customIcon: <TickIcon />,
          customLinkValue: 'Approve',
          customInputTextCss: 'approve-tick-icon',
        },
      },
      {
        id: 8,
        displayName: '',
        active: true,
        graphQLPropertyName: 'private',
        columnSize: ColumnSize.Default,
        displayType: {
          type: FormFieldType.IconButton,
          label: '',
          placeholder: 'Not Public',
          graphQLPropertyName: SRApprovalStatusEnum.Private,
          value: '',
          tableMode: true,
          customIcon: <XmarkIcon />,
          customLinkValue: 'Not Public',
          customInputTextCss: 'close-tick-icon',
        },
      },
    ];

    SetLandUseTableColumns(updatedTableConfiguration);
  }, [landUseCodes]);

  const summaryApproveRejectHandler = (approved: boolean) => {
    let saveDTO = null;

    if (approved) {
      const updatedSummaryEntity = {
        ...siteSummaryData,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Public,
      };
      saveDTO = {
        ...getDefaultObjectForSaving(),
        sitesSummary: updatedSummaryEntity,
      };
    } else {
      const updatedSummaryEntity = {
        ...siteSummaryData,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Private,
      };
      saveDTO = {
        ...getDefaultObjectForSaving(),
        sitesSummary: updatedSummaryEntity,
      };
    }

    dispatch(updateSiteDetailsForApproval(saveDTO));
  };

  const approveRejectHandlerForLandUses = (event: any) => {
    let saveDTO = null;
    let landUseRecord = event?.row;
    let updatedLandUseRecord = null;
    if (event && event.property === SRApprovalStatusEnum.Public) {
      updatedLandUseRecord = {
        originalLandUseCode: landUseRecord ? landUseRecord.landUse.code : null,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Public,
      };
    } else if (event && event.property === SRApprovalStatusEnum.Private) {
      updatedLandUseRecord = {
        originalLandUseCode: landUseRecord ? landUseRecord.landUse.code : null,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Private,
      };
    }

    saveDTO = {
      ...getDefaultObjectForSaving(),
      landHistories: [updatedLandUseRecord],
    };

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
        if (row.graphQLPropertyName === 'psnorgId') {
          return {
            ...row,
            options: ministryContactOptions || [],
          };
        }
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

  const handleNotationApproveRejectHandler = (
    notation: any,
    isApproved: boolean,
  ) => {
    const updatePartipantsInNotation =
      notation &&
      notation?.notationParticipant.map((participant: any) => {
        return {
          ...participant,
          srAction: isApproved
            ? SRApprovalStatusEnum.Public
            : SRApprovalStatusEnum.Private,
          apiAction: UserActionEnum.updated,
        };
      });

    const updatedNotation = {
      ...notation,
      notationParticipant: updatePartipantsInNotation,
      srAction: isApproved
        ? SRApprovalStatusEnum.Public
        : SRApprovalStatusEnum.Private,
      apiAction: UserActionEnum.updated,
    };

    let saveDTO = {
      ...getDefaultObjectForSaving(),
      events: updatedNotation,
    };

    dispatch(updateSiteDetailsForApproval(saveDTO));
  };

  const [location] = useState([48.46762, -123.25458]);

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
                internalTableColumn={notationColumnInternalLocal}
                externalTableColumn={[]}
                handleTableSort={handleChange}
                loading={RequestStatus.success}
                handleAddParticipant={handleChange}
                isAnyParticipantSelected={handleAndReturnBoolean}
                handleRemoveParticipant={handleChange}
                srVisibilityConfig={srVisibilityConfig}
                handleItemClick={handleChange}
                showApproveRejectSection={true}
                approveRejectHandler={(value) =>
                  handleNotationApproveRejectHandler(notation, value)
                }
              />
            </ApproveReject>
          );
        })}

      {siteParticipantData && siteParticipantData.length > 0 && (
        <ApproveReject name="Participants">
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
            associateColumnInternalSRandViewMode={
              associateColumnInternalSRandViewMode
            }
            associateColumnExternal={associateColumnExternal}
            formData={associatedSitesData}
            loading={RequestStatus.success}
            handleTableSort={handleChange}
            handleAddAssociate={handleChange}
            selectedRows={[]}
            handleRemoveAssociate={() => {}}
            srVisibilityAssocConfig={srVisibilityAssocConfig}
            handleItemClick={handleChange}
            showApproveRejectSection={true}
          />
        </ApproveReject>
      )}

      {landUsesData && (
        <ApproveReject name="LandUses">
          <LandUseTable
            onTableChange={approveRejectHandlerForLandUses}
            tableColumns={landUseTableColumn}
            dataWithTextSearchApplied={landUsesData}
            editModeEnabled={false}
            tableLoading={RequestStatus.success}
            viewMode={SiteDetailsMode.ViewOnlyMode}
            handleTableSort={handleChange}
            selectedRowIds={[]}
            handleRemoveLandUse={handleChange}
            handleAddLandUse={handleChange}
          ></LandUseTable>
        </ApproveReject>
      )}

      <ApproveReject name="Parcel Description">pending</ApproveReject>

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
            isAnyDisclosureScheduleSelected={(event: any) => {
              return false;
            }}
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
