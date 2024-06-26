import React, { useEffect, useState } from "react";
import PanelWithUpDown from "../../../components/simple/PanelWithUpDown";
import Form from "../../../components/form/Form";
import { notationColumnInternal, notationFormRowsInternal, notationFormRowExternal, notationFormRowsFirstChild, notationColumnExternal } from "./NotationsConfig";
import './Notations.css';
import Widget from "../../../components/widget/Widget";
import { RequestStatus } from "../../../helpers/requests/status";
import { UserType } from "../../../helpers/requests/userType";
import { AppDispatch } from "../../../Store";
import { useDispatch, useSelector } from "react-redux";
import { CircleXMarkIcon, MagnifyingGlassIcon, Plus, UserMinus, UserPlus } from "../../../components/common/icon";
import { INotations } from "./INotations";
// import { SiteDetailsMode } from "../../../helpers/requests/SiteDetailsMode";
import { ChangeTracker, IChangeType } from "../../../components/common/IChangeType";
import { resetSiteDetails, selectSiteDetails, siteDetailsMode, trackChanges } from "../../site/dto/SiteSlice";
import { flattenFormRows, formatDate, formatDateRange } from "../../../helpers/utility";
import Search from "../../site/Search";
import SearchInput from "../../../components/search/SearchInput";
import Sort from "../../../components/sort/Sort"; 
import SiteDetails from "../SiteDetails";
import { SiteDetailsMode } from "../dto/SiteDetailsMode";
import { setDate } from "date-fns";
import { CheckBoxInput } from "../../../components/input-controls/InputControls";
import { FormFieldType } from "../../../components/input-controls/IFormField";




const notationParticipantData1 = [
    {
      id: 1,
      role: "CSAP",
      participantName: "Jane Smith",
      sr: false,
      date: new Date('2024-05-05')
    },
    {
      id:2,
      role: "SDM",
      participantName: "John",
      sr: true,
      date: new Date('2024-05-03')
    },
    {
      id:3,
      role: "CSSATEAM",
      participantName: "Chris Lee",
      sr: false,
      date: new Date('2024-05-03')
    }
  ];

const notationParticipantData2 = [
    {
      id: 1,
      role: "CSAP",
      participantName: "Jane Smith",
      sr: false,
      date: new Date('2024-05-05')
    },
    {
      id:2,
      role: "SDM",
      participantName: "Johnson",
      sr: true,
      date: new Date('2024-05-03')
    },
    {
      id:3,
      role: "CSSATEAM",
      participantName: "Chris",
      sr: false,
      date: new Date('2024-05-03')
    }
  ];

const notationParticipantData3 = [
    {
      id: 1,
      role: "CSAP",
      participantName: "Smith",
      sr: false,
      date: new Date('2024-05-05')
    },
    {
      id:2,
      role: "SDM",
      participantName: "Johnson",
      sr: true,
      date: new Date('2024-05-03')
    },
    {
      id:3,
      role: "CSSATEAM",
      participantName: "Lee",
      sr: false,
      date: new Date('2024-05-03')
    }
  ];






const Notations: React.FC<INotations> = ({    
    user,
  }) => {

    const details = useSelector(selectSiteDetails);

    const [userType, setUserType] = useState<UserType>(UserType.Internal);
    const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
    const [formData, setFormData] =  useState<{ [key: string]: any | [Date, Date] }[]>(details.events);
    const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
    const [srTimeStamp, setSRTimeStamp] = useState('Sent to SR on June 2nd, 2013');
    const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
    const [searchTerm, setSearchTerm] = useState('');

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = event.target.value;
      setSearchTerm(searchTerm);
  
      const filteredData = formData.filter(notation => {
          // Check if any property of the notation object contains the searchTerm
          return deepSearch(notation, searchTerm.toLowerCase().trim());
      });
      setFormData(filteredData);
  };
  
  const deepSearch = (obj: any, searchTerm: string): boolean => {
      for (const key in obj) {
        const value = obj[key];
          if (typeof value === 'object') {
              if (deepSearch(obj[key], searchTerm)) {
                  return true;
              }
            }
          // } else if (typeof value === 'string' || typeof value === 'number' || value instanceof Date) {
              if (String(value).toLowerCase().includes(searchTerm)) {
                  return true;
              }
          // }
      }
      return false;
  };

    const dispatch = useDispatch<AppDispatch>();
    const mode = useSelector(siteDetailsMode);

    useEffect(()=> {
        setViewMode(mode);
    }, [mode]);

    const clearSearch = () => {
      setSearchTerm('');
      setFormData(details.events)
    };

    

    const resetDetails = useSelector(resetSiteDetails);  
    useEffect(()=>{
        if(resetDetails)
        {
          setFormData(details.events)
          // setData(dummyData);
        }
    },[resetDetails]);

    useEffect(() => {
      setFormData(details.events)
    }, []);

    const handleInputChange = (id: number, graphQLPropertyName: any, value: String | [Date, Date]) => {
      if(viewMode === SiteDetailsMode.SRMode)
      {
        console.log({[graphQLPropertyName]:value, id})
      }
      else
      {
        setFormData((prevData) => {
          return prevData.map((notation) => {
              if (notation.notationId === id) {
                  return { ...notation, [graphQLPropertyName]: value };
              }
              return notation;
          });
      });
    }
      const flattedArr = flattenFormRows(notationFormRowsInternal)
      const currLabel = flattedArr && flattedArr.find(row => row.graphQLPropertyName === graphQLPropertyName);
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        "Notations: " + currLabel?.label ?? ''
      );
      dispatch(trackChanges(tracker.toPlainObject()));
  };

  const handleWidgetCheckBox = (event: any) => {
    alert(event)
  }
  const handleParentChekBoxChange = (id: any, value: any) => {
    alert(`${value}, ${id}`)
  }

    const [selectedRows, setSelectedRows] = useState<{notationId: any, participantId: any}[]>([]);

    const handleRemoveParticipant = (notationId: any) => {
     // Remove selected rows from formData state
      setFormData(prevData => {
        return prevData.map(notation => {
            if (notation.notationId === notationId) {
                // Filter out selected rows from notationParticipant array
                const updatedNotationParticipant = notation.notationParticipant.filter((participant:any) =>
                    !selectedRows.some(row => row.notationId === notation.notationId && row.participantId === participant.id)
                );
                return { ...notation, notationParticipant: updatedNotationParticipant };
            }
            return notation;
        });
    });
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Notation Participant Delete'
    );
    dispatch(trackChanges(tracker.toPlainObject()));
    // Clear selectedRows state

    const updateSelectedRows =  selectedRows.filter(row => row.notationId !== notationId);
    setSelectedRows(updateSelectedRows);
    
    };

    useEffect(()=>{
      console.log(formData)
    },[formData])

    const handleTableChange = (notationId: any, event: any) => {
      const isExist = formData.some(item => item.notationId === notationId && item.notationParticipant.some((participant: any) => participant.id === event.row.id));
      if (isExist && event.property.includes('select_row')) {
        // Update selectedRows state based on checkbox selection
        if (event.value) {
            setSelectedRows(prevSelectedRows => [...prevSelectedRows, { notationId, participantId: event.row.id }]);
        } else {
            setSelectedRows(prevSelectedRows => prevSelectedRows.filter(row => !(row.notationId === notationId && row.participantId === event.row.id)));
        }
      }
      else
      {
        setFormData((prevData) => {
            return prevData.map((notation) => {
                if (notation.notationId === notationId) {
                    const updatedNotationParticipant = notation.notationParticipant.map((participant:any) => {
                        if (participant.id === event.row.id) {
                            return { ...participant, [event.property]: event.value };
                        }
                        return participant;
                    });
                    return { ...notation, notationParticipant: updatedNotationParticipant };
                }
                return notation;
            });
        });
      }
  };

  const handleSortChange = (graphQLPropertyName: any, value: String | [Date, Date] ) => {
      setSortByValue((prevData) => ({
        ...prevData,
        [graphQLPropertyName]:value 
      }));
      sortItems (value, formData);
  }

    const sortItems = (sortBy:any, data:any) => {
      let sorted = [...data];
      switch (sortBy) {
        case 'newToOld':
          sorted.sort((a, b) => b.initialDate - a.initialDate); // Sorting by date from new to old
          break;
        case 'oldTonew':
          sorted.sort((a, b) => a.initialDate - b.initialDate); // Sorting by date from new to old
          break;
        // Add more cases for additional sorting options
        default:
          break;
      }
      setFormData(sorted)
    };

    const handleOnAddNotation = () => {
        const newNotation = {
          notationId: formData.length + 1, // Generate a unique ID for the new notation
          notationType: "", // Default values for other properties
          initialDate: new Date(),
          completedDate: new Date(),
          notationClass: "",
          requiredDate: new Date(),
          ministryContact: "",
          requiredActions: "",
          note: "",
          notationParticipant: [ ],
      };

      // Add the new notation to formData
      setFormData(prevData => [...prevData, newNotation]);
      const tracker = new ChangeTracker(
        IChangeType.Modified,
        'New Notation Added'
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    };

    const handleAddParticipant = (notationId: any) => {
      const newParticipant = {
        id: Date.now(), // Generate a unique ID for the new participant
        role: "",
        participantName: "",
        sr: false,
        date: new Date()
    };

    setFormData(prevFormData => {
        return prevFormData.map(notation => {
            if (notation.notationId === notationId) {
                // Create a new array with the updated notation object
                return {
                    ...notation,
                    notationParticipant: [...notation.notationParticipant, newParticipant]
                };
            }
            return notation;
        });
    });
    const tracker = new ChangeTracker(
      IChangeType.Modified,
      'Notation Participant Added'
    );
  };

  const isAnyParticipantSelected = (notationId: any) => {
   return selectedRows.some((row) => row.notationId === notationId)
  };

    return (
      <>
          <div className="row" id="notations-component" data-testid="notations-component">
          { userType === UserType.Internal && (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode) &&
            <div className="col-lg-6 col-md-12 py-4">
              <button className={`d-flex align-items-center ${viewMode === SiteDetailsMode.EditMode ? `btn-add-notation` : `btn-add-notation-disable`} `} disabled= { viewMode === SiteDetailsMode.SRMode } onClick={handleOnAddNotation}
               aria-label="Add Notation">
                  <Plus className="btn-notation-icon"/>
                  <span>Add Notation</span>
              </button>
            </div>
          }
            <div className={`${userType === UserType.Internal && (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode) ? `col-lg-6 col-md-12` : `col-lg-12`}`}>
              <div className="row align-items-center justify-content-between p-0">
                <div className={`mb-3 ${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode) ? `col` : `col-lg-8 col-md-12` : `col-xxl-8 col-xl-8 col-lg-8 col-md-12 col-sm-12 col-xs-12`}`}>
                  <SearchInput label={'Search'} searchTerm={searchTerm} clearSearch={clearSearch} handleSearchChange={handleSearchChange}/>
                </div>            
                <div className={`${userType === UserType.Internal ? (viewMode === SiteDetailsMode.EditMode || viewMode === SiteDetailsMode.SRMode) ? `col` : `col-lg-4 col-md-12` : `col-xxl-4 col-xl-4 col-lg-4 col-md-12 col-sm-12 col-xs-12`}`}>
                  <Sort formData={sortByValue} editMode={true} handleSortChange={handleSortChange} /> 
                </div>
              </div>
            </div>
          </div>
          <div data-testid="notation-rows" className={`col-lg-12 overflow-auto p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`} style={{ maxHeight: '850px' }}>
            {
              formData && formData.map((notation, index) =>
              (<div className={`${formData.length >= 6 ? 'me-2' : 'me-0'}`} key={index} >
                  {
                    (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal && 
                    <CheckBoxInput
                      type={FormFieldType.Checkbox}
                      label={''}
                      isLabel={false}
                      onChange={(value) => handleParentChekBoxChange(notation.notationId, value)}
                    />
                  }
                  <PanelWithUpDown 
                        firstChild = { 
                            <div className="w-100">
                              <Form formRows = {notationFormRowsFirstChild} 
                                    formData = {notation} 
                                    editMode = {viewMode === SiteDetailsMode.EditMode} 
                                    srMode= { viewMode === SiteDetailsMode.SRMode } 
                                    handleInputChange={(graphQLPropertyName, value) => handleInputChange(notation.notationId, graphQLPropertyName, value)}
                              aria-label="Sort Notation Form"/>
                            { userType === UserType.Internal && <span className="sr-time-stamp">{notation.srTimeStamp}</span> }
                            </div>
                            }
                        secondChild = { 
                            <div className="w-100">
                                <Form formRows={ userType === UserType.External ? notationFormRowExternal : notationFormRowsInternal } 
                                      formData={notation} 
                                      editMode={viewMode === SiteDetailsMode.EditMode}  
                                      srMode= { viewMode === SiteDetailsMode.SRMode } 
                                      handleInputChange={(graphQLPropertyName, value) => handleInputChange(notation.notationId, graphQLPropertyName, value)}
                                      aria-label="Sort Notation Form"/>
                                <Widget changeHandler={(event) => handleTableChange(notation.notationId, event)}
                                        handleCheckBoxChange={(event)=> handleWidgetCheckBox(event)}
                                        title={'Notation Participants'} 
                                        tableColumns={ userType === UserType.Internal ? notationColumnInternal : notationColumnExternal} 
                                        tableData={ notation.eventPartics.map((x:any)=>{ return {...x, ...x.psnorg} }) } 
                                        tableIsLoading={loading} 
                                        allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
                                        aria-label="Notation Widget" 
                                        hideTable = { false } 
                                        hideTitle = { false } 
                                        editMode={ (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal}
                                        srMode={ (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal}
                                        primaryKeycolumnName="id"
                                        sortHandler={(row,ascDir)=>{

                                          console.log("table sort handler", row, ascDir)

                                          let property = row["graphQLPropertyName"];
                                          let notationId =notation.notationId;
                                          setFormData(prevData => {
                                            return prevData.map(tempNotation => {
                                                if (( notationId === tempNotation.notationId)) {
                                                    // Filter out selected rows from notationParticipant array
                                                    const updatedNotationParticipant = tempNotation.notationParticipant.sort(function(a:any, b:any) {
                                                      if (ascDir) return (a[property] > b[property]) ? 1 : ((a[property] < b[property]) ? -1 : 0);
                                                      else return (b[property] > a[property]) ? 1 : ((b[property] < a[property]) ? -1 : 0);
                                                  });
                                                    console.log("updatedNotationParticipant",updatedNotationParticipant);
                                                    return { ...tempNotation, notationParticipant: updatedNotationParticipant };
                                                }
                                                return notation;
                                            });
                                        });
                                          
                                        }}
                                        >
                                { viewMode === SiteDetailsMode.EditMode && userType === UserType.Internal &&
                                    <div className="d-flex gap-2" key={notation.notationId}>
                                      <button id="add-participant-btn" className=" d-flex align-items-center notation-btn" type="button" onClick={() => handleAddParticipant(notation.notationId)} aria-label={'Add Participant'} >
                                          <UserPlus className="btn-user-icon"/>
                                          <span className="notation-btn-lbl">{'Add Participant'}</span>
                                      </button>
                                      
                                      <button id="delete-participant-btn" className={`d-flex align-items-center ${isAnyParticipantSelected(notation.notationId) ? `notation-btn` : `notation-btn-disable`}`} disabled={!isAnyParticipantSelected(notation.notationId)} type="button" onClick={() => handleRemoveParticipant(notation.notationId)} aria-label={'Remove Participant'} >
                                          <UserMinus className={`${isAnyParticipantSelected(notation.notationId) ?`btn-user-icon`: `btn-user-icon-disabled`}`}/>
                                          <span className={`${isAnyParticipantSelected(notation.notationId) ? `notation-btn-lbl` : `notation-btn-lbl-disabled`}`}>{'Remove Participant'}</span>
                                      </button>
                                    </div>
                                  }
                                  { viewMode === SiteDetailsMode.SRMode && userType === UserType.Internal &&
                                    <button className={`d-flex align-items-center ${(selectedRows.length > 0) ? `notation-btn` : `notation-btn-disable`}`} disabled={viewMode === SiteDetailsMode.SRMode} type="button" onClick={()=>{}} aria-label={'Set SR Visibility'} >
                                      <span className={`${(selectedRows.length > 0) ? `notation-btn-lbl` : `notation-btn-lbl-disabled`}`}>{'Set SR Visibility'}</span>
                                    </button>
                                  }
                                </Widget>
                              { userType === UserType.Internal && <p className="sr-time-stamp">{notation.srTimeStamp}</p>}
                            </div>
                          }
                    />
                </div>)
              )
            }
          </div>
      </>
    );
}


export default Notations;