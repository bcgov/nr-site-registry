import React, { useEffect, useState } from 'react';
import PageContainer from '../../components/simple/PageContainer';
import CustomLabel from '../../components/simple/CustomLabel';
import Table from '../../components/table/Table';
import { RequestStatus } from '../../helpers/requests/status';
import { FolioContentTableColumns } from './FolioContentTableConfig';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getUser,
  showNotification,
  sortTableData,
} from '../../helpers/utility';
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
} from './redux/FolioSlice';
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
import { Button } from '../../components/button/Button';
import { TableColumn } from '../../components/table/TableColumn';

const FolioContents = () => {
  const { id } = useParams();
  const auth = useAuth();

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

  const [sortColumn, setSortColumn] = useState<string>('');
  const [sortAsc, setSortAsc] = useState<boolean>(true);

  useEffect(() => {
    const dto = { id: parseInt(id ?? '0') };

    dispatch(getSiteForFolio(dto)).unwrap();
  }, []);

  useEffect(() => {
    const dto = { id: parseInt(id ?? '0') };

    dispatch(getSiteForFolio(dto)).unwrap();
    showNotification(
      sitesDeleteStatus,
      'Successfully deleted site from Folio',
      'Unable delete site from folio',
    );
    dispatch(resetFolioSiteDeleteStatus(null));
  }, [sitesDeleteStatus]);

  useEffect(() => {
    let folioDetails = folioItemsArr.find(
      (x: any) => x.id === parseInt(id ?? ''),
    );
    SetSelectedFolio(folioDetails);
  }, [folioItemsArr]);

  const navigate = useNavigate();
  const onClickBackButton = () => {
    navigate(-1);
  };

  const handleChangeEventFromTable = (event: any) => {
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
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const cartItem = selectedRows.map((folio) => {
        return {
          siteId: folio.siteId,
          price: 200.11,
        };
      });

      dispatch(resetCartItemAddedStatus(null));
      dispatch(addCartItem(cartItem)).unwrap();
    }
  };

  const handleDeleteFromFolio = () => {
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const sitesinFolio = selectedRows.map((folio) => {
        return {
          id: parseInt(id ?? ''),

          siteId: folio.siteId,
          folioId: id,
        };
      });

      dispatch(resetFolioSiteDeleteStatus(null));
      dispatch(deleteSitesInFolio(sitesinFolio)).unwrap();
    }
  };

  const handleDeleteFromShoppingCart = () => {
    const loggedInUser = getUser();
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

  const handleSortChange = (column: TableColumn, ascSort: boolean) => {
    setSortColumn(column.graphQLPropertyName);
    setSortAsc(ascSort);
  };

  const getSortedFolioContent = () => {
    const mapped = sitesInFolioArr.map((x) => {
      const merged = { ...x, ...x.site };
      const rawDate = merged.whenUpdated || (x as any).whenUpdated;
      return {
        ...merged,
        _rawWhenUpdated: rawDate,
        whenUpdated: rawDate ? new Date(rawDate).toLocaleString() : '',
      };
    });
    if (!sortColumn) return mapped;
    return sortTableData(mapped, sortColumn, sortAsc, ['whenUpdated'], {
      whenUpdated: '_rawWhenUpdated',
    });
  };

  return (
    <PageContainer role="Folio Contents">
      <div className="d-flex folio-actions folio-actions-gap">
        <Button variant="secondary" onClick={onClickBackButton}>
          <AngleLeft />
          Back to Folios
        </Button>
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
        <div className="folio-content-actions">
          <Button
            onClick={handleAddToShoppingCart}
            disabled={selectedRows.length === 0}
          >
            <ShoppingCartIcon />
            Add Selected To Cart
          </Button>

          <Button
            variant="secondary"
            disabled={selectedRows.length === 0}
            onClick={() => {
              SetShowDeleteConfirmModal(true);
            }}
          >
            <TrashCanIcon />
            Remove Selected From Folio
          </Button>
        </div>
        <div className="col-12 overflow-auto w-100">
          <Table
            label="Folios"
            isLoading={RequestStatus.success}
            columns={FolioContentTableColumns}
            data={getSortedFolioContent()}
            totalResults={[].length}
            allowRowsSelect={true}
            showPageOptions={false}
            changeHandler={(event) => {
              handleChangeEventFromTable(event);
            }}
            editMode={false}
            idColumnName="id"
            deleteHandler={() => {}}
            sortHandler={handleSortChange}
          />
        </div>
      </div>

      {showDeleteConfirmModal && (
        <ModalDialog
          label="Are you sure to delete the selected sites from folio?"
          closeHandler={(response) => {
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
