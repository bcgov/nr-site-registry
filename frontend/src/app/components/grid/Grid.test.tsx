import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import Grid, { GridColumn, GridSort } from './Grid';

type SampleRow = { name: string; note: string };

const columns: GridColumn<SampleRow>[] = [
  {
    id: 'name',
    label: 'Name',
    sortable: true,
    cell: (row) => row.name,
  },
  {
    id: 'note',
    label: 'Note',
    sortable: false,
    cell: (row) => row.note,
  },
  {
    id: 'city',
    label: 'City',
    sortable: true,
    cell: () => 'Victoria',
  },
];

const rows: SampleRow[] = [
  { name: 'Alpha', note: 'First' },
  { name: 'Beta', note: 'Second' },
];

function SortableGrid({
  initialSort = { id: 'name', direction: 'asc' as const },
  visibleColumns = columns,
  tableRows = rows,
  loading = false,
  fetching = false,
  empty = false,
}: {
  initialSort?: GridSort | null;
  visibleColumns?: GridColumn<SampleRow>[];
  tableRows?: SampleRow[];
  loading?: boolean;
  fetching?: boolean;
  empty?: boolean;
}) {
  const [sort, setSort] = useState<GridSort | null>(initialSort);

  return (
    <Grid
      label="Sites"
      rows={tableRows}
      columns={visibleColumns}
      sort={sort}
      onSortChange={(columnId) => {
        setSort((current) => ({
          id: columnId,
          direction:
            current?.id === columnId && current.direction === 'asc'
              ? 'desc'
              : 'asc',
        }));
      }}
      loading={loading}
      fetching={fetching}
      empty={empty}
    />
  );
}

describe('Grid', () => {
  test('shows one sort indicator and it matches the active direction', async () => {
    const user = userEvent.setup();
    render(<SortableGrid />);

    const nameHeader = screen.getByRole('columnheader', { name: 'Name' });
    const cityHeader = screen.getByRole('columnheader', { name: 'City' });

    expect(nameHeader).toHaveAttribute('aria-sort', 'ascending');
    expect(cityHeader).toHaveAttribute('aria-sort', 'none');
    expect(screen.getAllByTestId('sort-indicator')).toHaveLength(1);
    expect(screen.getByTestId('sort-indicator')).toHaveAttribute(
      'data-direction',
      'ascending',
    );

    await user.click(screen.getByRole('button', { name: 'Name' }));

    expect(nameHeader).toHaveAttribute('aria-sort', 'descending');
    expect(screen.getByTestId('sort-indicator')).toHaveAttribute(
      'data-direction',
      'descending',
    );
    expect(screen.getAllByTestId('sort-indicator')).toHaveLength(1);
    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')[1].textContent).toContain('Alpha');
    expect(
      screen
        .getByRole('columnheader', { name: 'City' })
        .querySelector('[data-testid="sort-indicator"]'),
    ).toBeNull();
  });

  test('orders the view and leaves the given rows unchanged', () => {
    const given = [
      { name: 'Beta', note: 'Second' },
      { name: 'Alpha', note: 'First' },
    ];
    const sortableColumns: GridColumn<SampleRow>[] = columns.map((column) =>
      column.id === 'name'
        ? { ...column, sortValue: (row: SampleRow) => row.name }
        : column,
    );

    render(
      <Grid
        label="Sites"
        rows={given}
        columns={sortableColumns}
        sort={{ id: 'name', direction: 'asc' }}
        onSortChange={() => {}}
        loading={false}
        fetching={false}
        empty={false}
        manualSorting={false}
      />,
    );

    const dataRows = screen.getAllByRole('row').slice(1);
    expect(dataRows[0]).toHaveTextContent('Alpha');
    expect(dataRows[1]).toHaveTextContent('Beta');
    expect(given.map((row) => row.name)).toEqual(['Beta', 'Alpha']);
  });

  test('uses the column label as header text and gives a non-sortable column no sort control', () => {
    render(<SortableGrid />);

    expect(
      screen.getByRole('columnheader', { name: 'Name' }),
    ).toHaveTextContent('Name');
    expect(
      screen.getByRole('columnheader', { name: 'Note' }),
    ).toHaveTextContent('Note');
    expect(
      screen.queryByRole('button', { name: 'Note' }),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Note' }),
    ).not.toHaveAttribute('aria-sort');
  });

  test('loading and empty rows span the columns that are still visible', () => {
    const { rerender } = render(
      <SortableGrid
        visibleColumns={columns}
        tableRows={[]}
        loading
        initialSort={null}
      />,
    );

    expect(screen.getByText('Searching').closest('td')).toHaveAttribute(
      'colspan',
      '3',
    );

    rerender(
      <SortableGrid
        visibleColumns={columns.slice(0, 2)}
        tableRows={[]}
        loading
        initialSort={null}
      />,
    );

    expect(screen.getByText('Searching').closest('td')).toHaveAttribute(
      'colspan',
      '2',
    );

    rerender(
      <SortableGrid
        visibleColumns={columns.slice(0, 2)}
        tableRows={[]}
        empty
        initialSort={null}
      />,
    );

    expect(screen.getByText('No Results Found').closest('td')).toHaveAttribute(
      'colspan',
      '2',
    );
  });

  test('keeps the current rows on screen while a later page is fetching', () => {
    render(<SortableGrid fetching />);

    expect(screen.getByRole('cell', { name: 'Alpha' })).toBeInTheDocument();
    expect(screen.queryByText('Searching')).not.toBeInTheDocument();
    expect(screen.getByRole('table', { name: 'Sites' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
  });
});
