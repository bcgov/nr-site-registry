import React, { useEffect, useState } from "react";
import PanelWithUpDown from "../../../components/simple/PanelWithUpDown";
import Form from "../../../components/form/Form";
import { notationColumnInternal, notationFormRowsInternal, notationFormRowExternal, notationFormRowsFirstChild, notationColumnExternal, notationFormRowEditMode, srVisibilityConfig } from "./NotationsConfig";
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
import { resetSiteDetails, siteDetailsMode, trackChanges } from "../../site/dto/SiteSlice";
import { flattenFormRows, formatDate, formatDateRange } from "../../../helpers/utility";
import Search from "../../site/Search";
import SearchInput from "../../../components/search/SearchInput";
import Sort from "../../../components/sort/Sort"; 
import SiteDetails from "../SiteDetails";
import { SiteDetailsMode } from "../dto/SiteDetailsMode";
import { setDate } from "date-fns";
import { CheckBoxInput } from "../../../components/input-controls/InputControls";
import { FormFieldType } from "../../../components/input-controls/IFormField";
import Actions from "../../../components/action/Actions";
import { SRVisibility } from "../../../helpers/requests/srVisibility";




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

const initialNotationData = [
  {   
    notationId: 1,
    notationType:'CERTIFICATE OF COMPLIANCE ISSUED USING RISK BASED STANDARDS',
    initialDate: new Date( '2013-05-30'),
    completedDate:new Date('2013-06-15'),
    notationClass:'ENVIRONMENTAL MANAGEMENT ACT: GENERAL',
    requiredDate: new Date('2013-06-30'),
    ministryContact:'John',
    requiredActions: 'Pending',
    note: 'REF # 9999-99',
    srTimeStamp: `Sent to SR on ${formatDate(new Date())}`,
    notationParticipant : notationParticipantData1,
  },
  {
    notationId: 2,
    notationType:'WASTE MANAGEMENT APPROVAL ISSUED',
    initialDate:new Date('2013-05-31'),
    completedDate:new Date('2013-06-15'),
    notationClass:'ENVIRONMENTAL MANAGEMENT ACT: GENERAL',
    requiredDate:new Date('2013-06-29'),
    ministryContact:'Bradley Macejkovic',
    requiredActions: 'Pending',
    note: 'REF # 9999-99',
    srTimeStamp: `Sent to SR on ${formatDate(new Date('2013-06-30'))}`,
    notationParticipant : notationParticipantData2,
  },
  {
    notationId: 3,
    notationType:'RISK ASSESSMENT SUBMITTED',
    initialDate:new Date('2013-05-29'),
    completedDate:new Date('2013-06-15'),
    notationClass:'ENVIRONMENTAL MANAGEMENT ACT: GENERAL',
    requiredDate:new Date('2013-06-30'),
    ministryContact:'Bradley Macejkovic',
    requiredActions: 'Urgent',
    note: 'REF # 9999-99',
    srTimeStamp: `Sent to SR on ${formatDate(new Date('2013-06-31'))}`,
    notationParticipant : notationParticipantData3,
  },
];




const Notations: React.FC<INotations> = ({    
    user,
  }) => {

    const [userType, setUserType] = useState<UserType>(UserType.Internal);
    const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
    const [formData, setFormData] =  useState<{ [key: string]: any | [Date, Date] }[]>(initialNotationData);
    const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
    const [srTimeStamp, setSRTimeStamp] = useState('Sent to SR on June 2nd, 2013');
    const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
    const [searchTerm, setSearchTerm] = useState('');

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const searchTerm = event.target.value;
      setSearchTerm(searchTerm);
  
      const filteredData = initialNotationData.filter(notation => {
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
      setFormData(initialNotationData)
    };

    

    const resetDetails = useSelector(resetSiteDetails);  
    useEffect(()=>{
        if(resetDetails)
        {
          setFormData(initialNotationData)
          // setData(dummyData);
        }
    },[resetDetails]);

    useEffect(() => {
      setFormData(initialNotationData)
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
     debugger;
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
      IChangeType.Deleted,
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
        IChangeType.Added,
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
      IChangeType.Added,
      'Notation Participant Added'
    );
  };

  const isAnyParticipantSelected = (notationId: any) => {
   return selectedRows.some((row) => row.notationId === notationId)
  };

  const handleTableSort = (row:any, ascDir:any, notationId:any) => {
      console.log("table sort handler", row, ascDir)
      let property = row["graphQLPropertyName"];
      // let notationId =notation.notationId;
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
            return tempNotation;
        });
    });
  }

  const handleItemClick = (value: string) => {
    switch(value)
    {
      case SRVisibility.ShowSR:
        alert('show')
       break;
      case SRVisibility.HideSR:
        alert('hide')
       break;
      default:
       break;
    }
 };

    return (
      <div className="px-2">
          <div className="row pe-2" id="notations-component" data-testid="notations-component">
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
          <div data-testid="notation-rows" className={`col-lg-12 overflow-auto p-0 ${viewMode === SiteDetailsMode.SRMode ? ' ps-4' : ''}`} style={{ maxHeight: '1000px'}}>
            {
              formData && formData.map((notation, index) =>
              (<div key={index} >
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
                                <Form formRows={ userType === UserType.External ? notationFormRowExternal : viewMode === SiteDetailsMode.EditMode ? notationFormRowEditMode :  viewMode === SiteDetailsMode.SRMode ? notationFormRowExternal : notationFormRowsInternal } 
                                      formData={notation} 
                                      editMode={viewMode === SiteDetailsMode.EditMode}  
                                      srMode= { viewMode === SiteDetailsMode.SRMode } 
                                      handleInputChange={(graphQLPropertyName, value) => handleInputChange(notation.notationId, graphQLPropertyName, value)}
                                      aria-label="Sort Notation Form"/>
                                <Widget changeHandler={(event) => handleTableChange(notation.notationId, event)}
                                        handleCheckBoxChange={(event)=> handleWidgetCheckBox(event)}
                                        title={'Notation Participants'} 
                                        tableColumns={ userType === UserType.Internal ? notationColumnInternal : notationColumnExternal} 
                                        tableData={notation.notationParticipant} 
                                        tableIsLoading={notation.notationParticipant.Length > 0 ? loading : RequestStatus.idle} 
                                        allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
                                        aria-label="Notation Widget" 
                                        hideTable = { false } 
                                        hideTitle = { false } 
                                        editMode={ (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal}
                                        srMode={ (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal}
                                        primaryKeycolumnName="id"
                                        sortHandler={(row,ascDir)=>{ handleTableSort(row, ascDir, notation.notationId)}}
                                        >
                                { viewMode === SiteDetailsMode.EditMode && userType === UserType.Internal &&
                                    <div className="d-flex gap-2 flex-wrap " key={notation.notationId}>
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
                                      <Actions label="Set SR Visibility" items={srVisibilityConfig} onItemClick={handleItemClick} 
                                               customCssToggleBtn={ false ? `notation-sr-btn` : `notation-sr-btn-disable`}
                                               disable={viewMode === SiteDetailsMode.SRMode}/>
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
      </div>
    );
}


export default Notations;