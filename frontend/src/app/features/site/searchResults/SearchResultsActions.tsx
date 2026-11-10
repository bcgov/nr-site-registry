import { FC } from 'react';
import { useAuth } from 'react-oidc-context';
import { useDispatch } from 'react-redux';

import { AppDispatch } from '../../../Store';
import { Button } from '../../../components/button/Button';
import { getUser, isUserOfType, UserRoleType } from '../../../helpers/utility';
import { signInWithReturnUrl } from '../../../auth/returnUrl';
import AddToFolio from '../../folios/AddToFolio';
import {
  FileExportIcon,
  ShoppingCartIcon,
} from '../../../components/common/icon';
import {
  downloadLabeledValues,
  LabeledCsvColumn,
} from '../../../helpers/csvExport/csvExport';
import { SearchSiteRow } from '../searchSites';
import { addCartItem, resetCartItemAddedStatus } from '../../cart/CartSlice';

interface SearchResultsActionsProps {
  selectedRows: SearchSiteRow[];
  exportColumns: LabeledCsvColumn[];
}
export const SearchResultsActions: FC<SearchResultsActionsProps> = ({
  selectedRows,
  exportColumns,
}) => {
  const auth = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleExport = () => {
    downloadLabeledValues(selectedRows, exportColumns);
  };

  const handleAddToShoppingCart = () => {
    const loggedInUser = getUser();
    if (loggedInUser === null) {
      signInWithReturnUrl(auth);
    } else {
      const cartItems = selectedRows.map((row) => {
        return {
          siteId: String(row.id),
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
          selectedSiteIds={selectedRows.map((row) => String(row.id))}
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
