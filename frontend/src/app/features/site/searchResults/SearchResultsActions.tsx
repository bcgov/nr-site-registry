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
import { TableColumn } from '../../../components/table/TableColumn';
import {
  downloadLabeledValues,
  downloadSelectedColumnsCSV,
} from '../../../helpers/csvExport/csvExport';
import { SearchSiteRow } from '../searchSites';
import { addCartItem, resetCartItemAddedStatus } from '../../cart/CartSlice';

interface SearchResultsActionsProps {
  selectedRows: SearchSiteRow[];
  selectedColumns?: TableColumn[];
  visibleCellText?: (column: TableColumn, row: SearchSiteRow) => string;
}
export const SearchResultsActions: FC<SearchResultsActionsProps> = ({
  selectedRows,
  selectedColumns = [],
  visibleCellText,
}) => {
  const auth = useAuth();
  const dispatch = useDispatch<AppDispatch>();

  const handleExport = () => {
    if (selectedRows.length === 0 || selectedColumns.length === 0) {
      return;
    }
    if (!visibleCellText) {
      downloadSelectedColumnsCSV(selectedRows, selectedColumns);
      return;
    }

    const visibleColumns = selectedColumns.filter((column) => column.isChecked);
    downloadLabeledValues(
      selectedRows,
      visibleColumns.map((column) => ({
        label: column.displayName,
        value: (row) => visibleCellText(column, row as SearchSiteRow),
      })),
    );
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
