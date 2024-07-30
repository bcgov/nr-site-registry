import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/simple/PageContainer';
import CustomLabel from '../../components/simple/CustomLabel';
import Table from '../../components/table/Table';
import { RequestStatus } from '../../helpers/requests/status';
import { FolioContentTableColumns } from './FolioContentTableConfig';
import { useNavigate, useParams } from 'react-router-dom';
import { getUser, showNotification } from '../../helpers/utility';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '../../Store';
import {
  deleteSiteInFolioStatus,
  deleteSitesInFolio,
  fetchFolioItems,
  folioItems,
  getSiteForFolio,
  resetFolioSiteDeleteStatus,
  sitesInFolio,
} from './FolioSlice';
import { Folio, FolioContentDTO } from './dto/Folio';
import {
  AngleLeft,
  ShoppingCartIcon,
  TrashCanIcon,
} from '../../components/common/icon';
import './FolioContent.css';
import {
  addCartItem,
  deleteCartItemWithSiteId,
  resetCartItemAddedStatus,
  resetCartItemDeleteStatus,
} from '../cart/CartSlice';
import { useAuth } from 'react-oidc-context';
import ModalDialog from '../../components/modaldialog/ModalDialog';

const FolioContents = () => {
  const { id } = useParams();
  const auth = useAuth();

  console.log(id);

  const user = getUser();

  useEffect(() => {
    dispatch(fetchFolioItems(user?.profile.sub ? user.profile.sub : ''));
  }, []);

  const dispatch = useDispatch<AppDispatch>();

  const sitesInFolioArr: [FolioContentDTO] = useSelector(sitesInFolio);

  const folioItemsArr = useSelector(folioItems);

  const [selectedFolio, SetSelectedFolio] = useState<Folio>();

  const [selectedRows, SetSelectedRows] = useState<FolioContentDTO[]>([]);

  const sitesDeleteStatus = useSelector(deleteSiteInFolioStatus);

  const [showDeleteConfirmModal, SetShowDeleteConfirmModal] = useState(false);

  useEffect(() => {
    const dto = { id: parseInt(id ?? '0'), userId: user?.profile.sub ?? '' };

    dispatch(getSiteForFolio(dto)).unwrap();
  }, []);

  useEffect(() => {
    const dto = { id: parseInt(id ?? '0'), userId: user?.profile.sub ?? '' };

    dispatch(getSiteForFolio(dto)).unwrap();
    showNotification(
      sitesDeleteStatus,
      'Successfully deleted site from Folio',
      'Unable delete site from folio',
    );
  }, [sitesDeleteStatus]);

  useEffect(() => {
    let folioDetails = folioItemsArr.find(
      (x: any) => x.id === parseInt(id ?? ''),
    );
    console.log('folioItemsArr', folioDetails);
    SetSelectedFolio(folioDetails);
  }, [folioItemsArr]);

  useEffect(() => {
    console.log(sitesInFolioArr);
  }, [sitesInFolioArr]);

  const navigate = useNavigate();
  const onClickBackButton = () => {
    navigate(-1);
  };

  const handleChangeEventFromTable = (event: any) => {
    console.log(event);
    if (event && event.property === 'select_row') {
      const index = selectedRows.findIndex((r: any) => r.id === event.row.id);
      if (index > -1 && !event.value) {
        SetSelectedRows(selectedRows.filter((r: any) => r.id !== event.row.id));
      } else {
        SetSelectedRows([...selectedRows, event.row]);
      }
    }
  };

  const handleAddToShoppingCart = () => {
    const loggedInUser = getUser();
    console.log(selectedRows);
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const foliosToAdd = selectedRows.map((folio) => {
        return {
          userId: loggedInUser.profile.sub,
          siteId: folio.siteId,
          whoCreated: loggedInUser.profile.given_name ?? '',
          price: 200.11,
        };
      });

      dispatch(resetCartItemAddedStatus(null));
      dispatch(addCartItem(foliosToAdd)).unwrap();
    }
  };

  const handleDeleteFromFolio = () => {
    const loggedInUser = getUser();
    console.log(selectedRows);
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const sitesinFolio = selectedRows.map((folio) => {
        return {
          id: parseInt(id ?? ''),
          userId: loggedInUser.profile.sub,
          siteId: folio.siteId,
          folioId: id,
          whoCreated: '',
        };
      });

      dispatch(resetFolioSiteDeleteStatus(null));
      dispatch(deleteSitesInFolio(sitesinFolio)).unwrap();
    }
  };

  const handleDeleteFromShoppingCart = () => {
    const loggedInUser = getUser();
    console.log(selectedRows);
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const cartItemsToDelete = selectedRows.map((folio) => {
        return {
          userId: loggedInUser.profile.sub,
          siteId: folio.siteId,
        };
      });

      dispatch(resetCartItemDeleteStatus(null));
      dispatch(deleteCartItemWithSiteId(cartItemsToDelete)).unwrap();
    }
  };

  return (
    <PageContainer role="Folio Contents">
      <div className="d-flex folio-actions-gap">
        <button
          className="d-flex btn-back align-items-center"
          onClick={onClickBackButton}
        >
          <AngleLeft className="btn-icon" />
          <span className="btn-back-lbl">Back to</span>
        </button>
        <div className="folio-description">
          <div>
            <span className="folio-details-bold">Folio ID: </span>{' '}
            <span className="folio-details-default">{selectedFolio?.id}</span>
          </div>
          <div>
            <span className="folio-details-bold">
              {selectedFolio?.description}
            </span>
          </div>
        </div>
      </div>

      <div className="col-12 folio-contents-gap">
        <div>
          <CustomLabel label="Folio Contents" labelType="b-h1" />
        </div>
        <div className="search-result-actions">
          <div
            className="search-result-actions-btn"
            onClick={() => {
              handleAddToShoppingCart();
            }}
          >
            <ShoppingCartIcon />
            <span>Add Selected To Cart</span>
          </div>
          <div
            className="search-result-actions-btn"
            onClick={() => {
              SetShowDeleteConfirmModal(true);
            }}
          >
            <TrashCanIcon />
            <span>Remove Selected From Folio</span>
          </div>
        </div>
        <Table
          label="Folios"
          isLoading={RequestStatus.success}
          columns={FolioContentTableColumns}
          data={sitesInFolioArr.map((x) => {
            let combinedObject = {
              ...x,
              ...x.site,
            };

            return combinedObject;
          })}
          totalResults={[].length}
          allowRowsSelect={true}
          showPageOptions={false}
          changeHandler={(event) => {
            handleChangeEventFromTable(event);
          }}
          editMode={false}
          idColumnName="id"
          deleteHandler={() => {}}
        />
      </div>

      {showDeleteConfirmModal && (
        <ModalDialog
          label="Are you sure to delete the selected sites from folio?"
          closeHandler={(response) => {
            console.log('response', response);
            if (response) {
              handleDeleteFromFolio();
            }
            SetShowDeleteConfirmModal(false);
          }}
        >
          <span> Please confirm before proceeding.</span>
        </ModalDialog>
      )}
    </PageContainer>
  );
};

export default FolioContents;
