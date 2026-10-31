import { ReactNode } from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { DropdownIcon, DropdownUpIcon, SpinnerIcon } from '../common/icon';
import '../table/Table.css';
import '../table/header/TableHeader.css';
import './Grid.css';

export type GridSortDirection = 'asc' | 'desc';

export type GridSort = {
  id: string;
  direction: GridSortDirection;
};

export type GridColumn<Row> = {
  id: string;
  label: string;
  sortable?: boolean;
  header?: ReactNode;
  cell: (row: Row) => ReactNode;
  sortValue?: (row: Row) => string | number;
  cellClassName?: string;
  headerClassName?: string;
};

type GridColumnMeta<Row> = {
  source: GridColumn<Row>;
};

type GridProps<Row> = {
  label: string;
  rows: Row[];
  columns: GridColumn<Row>[];
  sort: GridSort | null;
  onSortChange: (columnId: string) => void;
  loading: boolean;
  fetching: boolean;
  empty: boolean;
  manualSorting?: boolean;
};

function sortStateFor(
  column: { id: string; sortable?: boolean },
  sort: GridSort | null,
): 'ascending' | 'descending' | 'none' | undefined {
  if (!column.sortable) {
    return undefined;
  }
  if (!sort || sort.id !== column.id) {
    return 'none';
  }
  return sort.direction === 'asc' ? 'ascending' : 'descending';
}

function columnSource<Row>(columnDef: ColumnDef<Row>): GridColumn<Row> {
  return (columnDef.meta as GridColumnMeta<Row>).source;
}

function Grid<Row>({
  label,
  rows,
  columns,
  sort,
  onSortChange,
  loading,
  fetching,
  empty,
  manualSorting = true,
}: GridProps<Row>) {
  const columnDefs: ColumnDef<Row>[] = columns.map((column) => ({
    id: column.id,
    accessorFn: (row) => column.sortValue?.(row) ?? '',
    header: column.label,
    cell: (info) => columnSource(info.column.columnDef).cell(info.row.original),
    enableSorting: Boolean(column.sortable),
    meta: { source: column } satisfies GridColumnMeta<Row>,
  }));

  const table = useReactTable({
    data: rows,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: manualSorting ? undefined : getSortedRowModel(),
    manualSorting,
    state: {
      sorting: sort ? [{ id: sort.id, desc: sort.direction === 'desc' }] : [],
    },
  });

  const columnCount = columns.length;
  const showLoadingRow = loading && rows.length === 0;
  const showEmptyRow = empty && !showLoadingRow && rows.length === 0;

  return (
    <div className="tableWidth table-border-radius">
      {fetching && !showLoadingRow ? (
        <div className="grid-fetching" role="status">
          <SpinnerIcon aria-label="Updating results" className="fa-spin" />
        </div>
      ) : null}
      <table
        className="table"
        aria-label={label}
        aria-busy={loading || fetching}
      >
        <thead aria-label={`${label} Header`}>
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id} className="table-header">
              {headerGroup.headers.map((header) => {
                const column = columnSource(header.column.columnDef);
                const ariaSort = sortStateFor(column, sort);
                const headerContent = column.header ?? column.label;
                return (
                  <th
                    key={header.id}
                    scope="col"
                    aria-sort={ariaSort}
                    className={`table-header-th ${column.headerClassName ?? ''}`}
                  >
                    {column.sortable ? (
                      <button
                        type="button"
                        className="grid-sort-button"
                        onClick={() => onSortChange(column.id)}
                      >
                        {headerContent}
                        <SortGlyph direction={ariaSort} />
                      </button>
                    ) : (
                      headerContent
                    )}
                  </th>
                );
              })}
            </tr>
          ))}
        </thead>
        <tbody>
          {showLoadingRow ? (
            <tr>
              <td
                colSpan={columnCount}
                className="noContent table-border-light"
              >
                <div className="content-loading">
                  <SpinnerIcon
                    data-testid="loading-spinner"
                    className="fa-spin"
                  />
                  <span className="noContentText">Searching</span>
                </div>
              </td>
            </tr>
          ) : null}
          {showEmptyRow ? (
            <tr>
              <td
                colSpan={columnCount}
                className="noContent table-border-light"
              >
                <span className="noContentText">No Results Found</span>
              </td>
            </tr>
          ) : null}
          {!showLoadingRow &&
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} data-testid="table-row">
                {row.getVisibleCells().map((cell) => {
                  const column = columnSource(cell.column.columnDef);
                  return (
                    <td
                      key={cell.id}
                      className={
                        column?.cellClassName ??
                        'table-border-light content-text align-content-center'
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
        </tbody>
      </table>
    </div>
  );
}

function SortGlyph({
  direction,
}: {
  direction: 'ascending' | 'descending' | 'none' | undefined;
}) {
  if (direction === 'ascending') {
    return (
      <DropdownUpIcon
        data-testid="sort-indicator"
        data-direction="ascending"
        className="column-sort-icon"
      />
    );
  }
  if (direction === 'descending') {
    return (
      <DropdownIcon
        data-testid="sort-indicator"
        data-direction="descending"
        className="column-sort-icon"
      />
    );
  }
  return null;
}

export default Grid;
