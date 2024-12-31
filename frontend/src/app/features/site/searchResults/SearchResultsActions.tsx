import { FC } from 'react';
import { useAuth } from 'react-oidc-context';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../../Store';
import { Button } from '../../../components/button/Button';
import { getUser, isUserOfType, UserRoleType } from '../../../helpers/utility';
import AddToFolio from '../../folios/AddToFolio';
import {
  FileExportIcon,
  ShoppingCartIcon,
} from '../../../components/common/icon';
import { downloadCSV } from '../../../helpers/csvExport/csvExport';
import { addCartItem, resetCartItemAddedStatus } from '../../cart/CartSlice';

interface SearchResultsActionsProps {
  selectedRows: any[]; // TODO: type this properly, should be Site
}
export const SearchResultsActions: FC<SearchResultsActionsProps> = ({
  selectedRows,
}) => {
  const auth = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleExport = () => {
    if (selectedRows.length > 0) {
      downloadCSV(selectedRows);
    }
  };

  const handleAddToShoppingCart = () => {
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      auth.signinRedirect({ extraQueryParams: { kc_idp_hint: 'bceid' } });
    } else {
      const cartItems = selectedRows.map((row) => {
        return {
          siteId: row.id,
          price: 200.11,
        };
      });

      dispatch(resetCartItemAddedStatus(null));
      dispatch(addCartItem(cartItems)).unwrap();
    }
  };

  return (
    <div className="search-result-actions">
      {!isUserOfType(UserRoleType.INTERNAL) && (
        <Button
          onClick={handleAddToShoppingCart}
          disabled={selectedRows.length === 0}
        >
          <ShoppingCartIcon />
          Add Selected To Cart
        </Button>
      )}
      {!isUserOfType(UserRoleType.INTERNAL) && (
        <AddToFolio
          label="Add Selected To Folio"
          disabled={selectedRows.length === 0}
          selectedSiteIds={selectedRows.map((row) => row.id)}
        />
      )}

      <Button
        variant="secondary"
        onClick={handleExport}
        disabled={selectedRows.length === 0}
      >
        <FileExportIcon />
        Export Results As File
      </Button>
    </div>
  );
};
