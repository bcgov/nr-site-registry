import { useDispatch, useSelector } from 'react-redux';
import CustomLabel from '../../components/simple/CustomLabel';
import PageContainer from '../../components/simple/PageContainer';
import Table from '../../components/table/Table';
import { RequestStatus } from '../../helpers/requests/status';
import './Cart.css';
import { CartTableColumns } from './CartTableConfig';

import React, { useEffect, useState } from 'react';
import { AppDispatch } from '../../Store';
import {
  cartItems,
  deleteCartItem,
  deleteRequestStatus,
  fetchCartItems,
  resetCartItemDeleteStatus,
} from './CartSlice';
import { useAuth } from 'react-oidc-context';
import { getUser, showNotification } from '../../helpers/utility';
import ModalDialog from '../../components/modaldialog/ModalDialog';
import { AngleRight } from '../../components/common/icon';
import {
  createSnapshotForSites,
  createSnapshotForSitesStatus,
  resetCreateSnapshotForSitesStatus,
} from '../details/snapshot/SnapshotSlice';
import { CreateSnapshotInputDto } from '../details/snapshot/ISnapshotState';

const Cart = () => {
  const auth = useAuth();

  const [delteConfirm, setDeleteConfirm] = useState(false);

  const [cartIdToDelte, setCartIdToDelete] = useState('');

  const dispatch = useDispatch<AppDispatch>();

  const user = getUser();

  const cartItemsArr = useSelector(cartItems);

  const deleteStatus = useSelector(deleteRequestStatus);

  const createSnapshotRequestStatus = useSelector(createSnapshotForSitesStatus);

  useEffect(() => {
    if (createSnapshotRequestStatus === RequestStatus.success) {
      showNotification(
        createSnapshotRequestStatus,
        'Successfully created snapshot',
      );
      dispatch(resetCreateSnapshotForSitesStatus(null));
    }
  }, [createSnapshotRequestStatus]);

  useEffect(() => {
    dispatch(fetchCartItems(user?.profile.sub ? user.profile.sub : ''));
  }, [deleteStatus]);

  useEffect(() => {
    setCartIdToDelete('');
  }, [cartItemsArr]);

  const handleCartItemDelete = (cartId: string) => {
    // eslint-disable-next-line no-restricted-globals
    setDeleteConfirm(true);
    setCartIdToDelete(cartId);
  };

  const handlePayment = () => {
    const inputDto: CreateSnapshotInputDto[] = cartItemsArr.map((item: any) => {
      return {
        siteId: item.siteId,
      };
    });

    dispatch(createSnapshotForSites(inputDto)).unwrap();
  };

  return (
    <PageContainer role="cart">
      <div>
        <CustomLabel label="Cart" labelType="b-h1" />
      </div>
      <div className="col-12">
        <Table
          label="Cart"
          isLoading={RequestStatus.success}
          columns={CartTableColumns}
          data={cartItemsArr.map((x: any) => {
            const {
              site: { id, ...siteWithoutId },
              ...xWithoutSite
            } = x;
            const mergedObject = { ...xWithoutSite, ...siteWithoutId };

            return mergedObject;
          })}
          totalResults={[].length}
          allowRowsSelect={false}
          showPageOptions={false}
          changeHandler={(event) => {
            console.log('change event', event);
          }}
          editMode={false}
          idColumnName="id"
          deleteHandler={(event) => {
            handleCartItemDelete(event.row.id);
          }}
        />
      </div>
      {cartItemsArr.length > 0 && (
        <div className="cart-actions">
          <div className="continue-payment">
            <span className="payment-text" onClick={() => handlePayment()}>
              Continue to Payment
              <AngleRight />
            </span>
          </div>
          <div className="cart-total">
            <span className="cart-total-text">Subtotal</span>
            <span>
              {' $'}
              {cartItemsArr.reduce(
                (total: any, item: any) => total + item.price,
                0,
              )}
            </span>
          </div>
        </div>
      )}
      {delteConfirm && (
        <ModalDialog
          label="Are you sure to delete from cart ?"
          closeHandler={(response) => {
            if (response) {
              dispatch(resetCartItemDeleteStatus(null));
              dispatch(
                deleteCartItem([
                  { cartId: cartIdToDelte, userId: user?.profile.sub ?? '' },
                ]),
              ).unwrap();
            }
            setDeleteConfirm(false);
          }}
        ></ModalDialog>
      )}
    </PageContainer>
  );
};

export default Cart;
