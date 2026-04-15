import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../../Store';
import {
  documents,
  fetchDocuments,
  updateSiteDocument,
} from './DocumentsSlice';
import {
  resetSiteDetails,
  siteDetailsMode,
  trackChanges,
} from '../../site/dto/SiteSlice';
import {
  getFieldLabel,
  ChangeContext,
} from '../../../helpers/fieldLabelMapper';
import { useCallback, useEffect, useState } from 'react';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import {
  flattenFormRows,
  formatDate,
  getAxiosInstance,
  getUser,
  isUserOfType,
  parseDate,
  resultCache,
  UpdateDisplayTypeParams,
  updateFields,
  UserRoleType,
} from '../../../helpers/utility';
import SearchInput from '../../../components/search/SearchInput';
import Sort from '../../../components/sort/Sort';
import { CheckBoxInput } from '../../../components/input-controls/InputControls';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import { UploadFileIcon } from '../../../components/common/icon';
import './Documents.css';
import { useParams } from 'react-router-dom';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { v4 } from 'uuid';
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphQLPeopleOrgsCd } from '../../site/graphql/Dropdowns';
import { print } from 'graphql';
import infoIcon from '../../../images/info-icon.png';
import { RequestStatus } from '../../../helpers/requests/status';
import { IComponentProps } from '../navigation/NavigationPillsConfig';
import Document from './Document';
import { GetDocumentsConfig } from './DocumentsConfig';
import {
  getParentBucket,
  getSiteDocuments,
  saveRequestStatus,
  setupDocumentsDataForSaving,
  updateParentBucket,
} from '../SaveSiteDetailsSlice';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { UserActionEnum } from '../../../common/userActionEnum';
import { Button } from '../../../components/button/Button';
import { getObject } from './DocumentEndpoints';
import { Alert } from 'react-bootstrap';
import { useCreateBucketMutation } from '../../../../graphql/generated';

const Documents: React.FC<IComponentProps> = ({ showPending = false }) => {
  const [createBucket] = useCreateBucketMutation();

  const {
    documentFirstChildFormRowsForExternal,
    documentFirstChildFormRows,
    documentFormRows,
    documentFormRowsEditMode,
  } = GetDocumentsConfig();
  const loggedInUser = getUser();
  const { id } = useParams();
  const { siteDocuments: siteDocuments, status } = useSelector(documents);
  const mode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const trackDocuments = useSelector(getSiteDocuments);
  const parentBucket = useSelector(getParentBucket);
  const dispatch = useDispatch<AppDispatch>();

  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [formData, setFormData] =
    useState<{ [key: string]: any | File | [Date, Date] }[]>(siteDocuments);
  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDelete, setIsDelete] = useState(false);
  const [isReplace, setIsReplace] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({});
  const [currentFile, setCurrentFile] = useState({});
  const [uniqueId, setUniqueId] = useState(Date.now()); // Key for input type="file" element

  const [internalRow, setInternalRow] = useState(documentFormRowsEditMode);
  const [internalDocRow, setInternalDocRow] = useState(documentFormRows);
  const [externalRow, setExternalRow] = useState(
    documentFirstChildFormRowsForExternal,
  );
  const [searchAuthors, setSearchAuthors] = useState('');
  const [options, setOptions] = useState<{ key: any; value: any }[]>([]);

  // Function to fetch author
  const fetchAuthors = useCallback(async (searchParam: string) => {
    if (searchParam.trim()) {
      try {
        // Check cache first
        if (resultCache[searchParam]) {
          return resultCache[searchParam];
        }

        const response = await getAxiosInstance().post(GRAPHQL, {
          query: print(graphQLPeopleOrgsCd()),
          variables: { searchParam, entityType: 'ORG' },
        });

        // Store result in cache if successful
        const { data = [], success = false } =
          response?.data?.data?.getPeopleOrgsCd || {};
        if (success && data?.length > 0) {
          resultCache[searchParam] = data;
          return response.data.data.getPeopleOrgsCd;
        }
      } catch (error) {
        console.error('Error fetching author:', error);
        return [];
      }
    }
    return [];
  }, []);

  // Handle search action
  const handleSearch = useCallback(
    (value: any) => {
      setSearchAuthors(value.trim());
      setInternalRow((prev) =>
        updateFields(prev, {
          indexToUpdate: prev.findIndex((row) =>
            row.some((field) => field.graphQLPropertyName === 'psnorgId'),
          ),
          updates: {
            isLoading: RequestStatus.loading,
            filteredOptions: [],
            handleSearch,
            customInfoMessage: <></>,
          },
        }),
      );
    },
    [options],
  );

  // Update form data when notations change
  useEffect(() => {
    if (status === RequestStatus.success && siteDocuments) {
      const uniquePsnOrgs: any = Array.from(
        new Map(
          siteDocuments.map((item: any) => [
            item.psnorgId,
            { key: item.psnorgId, value: item.displayName },
          ]),
        ).values(),
      );
      if (JSON.stringify(uniquePsnOrgs) !== JSON.stringify(options)) {
        // only update if different
        setOptions(uniquePsnOrgs);
        setInternalRow((prev) =>
          updateFields(prev, {
            indexToUpdate: prev.findIndex((row) =>
              row.some((field) => field.graphQLPropertyName === 'psnorgId'),
            ),
            updates: {
              isLoading: RequestStatus.success,
              options: uniquePsnOrgs,
              filteredOptions: [],
              handleSearch,
              customInfoMessage: <></>,
            },
          }),
        );
        setInternalDocRow((prev) =>
          updateFields(prev, {
            indexToUpdate: prev.findIndex((row) =>
              row.some((field) => field.graphQLPropertyName === 'psnorgId'),
            ),
            updates: {
              isLoading: RequestStatus.success,
              options: uniquePsnOrgs,
              filteredOptions: [],
              handleSearch,
              customInfoMessage: <></>,
            },
          }),
        );
        setExternalRow((prev) =>
          updateFields(prev, {
            indexToUpdate: prev.findIndex((row) =>
              row.some((field) => field.graphQLPropertyName === 'psnorgId'),
            ),
            updates: {
              isLoading: RequestStatus.success,
              options: uniquePsnOrgs,
              filteredOptions: [],
              handleSearch,
              customInfoMessage: <></>,
            },
          }),
        );
      }

      setFormData(siteDocuments);
    }
  }, [siteDocuments, status]);

  // Search author effect with debounce
  useEffect(() => {
    if (searchAuthors) {
      const timeoutId = setTimeout(async () => {
        const res = await fetchAuthors(searchAuthors);
        const indexToUpdate = internalRow.findIndex((row) =>
          row.some((field) => field.graphQLPropertyName === 'psnorgId'),
        );
        const infoMsg = !res.success ? (
          <div className="px-2">
            <img
              src={infoIcon}
              alt="info"
              aria-hidden="true"
              role="img"
              aria-label="User image"
            />
            <span
              aria-label={'info-message'}
              className="text-wrap px-2 custom-not-found"
            >
              No results found.
            </span>
          </div>
        ) : (
          <></>
        );

        setInternalRow((prev) =>
          updateFields(prev, {
            indexToUpdate,
            updates: {
              isLoading: RequestStatus.success,
              options,
              filteredOptions: res.data ?? resultCache[searchAuthors] ?? [],
              customInfoMessage: infoMsg,
              handleSearch,
            },
          }),
        );
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [searchAuthors, options]);

  // Handle user type based on username
  useEffect(() => {
    if (
      isUserOfType(UserRoleType.CLIENT) ||
      isUserOfType(UserRoleType.PUBLIC)
    ) {
      setUserType(UserType.External);
    } else if (isUserOfType(UserRoleType.INTERNAL)) {
      setUserType(UserType.Internal);
    }
  }, [loggedInUser]);

  // Handle view mode changes
  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  // THIS MAY CHANGE IN FUTURE. NEED TO DISCUSS AS API NEEDS TO BE CALLED AGAIN
  // IF SAVED OR CANCEL BUTTON ON TOP IS CLICKED
  useEffect(() => {
    if (
      resetDetails ||
      saveSiteDetailsRequestStatus === RequestStatus.success
    ) {
      dispatch(fetchDocuments({ siteId: id ?? '', showPending: showPending }));
    }
  }, [resetDetails, saveSiteDetailsRequestStatus]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    setSearchTerm(searchTerm);

    const filteredData = (siteDocuments || []).filter((document: any) => {
      // Check if any property of the notation object contains the searchTerm
      return deepSearch(document, searchTerm.toLowerCase().trim());
    });
    setFormData(filteredData);
  };

  const deepSearch = (obj: any, searchTerm: string): boolean => {
    for (const key in obj) {
      const value = obj[key];
      if (typeof value === 'object') {
        if (deepSearch(value, searchTerm)) {
          return true;
        }
      }

      const stringValue =
        typeof value === 'string'
          ? value.toLowerCase()
          : String(value).toLowerCase();

      if (key === 'submissionDate' || key === 'documentDate') {
        const date = new Date(value);
        const formattedDate = date
          .toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })
          .toLowerCase();
        const ordinalSuffixPattern = /\b(\d+)(st|nd|rd|th)\b/g;
        searchTerm = searchTerm.replace(ordinalSuffixPattern, '$1');
        if (formattedDate.includes(searchTerm)) {
          return true;
        }
      }

      if (stringValue.includes(searchTerm)) {
        return true;
      }
    }
    return false;
  };

  const clearSearch = () => {
    setSearchTerm('');
    setFormData(siteDocuments);
  };

  const handleSortChange = (
    graphQLPropertyName: any,
    value: String | [Date, Date],
  ) => {
    setSortByValue((prevData) => ({
      ...prevData,
      [graphQLPropertyName]: value,
    }));
    sortItems(value, formData);
  };

  const sortItems = (sortBy: any, data: any) => {
    let sorted = !data?.length ? [] : [...data];
    switch (sortBy) {
      case 'newToOld':
        sorted.sort(
          (a, b) =>
            new Date(b.documentDate).getTime() -
            new Date(a.documentDate).getTime(),
        ); // Sorting by date from new to old
        break;
      case 'oldTonew':
        sorted.sort(
          (a, b) =>
            new Date(a.documentDate).getTime() -
            new Date(b.documentDate).getTime(),
        ); // Sorting by date from new to old
        break;
      // Add more cases for additional sorting options
      default:
        break;
    }
    setFormData(sorted);
  };

  const handleOnUploadDocument = async (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0] ?? null;
      if (file) {
        if (file && file.type === 'application/pdf') {
          let parentBucketId: string = '';
          if (parentBucket?.bucketId?.trim().length > 0) {
            parentBucketId = parentBucket?.bucketId;
          } else {
            const bucketName = `sites/${id}`;
            const bucketKey = `sites/${id}`;
            const parentBucketRes = await createBucket({
              variables: {
                bucketName: bucketName,
                bucketKey: bucketKey,
              },
            });
            if (parentBucketRes) {
              dispatch(
                updateParentBucket({
                  bucketId: parentBucketRes?.data?.createBucket?.data?.bucketId,
                }),
              );
              parentBucketId =
                parentBucketRes?.data?.createBucket?.data?.bucketId ?? '';
            }
          }

          if (parentBucketId.trim().length > 0) {
            const newDocument = {
              id: v4(), // Generate a unique ID for the new document
              docParticId: v4(),
              siteId: id,
              psnorgId: '',
              submissionDate: new Date(), // Set submissionDate to parseDate(new Date()),
              documentDate: new Date(file.lastModified),
              title: file.name.split('.')[0].trim(),
              displayName: '',
              file: file,
              apiAction: UserActionEnum.added,
              srAction: SRApprovalStatusEnum.Pending,
            };

            const updatedDocuments = [newDocument, ...(formData || [])];
            setFormData(updatedDocuments);
            dispatch(updateSiteDocument(updatedDocuments));
            dispatch(
              setupDocumentsDataForSaving([
                newDocument,
                ...(trackDocuments ?? (formData || [])),
              ]),
            );

            const tracker = new ChangeTracker(
              IChangeType.Added,
              getFieldLabel('newDocument'),
              ChangeContext.DOCUMENTS,
            );
            dispatch(trackChanges(tracker.toPlainObject()));
          }
          event.target.value = ''; // Reset input value so same file can be uploaded again
        } else {
          alert('Please select a valid PDF file.');
        }
      }
    }
  };

  const handleViewOnline = async (document: any) => {
    if (document?.objectId !== null && document?.objectId !== undefined) {
      const response = await getObject(document?.objectId);
      window.open(response, '_blank');
    } else {
      if (document?.file) {
        window.open(URL.createObjectURL(document?.file), '_blank');
      }
    }
  };

  const handleDownload = async (doc: any) => {
    try {
      let fileBlob: Blob | null = null;
      if (doc?.objectId !== null && doc?.objectId !== undefined) {
        fileBlob = await getObject(doc?.objectId, 'proxy');
      } else {
        if (doc?.file) {
          fileBlob = doc?.file;
        }
      }

      if (fileBlob) {
        // Create an object URL for the Blob
        const objectURL = URL.createObjectURL(fileBlob);

        // Create an anchor element to trigger the download
        const downloadLink = document.createElement('a');
        downloadLink.href = objectURL; // Set the href to the Blob URL
        downloadLink.download = doc?.title; // Provide a filename for the download

        // Trigger the download
        downloadLink.click();

        // Optionally, revoke the object URL after the download
        URL.revokeObjectURL(objectURL);
      }
    } catch (error) {
      console.error('Error downloading file:', error);
    }
  };

  const handleFileReplace = async (
    event: any,
    doc: any,
    docIsReplace: boolean = false,
  ) => {
    if (docIsReplace) {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0] ?? null;
        if (file && file.type === 'application/pdf') {
          const updateDocuments = (documents: any) => {
            return documents.map((document: any) => {
              if (document.id === doc.id) {
                let replacedDocument = {
                  ...doc,
                  submissionDate: parseDate(new Date()),
                  documentDate: parseDate(new Date(file.lastModified)),
                  title: file.name.split('.')[0].trim(),
                  file: file,
                  apiAction: UserActionEnum.updated,
                  srAction: SRApprovalStatusEnum.Pending,
                };
                return { ...document, ...replacedDocument };
              }
              return document;
            });
          };

          // Update both formData and trackNotation
          const updatedDocuments = updateDocuments(formData);
          const updatedTrackedDocuments = updateDocuments(
            trackDocuments ?? formData,
          );

          // Replace document
          setFormData(updatedDocuments);
          dispatch(updateSiteDocument(updatedDocuments));
          dispatch(setupDocumentsDataForSaving(updatedTrackedDocuments));
          if (doc?.apiAction !== UserActionEnum.added) {
            const tracker = new ChangeTracker(
              IChangeType.Modified,
              getFieldLabel('document'),
              ChangeContext.DOCUMENTS,
            );
            dispatch(trackChanges(tracker.toPlainObject()));
          }
          setCurrentDocument({});
          setCurrentFile({});
          setIsReplace(false);
        }
      } else {
        alert('Please select a valid PDF file.');
      }
    } else {
      setCurrentFile(event);
      setCurrentDocument(doc);
      setIsReplace(true);

      // Reset input type="file" element by changing key prop
      setUniqueId(Date.now()); // Force input type="file" to reset
    }
  };

  const handleFileDelete = (document: any, docIsDelete: boolean = false) => {
    if (docIsDelete) {
      const updateDocuments = (documents: any) => {
        return documents.map((doc: any) => {
          if (doc.id === document.id) {
            return {
              ...document,
              apiAction: document?.file
                ? UserActionEnum.default
                : UserActionEnum.deleted, // Mark as deleted
              srAction: SRApprovalStatusEnum.Pending,
            };
          }
          return doc;
        });
      };

      // Update both formData and trackDocument
      const updatedDocuments = updateDocuments(formData);
      const updatedTrackedDocuments = updateDocuments(
        trackDocuments ?? formData,
      );

      // Filter out document for formData
      const filteredDocuments = updatedDocuments.filter((doc: any) => {
        if (doc.id !== document.id) {
          return doc;
        }
      });

      setFormData(filteredDocuments);
      dispatch(updateSiteDocument(filteredDocuments));
      dispatch(setupDocumentsDataForSaving(updatedTrackedDocuments));

      const tracker = new ChangeTracker(
        IChangeType.Deleted,
        getFieldLabel('document'),
        ChangeContext.DOCUMENTS,
      );
      dispatch(trackChanges(tracker.toPlainObject()));
      setCurrentDocument({});
      setIsDelete(false);
    } else {
      setCurrentDocument(document);
      setIsDelete(true);
    }
  };

  const updateDocuments = (
    documentId: number,
    documents: any,
    value: any,
    graphQLPropertyName: any,
    srMode?: boolean,
    srActionValue?: SRApprovalStatusEnum,
  ) => {
    return documents.map((document: any) => {
      if (document.id === documentId) {
        const isPsnorgId =
          typeof value === 'object' &&
          value !== null &&
          graphQLPropertyName === 'psnorgId';
        const isTitle =
          typeof value === 'string' &&
          value !== null &&
          document?.file &&
          graphQLPropertyName === 'title';
        if (isPsnorgId) {
          let params: UpdateDisplayTypeParams = {
            indexToUpdate: documentFormRows.findIndex((row) =>
              row.some((field) => field.graphQLPropertyName === 'psnorgId'),
            ),
            updates: {
              isLoading: RequestStatus.success,
              options,
              filteredOptions: [],
              handleSearch,
              customInfoMessage: <></>,
            },
          };
          setInternalRow(updateFields(internalRow, params));
        }
        let updatedDocument = null;
        if (srMode) {
          updatedDocument = {
            ...document,
            displayName: isPsnorgId ? value.value : document.displayName,
            apiAction: document?.apiAction ?? UserActionEnum.updated,
            srAction: srActionValue,
          };
        } else {
          let fileExtension: any;
          updatedDocument = {
            ...document,
            [graphQLPropertyName]: isPsnorgId ? value.key : value,
            displayName: isPsnorgId ? value.value : document.displayName,
            organizationName: isPsnorgId ? value?.metaData : '',
            apiAction: document?.apiAction ?? UserActionEnum.updated,
            srAction: SRApprovalStatusEnum.Pending,
          };

          if (isTitle) {
            const fileName = document?.file?.name;
            fileExtension = fileName.slice(fileName.lastIndexOf('.'));
            const updatedFile = new File(
              [document?.file],
              `${value}${fileExtension}`,
              {
                type: document.file.type, // Keep the original file's type (e.g., application/pdf)
                lastModified: document.file.lastModified, // Keep the original file's lastModified date
              },
            );

            updatedDocument = { ...updatedDocument, file: updatedFile };
          }
        }
        return updatedDocument;
      }
      return document;
    });
  };

  const handleInputChange = (
    id: number,
    graphQLPropertyName: any,
    value: any,
  ) => {
    let updatedDocuments = null;
    let updatedTrackDocuments = null;
    if (
      viewMode === SiteDetailsMode.SRMode &&
      (value === 'checked' || value === 'unchecked')
    ) {
      updatedDocuments = updateDocuments(
        id,
        formData,
        value,
        graphQLPropertyName,
        true,
        value === 'checked'
          ? SRApprovalStatusEnum.Public
          : SRApprovalStatusEnum.Private,
      );
      updatedTrackDocuments = updateDocuments(
        id,
        trackDocuments ?? formData,
        value,
        graphQLPropertyName,
        true,
        value === 'checked'
          ? SRApprovalStatusEnum.Public
          : SRApprovalStatusEnum.Private,
      );
    } else {
      // Update both formData and trackNotation
      updatedDocuments = updateDocuments(
        id,
        formData,
        value,
        graphQLPropertyName,
      );
      updatedTrackDocuments = updateDocuments(
        id,
        trackDocuments ?? formData,
        value,
        graphQLPropertyName,
      );
    }

    setFormData(updatedDocuments);
    dispatch(updateSiteDocument(updatedDocuments));
    dispatch(setupDocumentsDataForSaving(updatedTrackDocuments));

    const flattedArr = flattenFormRows(documentFormRows);
    const currLabel =
      flattedArr &&
      flattedArr.find((row) => row.graphQLPropertyName === graphQLPropertyName);
    if (
      viewMode === SiteDetailsMode.SRMode &&
      (value === 'checked' || value === 'unchecked')
    ) {
      const currentDoc = updatedDocuments?.find((d: any) => d.id === id);
      if (currentDoc?.apiAction !== UserActionEnum.added) {
        const tracker = new ChangeTracker(
          IChangeType.Modified,
          getFieldLabel('srValue'),
          ChangeContext.DOCUMENTS,
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      }
    } else {
      const currentDoc = updatedDocuments?.find((d: any) => d.id === id);
      if (currentDoc?.apiAction !== UserActionEnum.added) {
        const tracker = new ChangeTracker(
          IChangeType.Modified,
          getFieldLabel(graphQLPropertyName),
          ChangeContext.DOCUMENTS,
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      }
    }
  };

  if (
    !id?.trim() ||
    (!siteDocuments?.length && viewMode === SiteDetailsMode.ViewOnlyMode)
  ) {
    const hasDocuments =
      !siteDocuments?.length && viewMode === SiteDetailsMode.ViewOnlyMode;
    return (
      <Alert variant={hasDocuments ? 'info' : 'warning'} data-testid="no-site">
        {hasDocuments
          ? userType === UserType.Internal
            ? 'No documents found for this site.'
            : 'No documents found for this site. To inquire about documents, submit a Site Information Request form, or contact Advisor.SiteInformation@gov.bc.ca'
          : 'Please create a site before adding documents. Once the site is created, you can add documents to it.'}
      </Alert>
    );
  }

  return (
    <div className="px-2">
      <div
        className="row pe-2"
        id="document-component"
        data-testid="document-component"
      >
        {userType === UserType.Internal &&
          viewMode === SiteDetailsMode.EditMode && (
            <div className="col-lg-6 col-md-12 py-4 d-flex flex-column flex-sm-row ">
              <Button data-testid="Upload Document">
                <label
                  htmlFor="input-file"
                  className="d-flex align-items-center gap-2 cursor-pointer"
                >
                  <UploadFileIcon />
                  Upload Document
                </label>

                <input
                  key={uniqueId}
                  aria-label="input-file"
                  type="file"
                  id="input-file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleOnUploadDocument(e)}
                />
              </Button>
            </div>
          )}

        <div
          className={`${viewMode === SiteDetailsMode.EditMode ? `col-lg-6 col-md-12` : `col-lg-12`}`}
        >
          <div className="row justify-content-between p-0">
            <div
              className={`mb-3 ${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode ? `col-lg-6 col-md-12` : `col-lg-8 col-md-12`) : `col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12`}`}
            >
              <SearchInput
                label={'Search'}
                searchTerm={searchTerm}
                clearSearch={clearSearch}
                handleSearchChange={handleSearchChange}
              />
            </div>
            <div
              className={`${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode ? `col` : `col-lg-4 col-md-12`) : `col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12`}`}
            >
              <Sort
                formData={sortByValue}
                editMode={true}
                handleSortChange={handleSortChange}
              />
            </div>
          </div>
        </div>
      </div>
      <div
        data-testid="document-rows"
        className={`col-lg-12 p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`}
      >
        {formData &&
          formData.map((document, index) => (
            <div key={index} data-testid={`document-row-${index}`}>
              {viewMode === SiteDetailsMode.SRMode &&
                userType === UserType.Internal && (
                  <CheckBoxInput
                    type={FormFieldType.Checkbox}
                    label={''}
                    isLabel={false}
                    isChecked={
                      document.srAction === 'true' ||
                      document.srAction === SRApprovalStatusEnum.Public
                    }
                    onChange={(value) =>
                      handleInputChange(
                        document.id,
                        '',
                        value ? 'checked' : 'unchecked',
                      )
                    }
                    srMode={viewMode === SiteDetailsMode.SRMode}
                  />
                )}
              <Document
                userType={userType}
                mode={mode}
                documentFirstChildFormRows={documentFirstChildFormRows}
                externalRow={externalRow}
                viewMode={viewMode}
                handleInputChange={handleInputChange}
                document={document}
                srTimeStamp={`Send to SR on ${formatDate(document?.whenUpdated ?? document?.whenCreated ?? new Date())}`}
                handleViewOnline={() => {
                  handleViewOnline(document);
                }}
                handleDownload={() => {
                  handleDownload(document);
                }}
                handleFileReplace={handleFileReplace}
                handleFileDelete={handleFileDelete}
                uniqueId={uniqueId}
                internalRow={
                  viewMode === SiteDetailsMode.EditMode
                    ? internalRow
                    : internalDocRow
                }
              />
            </div>
          ))}
      </div>
      {(isDelete || isReplace) && (
        <ModalDialog
          key={v4()}
          label={`Are you sure to ${isDelete ? 'delete' : 'replace'} document ?`}
          closeHandler={(response) => {
            if (response) {
              if (isReplace) {
                handleFileReplace(currentFile, currentDocument, response);
              }

              if (isDelete) {
                handleFileDelete(currentDocument, response);
              }
            }
            setCurrentDocument({});
            setCurrentFile({});
            setIsDelete(false);
            setIsReplace(false);
          }}
        />
      )}
    </div>
  );
};

export default Documents;
