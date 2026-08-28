import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { useAuth } from 'react-oidc-context';

import { AppDispatch } from '../../../Store';
import { signInWithReturnUrl } from '../../../auth/returnUrl';
import { Button } from '../../../components/button/Button';
import { ShoppingCartIcon } from '../../../components/common/icon';
import { getUser, isUserOfType, UserRoleType } from '../../../helpers/utility';
import AddToFolio from '../../folios/AddToFolio';
import {
  addCartItem,
  addCartItemRequestStatus,
  fetchCartItems,
  resetCartItemAddedStatus,
} from '../../cart/CartSlice';
import { selectSiteDetails } from '../../site/dto/SiteSlice';

import './PurchaseAccessPrompt.css';

const PurchaseAccessPrompt = () => {
  const auth = useAuth();
  const { id } = useParams();
  const dispatch = useDispatch<AppDispatch>();
  const details = useSelector(selectSiteDetails);
  const addCartItemStatus = useSelector(addCartItemRequestStatus);
  const siteId = id || details?.id;

  useEffect(() => {
    if (isUserOfType(UserRoleType.CLIENT) && getUser() !== null) {
      dispatch(fetchCartItems());
    }
  }, [addCartItemStatus, dispatch]);

  const handleAddToCart = () => {
    if (getUser() === null) {
      signInWithReturnUrl(auth);
      return;
    }
    if (!siteId) {
      return;
    }
    dispatch(resetCartItemAddedStatus(null));
    dispatch(
      addCartItem([
        {
          siteId,
          price: 200.11,
        },
      ]),
    ).unwrap();
  };

  return (
    <div
      className="external-purchase-section"
      data-testid="purchase-access-prompt"
    >
      <div className="external-purchase-info">
        <span>
          In order to view this site’s details, please purchase access using the
          button below.
        </span>
      </div>
      <div className="external-purchase-buttons">
        <Button onClick={handleAddToCart}>
          <ShoppingCartIcon /> Purchase Site Details
        </Button>
        {siteId && (
          <AddToFolio
            selectedSiteIds={[siteId]}
            label="Add to Folio"
            popupPlacement="top-start"
          />
        )}
      </div>
    </div>
  );
};

export default PurchaseAccessPrompt;
