import { useEffect, useState } from 'react';
import { columnSizeClass } from './columnSizeClass';
import Grid, { GridColumn, GridSort } from './Grid';
import { SortByDirection } from '../../../graphql/generated';
import { gridSortDirection, nextSortDirection } from '../../helpers/pagedList';
import { RequestStatus } from '../../helpers/requests/status';
import { TableColumn } from '../table/TableColumn';
import { columnDisplayValue, get } from '../table/utils';
import Pagination from '../table/pagination/Pagination';
import { renderTableField } from '../table/body/renderTableField';

export type SectionSortControl = {
  manual: boolean;
  sort: GridSort | null;
  onSortChange: (columnId: string) => void;
};

export function nextGridSort(
  current: GridSort | null,
  columnId: string,
): GridSort {
  const currentDirection =
    current?.direction === 'desc' ? SortByDirection.Desc : SortByDirection.Asc;
  return {
    id: columnId,
    direction: gridSortDirection(
      nextSortDirection(current?.id ?? '', currentDirection, columnId),
    ),
  };
}

type SectionGridProps = {
  label: string;
  columns: TableColumn[];
  rows: any[];
  isLoading?: RequestStatus;
  editMode: boolean;
  srMode: boolean;
  allowRowsSelect: boolean;
  idColumnName: string;
  changeHandler: (event: any) => void;
  deleteHandler: (event: any) => void;
  showPageOptions?: boolean;
  currentPage?: number;
  resultsPerPage?: number;
  totalResults?: number;
  selectPage?: (pageNumber: number) => void;
  changeResultsPerPage?: (pageSize: number) => void;
  sortControl?: SectionSortControl;
  empty?: boolean;
};

function columnKey(column: TableColumn): string {
  return column.graphQLPropertyName || String(column.id);
}

function comparableValue(value: unknown): string | number {
  if (value instanceof Date) {
    return value.getTime();
  }
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const time = Date.parse(value);
    if (!Number.isNaN(time)) {
      return time;
    }
  }
  if (typeof value === 'string' && /^\d+$/.test(value)) {
    return Number(value);
  }
  if (value == null) {
    return '';
  }
  return String(value);
}

function sortValue(row: any, propertyName: string): string | number {
  const names = propertyName.split(',').filter((name) => name.length > 0);
  if (names.length === 1) {
    return comparableValue(get(row, names[0]));
  }
  return columnDisplayValue(row, propertyName);
}

function rowKey(row: any, index: number, idColumnName: string): string {
  const value = idColumnName ? get(row, idColumnName) : undefined;
  if (value == null || value === '') {
    return `row-${index}`;
  }
  return String(value);
}

function headerClassName(column: TableColumn): string {
  return [
    columnSizeClass(column.columnSize),
    column.stickyCol ? 'positionSticky' : '',
    column.customHeaderCss ?? '',
  ]
    .filter(Boolean)
    .join(' ');
}

function buildColumns(
  columns: TableColumn[],
  rows: any[],
  editMode: boolean,
  srMode: boolean,
  allowRowsSelect: boolean,
  idColumnName: string,
  selectedIds: string[],
  onToggleRow: (row: any, index: number, selected: boolean) => void,
  onTogglePage: (selected: boolean) => void,
  changeHandler: (event: any) => void,
  deleteHandler: (event: any) => void,
): GridColumn<any>[] {
  const pageIds = rows.map((row, index) => rowKey(row, index, idColumnName));
  const allSelected =
    pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));

  const selectColumn: GridColumn<any> = {
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
        checked={allSelected}
        onChange={(event) => onTogglePage(event.target.checked)}
      />
    ),
    cell: (row) => {
      const index = rows.indexOf(row);
      const id = rowKey(row, index, idColumnName);
      return (
        <input
          type="checkbox"
          className="checkbox-color"
          aria-label="Select Row"
          checked={selectedIds.includes(id)}
          onChange={(event) => onToggleRow(row, index, event.target.checked)}
        />
      );
    },
  };

  const dataColumns: GridColumn<any>[] = columns.map((column, columnIndex) => ({
    id: columnKey(column),
    label: column.displayName,
    sortable: !column.dynamicColumn,
    headerClassName: headerClassName(column),
    rendersOwnCell: true,
    sortValue: (row) => sortValue(row, column.graphQLPropertyName),
    cell: (row) => {
      if (!column.displayType) {
        return <td className="table-border-light align-content-center" />;
      }
      return renderTableField({
        field: column.displayType,
        value: columnDisplayValue(row, column.graphQLPropertyName),
        editMode,
        srMode,
        columnIndex,
        onChange: (value, isDeleteRow) => {
          const change = {
            row,
            property: column.displayType?.graphQLPropertyName,
            value,
          };
          if (isDeleteRow) {
            deleteHandler(change);
          } else {
            changeHandler(change);
          }
        },
      });
    },
  }));

  return allowRowsSelect ? [selectColumn, ...dataColumns] : dataColumns;
}

function SectionGrid({
  label,
  columns,
  rows,
  isLoading,
  editMode,
  srMode,
  allowRowsSelect,
  idColumnName,
  changeHandler,
  deleteHandler,
  showPageOptions,
  currentPage,
  resultsPerPage,
  totalResults,
  selectPage,
  changeResultsPerPage,
  sortControl,
  empty,
}: SectionGridProps) {
  const [clientSort, setClientSort] = useState<GridSort | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const present = new Set(
      rows.map((row, index) => rowKey(row, index, idColumnName)),
    );
    setSelectedIds((current) => {
      const next = current.filter((id) => present.has(id));
      if (
        next.length === current.length &&
        next.every((id, index) => id === current[index])
      ) {
        return current;
      }
      return next;
    });
  }, [rows, idColumnName]);

  const activeSort = sortControl ? sortControl.sort : clientSort;
  const manualSorting = sortControl?.manual ?? false;
  const requestLoading = isLoading === RequestStatus.loading;
  const loading = requestLoading && rows.length === 0;
  const fetching = requestLoading && rows.length > 0;
  const showEmpty = empty ?? (!requestLoading && rows.length === 0);

  const handleSort = (columnId: string) => {
    if (sortControl) {
      sortControl.onSortChange(columnId);
      return;
    }
    setClientSort((current) => nextGridSort(current, columnId));
  };

  const toggleRow = (row: any, index: number, selected: boolean) => {
    const id = rowKey(row, index, idColumnName);
    setSelectedIds((current) =>
      selected ? [...current, id] : current.filter((item) => item !== id),
    );
    changeHandler({
      row,
      property: 'select_row',
      value: selected,
    });
  };

  const togglePage = (selected: boolean) => {
    setSelectedIds(
      selected
        ? rows.map((row, index) => rowKey(row, index, idColumnName))
        : [],
    );
    changeHandler({
      id: 'select_all',
      property: 'select_all',
      value: rows,
      selected,
    });
  };

  const gridColumns = buildColumns(
    columns,
    rows,
    editMode,
    srMode,
    allowRowsSelect,
    idColumnName,
    selectedIds,
    toggleRow,
    togglePage,
    changeHandler,
    deleteHandler,
  );

  return (
    <>
      <Grid
        label={label}
        rows={rows}
        columns={gridColumns}
        sort={activeSort}
        onSortChange={handleSort}
        loading={loading}
        fetching={fetching}
        empty={showEmpty}
        manualSorting={manualSorting}
      />
      {showPageOptions && rows.length !== 0 ? (
        <Pagination
          changeResultsPerPage={changeResultsPerPage}
          selectPage={selectPage}
          currentPage={currentPage}
          resultsPerPage={resultsPerPage}
          totalResults={totalResults}
        />
      ) : null}
    </>
  );
}

export default SectionGrid;
