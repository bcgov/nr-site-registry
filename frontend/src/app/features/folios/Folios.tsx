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
} from './redux/FolioSlice';
import { Folio } from './dto/Folio';
import { deepSearch, getUser, showNotification } from '../../helpers/utility';
import { AppDispatch } from '../../Store';
import './Folios.css';
import {
  CircleXMarkIcon,
  FolderPlusIcon,
  PencilIcon,
  RegFloppyDisk,
  XmarkIcon,
} from '../../components/common/icon';
import SearchInput from '../../components/search/SearchInput';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import { useBlocker } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import { notifyError, notifySuccess } from '../../components/alert/Alert';
import { Button } from '../../components/button/Button';
import { TableColumn } from '../../components/table/TableColumn';

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

  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

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
    dispatch(resetFolioItemAddedStatus(null));
  }, [addStatus]);

  useEffect(() => {
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
    showNotification(
      folioDeleteStatus,
      'Successfully deleted folio.',
      'Unable to delete folio',
    );

    dispatch(resetFolioItemDeleteStatus(null));
  }, [folioDeleteStatus]);

  useEffect(() => {
    SetEditMode(false);

    setTimeout(() => {
      dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
    }, 1000);

    showNotification(updateStatus);

    dispatch(resetFolioSiteUpdateStatus(null));
  }, [updateStatus]);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = event.target.value;
    SetSearchText(searchTerm);
    if (searchTerm.trim() === '') {
      setTempArr(folioItemsArr);
    } else {
      const filteredData = folioItemsArr.filter((folio: any) => {
        return deepSearch(folio, searchTerm.toLowerCase().trim());
      });
      setTempArr(filteredData);
    }
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

  const handleSortChange = (column: TableColumn, ascSort: boolean) => {
    setSortColumn(column.graphQLPropertyName);
    setSortAsc(ascSort);
  };

  const getSortedData = () => {
    const formatted = tempArr.map((item: any) => ({
      ...item,
      _rawWhenUpdated: item.whenUpdated,
      whenUpdated: item.whenUpdated
        ? new Date(item.whenUpdated).toLocaleString()
        : '',
    }));
    if (!sortColumn) return formatted;
    const field = sortColumn.split(',')[0];
    const dateFields = ['whenUpdated'];
    return [...formatted].sort((a: any, b: any) => {
      if (dateFields.includes(field)) {
        const aTime = new Date(a._rawWhenUpdated || 0).getTime();
        const bTime = new Date(b._rawWhenUpdated || 0).getTime();
        return sortAsc ? aTime - bTime : bTime - aTime;
      }
      const aVal = a[field] ?? '';
      const bVal = b[field] ?? '';
      const comparison = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortAsc ? comparison : -comparison;
    });
  };

  return (
    <PageContainer role="Folios">
      <div>
        <CustomLabel label="Folios" labelType="b-h1" />
      </div>
      <div className="folio-actions">
        <div className="folio-add-new">
          {!editMode && (
            <Button onClick={handleAddNewFolio}>
              <FolderPlusIcon />
              Create New Folio
            </Button>
          )}

          {!editMode && (
            <Button variant="secondary" onClick={() => SetEditMode(true)}>
              <PencilIcon />
              Edit Folios
            </Button>
          )}
          {editMode && (
            <>
              <Button variant="secondary" onClick={() => SetEditMode(false)}>
                <XmarkIcon />
                Cancel
              </Button>
              <Button onClick={handleSaveChanges}>
                <RegFloppyDisk />
                Save Changes
              </Button>
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
      <div className="col-12 overflow-auto w-100">
        <Table
          label="Folios"
          isLoading={RequestStatus.success}
          columns={getFolioTableColumnsBasedOnMode(editMode)}
          data={getSortedData()}
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
          sortHandler={handleSortChange}
        />
      </div>

      {addFolioConfirm && (
        <ModalDialog
          label="Are you sure to create a new folio ?"
          closeHandler={(response) => {
            if (response) {
              const folio: Folio = {
                folioId: 'New' + Math.ceil(Math.random() * 1000),
                description:
                  'Please update description & folio name as desired',
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
            if (response) {
              let rowsToBeUpdated = tempArr.filter((x) => x.dirty === true);

              rowsToBeUpdated.map((row) => {
                delete row.dirty;
                return row;
              });

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
            if (response) {
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
          saveBtnLabel="Save"
          cancelBtnLabel="Cancel"
          dicardBtnLabel="Discard Changes"
          discardOption={true}
          closeHandler={(response) => {
            if (response === 'discard') {
              if (blocker) {
                blocker?.proceed?.();
              }
            } else if (response === true) {
              let rowsToBeUpdated = tempArr.filter((x) => x.dirty === true);

              rowsToBeUpdated.map((row) => {
                delete row.dirty;
                return row;
              });

              dispatch(resetFolioSiteUpdateStatus(null));
              dispatch(updateFolioItem(rowsToBeUpdated))
                .unwrap()
                .finally(() => {
                  if (blocker) {
                    blocker?.proceed?.();
                  }
                });
            } else {
              if (blocker) {
                blocker?.reset?.();
              }
            }
            SetShowDeleteConfirmModal(false);
          }}
        >
          <span> Please save or discard your new folio before proceeding.</span>
        </ModalDialog>
      ) : null}
    </PageContainer>
  );
};

export default Folios;
