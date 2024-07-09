import { useDispatch, useSelector } from "react-redux";
import CustomLabel from "../../components/simple/CustomLabel";
import PageContainer from "../../components/simple/PageContainer";
import Table from "../../components/table/Table";
import { RequestStatus } from "../../helpers/requests/status";
import "./Cart.css";
import { CartTableColumns } from "./CartTableConfig";

import React, { useEffect, useState } from "react";
import { AppDispatch } from "../../Store";
import {
  cartItems,
  deleteCartItem,
  deleteRequestStatus,
  fetchCartItems,
  resetCartItemDeleteStatus,
} from "./CartSlice";
import { useAuth } from "react-oidc-context";
import { getUser } from "../../helpers/utility";
import ModalDialog from "../../components/modaldialog/ModalDialog";
import { AngleRight } from "../../components/common/icon";

const Cart = () => {
  const auth = useAuth();

  const [delteConfirm, setDeleteConfirm] = useState(false);

  const [cartIdToDelte, setCartIdToDelete] = useState("");

  const dispatch = useDispatch<AppDispatch>();

  const user = getUser();

  const cartItemsArr = useSelector(cartItems);

  const delteStatus = useSelector(deleteRequestStatus);

  useEffect(() => {   
    dispatch(fetchCartItems(user?.profile.sub ? user.profile.sub : ""));
  }, [delteStatus]);

  useEffect(() => {
    setCartIdToDelete("");
  }, [cartItemsArr]);

  const handleCartItemDelete = (cartId: string) => {
    // eslint-disable-next-line no-restricted-globals
    setDeleteConfirm(true);
    setCartIdToDelete(cartId);
    // if(confirm("Are you sure to delete ?"))
    //   {

    //   }
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
            console.log("change event", event);
          }}
          editMode={false}
          idColumnName="id"
          delteHandler={(event) => {
            handleCartItemDelete(event.row.id);
          }}
        />
      </div>
      {cartItemsArr.length > 0 && (
        <div className="cart-actions">
          <div className="continue-payment">
            <span className="payment-text">Continue to Payment
              <AngleRight/>
            </span>
          </div>
          <div className="cart-total">
            <span className="cart-total-text">Subtotal</span>
            <span>
              {" $"}
              {cartItemsArr.reduce(
                (total: any, item: any) => total + item.price,
                0
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
              dispatch(deleteCartItem(cartIdToDelte)).unwrap();
            }
            setDeleteConfirm(false);
          }}
        ></ModalDialog>
      )}
    </PageContainer>
  );
};

export default Cart;
