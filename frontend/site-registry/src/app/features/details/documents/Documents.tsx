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
import PanelWithUpDown from '../../../components/simple/PanelWithUpDown';
import Form from '../../../components/form/Form';
import {
  ChangeTracker,
  IChangeType,
} from '../../../components/common/IChangeType';
import {
  DownloadPdfIcon,
  ReplaceIcon,
  SpinnerIcon,
  TrashCanIcon,
  UploadFileIcon,
  ViewOnlyIcon,
} from '../../../components/common/icon';
import './Documents.css';
import { useParams } from 'react-router-dom';
import ModalDialog from '../../../components/modaldialog/ModalDialog';
import { v4 } from 'uuid';
import { GRAPHQL } from '../../../helpers/endpoints';
import { graphQLPeopleOrgsCd } from '../../site/graphql/Dropdowns';
import { print } from 'graphql';
import infoIcon from '../../../images/info-icon.png';
import { RequestStatus } from '../../../helpers/requests/status';
import { GetDocumentsConfig } from './DocumentsConfig';
import {
  getSiteDocuments,
  saveRequestStatus,
  setupDocumentsDataForSaving,
} from '../SaveSiteDetailsSlice';
import { SRApprovalStatusEnum } from '../../../common/srApprovalStatusEnum';
import { UserActionEnum } from '../../../common/userActionEnum';

const Documents = () => {
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
      setOptions(uniquePsnOrgs);
      console.log(siteDocuments);
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
    dispatch(setupDocumentsDataForSaving(siteDocuments));
  }, [mode]);

  // THIS MAY CHANGE IN FUTURE. NEED TO DISCUSS AS API NEEDS TO BE CALLED AGAIN
  // IF SAVED OR CANCEL BUTTON ON TOP IS CLICKED
  useEffect(() => {
    if (resetDetails) {
      dispatch(fetchDocuments(id ?? ''));
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
          dprCode: 'ATH',
          submissionDate: new Date(),
          documentDate: new Date(file.lastModified),
          title: file.name.split('.pdf')[0].trim(),
          displayName: '',
          apiAction: UserActionEnum.added,
          srAction: SRApprovalStatusEnum.Pending,
        };
        const updatedDocuments = [newDocument, ...formData];
        setFormData(updatedDocuments);
        dispatch(updateSiteDocument(updatedDocuments));
        dispatch(setupDocumentsDataForSaving([newDocument, ...trackDocuments]));
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
          const updatedTrackedDocuments = updateDocuments(trackDocuments);

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

          // const updatedDoc = formData.map((document) => {
          //   if (document.id === doc.id) {
          //     const replacedDoc = {
          //       ...doc,
          //       submissionDate: new Date(),
          //       documentDate: file.lastModified,
          //       title: file.name.split('.pdf')[0].trim(),
          //       apiAction: UserActionEnum.updated,
          //       srAction: SRApprovalStatusEnum.Pending,
          //     };
          //     return { ...document, ...replacedDoc };
          //   }
          //   return document;
          // });
          // setFormData(updatedDoc);
          //   dispatch(updateSiteDocument(updatedDoc));
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
      const updatedTrackedDocuments = updateDocuments(trackDocuments);

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

      // const nonDeletedDoc = formData.filter((doc) => {
      //   if (doc.id !== document.id) {
      //     return doc;
      //   }
      // });
      // setFormData(nonDeletedDoc);
      // dispatch(updateSiteDocument(nonDeletedDoc));
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
    console.log(id, graphQLPropertyName, value);
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
      const updatedTrackDocuments = updateDocuments(trackDocuments);
      setFormData(updatedDocuments);
      dispatch(updateSiteDocument(updatedDocuments));
      dispatch(setupDocumentsDataForSaving(updatedTrackDocuments));

      // const updatedDoc = formData.map((document) => {
      //   if (document.id === id) {
      //     if (graphQLPropertyName === 'psnorgId') {
      //       // Parameters for the update
      //       let params: UpdateDisplayTypeParams = {
      //         indexToUpdate: documentFormRows.findIndex((row) =>
      //           row.some((field) => field.graphQLPropertyName === 'psnorgId'),
      //         ),
      //         updates: {
      //           isLoading: RequestStatus.success,
      //           options,
      //           filteredOptions: [],
      //           handleSearch,
      //           customInfoMessage: <></>,
      //         },
      //       };
      //       const indexToUpdateExt =
      //         documentFirstChildFormRowsForExternal.findIndex((row) =>
      //           row.some((field) => field.graphQLPropertyName === 'psnorgId'),
      //         );

      //       let paramsExt: UpdateDisplayTypeParams = {
      //         indexToUpdate: indexToUpdateExt,
      //         updates: {
      //           isLoading: RequestStatus.success,
      //           options: [options, { ...value }],
      //           filteredOptions: [],
      //           handleSearch: handleSearch,
      //           customInfoMessage: <></>,
      //         },
      //       };
      //       // setExternalRow(updateFields(externalRow, paramsExt));
      //       setInternalRow(updateFields(internalRow, params));
      //       return {
      //         ...document,
      //         [graphQLPropertyName]: value.key,
      //         ['displayName']: value.value,
      //       };
      //     }
      //     return { ...document, [graphQLPropertyName]: value };
      //   }
      //   return document;
      // });

      // setFormData(updatedDoc);
      // dispatch(updateSiteDocument(updatedDoc));
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

  // const fetchNotationParticipant = async (searchParam: string) => {
  //   try {
  //     if (
  //       searchParam !== null &&
  //       searchParam !== undefined &&
  //       searchParam !== ''
  //     ) {
  //       const response = await getAxiosInstance().post(GRAPHQL, {
  //         query: print(graphQLPeopleOrgsCd()),
  //         variables: {
  //           searchParam: searchParam,
  //         },
  //       });
  //       return response.data.data.getPeopleOrgsCd;
  //     } else {
  //       return [];
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // };

  // if (loading === RequestStatus.loading) {
  //   return (
  //     <div className="document-loading-overlay">
  //       <div className="document-spinner-container">
  //         <SpinnerIcon
  //           data-testid="loading-spinner"
  //           className="document-fa-spin"
  //         />
  //       </div>
  //     </div>
  //   );
  // }

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

              <PanelWithUpDown
                firstChild={
                  <div className="w-100" key={index}>
                    <Form
                      formRows={
                        userType === UserType.Internal
                          ? mode === SiteDetailsMode.EditMode
                            ? documentFirstChildFormRows
                            : externalRow
                          : externalRow
                      }
                      formData={document}
                      editMode={viewMode === SiteDetailsMode.EditMode}
                      srMode={viewMode === SiteDetailsMode.SRMode}
                      handleInputChange={(graphQLPropertyName, value) =>
                        handleInputChange(
                          document.id,
                          graphQLPropertyName,
                          value,
                        )
                      }
                      aria-label="Document collasped form"
                    />
                    {userType === UserType.Internal && (
                      <span className="sr-time-stamp">{srTimeStamp}</span>
                    )}
                  </div>
                }
                secondChild={
                  <div className="w-100 custom-second-child" key={index}>
                    <div
                      className="d-flex py-2 mb-3 gap-2 flex-wrap flex-column flex-sm-row"
                      key={index}
                    >
                      <button
                        id="view-online"
                        className={`d-flex align-items-center justify-content-center ${viewMode === SiteDetailsMode.SRMode ? 'document-btn-disable' : 'btn-upload-document'} `}
                        disabled={viewMode === SiteDetailsMode.SRMode}
                        onClick={handleViewOnline}
                        aria-label="View Online"
                      >
                        <div className="d-flex align-items-center gap-2">
                          <ViewOnlyIcon className="btn-document-icon " />
                          <span>View Online</span>
                        </div>
                      </button>
                      <button
                        id="download-pdf"
                        className={`d-flex align-items-center justify-content-center  ${viewMode === SiteDetailsMode.SRMode ? 'document-btn-disable' : 'document-btn '} `}
                        disabled={viewMode === SiteDetailsMode.SRMode}
                        type="button"
                        onClick={handleDownload}
                        aria-label={'Download'}
                      >
                        <DownloadPdfIcon className="btn-document-icon" />
                        <span>Download (PDF)</span>
                      </button>
                      {viewMode === SiteDetailsMode.EditMode &&
                        userType === UserType.Internal && (
                          <>
                            <button
                              id="replace-pdf"
                              className=" d-flex align-items-center justify-content-center document-btn "
                              type="button"
                              aria-label={'File replace'}
                              data-testid="replace-file"
                            >
                              <label
                                htmlFor={`replace-file_${index}`}
                                className="d-flex align-items-center gap-2"
                              >
                                <ReplaceIcon className="btn-document-icon cursor-pointer" />
                                <span className="cursor-pointer">
                                  Replace File
                                </span>
                              </label>
                              <input
                                type="file"
                                id={`replace-file_${index}`}
                                accept=".pdf"
                                style={{ display: 'none' }}
                                onChange={(e) => handleFileReplace(e, document)}
                                key={key}
                              />
                            </button>
                            <button
                              id="delete-pdf"
                              className=" d-flex align-items-center justify-content-center document-btn "
                              type="button"
                              onClick={() => handleFileDelete(document)}
                              aria-label={'File delete'}
                              data-testid="delete-file"
                            >
                              <TrashCanIcon className="btn-document-icon" />
                              <span>Delete</span>
                            </button>
                          </>
                        )}
                    </div>
                    <Form
                      formRows={internalRow}
                      formData={document}
                      editMode={viewMode === SiteDetailsMode.EditMode}
                      srMode={viewMode === SiteDetailsMode.SRMode}
                      handleInputChange={(graphQLPropertyName, value) =>
                        handleInputChange(
                          document.id,
                          graphQLPropertyName,
                          value,
                        )
                      }
                      aria-label="Sort Notation Form"
                    />
                    {userType === UserType.Internal && (
                      <p className="sr-time-stamp">{srTimeStamp}</p>
                    )}
                  </div>
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
