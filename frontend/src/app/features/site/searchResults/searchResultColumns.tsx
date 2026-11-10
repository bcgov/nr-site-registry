import { Link as RouterLink } from 'react-router-dom';
import { SiteSortBy } from '../../../../graphql/generated';
import { FormFieldType } from '../../../components/input-controls/IFormField';
import { GridColumn } from '../../../components/grid/Grid';
import { ColumnSize, TableColumn } from '../../../components/table/TableColumn';
import { getColumnValue } from '../../../helpers/csvExport/csvExport';
import { SearchSiteRow } from '../searchSites';

const sortFieldByProperty: Record<string, SiteSortBy> = {
  id: SiteSortBy.Id,
  srStatus: SiteSortBy.SrStatus,
  siteRiskCode: SiteSortBy.SiteRiskCode,
  commonName: SiteSortBy.CommonName,
  site_address: SiteSortBy.SiteAddress,
  generalDescription: SiteSortBy.GeneralDescription,
  city: SiteSortBy.City,
  whoCreated: SiteSortBy.WhoCreated,
  latdeg: SiteSortBy.LatDeg,
  longdeg: SiteSortBy.LongDeg,
  latDegressMinutesSeconds: SiteSortBy.LatDegreesMinutesSeconds,
  longDegreesMinutesSeconds: SiteSortBy.LongDegreesMinutesSeconds,
  whenCreated: SiteSortBy.WhenCreated,
  whenUpdated: SiteSortBy.WhenUpdated,
  latlongReliabilityFlag: SiteSortBy.LatLongReliabilityFlag,
  consultantSubmitted: SiteSortBy.ConsultantSubmitted,
};

function columnSizeClass(columnSize: ColumnSize | undefined) {
  switch (columnSize) {
    case ColumnSize.Triple:
      return 'triple';
    case ColumnSize.Double:
      return 'double';
    case ColumnSize.Small:
      return 'custom-small';
    case ColumnSize.XtraSmall:
      return 'xtraSmall';
    case ColumnSize.w300:
      return 'w300';
    case ColumnSize.w200:
      return 'w200';
    case ColumnSize.w100:
      return 'w100';
    case ColumnSize.w50:
      return 'w50';
    default:
      return '';
  }
}

export function sortFieldForColumn(column: TableColumn): SiteSortBy | null {
  if (column.dynamicColumn) {
    return null;
  }

  if (column.graphQLPropertyName === 'addrLine_1,addrLine_2,addrLine_3') {
    return SiteSortBy.SiteAddress;
  }
  if (column.graphQLPropertyName === 'longDegrees,longMinutes,longSeconds') {
    return SiteSortBy.LongDegreesMinutesSeconds;
  }
  if (column.graphQLPropertyName === 'latDegrees,latMinutes,latSeconds') {
    return SiteSortBy.LatDegreesMinutesSeconds;
  }

  return sortFieldByProperty[column.graphQLPropertyName] ?? null;
}

export function displayedSearchCellText(
  column: TableColumn,
  row: Record<string, unknown>,
): string {
  const value = getColumnValue(row, column);
  const visibleLabel = column.displayType?.customLinkValue;
  if (column.displayType?.type === FormFieldType.Link && visibleLabel) {
    return String(visibleLabel);
  }
  return value;
}

function SearchResultCell({
  column,
  row,
}: {
  column: TableColumn;
  row: SearchSiteRow;
}) {
  const value = getColumnValue(row, column);
  const visibleText = displayedSearchCellText(column, row);
  const field = column.displayType;

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
        {field.customIcon ? field.customIcon : null}{' '}
        <span className="ps-1">{visibleText}</span>
      </RouterLink>
    );
  }

  return (
    <span
      aria-label={column.displayName}
      className={`d-flex pt-1 ${field?.customInputTextCss ?? ''}`}
    >
      {value}
    </span>
  );
}

type SelectionControls = {
  pageRows: SearchSiteRow[];
  isSelected: (row: SearchSiteRow) => boolean;
  onToggleRow: (row: SearchSiteRow, selected: boolean) => void;
  onTogglePage: (selected: boolean) => void;
};

export function buildSearchResultColumns(
  tableColumns: TableColumn[],
  selection: SelectionControls,
): GridColumn<SearchSiteRow>[] {
  const pageRows = selection.pageRows;
  const allSelected =
    pageRows.length > 0 && pageRows.every((row) => selection.isSelected(row));

  const selectColumn: GridColumn<SearchSiteRow> = {
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

  const visibleColumns = tableColumns
    .filter((column) => column.isChecked)
    .map((column) => {
      const sortField = sortFieldForColumn(column);
      const sizeClass = columnSizeClass(column.columnSize);
      const stickyClass = column.stickyCol ? 'positionSticky' : '';
      return {
        id: String(column.id),
        label: column.displayName,
        sortable: sortField !== null,
        headerClassName: `${sizeClass} ${stickyClass}`.trim(),
        cellClassName:
          `table-border-light align-content-center ${sizeClass} ${stickyClass} ${
            column.displayType?.customContainerCss ?? ''
          }`.trim(),
        cell: (row: SearchSiteRow) => (
          <SearchResultCell column={column} row={row} />
        ),
      };
    });

  return [selectColumn, ...visibleColumns];
}

export function columnSortField(
  tableColumns: TableColumn[],
  columnId: string,
): SiteSortBy | null {
  const column = tableColumns.find((item) => String(item.id) === columnId);
  if (!column) {
    return null;
  }
  return sortFieldForColumn(column);
}

export function columnIdForSortField(
  tableColumns: TableColumn[],
  sortField: string,
): string | null {
  const column = tableColumns.find(
    (item) => item.isChecked && sortFieldForColumn(item) === sortField,
  );
  return column ? String(column.id) : null;
}
