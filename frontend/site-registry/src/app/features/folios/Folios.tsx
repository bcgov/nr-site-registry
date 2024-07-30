import React, { useEffect, useState } from 'react';
import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import Table from '../../components/table/Table';
import { RequestStatus } from '../../helpers/requests/status';
import { getFolioTableColumnsBasedOnMode } from './FolioTableConfig';
import { useDispatch, useSelector } from 'react-redux';
import {
  addFolioItem,
  addFolioItemRequestStatus,
  deleteFolioItem,
  deleteRequestStatus,
  fetchFolioItems,
  folioItems,
  resetFolioItemAddedStatus,
  resetFolioItemDeleteStatus,
  resetFolioSiteUpdateStatus,
  updateFolioItem,
  updateRequestStatus,
} from './FolioSlice';
import { Folio } from './dto/Folio';
import { deepSearch, getUser, showNotification } from '../../helpers/utility';
import { AppDispatch } from '../../Store';
import './Folios.css';
import {
  CircleXMarkIcon,
  FolderPlusIcon,
  PencilIcon,
  RegFloppyDisk,
} from '../../components/common/icon';
import SearchInput from '../../components/search/SearchInput';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import { useBlocker } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import { notifyError, notifySuccess } from '../../components/alert/Alert';

const Folios = () => {
  let blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      editMode && currentLocation.pathname !== nextLocation.pathname,
  );

  const folioItemsArr: Folio[] = useSelector(folioItems);
  const [tempArr, setTempArr] = useState(folioItemsArr);

  const dispatch = useDispatch<AppDispatch>();

  const [editMode, SetEditMode] = useState(false);

  const [searchText, SetSearchText] = useState('');

  const [addFolioConfirm, SetAddFolioConfirm] = useState(false);

  const [showUpdatesConfirmModal, SetShowUpdatesConfirmModal] = useState(false);

  const [showDeleteConfirmModal, SetShowDeleteConfirmModal] = useState(false);

  const addStatus = useSelector(addFolioItemRequestStatus);

  const folioDeleteStatus = useSelector(deleteRequestStatus);

  const updateStatus = useSelector(updateRequestStatus);

  const [deleteRow, SetDeleteRow] = useState<any>(null);

  const auth = useAuth();

  const user = getUser();


  useEffect(() => {
    if (user === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    }
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
  }, []);

  useEffect(() => {
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
    showNotification(
      addStatus,
      'Successfully added new folio.',
      'Unable to add new folio',
    );
  }, [addStatus]);

  useEffect(() => {
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
    showNotification(
      folioDeleteStatus,
      'Successfully deleted folio.',
      'Unable to delete folio',
    );

    if (folioDeleteStatus === RequestStatus.success) {
      notifySuccess();
    } else if (folioDeleteStatus === RequestStatus.failed) {
      notifyError();
    }
  }, [folioDeleteStatus]);

  useEffect(() => {
    console.log('updateStatus', updateStatus);
    SetEditMode(false);

    setTimeout(() => {
      dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
    }, 1000);

    showNotification(updateStatus);



  }, [updateStatus]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    SetSearchText(searchTerm);
    const filteredData = tempArr.filter((folio: any) => {
      return deepSearch(folio, searchTerm.toLowerCase().trim());
    });
    setTempArr(filteredData);
  };

  useEffect(() => {
    setTempArr(folioItemsArr);   
  }, [folioItemsArr]);

  const handleAddNewFolio = () => {
    SetAddFolioConfirm(true);
  };

  const handleChange = (event: any) => {
    setTempArr((prevData) => {
      const folioToUpdate = prevData.map((folio) => {
        if (folio.id === event.row.id) {
          return { ...folio, [event.property]: event.value, dirty: true };
        }
        return folio;
      });
      return folioToUpdate;
    });
  };

  const clearSearch = () => {
    SetSearchText('');
    setTempArr(folioItemsArr);
  };

  const handleSaveChanges = () => {
    SetShowUpdatesConfirmModal(true);
  };

  return (
    <PageContainer role="Folios">
      <div>
        <CustomLabel label="Folios" labelType="b-h1" />
      </div>
      <div className="folio-actions">
        <div className="folio-add-new">
          {!editMode && (
            <div
              className="folio-add-new-btn"
              onClick={() => handleAddNewFolio()}
            >
              <FolderPlusIcon />
              <span>Create New Folio</span>
            </div>
          )}

          {!editMode && (
            <div className="folio-edit-btn" onClick={() => SetEditMode(true)}>
              <PencilIcon />
              <span>Edit Folios</span>
            </div>
          )}
          {editMode && (
            <>
              <div
                className="folio-edit-btn"
                onClick={() => SetEditMode(false)}
              >
                <CircleXMarkIcon />
                <span>Cancel</span>
              </div>{' '}
              <div
                className="folio-add-new-btn"
                onClick={() => handleSaveChanges()}
              >
                <RegFloppyDisk />
                <span>Save Changes</span>
              </div>{' '}
            </>
          )}
        </div>

        <SearchInput
          placeHolderText={'Search Folios'}
          searchTerm={searchText}
          clearSearch={clearSearch}
          handleSearchChange={handleSearchChange}
        />
      </div>
      <div className="col-12">
        <Table
          label="Folios"
          isLoading={RequestStatus.success}
          columns={getFolioTableColumnsBasedOnMode(editMode)}
          data={tempArr}
          totalResults={tempArr.length}
          allowRowsSelect={false}
          showPageOptions={false}
          changeHandler={(event) => {
            handleChange(event);
          }}
          editMode={editMode}
          idColumnName="id"
          deleteHandler={(event) => {
            SetShowDeleteConfirmModal(true);
            SetDeleteRow(event.row);
          }}
        />
      </div>

      {addFolioConfirm && (
        <ModalDialog
          label="Are you sure to create a new folio ?"
          closeHandler={(response) => {
            if (response) {
              const folio: Folio = {
                folioId: 'New',
                description: 'Please update description',
                userId: user?.profile.sub ? user.profile.sub : '',
                whoCreated: user?.profile.given_name
                  ? user.profile.given_name
                  : '',
                id: 0,
                whenUpdated: '',
              };
              dispatch(resetFolioItemAddedStatus(null));
              dispatch(addFolioItem(folio));
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
            console.log('response', response);
            if (response) {
              let rowsToBeUpdated = tempArr.filter((x) => x.dirty === true);

              rowsToBeUpdated.map((row) => {
                delete row.dirty;
                return row;
              });

              console.log('rowsToBeUpdated', rowsToBeUpdated);
              dispatch(resetFolioSiteUpdateStatus(null));
              dispatch(updateFolioItem(rowsToBeUpdated));
            }
            SetShowUpdatesConfirmModal(false);
          }}
        >
          <span> Please confirm changes before proceeding.</span>
        </ModalDialog>
      )}

      {showDeleteConfirmModal && (
        <ModalDialog
          label="Are you sure you to delete the folio?"
          closeHandler={(response) => {
            console.log('response', response);
            if (response) {
              console.log('response', deleteRow?.id);
              dispatch(resetFolioItemDeleteStatus(null));
              dispatch(deleteFolioItem(deleteRow?.id));
            } else {
              SetDeleteRow(null);
            }
            SetShowDeleteConfirmModal(false);
          }}
        >
          <span> Please confirm before proceeding.</span>
        </ModalDialog>
      )}

      {blocker.state === 'blocked' ? (
        <ModalDialog
          label="Are you sure you proceed?"
          closeHandler={(response) => {
            console.log('response', response);
            if (response) {
              if (blocker) {
                blocker?.proceed?.();
              }
            } else {
              if (blocker) {
                blocker?.reset?.();
              }
            }
            SetShowDeleteConfirmModal(false);
          }}
        >
          <span> Please confirm before proceeding.</span>
        </ModalDialog>
      ) : null}
    </PageContainer>
  );
};

export default Folios;
