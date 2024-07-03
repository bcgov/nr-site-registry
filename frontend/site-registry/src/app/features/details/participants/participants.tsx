import { useEffect, useState } from "react";
import { UserType } from "../../../helpers/requests/userType";
import { SiteDetailsMode } from "../dto/SiteDetailsMode";
import { RequestStatus } from "../../../helpers/requests/status";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../Store";
import { resetSiteDetails, siteDetailsMode, trackChanges } from "../../site/dto/SiteSlice";
import { ChangeTracker, IChangeType } from "../../../components/common/IChangeType";
import { SRVisibility } from "../../../helpers/requests/srVisibility";
import Widget from "../../../components/widget/Widget";
import { UserMinus, UserPlus } from "../../../components/common/icon";
import Actions from "../../../components/action/Actions";
import './Participants.css';
import SearchInput from "../../../components/search/SearchInput";
import Sort from "../../../components/sort/Sort";
import { fetchSiteParticipants, siteParticipants } from "./ParticipantSlice";
import { useParams } from "react-router-dom";
import GetConfig from "./ParticipantsConfig";
import { IParticipant } from "./IParticipantState";
import { v4 } from "uuid";
// const siteParticipantdd = [
//     {
//         psnorgId: 1,
//         prCode: "AL",
//         displayName: "SHELL CANADA PRODUCTS",
//         effectiveDate: new Date( '2013-05-30'),
//         endDate: new Date('2024-05-05'),
//         note: '',
//         sr: false,
//     },
//     {
//         psnorgId: 2,
//         prCode: "AL",
//         displayName: "SNC-LAVALIN ENVIRONMENT INC.",
//         effectiveDate: new Date('2024-05-05'),
//         endDate: new Date('2024-05-05'),
//         note: 'Testing....',
//         sr: false,
//     },
//     {
//         psnorgId: 3,
//         prCode: "EC",
//         displayName: "Lorene Rutherford",
//         effectiveDate: new Date('2024-05-05'),
//         endDate: new Date('2024-05-05'),
//         note: '',
//         sr: false,
//     },
//     {
//         psnorgId: 4,
//         prCode: "MBCEC",
//         displayName: "Roland Hintz",
//         effectiveDate: new Date('2024-05-05'),
//         endDate: new Date('2024-05-05'),
//         note: '',
//         sr: false,
//     },
// ]

const Participants = () => {
    const { participantColumnInternal, participantColumnExternal, srVisibilityParcticConfig } = GetConfig();
    const [userType, setUserType] = useState<UserType>(UserType.Internal);
    const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
    const [formData, setFormData] =  useState<{ [key: string]: any | [Date, Date] }[]>([]);
    const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
    const [sortByValue, setSortByValue] = useState<{ [key: string]: any }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRows, setSelectedRows] = useState<{participantId: any, psnorgId: any, prCode: string, guid: string}[]>([]);
    const dispatch = useDispatch<AppDispatch>();
    const resetDetails = useSelector(resetSiteDetails);  
    const mode = useSelector(siteDetailsMode);
    const siteParticipant: IParticipant[] = useSelector(siteParticipants)
    const { id } = useParams();

    useEffect(()=> {
        setViewMode(mode);
    }, [mode]);

    useEffect(()=>{
      if(resetDetails)
      {
        setFormData(siteParticipant.map(participant => ({
          ...participant,
          effectiveDate: new Date(participant.effectiveDate),
          endDate: participant.endDate ? new Date(participant.endDate) : null
      })));
      }
    },[resetDetails]);

    useEffect(() => {
     
      setFormData(siteParticipant.map(participant => ({
        ...participant,
        effectiveDate: new Date(participant.effectiveDate),
        endDate: participant.endDate ? new Date(participant.endDate) : null
    })));
    }, [id]);
    
    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const searchTerm = event.target.value;
        setSearchTerm(searchTerm);
        const searchData = siteParticipant.map(participant => ({
                              ...participant,
                              effectiveDate: new Date(participant.effectiveDate),
                              endDate: participant.endDate ? new Date(participant.endDate) : null
                          }));
        const filteredData = searchData.filter((paticipant: any) => {
            return deepSearch(paticipant, searchTerm.toLowerCase().trim());
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
          
          if (key === 'effectiveDate' || key === 'endDate') {
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
      setFormData(siteParticipant.map(participant => ({
        ...participant,
        effectiveDate: new Date(participant.effectiveDate),
        endDate: participant.endDate ? new Date(participant.endDate) : null
      })));
    };

   
 
    const handleWidgetCheckBox = (event: any) => {
        alert(event)
    }


    const handleRemoveParticipant = () => {
      // Remove selected rows from formData state
      setFormData(prevData => {
         return prevData.filter(
          participant => !selectedRows.some(row => row.participantId === participant.id 
                                                  && row.psnorgId === participant.psnorgId 
                                                  && row.prCode === participant.prCode
                                                  && row.guid === participant.guid));
      });
   
      const tracker = new ChangeTracker(
         IChangeType.Deleted,
         'Site Participant'
       );
       dispatch(trackChanges(tracker.toPlainObject()));

      // Clear selectedRows state
      setSelectedRows([]);
       
    };
    
    const handleTableChange = (event: any) => {
      
        const isExist = formData.some((participant: any) => participant.id === event.row.id);
        if (isExist && event.property.includes('select_row')) {
          // Update selectedRows state based on checkbox selection
          if (event.value) {
              setSelectedRows(prevSelectedRows => [...prevSelectedRows, {participantId: event.row.id, psnorgId:event.row.psnorgId, prCode:event.row.prCode, guid:event.row.guid  }]);
          } else {
              setSelectedRows(prevSelectedRows => prevSelectedRows.filter(row => !(row.participantId === event.row.id && row.psnorgId === event.row.psnorgId && row.prCode === event.row.prCode && row.guid === event.row.guid )));
          }
        }
        else
        {
          setFormData((prevData) => {
           const updatedParticipant = prevData.map(participant => {
              if(participant.guid === event.row.guid)
                {
                  return { ...participant, [event.property]: event.value };
                }
                return participant;
            })
            return updatedParticipant;
          });

          const IsExist = selectedRows.some(row => row.guid === event.row.guid);
          if(IsExist)
          {
            setSelectedRows((prev: any) => {
              return prev.map((row: any) => {
                if(row.guid === event.row.guid)
                {
                  return { ...row, [event.property]: event.value };
                }
                return row;
              });
            });
          }
        }
        const currLabel = participantColumnInternal && participantColumnInternal.find(row => row.graphQLPropertyName === event.property);
        const tracker = new ChangeTracker(
                IChangeType.Modified,
                "Site Participant: " + currLabel?.displayName ?? ''
              );
        dispatch(trackChanges(tracker.toPlainObject()));
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
            sorted.sort((a, b) => b.effectiveDate - a.effectiveDate); // Sorting by date from new to old
            break;
          case 'oldTonew':
            sorted.sort((a, b) => a.effectiveDate - b.effectiveDate); // Sorting by date from new to old
            break;
          // Add more cases for additional sorting options
          default:
            break;
        }
        setFormData(sorted)
    };

    const handleAddParticipant = () => {
        const newParticipant = {
          guid: v4(),
          id: '',
          psnorgId: '',
          prCode: "",
          displayName: "",
          effectiveDate: new Date('2024-05-05'),
          endDate: new Date('2024-05-05'),
          note: '',
          sr: true,
      };
      setFormData(prevData => [newParticipant, ...prevData])
      const tracker = new ChangeTracker(
        IChangeType.Added,
        'New Site Participant'
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    };
  
    // need to do this tomorrow??
    const handleTableSort = (row:any, ascDir:any) => {
      let property = row["graphQLPropertyName"];
      setFormData(prevData =>{
        const updatedNotationParticipant = prevData.sort(
            function(a:any, b:any) {
              if (ascDir) 
                return (a[property] > b[property]) ? 1 : ((a[property] < b[property]) ? -1 : 0);
              else 
                return (b[property] > a[property]) ? 1 : ((b[property] < a[property]) ? -1 : 0);
            }
          );
        return [...updatedNotationParticipant];
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
  
     return(
        
        <div className="row" id="participant-component" data-testid="participant-component">
            <div className="row">
                  <div className={`mb-3 col-lg-8`}>
                    <SearchInput label={'Search'} searchTerm={searchTerm} clearSearch={clearSearch} handleSearchChange={handleSearchChange}/>
                  </div>            
                  <div className={`col-lg-4`}>
                    <Sort formData={sortByValue} editMode={true} handleSortChange={handleSortChange} /> 
                  </div>
            </div>
            <div >
              <Widget changeHandler={handleTableChange}
                  handleCheckBoxChange={(event)=> handleWidgetCheckBox(event)}
                  title={'Site Participants'} 
                  tableColumns={ userType === UserType.Internal ? participantColumnInternal : participantColumnExternal} 
                  tableData={formData} 
                  tableIsLoading={formData.length > 0 ? loading : RequestStatus.idle} 
                  allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
                  aria-label="Site Participant Widget" 
                  customLabelCss='custom-participant-widget-lbl'
                  hideTable = { false } 
                  hideTitle = { false } 
                  editMode={ (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal}
                  srMode={ (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal}
                  primaryKeycolumnName="guid"
                  sortHandler={(row,ascDir)=>{ handleTableSort(row, ascDir)}}
                  >
                  { viewMode === SiteDetailsMode.EditMode && userType === UserType.Internal &&
                      <div className="d-flex gap-2 flex-wrap ">
                          <button id="add-participant-btn" className=" d-flex align-items-center notation-btn" type="button" onClick={handleAddParticipant} aria-label={'Add Participant'} >
                            <UserPlus className="btn-user-icon"/>
                            <span className="notation-btn-lbl">{'Add Participant'}</span>
                          </button>
                        
                          <button id="delete-participant-btn" className={`d-flex align-items-center ${selectedRows.length > 0 ? `notation-btn` : `notation-btn-disable`}`} disabled={selectedRows.length <= 0} type="button" onClick={handleRemoveParticipant} aria-label={'Remove Participant'} >
                            <UserMinus className={`${selectedRows.length > 0 ?`btn-user-icon`: `btn-user-icon-disabled`}`}/>
                            <span className={`${selectedRows.length > 0 ? `notation-btn-lbl` : `notation-btn-lbl-disabled`}`}>{'Remove Participant'}</span>
                          </button>
                      </div>
                  }
                  { viewMode === SiteDetailsMode.SRMode && userType === UserType.Internal &&
                      <Actions label="Set SR Visibility" items={srVisibilityParcticConfig} onItemClick={handleItemClick} 
                          customCssToggleBtn={ false ? `notation-sr-btn` : `notation-sr-btn-disable`}
                          disable={viewMode === SiteDetailsMode.SRMode}/>
                  }
              </Widget>
            </div>
        </div>
     )
}

export default Participants;