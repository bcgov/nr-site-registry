import { SectionColumn } from '../../../components/grid/SectionColumn';
import { Link as RouterLink } from 'react-router-dom';
import { SiteSortBy } from '../../../../graphql/generated';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { GridColumn } from '../../../components/grid/Grid';

import { formatDate } from '../../../helpers/utility';
import SRUpdatesTableConfiguration from './srUpdatesTableConfiguration';
import { PendingApprovalRow } from './pendingSiteApprovals';

const sortFieldByColumnId: Record<number, SiteSortBy> = {
  1: SiteSortBy.WhenUpdated,
  2: SiteSortBy.WhoCreated,
  3: SiteSortBy.Id,
  4: SiteSortBy.SiteAddress,
};

type SelectionControls = {
  pageRows: PendingApprovalRow[];
  isSelected: (row: PendingApprovalRow) => boolean;
  onToggleRow: (row: PendingApprovalRow, selected: boolean) => void;
  onTogglePage: (selected: boolean) => void;
};

function cellText(column: SectionColumn, row: PendingApprovalRow): string {
  const value = row[column.graphQLPropertyName as keyof PendingApprovalRow];
  return value == null ? '' : String(value);
}

function ApprovalCell({
  column,
  row,
}: {
  column: SectionColumn;
  row: PendingApprovalRow;
}) {
  const field = column.displayType;
  const value = cellText(column, row);

  if (field?.type === FormFieldType.Link) {
    return (
      <RouterLink
        to={`${field.href ?? ''}${value}`}
        className={`d-flex pt-1 ${field.customInputTextCss ?? ''}`}
        aria-label={`${field.label} ${value}`}
        state={{
          fromPath: field.componentPath ?? '',
          fromLabel: field.componentName ?? '',
        }}
      >
        <span className="ps-1">{field.customLinkValue ?? value}</span>
      </RouterLink>
    );
  }

  const shown =
    field?.type === FormFieldType.Date ? formatDate(value || null) : value;

  return (
    <span aria-label={column.displayName} className="d-flex pt-1">
      {shown}
    </span>
  );
}

export function sortFieldForApprovalColumn(
  columnId: string,
): SiteSortBy | null {
  const column = SRUpdatesTableConfiguration.find(
    (item) => String(item.id) === columnId,
  );
  if (!column) {
    return null;
  }
  return sortFieldByColumnId[column.id] ?? null;
}

export function columnIdForApprovalSort(sortField: string): string {
  const column = SRUpdatesTableConfiguration.find(
    (item) => sortFieldByColumnId[item.id] === sortField,
  );
  return column ? String(column.id) : '3';
}

export function buildApprovalColumns(
  selection: SelectionControls,
): GridColumn<PendingApprovalRow>[] {
  const pageRows = selection.pageRows;
  const allSelected =
    pageRows.length > 0 && pageRows.every((row) => selection.isSelected(row));

  const selectColumn: GridColumn<PendingApprovalRow> = {
    id: 'select',
    label: '',
    sortable: false,
    headerClassName: 'checkbox-column positionSticky',
    cellClassName:
      'table-border-light content-text positionSticky align-content-center',
    header: (
      <input
        type="checkbox"
        className="checkbox-color"
        aria-label="Select all rows on this page"
        checked={allSelected}
        onChange={(event) => selection.onTogglePage(event.target.checked)}
      />
    ),
    cell: (row) => (
      <input
        type="checkbox"
        className="checkbox-color"
        aria-label="Select Row"
        checked={selection.isSelected(row)}
        onChange={(event) => selection.onToggleRow(row, event.target.checked)}
      />
    ),
  };

  const dataColumns = SRUpdatesTableConfiguration.map((column) => ({
    id: String(column.id),
    label: column.displayName,
    sortable: sortFieldByColumnId[column.id] !== undefined,
    cellClassName: 'table-border-light align-content-center',
    cell: (row: PendingApprovalRow) => (
      <ApprovalCell column={column} row={row} />
    ),
  }));

  return [selectColumn, ...dataColumns];
}
