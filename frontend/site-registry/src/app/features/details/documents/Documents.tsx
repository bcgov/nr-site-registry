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
import { useCallback, useEffect, useState } from 'react';
import { UserType } from '../../../helpers/requests/userType';
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import {
  flattenFormRows,
  getAxiosInstance,
  getUser,
  resultCache,
  UpdateDisplayTypeParams,
  updateFields,
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
  getSiteDocuments,
  saveRequestStatus,
  setupDocumentsDataForSaving,
} from '../SaveSiteDetailsSlice';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { UserActionEnum } from '../../../common/userActionEnum';

const Documents: React.FC<IComponentProps> = ({ showPending = false }) => {
  const {
    documentFirstChildFormRowsForExternal,
    documentFirstChildFormRows,
    documentFormRows,
  } = GetDocumentsConfig();
  const loggedInUser = getUser();
  const { id } = useParams();
  const { siteDocuments: siteDocuments, status } = useSelector(documents);
  const mode = useSelector(siteDetailsMode);
  const resetDetails = useSelector(resetSiteDetails);
  const saveSiteDetailsRequestStatus = useSelector(saveRequestStatus);
  const trackDocuments = useSelector(getSiteDocuments);
  const dispatch = useDispatch<AppDispatch>();

  const [userType, setUserType] = useState<UserType>(UserType.External);
  const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
  const [formData, setFormData] =
    useState<{ [key: string]: any | [Date, Date] }[]>(siteDocuments);
  const [srTimeStamp, setSRTimeStamp] = useState(
    'Sent to SR on June 2nd, 2013',
  );
  const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [isDelete, setIsDelete] = useState(false);
  const [isReplace, setIsReplace] = useState(false);
  const [currentDocument, setCurrentDocument] = useState({});
  const [currentFile, setCurrentFile] = useState({});
  const [key, setKey] = useState(Date.now()); // Key for input type="file" element

  const [internalRow, setInternalRow] = useState(documentFormRows);
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
          variables: { searchParam },
        });

        // Store result in cache if successful
        if (response?.data?.data?.getPeopleOrgsCd?.success) {
          resultCache[searchParam] = response.data.data.getPeopleOrgsCd.data;
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
        setFormData(siteDocuments);
      }
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
    if (loggedInUser?.profile.preferred_username?.includes('bceid')) {
      setUserType(UserType.External);
    } else if (loggedInUser?.profile.preferred_username?.includes('idir')) {
      setUserType(UserType.Internal);
    } else {
      setUserType(UserType.External);
    }
  }, [loggedInUser]);

  // Handle view mode changes
  useEffect(() => {
    setViewMode(mode);
  }, [mode]);

  // THIS MAY CHANGE IN FUTURE. NEED TO DISCUSS AS API NEEDS TO BE CALLED AGAIN
  // IF SAVED OR CANCEL BUTTON ON TOP IS CLICKED
  useEffect(() => {
    if (resetDetails) {
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
    let sorted = [...data];
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

  const handleWidgetCheckBox = (event: any) => {
    alert(event);
  };

  const handleParentChekBoxChange = (id: any, value: any) => {
    alert(`${value}, ${id}`);
  };

  const handleOnUploadDocument = (event: any) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0] ?? null;
      if (file && file.type === 'application/pdf') {
        // You can perform additional actions here with the selected file
        // For example, upload it to a server or process it further

        const newDocument = {
          id: v4(), // Generate a unique ID for the new document
          docParticId: v4(),
          siteId: id,
          psnorgId: '',
          submissionDate: new Date(),
          documentDate: new Date(file.lastModified),
          title: file.name.split('.pdf')[0].trim(),
          displayName: '',

          //this need to be filled once file is uploaded in BC Box
          filePath: 'Need to give uploaded file path.',

          apiAction: UserActionEnum.added,
          srAction: SRApprovalStatusEnum.Pending,
        };
        const updatedDocuments = [newDocument, ...formData];
        setFormData(updatedDocuments);
        dispatch(updateSiteDocument(updatedDocuments));
        dispatch(
          setupDocumentsDataForSaving([
            newDocument,
            ...(trackDocuments ?? formData),
          ]),
        );
        const tracker = new ChangeTracker(
          IChangeType.Added,
          'New Site Document',
        );
        dispatch(trackChanges(tracker.toPlainObject()));
      } else {
        alert('Please select a valid PDF file.');
      }
    }
  };

  const handleViewOnline = () => {
    alert('View online click');
  };

  const handleDownload = () => {
    alert('Download click');
  };

  const handleFileReplace = (
    event: any,
    doc: any,
    docIsReplace: boolean = false,
  ) => {
    if (docIsReplace) {
      if (event.target.files && event.target.files.length > 0) {
        const file = event.target.files[0] ?? null;
        if (file && file.type === 'application/pdf') {
          // You can perform additional actions here with the selected file
          // For example, upload it to a server or process it further

          const updateDocuments = (documents: any) => {
            return documents.map((document: any) => {
              if (document.id === doc.id) {
                let replacedDocument = {
                  ...doc,
                  submissionDate: new Date(),
                  documentDate: new Date(file.lastModified),
                  title: file.name.split('.pdf')[0].trim(),

                  //this need to be filled once file is uploaded in BC Box
                  filePath: 'Need to give uploaded file path.',

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
          const tracker = new ChangeTracker(
            IChangeType.Modified,
            'Replace Site Document',
          );
          dispatch(trackChanges(tracker.toPlainObject()));
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
      setKey(Date.now()); // Force input type="file" to reset
    }
  };

  const handleFileDelete = (document: any, docIsDelete: boolean = false) => {
    if (docIsDelete) {
      const updateDocuments = (documents: any) => {
        return documents.map((doc: any) => {
          if (doc.id === document.id) {
            return {
              ...document,
              apiAction: UserActionEnum.deleted, // Mark as deleted
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

      const tracker = new ChangeTracker(IChangeType.Deleted, 'Document Delete');
      dispatch(trackChanges(tracker.toPlainObject()));
      setCurrentDocument({});
      setIsDelete(false);
    } else {
      setCurrentDocument(document);
      setIsDelete(true);
    }
  };

  const handleInputChange = (
    id: number,
    graphQLPropertyName: any,
    value: any,
  ) => {
    if (viewMode === SiteDetailsMode.SRMode) {
      console.log({ [graphQLPropertyName]: value, id });
    } else {
      const updateDocuments = (documents: any) => {
        return documents.map((document: any) => {
          if (document.id === id) {
            const isPsnorgId =
              typeof value === 'object' &&
              value !== null &&
              graphQLPropertyName === 'psnorgId';
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
            let updatedDocument = {
              ...document,
              [graphQLPropertyName]: isPsnorgId ? value.key : value,
              displayName: isPsnorgId ? value.value : document.displayName,
              apiAction: document?.apiAction ?? UserActionEnum.updated,
              srAction: SRApprovalStatusEnum.Pending,
            };
            return updatedDocument;
          }
          return document;
        });
      };

      // Update both formData and trackNotation
      const updatedDocuments = updateDocuments(formData);
      const updatedTrackDocuments = updateDocuments(trackDocuments ?? formData);
      setFormData(updatedDocuments);
      dispatch(updateSiteDocument(updatedDocuments));
      dispatch(setupDocumentsDataForSaving(updatedTrackDocuments));
    }
    const flattedArr = flattenFormRows(documentFormRows);
    const currLabel =
      flattedArr &&
      flattedArr.find((row) => row.graphQLPropertyName === graphQLPropertyName);
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Document: ' + currLabel?.label,
    );
    dispatch(trackChanges(tracker.toPlainObject()));
  };

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
              <button
                className={`d-flex align-items-center btn-upload-document justify-content-center`}
                data-testid="Upload Document"
                aria-label="Upload Document"
              >
                <label
                  htmlFor="input-file"
                  className="d-flex align-items-center gap-2"
                >
                  <UploadFileIcon className="btn-document-icon cursor-pointer" />
                  <span className="cursor-pointer">Upload Document</span>
                </label>
                <input
                  aria-label="input-file"
                  type="file"
                  id="input-file"
                  accept=".pdf"
                  style={{ display: 'none' }}
                  onChange={(e) => handleOnUploadDocument(e)}
                />
              </button>
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
        className={`col-lg-12 overflow-auto p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`}
        style={{ maxHeight: '800px' }}
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
                    onChange={(value) =>
                      handleParentChekBoxChange(document.id, value)
                    }
                    srMode={viewMode === SiteDetailsMode.SRMode}
                  />
                )}
              <Document
                index={index}
                userType={userType}
                mode={mode}
                documentFirstChildFormRows={documentFirstChildFormRows}
                externalRow={externalRow}
                viewMode={viewMode}
                handleInputChange={handleInputChange}
                document={document}
                srTimeStamp={srTimeStamp}
                handleViewOnline={handleViewOnline}
                handleDownload={handleDownload}
                handleFileReplace={handleFileReplace}
                handleFileDelete={handleFileDelete}
                key={key}
                internalRow={internalRow}
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
