import React, { useEffect, useState } from 'react'
import CustomLabel from '../../components/simple/CustomLabel'
import PageContainer from '../../components/simple/PageContainer'
import Table from '../../components/table/Table'
import { RequestStatus } from '../../helpers/requests/status'
import { FolioTableColumns } from './FolioTableConfig'
import { useDispatch, useSelector } from 'react-redux'
import { addFolioItem, addFolioItemRequestStatus, fetchFolioItems, folioItems, resetFolioItemAddedStatus, updateFolioItem } from './FolioSlice'
import { Folio } from './dto/Folio'
import { v4 } from 'uuid'
import { deepSearch, getUser } from '../../helpers/utility'
import { AppDispatch } from '../../Store';
import './Folios.css'
import { CircleXMarkIcon, FolderPlusIcon, PencilIcon, RegFloppyDisk } from '../../components/common/icon'
import SearchInput from '../../components/search/SearchInput'
import ModalDialog from '../../components/modaldialog/ModalDialog'
import { useBlocker } from 'react-router-dom'

const Folios = () => {

  // let blocker = useBlocker(
  //   ({ currentLocation, nextLocation }) =>
  //     editMode &&
  //     currentLocation.pathname !== nextLocation.pathname
  // );

   const folioItemsArr:Folio[] =  useSelector(folioItems);
   const [tempArr,setTempArr] = useState(folioItemsArr);

   const dispatch = useDispatch<AppDispatch>();

   const [editMode, SetEditMode] = useState(false);

   const [searchText,SetSearchText] = useState("");

   const [addFolioConfirm,SetAddFolioConfirm] = useState(false);

   const [showUpdatesConfirmModal, SetShowUpdatesConfirmModal] = useState(false);

   const addStatus = useSelector(addFolioItemRequestStatus);



   const user = getUser();

   useEffect(()=>{
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub :""))

   },[])


   useEffect(()=>{
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub :""))

   },[addStatus])


   const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    SetSearchText(searchTerm); 
    const filteredData = tempArr.filter((folio: any) => {
        return deepSearch(folio, searchTerm.toLowerCase().trim());
    });
    setTempArr(filteredData);
};




   useEffect(()=>{
    setTempArr(folioItemsArr)
    console.log("folioItemsArr",folioItemsArr)
   },[folioItemsArr])

   const handleAddNewFolio = () => {
    //setTempArr([...tempArr, { userId: "", description: "", folioId : "new" , id: v4(), whoCreated: "" } ])
    SetAddFolioConfirm(true);
    
   }

   const handleChange = (event:any) => {

    console.log("fc");

    if(event.property === 'save')
    {
        dispatch(updateFolioItem(event.row));
    }
    else
    {
      setTempArr((prevData) => {
        const folioToUpdate = prevData.map(folio => {
           if(folio.id === event.row.id)
             {
               return { ...folio, [event.property]: event.value , ...{dirty: true} };
             }
             return folio;
         })
         return folioToUpdate;
       });
    }
 
  
  
      };

      const clearSearch = () => {
        SetSearchText('');     
        setTempArr(folioItemsArr);
      };


      const handleSaveChanges = () => {
        SetShowUpdatesConfirmModal(true);
      }
   

  return (
    
    <PageContainer role='Folios'>
    <div>
        <CustomLabel label="Folios" labelType="b-h1" />
    </div>
    <div className='folio-actions'>
      <div className='folio-add-new'>
      {!editMode && <div className='folio-add-new-btn' onClick={()=>handleAddNewFolio()}>
         <FolderPlusIcon/>
         <span>Create New Folio</span>
      </div> }

      {!editMode && <div className='folio-edit-btn' onClick={()=>SetEditMode(true)}>
         <PencilIcon/>
         <span>Edit Folios</span>
      </div> }
      { editMode && <><div className='folio-edit-btn' onClick={()=>SetEditMode(false)}>
         <CircleXMarkIcon/>
         <span>Cancel</span>
        
      </div> <div className='folio-add-new-btn' onClick={()=>handleSaveChanges()}>
         <RegFloppyDisk/>
         <span>Save Changes</span>
      </div> </>}
      </div>
      <div>
      <SearchInput placeHolderText={'Search Folios'} searchTerm={searchText} clearSearch={clearSearch} handleSearchChange={handleSearchChange}/>
      </div>
      

      
    </div>
    <div className="col-12">
    <Table
          label="Folios"
          isLoading={RequestStatus.success}
          columns={FolioTableColumns}
          data={tempArr}
          totalResults={tempArr.length}
          allowRowsSelect={false}
          showPageOptions={false}
          changeHandler={(event) => {
            handleChange(event);
          }}
          editMode={editMode}
          idColumnName="id"
          delteHandler={()=>{}}
          
        />
      </div>  

      {addFolioConfirm && (
        <ModalDialog
          label="Are you sure to create a new folio ?"
          closeHandler={(response) => {
            if (response) {            
              const folio:Folio = {
                folioId:'New',
                description: 'Please update description',
                userId : user?.profile.sub ?  user.profile.sub: "",
                whoCreated : user?.profile.given_name ?  user.profile.given_name : "",
                id:0,
                whenUpdated :''
              };
              dispatch(resetFolioItemAddedStatus(null));
              dispatch(addFolioItem(folio) );    
            }
            SetAddFolioConfirm(false);
          }}
        >

        <span> Please confirm before proceeding.</span>

        </ModalDialog>
      )}

      {showUpdatesConfirmModal && (
              <ModalDialog
                label="Are you sure you want to save these changes?"
                closeHandler={(response) => {
                  console.log("response",response)
                  if (response) {      
                    let rowsToBeUpdated = (tempArr.filter(x=>x.dirty === true));

                    rowsToBeUpdated.map(row=>{
                      delete row.dirty;
                      return row;
                    })

                    console.log("rowsToBeUpdated",rowsToBeUpdated)

                    dispatch(updateFolioItem(rowsToBeUpdated));
                    //dispatch(resetFolioItemAddedStatus(null));                 
                  }
                  SetShowUpdatesConfirmModal(false);
                }}
              >

            <span> Please confirm changes before proceeding.</span>
              </ModalDialog>
            )}

{/* {blocker.state === "blocked" ? (
        <div>
          <p>Are you sure you want to leave?</p>
          <button onClick={() => (blocker !== undefined && blocker?.proceed?.())}>
            Proceed
          </button>
          <button onClick={() => blocker !== undefined  && blocker?.reset?.()}>
            Cancel
          </button>
        </div>
      ) : null} */}

    </PageContainer>
  )

}

export default Folios