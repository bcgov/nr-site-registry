import { useEffect, useState } from "react";
import Form from "../../../components/form/Form";
import Widget from "../../../components/widget/Widget";
import { UserType } from "../../../helpers/requests/userType";
import { SiteDetailsMode } from "../dto/SiteDetailsMode";
import { disclosureCommentsConfig, disclosureScheduleExternalConfig, disclosureScheduleInternalConfig, disclosureStatementConfig, srVisibilityConfig } from "./DisclosureConfig";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "../../../Store";
import { siteDetailsMode, trackChanges } from "../../site/dto/SiteSlice";
import './Disclosure.css';
import { RequestStatus } from "../../../helpers/requests/status";
import { Minus, Plus, UserMinus, UserPlus } from "../../../components/common/icon";
import { ChangeTracker, IChangeType } from "../../../components/common/IChangeType";
import { flattenFormRows, formatDate, serializeDate } from "../../../helpers/utility";
import Actions from "../../../components/action/Actions";
import { SRVisibility } from "../../../helpers/requests/srVisibility";
import { siteDisclosure, updateSiteDisclosure } from "./DisclosureSlice";


// const disclosureData = {
//         disclosureId:1,
//         siteId:1,
//         dateReceived:new Date('2013-05-31'),
//         dateComplete:new Date('2013-05-31'),
//         localAuthorityReceived:new Date('2013-05-31'),
//         dateRegistrar:new Date('2013-05-31'),
//         dateEntered:new Date('2013-05-31'),
//         disclosureSchedule:[
//             {
//                 scheduleId:1,
//                 reference:'F1',
//                 discription:'PETROLEUM OR NATURAL GAS DRILLING',
//                 sr:true
//             },
//             {
//                 scheduleId:2,
//                 reference:'F2',
//                 discription:'PETROLEUM OR NATURAL GAS PRODUCTION FACILITIES',
//                 sr:false,
//             },
//         ],
//         summary: 'PLANNED ACTIVITIES INCLUDE MEETING THE OBLIGATIONS OF THE ENVIRONMENTAL MANAGEMENT ACT AND CONTAMINATED SITES REGULATION TO OBTAIN A CERTIFICATE OF RESTORATION FOR THE PROPERTY. THE END LAND USE OF THE PROPERTY IS WILDLANDS - REVERTED.',
//         statement:`SITE DISCLOSURE WAS COMPLETED AND SUMMARIZED USING AVAILABLE SITE INFORMATION OBTAINED VIA A FILE REVIEW OF WELLSITE DOCUMENTS OBTAINED FROM ENERPLUS CORPORATION'S CALGARY OFFICE. ADDITIONAL SITE BACKGROUND INFORMATION OBTAINED FROM USING A REVIEW OF AVAILABLE HISTORICAL AERIAL PHOTOGRAPHS AND A SEARCH OF ON-LINE DATABASES MAINTAINED AND/OR DEVELOPED BY REGULATORY AGENCIES (OIL AND GAS COMMISSION AND MINISTRY OF THE ENVIRONMENT).`,
//         governmentOrder:'NONE.',
//         srTimeStamp: `Sent to SR on ${formatDate(new Date())}`,
// };

const Disclosure = () => {
    const [formData, setFormData] =  useState<{ [key: string]: any | [Date, Date] }>({});
    const [selectedRows, setSelectedRows] = useState<{disclosureId: any, scheduleId: any}[]>([]);
    const [userType, setUserType] = useState<UserType>(UserType.Internal);
    const [viewMode, setViewMode] = useState(SiteDetailsMode.ViewOnlyMode);
    const [loading, setLoading] = useState<RequestStatus>(RequestStatus.loading);
    const [srTimeStamp, setSRTimeStamp] = useState('Sent to SR on June 2nd, 2013');
    const dispatch = useDispatch<AppDispatch>();
    const mode = useSelector(siteDetailsMode);
    const disclosureData = useSelector(siteDisclosure)
    useEffect(() => {
        setFormData(disclosureData ?? {})  
    }, []);

    useEffect(()=> {
        setViewMode(mode);
    }, [mode]);

    const handleInputChange = (id: number, graphQLPropertyName: any, value: String | [Date, Date]) => {
        if(viewMode === SiteDetailsMode.SRMode)
        {
          console.log({[graphQLPropertyName]:value, id})
        }
        else 
        {
            setFormData((preData) => {return { ...preData, [graphQLPropertyName]: value };});
            //dispatch the updated site disclosure
            dispatch(updateSiteDisclosure(serializeDate({
                ...formData,
                [graphQLPropertyName]: value
              })))
        }
        const flattedArr = flattenFormRows(disclosureStatementConfig)
        const currLabel = flattedArr && flattedArr.find(row => row.graphQLPropertyName === graphQLPropertyName);
        const tracker = new ChangeTracker(
            IChangeType.Modified,
            "Site Disclosure: " + currLabel?.label ?? ''
        );
        dispatch(trackChanges(tracker.toPlainObject()));
    };

    /// not working yet as the actual source of table data is unknown.
    const handleTableChange = (disclosureId: any, event: any) => {
        const isExist = formData.disclosureSchedule.some((item: any) => item.scheduleId === event.row.scheduleId);
        if (isExist && event.property.includes('select_row')) {
          // Update selectedRows state based on checkbox selection
          if (event.value) {
              setSelectedRows(prevSelectedRows => [...prevSelectedRows, { disclosureId, scheduleId: event.row.scheduleId }]);
          } else {
              setSelectedRows(prevSelectedRows => prevSelectedRows.filter(row => !(row.disclosureId === disclosureId && row.scheduleId === event.row.scheduleId)));
          }
        }
        else
        {
            setFormData((prevData) => {
                    if (prevData.disclosureId === disclosureId) {
                        const updatedDisclosureSchedule = prevData.disclosureSchedule.map((schedule:any) => {
                          if (schedule.scheduleId === event.row.scheduleId) {
                              return { ...schedule, [event.property]: event.value };
                          }
                          return schedule;
                      });
                      return { ...prevData, disclosureSchedule: updatedDisclosureSchedule };
                  }
          });
        }
    };

    const handleTableSort = (row:any, ascDir:any, disclosureId:any) => {
        let property = row["graphQLPropertyName"];
        setFormData(prevData => {
            if (prevData.disclosureId === disclosureId) {
                  // Filter out selected rows from notationParticipant array
                  const updatedDisclosureSchedule = prevData.disclosureSchedule.sort(function(a:any, b:any) {
                    if (ascDir) return (a[property] > b[property]) ? 1 : ((a[property] < b[property]) ? -1 : 0);
                    else return (b[property] > a[property]) ? 1 : ((b[property] < a[property]) ? -1 : 0);
                });
                  return { ...prevData, notationParticipant: updatedDisclosureSchedule };
              }
      });
    }

    const handleAddDisclosureSchedule = (disclosureId: any) => {
        const newDisclosureSchedule = {
            scheduleId:Date.now(),
            reference:'',
            discription:'',
            sr:false
      };
  
      setFormData(prevFormData => {
              if (prevFormData.disclosureId === disclosureId) {
                  // Create a new array with the updated notation object
                  return {
                      ...prevFormData,
                      disclosureSchedule: [...prevFormData.disclosureSchedule, newDisclosureSchedule]
                  };
              }
      });
      const tracker = new ChangeTracker(
        IChangeType.Added,
        'Site Dosclosure Schedule'
      );
      dispatch(trackChanges(tracker.toPlainObject()));
    };

    const handleRemoveDisclosureSchedule = (disclosureId: any) => {
        // Remove selected rows from formData state
        setFormData(prevData => {
            if (prevData.disclosureId === disclosureId) {
                   // Filter out selected rows from notationParticipant array
                   const updatedDisclosureSchedule = prevData.disclosureSchedule.filter((schedule:any) =>
                       !selectedRows.some(row => row.disclosureId === disclosureId && row.scheduleId === schedule.scheduleId)
                   );
                   return { ...prevData, disclosureSchedule: updatedDisclosureSchedule };
               }
       });
       const tracker = new ChangeTracker(
         IChangeType.Deleted,
         'Site Disclosure Schedule'
       );
       dispatch(trackChanges(tracker.toPlainObject()));
       // Clear selectedRows state
   
       const updateSelectedRows =  selectedRows.filter(row => row.disclosureId !== disclosureId);
       setSelectedRows(updateSelectedRows);
       
       };
    
    const isAnyDisclosureScheduleSelected = (disclosureId: any) => {
        return selectedRows.some((row) => row.disclosureId === disclosureId)
    };

    const handleWidgetCheckBox = (event: any) => {
        alert(event)
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
        <div className="row" id="disclosure-component" data-testid="disclosure-component">
            <div className={`mb-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-5' : 'px-3'}`}>
                <Widget title={'Site Disclosure Statement (Sec. III and IV)'}
                        hideTable={true}
                        hideTitle = {false}
                        editMode={ (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal}
                        srMode={ (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal}
                        handleCheckBoxChange={(event)=> handleWidgetCheckBox(event)}
                        customLabelCss='custom-disclosure-widget-lbl'
                        aria-label="Disclosure Widget" >
                    <div className={`mt-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-4' : ''}`}>
                    { 
                        formData &&
                        <Form formRows={disclosureStatementConfig} 
                            formData={formData}
                            editMode={viewMode === SiteDetailsMode.EditMode}  
                            srMode= { viewMode === SiteDetailsMode.SRMode }
                            handleInputChange={(graphQLPropertyName, value) => handleInputChange(formData.disclosureId, graphQLPropertyName, value)}
                            aria-label="Site Disclosure Statement"/>
                    }
                    </div>
                </Widget>
            </div>
            {/*  Not working yet as the actual source of table data is unknown.*/}
            <div className={`mb-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-5' : 'px-3'}`}>
                <div className={`mt-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-4' : 'p-0'}`}>
                   {formData && 
                    <Widget changeHandler={(event) => handleTableChange(formData.disclosureId, event)}
                            handleCheckBoxChange={(event)=> handleWidgetCheckBox(event)}
                            title={'III Commercial and Industrial Purposes or Activities on Site'} 
                            tableColumns={ userType === UserType.Internal ? disclosureScheduleInternalConfig : disclosureScheduleExternalConfig} 
                            tableData={formData.disclosureSchedule ?? []} 
                            tableIsLoading={formData.disclosureSchedule && formData.disclosureSchedule.length > 0 ? loading : RequestStatus.idle} 
                            allowRowsSelect={viewMode === SiteDetailsMode.EditMode}
                            aria-label="Site Disclosure Schedule" 
                            hideTable = { false } 
                            hideTitle = { false } 
                            editMode={ (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal}
                            srMode={ (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal}
                            primaryKeycolumnName="scheduleId"
                            sortHandler={(row,ascDir)=>{ handleTableSort(row, ascDir, formData.disclosureId)}}>

                        { viewMode === SiteDetailsMode.EditMode && userType === UserType.Internal &&
                            <div className="d-flex gap-2" key={formData.disclosureId}>
                            <button id="add-schedule-btn" className=" d-flex align-items-center disclosure-add-btn" type="button" onClick={() => handleAddDisclosureSchedule(formData.disclosureId)} aria-label={'Add'} >
                                <Plus className="btn-user-icon"/>
                                <span className="disclosure-btn-lbl">{'Add'}</span>
                            </button>
                            
                            <button id="delete-schedule-btn" className={`d-flex align-items-center ${isAnyDisclosureScheduleSelected(formData.disclosureId) ? `disclosure-add-btn` : `disclosure-btn-disable`}`} disabled={!isAnyDisclosureScheduleSelected(formData.disclosureId)} type="button" onClick={() => handleRemoveDisclosureSchedule(formData.disclosureId)} aria-label={'Remove Disclosure Schedule'} >
                                <Minus className={`${isAnyDisclosureScheduleSelected(formData.disclosureId) ?`btn-user-icon`: `btn-user-icon-disabled`}`}/>
                                <span className={`${isAnyDisclosureScheduleSelected(formData.disclosureId) ? `disclosure-btn-lbl` : `disclosure-btn-lbl-disabled`}`}>{'Remove'}</span>
                            </button>
                            </div>
                        }
                        { viewMode === SiteDetailsMode.SRMode && userType === UserType.Internal &&
                            <Actions label="Set SR Visibility" items={srVisibilityConfig} onItemClick={handleItemClick} 
                                     customCssToggleBtn={ true ? `disclosure-sr-btn` : `disclosure-sr-btn-disable`}
                                     disable={viewMode !== SiteDetailsMode.SRMode}/>
                        }
                    </Widget>
                    }
                </div>
            </div>
            <div className={`mb-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-5' : 'px-3'}`}>
                <div className={`mt-3 ${viewMode === SiteDetailsMode.SRMode ? 'px-4' : 'p-0'}`}>
                   { formData &&
                    <Widget title={'IV Additional Comments and Explanations'}
                                hideTable={true}
                                hideTitle = {false}
                                editMode={ (viewMode === SiteDetailsMode.EditMode) && userType === UserType.Internal}
                                srMode={ (viewMode === SiteDetailsMode.SRMode) && userType === UserType.Internal}
                                handleCheckBoxChange={(event)=> handleWidgetCheckBox(event)}
                                aria-label="Disclosure Widget" >
                        <div className="mt-3">
                        { 
                            formData &&
                            <Form formRows={ disclosureCommentsConfig } 
                                formData={formData}
                                editMode={viewMode === SiteDetailsMode.EditMode}  
                                srMode= { viewMode === SiteDetailsMode.SRMode }
                                handleInputChange={(graphQLPropertyName, value) => handleInputChange(formData.disclosureId, graphQLPropertyName, value)}
                                aria-label="Site Disclosure Statement"/>
                        }
                        </div>
                    </Widget>
                    }
                </div>
            </div>
            { userType === UserType.Internal && <p className="sr-time-stamp">{formData.srTimeStamp ?? 'Hard Code Value'}</p>}
        </div>
    )
}

export default Disclosure;