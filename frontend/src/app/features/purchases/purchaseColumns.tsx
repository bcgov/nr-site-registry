import { Link as RouterLink } from 'react-router-dom';
import { columnSizeClass } from '../../components/grid/columnSizeClass';
import { GridColumn } from '../../components/grid/Grid';
import { TableColumn } from '../../components/table/TableColumn';
import { PurchasesTableColumns } from './PurchasesTableConfig';
import {
  isPurchaseSortField,
  PurchaseSortField,
  PurchasedSite,
} from './purchasedSites';

function cellText(field: PurchaseSortField, row: PurchasedSite): string {
  const value = row[field];
  if (value == null || value === '') {
    return '';
  }
  if (field === 'purchaseDate') {
    return new Date(value).toLocaleString();
  }
  return value;
}

function PurchaseCell({
  column,
  row,
}: {
  column: TableColumn;
  row: PurchasedSite;
}) {
  const field = column.graphQLPropertyName;
  if (!isPurchaseSortField(field)) {
    return null;
  }
  const value = cellText(field, row);
  if (field === 'siteId') {
    return (
      <RouterLink
        to={`${column.displayType?.href ?? ''}${row.siteId}`}
        className="d-flex pt-1"
        aria-label={`${column.displayName} ${row.siteId}`}
      >
        <span className="ps-1">{value}</span>
      </RouterLink>
    );
  }

  return (
    <span aria-label={column.displayName} className="d-flex pt-1">
      {value}
    </span>
  );
}

export function sortFieldForPurchaseColumn(
  columnId: string,
): PurchaseSortField | null {
  const column = PurchasesTableColumns.find(
    (item) => String(item.id) === columnId,
  );
  if (!column || !isPurchaseSortField(column.graphQLPropertyName)) {
    return null;
  }
  return column.graphQLPropertyName;
}

export function columnIdForPurchaseSort(sortField: PurchaseSortField): string {
  const column = PurchasesTableColumns.find(
    (item) => item.graphQLPropertyName === sortField,
  );
  return String(column?.id ?? PurchasesTableColumns[0].id);
}

export function buildPurchaseColumns(): GridColumn<PurchasedSite>[] {
  return PurchasesTableColumns.map((column) => {
    const sizeClass = columnSizeClass(column.columnSize);
    return {
      id: String(column.id),
      label: column.displayName,
      sortable: sortFieldForPurchaseColumn(String(column.id)) !== null,
      headerClassName: sizeClass,
      cellClassName:
        `table-border-light align-content-center ${sizeClass}`.trim(),
      cell: (row: PurchasedSite) => <PurchaseCell column={column} row={row} />,
    };
  });
}
