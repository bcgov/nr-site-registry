import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import { saveRequestStatus } from '../SaveSiteDetailsSlice';
import {
  fetchParcelDescriptionsForApproval,
  fetchPendingAssociatedSites,
  fetchPendingDocumentsForApproval,
  fetchPendingLandUses,
  fetchPendingSiteDisclosure,
  fetchPendingSiteNotationBySiteId,
  fetchPendingSiteParticipantsForApproval,
  fetchPendingSitesDetailsForApproval,
  resetAllData,
  resetRequestStatus,
  selectAssociatedSites,
  selectDisclosure,
  selectDocuments,
  selectLandUsesData,
  selectNotationData,
  selectParcelDescriptionData,
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
import { GetNotationConfig } from '../notations/NotationsConfig';
import {
  ministryContactDrpdown,
  notationClassDrpdown,
  notationParticipantRoleDrpdown,
  notationTypeDrpdown,
  participantRoleDrpdown,
  schedule2ReferenceCdDrpdown,
} from '../dropdowns/DropdownSlice';
import {
  formatDate,
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
import AssociateSiteComponent from '../associates/AssociateSiteComponent';
import { GetAssociateConfig } from '../associates/AssociateConfig';
import { useParams } from 'react-router-dom';
import './srUpdates.css';
import { TickIcon, XmarkIcon } from '../../../components/common/icon';
import { ColumnSize } from '../../../components/table/TableColumn';
import LandUseTable from '../landUses/LandUseTable';
import { selectLandUseCodes } from '../landUses/LandUsesSlice';
import { getLandUseColumns } from '../landUses/LandUseColumnConfiguration';
import ParcelDescriptionTable from '../parcelDescriptions/ParcelDescriptionTable';
import { IFetchParcelDescriptionsParams } from '../parcelDescriptions/parcelDescriptionsInterfaces';
import { columns as columnConfigForParcelDescription } from '../parcelDescriptions/parcelDescriptionsConfig';
import { GetSummaryConfig } from '../summary/SummaryConfig';
import { siteDisclosureConfig } from '../disclosure/DisclosureConfig';

const SRUpdates = () => {
  const schedule2Ref = useSelector(schedule2ReferenceCdDrpdown);
  const {
    disclosureCommentsConfig,
    disclosureScheduleExternalConfig,
    disclosureScheduleInternalConfig,
    disclosureStatementConfig,
  } = siteDisclosureConfig(schedule2Ref?.data);
  const dispatch = useDispatch<AppDispatch>();
  const { summaryFormRows } = GetSummaryConfig();
  const {
    participantColumnInternal,
    participantColumnExternal,
    srVisibilityParcticConfig,
  } = GetConfig();

  const { associateColumnInternalSRandViewMode, srVisibilityAssocConfig } =
    GetAssociateConfig();

  const { documentFirstChildFormRowsForExternal, documentFormRows } =
    GetDocumentsConfig() || {};

  const {
    notationFormRowsInternal,
    notationFormRowsFirstChild,
    notationFormRowsFirstChildIsRequired,
    notationColumnInternal,
    srVisibilityConfig,
  } = GetNotationConfig();

  const approvalButtonColumnConfig = {
    id: 7,
    displayName: '',
    active: true,
    graphQLPropertyName: SRApprovalStatusEnum.Public,
    columnSize: ColumnSize.XtraSmall,
    dynamicColumn: true,
    displayType: {
      type: FormFieldType.IconButton,
      label: '',
      placeholder: 'Public',
      graphQLPropertyName: SRApprovalStatusEnum.Public,
      value: '',
      tableMode: true,
      customIcon: <TickIcon />,
      customLinkValue: 'Public',
      customInputTextCss: 'approve-tick-icon',
    },
  };

  const rejectButtonColumnConfig = {
    id: 8,
    displayName: '',
    active: true,
    graphQLPropertyName: SRApprovalStatusEnum.Private,
    columnSize: ColumnSize.XtraSmall,
    dynamicColumn: true,
    displayType: {
      type: FormFieldType.IconButton,
      label: '',
      placeholder: 'Private',
      graphQLPropertyName: SRApprovalStatusEnum.Private,
      value: '',
      tableMode: true,
      customIcon: <XmarkIcon />,
      customLinkValue: 'Private',
      customInputTextCss: 'close-tick-icon',
    },
  };

  const getDefaultObjectForSaving = () => {
    return {
      events: null,
      siteParticipants: null,
      documents: null,
      siteAssociations: null,
      landHistories: null,
      profiles: null,
      sitesSummary: null,
      siteId: siteId,
      parcelDescriptions: null,
    };
  };
  const [internalDocRow, setInternalDocRow] = useState(documentFormRows);
  const [internalDocChildRow, setInternalDocChildRow] = useState(
    documentFirstChildFormRowsForExternal,
  );
  const siteSummaryData = useSelector(selectSiteSummary);
  const notationData = useSelector(selectNotationData);
  const siteParticipantData = useSelector(selectSiteParticipants);
  const landUsesData = useSelector(selectLandUsesData);
  const documentsData = useSelector(selectDocuments);
  const disclosureData = useSelector(selectDisclosure);
  const associatedSitesData = useSelector(selectAssociatedSites);
  const parcelDescriptionData = useSelector(selectParcelDescriptionData);
  const updateRequestStatusFromState = useSelector(updateRequestStatus);
  const saveRequestStatusFromState = useSelector(saveRequestStatus);
  const notationParticipantRole = useSelector(notationParticipantRoleDrpdown);
  const ministryContact = useSelector(ministryContactDrpdown);
  const particRoleDropdwn = useSelector(participantRoleDrpdown);
  const notationTypeDropdownData = useSelector(notationTypeDrpdown);
  const notationClass = useSelector(notationClassDrpdown);
  const { landUseCodes } = useSelector(selectLandUseCodes);

  const { id } = useParams();
  const [siteId, SetSiteId] = useState<string>('');
  const [landUseTableColumn, SetLandUseTableColumns] = useState<any>();
  const [ministryContactOptions, setMinistryContactOptions] = useState([]);
  const [externalRow, setExternalRow] = useState(participantColumnExternal);
  const [internalRow, setInternalRow] = useState([
    ...participantColumnInternal,
    approvalButtonColumnConfig,
    rejectButtonColumnConfig,
  ]);
  const [parcelDescriptionColumn, SetParcelDescriptionColumn] = useState([
    ...columnConfigForParcelDescription,
    approvalButtonColumnConfig,
    rejectButtonColumnConfig,
  ]);
  const [
    updatedAssociateColumnInternalSRandViewMode,
    updatedSetAssociateColumnInternalSRandViewMode,
  ] = useState([
    ...associateColumnInternalSRandViewMode,
    approvalButtonColumnConfig,
    rejectButtonColumnConfig,
  ]);

  const [notationFormRowsInternalLocal, SetNotationFormRowsInternalLocal] =
    useState(notationFormRowsInternal);

  const [notationColumnInternalLocal, SetNotationColumnInternalLocal] =
    useState(notationColumnInternal);

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

  useEffect(() => {
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
    if (documentsData) {
      const uniquePsnOrgs: any = Array.from(
        new Map(
          documentsData.map((item: any) => [
            item.psnorgId,
            { key: item.psnorgId, value: item.displayName },
          ]),
        ).values(),
      );
      setInternalDocRow((prev) =>
        updateFields(prev, {
          indexToUpdate: prev.findIndex((row) =>
            row.some((field) => field.graphQLPropertyName === 'psnorgId'),
          ),
          updates: {
            isLoading: RequestStatus.success,
            options: uniquePsnOrgs,
          },
        }),
      );
      setInternalDocChildRow((prev) =>
        updateFields(prev, {
          indexToUpdate: prev.findIndex((row) =>
            row.some((field) => field.graphQLPropertyName === 'psnorgId'),
          ),
          updates: {
            isLoading: RequestStatus.success,
            options: uniquePsnOrgs,
          },
        }),
      );
    }
  }, [documentsData]);

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

  useEffect(() => {
    if (id !== undefined) SetSiteId(id);
  }, [id]);

  useEffect(() => {
    if (updateRequestStatusFromState === RequestStatus.success) {
      showNotification(
        updateRequestStatusFromState,
        'Successfully updated',
        'Failed to update',
      );

      dispatch(resetRequestStatus(null));

      dispatch(resetAllData(null));

      dispatch(
        fetchPendingSitesDetailsForApproval({ siteId, showPending: true }),
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

      const params: IFetchParcelDescriptionsParams = {
        siteId: parseInt(siteId),
        page: 1,
        pageSize: 1000,
        searchParam: '',
        sortBy: '',
        sortByDir: '',
        showPending: true,
      };
      dispatch(fetchParcelDescriptionsForApproval(params));
    }
  }, [updateRequestStatusFromState]);

  const handleChange = () => {};

  const handleAndReturnBoolean = (event: any): boolean => {
    return true;
  };

  useEffect(() => {
    let tableConfiguration = getLandUseColumns(landUseCodes, false);

    let updatedTableConfiguration = [
      ...tableConfiguration,
      approvalButtonColumnConfig,
      rejectButtonColumnConfig,
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
        apiAction: UserActionEnum.updated,
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
        apiAction: UserActionEnum.updated,
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

  const getUpdateRecordForTableType = (event: any) => {
    let record = event?.row;
    let updatedRecord = null;
    if (event && event.property === SRApprovalStatusEnum.Public) {
      updatedRecord = {
        ...record,
        apiAction: UserActionEnum.updated,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Public,
      };
    } else if (event && event.property === SRApprovalStatusEnum.Private) {
      updatedRecord = {
        ...record,
        apiAction: UserActionEnum.updated,
        userAction: UserActionEnum.default,
        srAction: SRApprovalStatusEnum.Private,
      };
    } else {
      return null;
    }
    return updatedRecord;
  };

  const handleParticipantsApproveRejectHandler = (event: any) => {
    let updatedRecord = getUpdateRecordForTableType(event);

    if (updatedRecord !== null) {
      let saveDTO = {
        ...getDefaultObjectForSaving(),
        siteParticipants: updatedRecord,
      };

      dispatch(updateSiteDetailsForApproval(saveDTO));
    }
  };

  const handleParcelDescriptionApproveRejectHandler = (event: any) => {
    let updatedRecord = getUpdateRecordForTableType(event);

    if (updatedRecord !== null) {
      let saveDTO = {
        ...getDefaultObjectForSaving(),
        parcelDescriptions: updatedRecord,
      };

      dispatch(updateSiteDetailsForApproval(saveDTO));
    }
  };

  const handleAssociatedSiteApproveRejectHandler = (event: any) => {
    let updatedRecord = getUpdateRecordForTableType(event);

    if (updatedRecord !== null) {
      let saveDTO = {
        ...getDefaultObjectForSaving(),
        siteAssociations: updatedRecord,
      };

      dispatch(updateSiteDetailsForApproval(saveDTO));
    }
  };

  const getUpdateRecordForComponentTypes = (
    record: any,
    isApproved: boolean,
  ) => {
    return {
      ...record,
      srAction: isApproved
        ? SRApprovalStatusEnum.Public
        : SRApprovalStatusEnum.Private,
      apiAction: UserActionEnum.updated,
    };
  };

  const handleNotationApproveRejectHandler = (
    notation: any,
    isApproved: boolean,
  ) => {
    const updatePartipantsInNotation =
      notation &&
      notation?.notationParticipant.map((participant: any) => {
        return getUpdateRecordForComponentTypes(participant, isApproved);
      });

    const updatedNotation = {
      ...getUpdateRecordForComponentTypes(notation, isApproved),
      notationParticipant: updatePartipantsInNotation,
    };

    let saveDTO = {
      ...getDefaultObjectForSaving(),
      events: updatedNotation,
    };

    dispatch(updateSiteDetailsForApproval(saveDTO));
  };

  const handleDocumentsApproveRejectHandler = (
    document: any,
    isApproved: boolean,
  ) => {
    const updatedDocument = getUpdateRecordForComponentTypes(
      document,
      isApproved,
    );

    delete updatedDocument?.whenCreated;
    delete updatedDocument?.whenUpdated;
    let saveDTO = {
      ...getDefaultObjectForSaving(),
      documents: updatedDocument,
    };

    dispatch(updateSiteDetailsForApproval(saveDTO));
  };

  const handleDisclosureApproveRejectHandler = (
    disclosure: any,
    isApproved: boolean,
  ) => {
    const updateDisclosureSchedule2Refs =
      disclosure?.siteProfileSchedule2Refs.map((schedule: any) => {
        return getUpdateRecordForComponentTypes(schedule, isApproved);
      });
    const updatedDisclosure = {
      ...getUpdateRecordForComponentTypes(disclosure, isApproved),
      siteProfileSchedule2Refs: updateDisclosureSchedule2Refs,
    };

    let saveDTO = {
      ...getDefaultObjectForSaving(),
      profiles: updatedDisclosure,
    };

    dispatch(updateSiteDetailsForApproval(saveDTO));
  };

  return (
    <div data-testid="srreviewtab-component">
      {siteSummaryData && (
        <ApproveReject
          name="Summary"
          testId="site-summary-component"
          link="?summary"
        >
          <SummaryInfo
            summaryFormRows={summaryFormRows}
            siteData={siteSummaryData}
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
            <ApproveReject
              key={notation.id ?? index}
              name="Notations"
              testId="srupdates-notation-component"
              link="?notations"
            >
              <Notation
                index={index}
                notation={notation}
                handleNotationFormRowExternal={handleChange}
                viewMode={SiteDetailsMode.ViewOnlyMode}
                handleNotationFormRowFirstChild={
                  handleNotationFormRowFirstChild
                }
                handleChangeNotationFormRow={handleChange}
                handleDeleteNotation={(_notationId: string) => {}}
                handleRestoreNotation={(_notationId: string) => {}}
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
        <ApproveReject
          name="Site Participants"
          testId="srupdates-participant-component"
          link="?participants"
        >
          <ParticipantTable
            handleTableChange={handleParticipantsApproveRejectHandler}
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
            hideLabelForWidget={true}
          />
        </ApproveReject>
      )}

      {documentsData &&
        documentsData.map((document: any, index: number) => {
          return (
            <ApproveReject
              key={document.id ?? index}
              name="Documents"
              testId="srupdates-documents-component"
              link="?documents"
            >
              <Document
                userType={UserType.Internal}
                mode={SiteDetailsMode.ViewOnlyMode}
                documentFirstChildFormRows={[]}
                externalRow={internalDocChildRow}
                viewMode={SiteDetailsMode.ViewOnlyMode}
                handleInputChange={handleChange}
                document={document}
                srTimeStamp={`Send to SR on ${formatDate(document?.whenUpdated ?? document?.whenCreated ?? new Date())}`}
                handleViewOnline={() => {}}
                handleDownload={() => {}}
                handleFileReplace={handleChange}
                handleFileDelete={handleChange}
                uniqueId={Date.now()}
                internalRow={internalDocRow}
                showApproveRejectSection={true}
                approveRejectHandler={(value) =>
                  handleDocumentsApproveRejectHandler(document, value)
                }
              />
            </ApproveReject>
          );
        })}

      {associatedSitesData && associatedSitesData.length > 0 && (
        <ApproveReject
          name="Associated Sites"
          testId="srupdates-siteassociations-component"
          link="?associated"
        >
          <AssociateSiteComponent
            handleTableChange={handleAssociatedSiteApproveRejectHandler}
            handleWidgetCheckBox={handleChange}
            userType={UserType.Internal}
            viewMode={SiteDetailsMode.ViewOnlyMode}
            internalRow={null}
            associateColumnInternalSRandViewMode={
              updatedAssociateColumnInternalSRandViewMode
            }
            associateColumnExternal={null}
            formData={associatedSitesData}
            loading={RequestStatus.success}
            handleTableSort={handleChange}
            handleAddAssociate={handleChange}
            selectedRows={[]}
            handleRemoveAssociate={() => {}}
            srVisibilityAssocConfig={srVisibilityAssocConfig}
            handleItemClick={handleChange}
            showApproveRejectSection={true}
            hideLabelForWidget={true}
          />
        </ApproveReject>
      )}

      {landUsesData && landUsesData.length > 0 && (
        <ApproveReject
          name="Suspect Land Uses"
          testId="srupdates-landuses-component"
          link="?landuses"
        >
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
          />
        </ApproveReject>
      )}

      {parcelDescriptionData?.data.length > 0 &&
        parcelDescriptionData?.data && (
          <ApproveReject
            name="Parcel Description"
            testId="srupdates-parceldesc-component"
            link="?parceldesc"
          >
            <ParcelDescriptionTable
              tableChangeHandler={handleParcelDescriptionApproveRejectHandler}
              showPageOptions={false}
              requestStatus={RequestStatus.success}
              columns={parcelDescriptionColumn}
              data={parcelDescriptionData.data}
              totalResults={[].length}
              handleSelectPage={handleChange}
              handleChangeResultsPerPage={handleChange}
              currentPage={1}
              resultsPerPage={undefined}
              viewMode={SiteDetailsMode.ViewOnlyMode}
              handleTableSortChange={handleChange}
              deleteHandler={() => {}}
              allowRowsSelect={false}
            />
          </ApproveReject>
        )}

      {disclosureData && (
        <ApproveReject name="Site Disclosure" link="?disclosure">
          <DisclosureComponent
            viewMode={SiteDetailsMode.ViewOnlyMode}
            userType={UserType.Internal}
            handleWidgetCheckBox={handleChange}
            formData={{
              ...disclosureData,
              siteProfileSchedule2Refs:
                disclosureData?.siteProfileSchedule2Refs?.map((item: any) => {
                  return {
                    ...item,
                    description: schedule2Ref?.data?.find(
                      (ref: any) => ref.key === item.schedule2ReferenceCode,
                    )?.metaData,
                  };
                }) ?? [],
            }}
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
            approveRejectHandler={(value) => {
              handleDisclosureApproveRejectHandler(disclosureData, value);
            }}
          />
        </ApproveReject>
      )}
      {!disclosureData &&
        (!parcelDescriptionData ||
          (parcelDescriptionData && parcelDescriptionData.data.length === 0)) &&
        (!landUsesData || (landUsesData && landUsesData.length === 0)) &&
        (!associatedSitesData ||
          (associatedSitesData && associatedSitesData.length === 0)) &&
        (!documentsData || (documentsData && documentsData.length === 0)) &&
        (!siteParticipantData ||
          (siteParticipantData && siteParticipantData.length === 0)) &&
        (!notationData || (notationData && notationData.length === 0)) &&
        !siteSummaryData && (
          <div>
            <span> No updates to review</span>
          </div>
        )}
    </div>
  );
};

export default SRUpdates;
