import { useDispatch, useSelector } from "react-redux";
import GetDocumentsConfig from "./DocumentsConfig";
import { AppDispatch } from "../../../Store";
import { documents, updateSiteDocument } from "./DocumentsSlice";
import { resetSiteDetails, siteDetailsMode, trackChanges } from "../../site/dto/SiteSlice";
import { useEffect, useState } from "react";
import { UserType } from "../../../helpers/requests/userType";
import { SiteDetailsMode } from "../dto/SiteDetailsMode";
import { flattenFormRows, getUser } from "../../../helpers/utility";
import SearchInput from "../../../components/search/SearchInput";
import Sort from "../../../components/sort/Sort";
import { CheckBoxInput } from "../../../components/input-controls/InputControls";
import { FormFieldType } from "../../../components/input-controls/IFormField";
import PanelWithUpDown from "../../../components/simple/PanelWithUpDown";
import Form from "../../../components/form/Form";
import { ChangeTracker, IChangeType } from "../../../components/common/IChangeType";
import { DownloadPdfIcon, ReplaceIcon, TrashCanIcon, UploadFileIcon, ViewOnlyIcon } from "../../../components/common/icon";
import './Documents.css';
import { useParams } from "react-router-dom";

const Documents = () => {
    const {documentFirstChildFormRowsForExternal, documentFirstChildFormRows, documentFormRows} = GetDocumentsConfig();
    const siteDocuments = useSelector(documents);
    const mode = useSelector(siteDetailsMode);
    const resetDetails = useSelector(resetSiteDetails); 
    const dispatch = useDispatch<AppDispatch>();
    const [userType, setUserType] = useState<UserType>(UserType.External);
    const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
    const [formData, setFormData] =  useState<{ [key: string]: any | [Date, Date] }[]>(siteDocuments);
    const [srTimeStamp, setSRTimeStamp] = useState('Sent to SR on June 2nd, 2013');
    const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const loggedInUser = getUser();
    const { id } = useParams();

    useEffect(() => {
        setViewMode(mode);
      }, [mode]);
      
    useEffect(()=>{
        if(resetDetails)
        {
          setFormData(siteDocuments)
        }
    },[resetDetails]);

    useEffect(()=>{
        if(loggedInUser?.profile.preferred_username?.indexOf("bceid") !== -1)
          {
            setUserType(UserType.External);
          }
          else if (loggedInUser?.profile.preferred_username?.indexOf("idir") !== -1)
          {
            setUserType(UserType.Internal);
          }
          else
          {
            // not logged in 
            setUserType(UserType.External);
      
          }
          setFormData(siteDocuments)
      }, []);

      const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = event.target.value;
        setSearchTerm(searchTerm);
    
        const filteredData = siteDocuments.filter((document: any) => {
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
    
            const stringValue = typeof value === 'string' ? value.toLowerCase() : String(value).toLowerCase();
            
            if (key === 'completionDate' || key === 'requirementDueDate' || key === 'requirementReceivedDate') {
                const date = new Date(value);
                const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }).toLowerCase();
                const ordinalSuffixPattern = /\b(\d+)(st|nd|rd|th)\b/g;
                searchTerm = searchTerm.replace(ordinalSuffixPattern, '$1')
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
      setFormData(siteDocuments)
    };

    const handleSortChange = (graphQLPropertyName: any,  value: String | [Date, Date]) => {
        setSortByValue((prevData) => ({
          ...prevData,
          [graphQLPropertyName]: value,
        }));
        sortItems(value, formData);
    };

    const sortItems = (sortBy:any, data:any) => {
        let sorted = [...data];
        switch (sortBy) {
          case 'newToOld':
            sorted.sort((a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime()); // Sorting by date from new to old
            break;
          case 'oldTonew':
            sorted.sort((a, b) => new Date(a.documentDate).getTime() - new Date(b.documentDate).getTime()); // Sorting by date from new to old
            break;
          // Add more cases for additional sorting options
          default:
            break;
        }
        setFormData(sorted)
    };

    const handleWidgetCheckBox = (event: any) => {
        alert(event);
    };

    const handleParentChekBoxChange = (id: any, value: any) => {
        alert(`${value}, ${id}`);
    };

    const handleOnUploadDocument = (event: React.ChangeEvent<HTMLInputElement>) => {
        console.log(event);
        // const file = event.target.files[0];
        // if (file && file.type === 'application/pdf') {
        //   console.log({...file});
        //   // You can perform additional actions here with the selected file
        //   // For example, upload it to a server or process it further
        // } else {
        //   alert('Please select a valid PDF file.');
        // }

        // alert('Upload file click');

        const newDocument = {
            id: Date.now(), // Generate a unique ID for the new participant
            siteId:id,
            psnorgId:'',
            submissionDate: new Date(),
            documentDate: null,
            title:'',
            displayName:'',
            sr: false,
        };
    
        const addDoc = [newDocument, ...formData];
        setFormData(addDoc);
        // dispatch(updateSiteDocument(addDoc));
        const tracker = new ChangeTracker(
            IChangeType.Added,
            'New Site Document'
        );
        dispatch(trackChanges(tracker.toPlainObject()));
    };

    const handleViewOnline = () => {
        alert('View online click');
    };

    const handleDownload = () => {
        alert('Download click');
    };
    const handleFileReplace = (event: any) => {
        // alert('File replace click');
    };
    const handleFileDelete = (document: any) => {
        alert(document.id);
        const nonDeletedDoc = formData.filter(doc => {
            if(doc.id !== document.id)
            {
                return doc;
            }
        });
        setFormData(nonDeletedDoc);
        // dispatch(updateSiteDocument(nonDeletedDoc));
        const tracker = new ChangeTracker(
            IChangeType.Deleted,
            'Document Delete',
          );
          dispatch(trackChanges(tracker.toPlainObject()));
    };

    const handleInputChange = (id: number, graphQLPropertyName: any, value: String | [Date, Date]) => {
        if(viewMode === SiteDetailsMode.SRMode)
        {
          console.log({[graphQLPropertyName]:value, id})
        }
        else
        {
            const updatedDoc = formData.map((document) => {
                if (document.id === id) {
                  return { ...document, [graphQLPropertyName]: value };
                }
                return document;
              });
              setFormData(updatedDoc);
              dispatch(updateSiteDocument(updatedDoc));
        }
        const flattedArr = flattenFormRows(documentFormRows);
        const currLabel =
          flattedArr &&
          flattedArr.find((row) => row.graphQLPropertyName === graphQLPropertyName);
        const tracker = new ChangeTracker(
            IChangeType.Modified,
            'Document: ' + currLabel?.label ?? '',
          );
          dispatch(trackChanges(tracker.toPlainObject()));
    }


    return(
     <div className="px-2">
        <div className="row pe-2" id="document-component" data-testid="document-component">
            { 
                userType === UserType.Internal && viewMode === SiteDetailsMode.EditMode &&
                <div className="col-lg-6 col-md-12 py-4 d-flex flex-column flex-sm-row ">
                    <button
                        className={`d-flex align-items-center btn-upload-document justify-content-center`}
                       
                        aria-label="Upload Document">
                            <label htmlFor="input-file" className="d-flex align-items-center gap-2">
                                <UploadFileIcon className="btn-document-icon cursor-pointer" />
                                <span className="cursor-pointer">Upload Document</span>
                            </label>
                            <input type="file" id="input-file" accept=".pdf" style={{ display: 'none' }}  onChange={(e) => handleOnUploadDocument} />
                    </button>
                </div>
            }

            <div className={`${viewMode === SiteDetailsMode.EditMode ? `col-lg-6 col-md-12` : `col-lg-12`}`}>
                <div className="row justify-content-between p-0">
                    <div className={`mb-3 ${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode) ? `col-lg-6 col-md-12` : `col-lg-8 col-md-12` : `col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12`}`}>
                        <SearchInput label={'Search'} searchTerm={searchTerm} clearSearch={clearSearch} handleSearchChange={handleSearchChange}/>
                    </div>            
                    <div className={`${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode) ? `col` : `col-lg-4 col-md-12` : `col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12`}`}>
                        <Sort formData={sortByValue} editMode={true} handleSortChange={handleSortChange} /> 
                    </div>
                </div>
            </div>
        </div>
        <div data-testid = "document-rows" className={`col-lg-12 overflow-auto p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`} style={{ maxHeight: '800px'}}>
            {
                formData && formData.map((document, index) => (
                    <div key={index}>
                         {
                            (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal && 
                            <CheckBoxInput
                                type={FormFieldType.Checkbox}
                                label={''}
                                isLabel={false}
                                onChange={(value) => handleParentChekBoxChange(document.id, value)}
                                srMode = {(viewMode === SiteDetailsMode.SRMode)}
                            />
                        }
                 
                        <PanelWithUpDown
                            firstChild = {
                                <div className="w-100" key={index}>
                                    <Form formRows = { userType === UserType.Internal ? documentFirstChildFormRows: documentFirstChildFormRowsForExternal} 
                                        formData = {document} 
                                        editMode = {viewMode === SiteDetailsMode.EditMode} 
                                        srMode= { viewMode === SiteDetailsMode.SRMode } 
                                        handleInputChange={(graphQLPropertyName, value) => handleInputChange(document.id, graphQLPropertyName, value)}
                                        aria-label="Document collasped form"/>
                                        { userType === UserType.Internal && <span className="sr-time-stamp">{srTimeStamp}</span> }
                                </div>
                            }
                            secondChild = {
                                <div className="w-100">
                                     <div className="d-flex py-2 mb-3 gap-2  flex-wrap flex-column flex-sm-row">
                                        <button
                                            id="view-online"
                                            className={`d-flex align-items-center ${viewMode === SiteDetailsMode.SRMode ? 'document-btn-disable' : 'btn-upload-document'} `}
                                            disabled={viewMode === SiteDetailsMode.SRMode}
                                            onClick={handleViewOnline}
                                            aria-label="View Online">
                                                <div className="d-flex align-items-center gap-2">
                                                    <ViewOnlyIcon className="btn-document-icon " />
                                                    <span>View Online</span>
                                                </div>
                                        </button>
                                        <button
                                            id="download-pdf"
                                            className={`d-flex align-items-center  ${viewMode === SiteDetailsMode.SRMode ? 'document-btn-disable': 'document-btn '} `}
                                            disabled={viewMode === SiteDetailsMode.SRMode}
                                            type="button"
                                            onClick={handleDownload}
                                            aria-label={'Download'}
                                            >
                                            <DownloadPdfIcon className="btn-document-icon" />
                                            <span>Download (PDF)</span>
                                        </button>
                                        { (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal && 
                                            <>
                                                <button
                                                    id="download-pdf"
                                                    className=" d-flex align-items-center document-btn "
                                                    type="button"
                                                    onClick={handleFileReplace}
                                                    aria-label={'File replace'}
                                                    >
                                                    <label htmlFor="replace-file" className="d-flex align-items-center gap-2">
                                                        <ReplaceIcon className="btn-document-icon cursor-pointer" />
                                                        <span className="cursor-pointer">Replace File</span>
                                                    </label>
                                                    <input type="file" id="replace-file" accept=".pdf" style={{ display: 'none' }} />
                                                </button>
                                                <button
                                                    id="download-pdf"
                                                    className=" d-flex align-items-center document-btn "
                                                    type="button"
                                                    onClick={() => handleFileDelete(document)}
                                                    aria-label={'File delete'}
                                                    >
                                                    <TrashCanIcon className="btn-document-icon" />
                                                    <span>Delete</span>
                                                </button>
                                            </>
                                        }
                                     </div>
                                     <Form formRows={documentFormRows } 
                                      formData={document} 
                                      editMode={viewMode === SiteDetailsMode.EditMode}  
                                      srMode= { viewMode === SiteDetailsMode.SRMode } 
                                      handleInputChange={(graphQLPropertyName, value) => handleInputChange(document.id, graphQLPropertyName, value)}
                                      aria-label="Sort Notation Form"/>
                                    { userType === UserType.Internal && <p className="sr-time-stamp">{srTimeStamp}</p>}
                                </div>
                            }
                        />
                    </div>
                ))
            }
        </div>
     </div>
    )
}

export default Documents;