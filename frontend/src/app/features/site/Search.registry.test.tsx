import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Search from './Search';
import { renderSearchScreen } from './renderSearchScreen';
import { GRAPHQL } from '../../helpers/endpoints';
import * as utility from '../../helpers/utility';

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn().mockReturnValue({ isAuthenticated: false }),
}));

type SearchBody = {
  operationName?: string;
  variables?: {
    searchParam?: string;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    sortByDir?: string;
    filters?: Record<string, unknown>;
  };
};

type RecordedSearch = {
  variables: SearchBody['variables'];
  signal?: AbortSignal;
};

function LocationProbe() {
  const location = useLocation();
  return (
    <div data-testid="location">{location.pathname + location.search}</div>
  );
}

function queryString() {
  return new URLSearchParams(
    screen.getByTestId('location').textContent?.split('?')[1] ?? '',
  );
}

function site(id: string, city = 'Victoria') {
  return {
    id,
    addrLine_1: `${id} Harbour St`,
    addrLine_2: '',
    addrLine_3: '',
    city,
    generalDescription: 'A site',
    whenCreated: '2024-04-04',
  };
}

function searchResponse(
  sites: ReturnType<typeof site>[],
  page: number,
  pageSize: number,
  count = 12,
): [number, object] {
  return [
    200,
    {
      data: {
        searchSites: {
          sites,
          count,
          page,
          pageSize,
        },
      },
    },
  ];
}

async function renderSearch(initialEntry: string) {
  const view = renderSearchScreen(
    <>
      <Search />
      <LocationProbe />
    </>,
    initialEntry,
  );

  await screen.findByLabelText('Search input');

  return view;
}

describe('Search Site Registry', () => {
  let mock: MockAdapter;
  let searches: RecordedSearch[];
  let deferLaterPages = false;
  const pending: Array<(error?: Error) => void> = [];

  beforeEach(() => {
    localStorage.clear();
    searches = [];
    deferLaterPages = false;
    pending.length = 0;
    jest.spyOn(utility, 'getAxiosInstance').mockReturnValue(axios);
    mock = new MockAdapter(axios);
    mock.onPost(GRAPHQL).reply((config) => {
      const body: SearchBody =
        typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      if (body.operationName !== 'searchSites') {
        return [200, { data: {} }];
      }
      const variables = body.variables ?? {};
      const signal = config.signal as AbortSignal | undefined;
      searches.push({ variables, signal });
      return respond(variables, signal);
    });
  });

  afterEach(() => {
    pending.splice(0).forEach((reject) => {
      reject(new axios.CanceledError('canceled'));
    });
    mock.restore();
    jest.restoreAllMocks();
  });

  function respond(
    variables: NonNullable<SearchBody['variables']>,
    signal?: AbortSignal,
  ): [number, object] | Promise<[number, object]> {
    const page = variables.page ?? 1;
    const pageSize = variables.pageSize ?? 5;
    if (variables.searchParam === 'fail') {
      return [500, { errors: [{ message: 'Search failed' }] }];
    }
    if (variables.searchParam === 'none') {
      return searchResponse([], page, pageSize, 0);
    }
    if (deferLaterPages && page > 1 && variables.searchParam === 'harbor') {
      return new Promise((resolve, reject) => {
        const finish = (error?: Error) => {
          if (error) {
            reject(error);
            return;
          }
          resolve(searchResponse([site('2002', 'Later')], page, pageSize));
        };
        pending.push(finish);
        signal?.addEventListener('abort', () => {
          reject(new axios.CanceledError('canceled'));
        });
      });
    }
    const start = (page - 1) * 5;
    const ids = ['1001', '1002', '1003', '1004', '1005'].slice(
      0,
      Math.min(5, pageSize),
    );
    return searchResponse(
      ids.map((id, index) => site(String(Number(id) + start + index * 0))),
      page,
      pageSize,
    );
  }

  test('opens sorted by site id ascending with five rows per page', async () => {
    await renderSearch('/?search=harbor');

    expect(
      await screen.findByRole('columnheader', { name: 'Site ID' }),
    ).toHaveAttribute('aria-sort', 'ascending');
    expect(await screen.findAllByLabelText('Select Row')).toHaveLength(5);
    expect(screen.getByTestId('results-per-page-select')).toHaveValue('5');
    expect(
      screen.getByRole('link', { name: 'Site ID 1001' }),
    ).toBeInTheDocument();
    expect(searches[0].variables).toMatchObject({
      searchParam: 'harbor',
      page: 1,
      pageSize: 5,
      sortBy: 'ID',
      sortByDir: 'ASC',
    });
  });

  test('keeps only non-default page, page size, sort, and search text in the address bar', async () => {
    const firstVisit = await renderSearch('/');
    expect(queryString().toString()).toBe('');
    firstVisit.unmount();

    await renderSearch('/?search=harbor');
    await screen.findByRole('link', { name: 'Site ID 1001' });

    await waitFor(() => {
      const params = queryString();
      expect(params.get('page')).toBeNull();
      expect(params.get('pageSize')).toBeNull();
      expect(params.get('sortBy')).toBeNull();
      expect(params.get('sortByDir')).toBeNull();
      expect(params.get('search')).toBe('harbor');
    });
  });

  test('shows the sort from a loaded address before any click', async () => {
    await renderSearch(
      '/?search=harbor&page=1&pageSize=5&sortBy=CITY&sortByDir=DESC',
    );

    expect(
      await screen.findByRole('columnheader', { name: 'City' }),
    ).toHaveAttribute('aria-sort', 'descending');
    expect(
      screen.getByRole('columnheader', { name: 'Site ID' }),
    ).toHaveAttribute('aria-sort', 'none');
    expect(searches[0].variables).toMatchObject({
      sortBy: 'CITY',
      sortByDir: 'DESC',
    });
  });

  test('returns to page 1 when the sort changes', async () => {
    const user = userEvent.setup();
    await renderSearch(
      '/?search=harbor&page=2&pageSize=5&sortBy=ID&sortByDir=ASC',
    );
    await screen.findByRole('button', { name: '2' });

    await user.click(screen.getByRole('button', { name: 'City' }));

    await waitFor(() => {
      expect(queryString().get('page')).toBeNull();
      expect(queryString().get('sortBy')).toBe('CITY');
      expect(queryString().get('sortByDir')).toBeNull();
    });
    expect(screen.getByRole('columnheader', { name: 'City' })).toHaveAttribute(
      'aria-sort',
      'ascending',
    );
  });

  test('returns to page 1 when the page size changes', async () => {
    const user = userEvent.setup();
    await renderSearch(
      '/?search=harbor&page=2&pageSize=5&sortBy=ID&sortByDir=ASC',
    );
    await screen.findByRole('button', { name: '2' });

    await user.selectOptions(
      screen.getByTestId('results-per-page-select'),
      '10',
    );

    await waitFor(() => {
      expect(queryString().get('page')).toBeNull();
      expect(queryString().get('pageSize')).toBe('10');
    });
  });

  test('keeps the previous rows visible while the next page loads', async () => {
    const user = userEvent.setup();
    deferLaterPages = true;
    await renderSearch('/?search=harbor');
    expect(
      await screen.findByRole('link', { name: 'Site ID 1001' }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: '2' }));

    expect(
      screen.getByRole('link', { name: 'Site ID 1001' }),
    ).toBeInTheDocument();
    expect(screen.queryByText('Searching')).not.toBeInTheDocument();

    pending[pending.length - 1]();

    await waitFor(() => {
      expect(
        screen.getByRole('link', { name: 'Site ID 2002' }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole('link', { name: 'Site ID 1001' }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('link', { name: 'Site ID 1001' }),
    ).not.toBeInTheDocument();
  });

  test('cancels the request a newer page replaces', async () => {
    const user = userEvent.setup();
    deferLaterPages = true;
    await renderSearch(
      '/?search=harbor&page=1&pageSize=5&sortBy=ID&sortByDir=ASC',
    );
    await screen.findByRole('link', { name: 'Site ID 1001' });

    await user.click(screen.getByRole('button', { name: '2' }));
    const pageTwo = searches.find((call) => call.variables?.page === 2);
    expect(pageTwo?.signal?.aborted).toBe(false);

    await user.click(screen.getByRole('button', { name: '3' }));

    await waitFor(() => {
      expect(pageTwo?.signal?.aborted).toBe(true);
    });
  });

  test('reports a failed search and does not show an empty table', async () => {
    await renderSearch('/?search=fail');

    expect(await screen.findByText('Search failed')).toBeInTheDocument();
    expect(screen.queryByText('No Results Found')).not.toBeInTheDocument();
  });

  test('shows an empty table when the search succeeds with no rows', async () => {
    await renderSearch('/?search=none');

    expect(await screen.findByText('No Results Found')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('keeps filters out of the address bar and still narrows the search', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'siteFilterPills',
      JSON.stringify([{ key: 'city', value: 'Victoria', label: 'City' }]),
    );
    await renderSearch('/?search=harbor');

    expect(await screen.findByText(/City : Victoria/)).toBeInTheDocument();
    await waitFor(() => {
      expect(searches.at(-1)?.variables?.filters).toEqual({ city: 'Victoria' });
    });
    expect(queryString().get('city')).toBeNull();
    expect(queryString().get('search')).toBe('harbor');

    await user.click(screen.getByText('Filters'));
    await user.type(
      screen.getByPlaceholderText('Separate IDs by a comma (",")'),
      '514',
    );
    await user.click(screen.getByTestId('Submit'));

    await waitFor(() => {
      expect(searches.at(-1)?.variables?.filters).toEqual({
        city: 'Victoria',
        id: '514',
      });
    });
    expect(queryString().get('id')).toBeNull();
    expect(queryString().get('page')).toBeNull();
  });

  test('selects one row and every row on the page', async () => {
    const user = userEvent.setup();
    await renderSearch('/?search=harbor');
    const checkboxes = await screen.findAllByLabelText('Select Row');
    await user.click(checkboxes[0]);
    expect(screen.getAllByLabelText('Select Row')[0]).toBeChecked();
    expect(screen.getAllByLabelText('Select Row')[1]).not.toBeChecked();

    await user.click(screen.getByLabelText('Select all rows on this page'));
    screen.getAllByLabelText('Select Row').forEach((checkbox) => {
      expect(checkbox).toBeChecked();
    });
  });

  test('exports the labels and values shown in the table', async () => {
    const user = userEvent.setup();
    if (typeof globalThis.URL.createObjectURL !== 'function') {
      Object.defineProperty(globalThis.URL, 'createObjectURL', {
        configurable: true,
        writable: true,
        value: () => 'blob:mock',
      });
    }
    if (typeof globalThis.URL.revokeObjectURL !== 'function') {
      Object.defineProperty(globalThis.URL, 'revokeObjectURL', {
        configurable: true,
        writable: true,
        value: () => {},
      });
    }
    const createObjectURL = jest
      .spyOn(globalThis.URL, 'createObjectURL')
      .mockReturnValue('blob:mock');
    jest.spyOn(globalThis.URL, 'revokeObjectURL').mockImplementation(() => {});

    await renderSearch('/?search=harbor');
    const checkboxes = await screen.findAllByLabelText('Select Row');
    await user.click(checkboxes[0]);
    expect(screen.getAllByLabelText('Select Row')[0]).toBeChecked();
    await user.click(
      screen.getByRole('button', { name: /Export Results As File/ }),
    );

    const blob = createObjectURL.mock.calls[0][0] as Blob;
    const csv = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error);
      reader.readAsText(blob);
    });
    expect(csv).toContain('Site ID');
    expect(csv).toContain('1001');
    expect(csv).toContain('City');
    expect(csv).toContain('Victoria');
    expect(csv).toContain('Site Address');
    expect(csv).toContain('1001 Harbour St');
    expect(csv).toContain('Map');
    expect(csv).toContain('Details');
    expect(csv).toContain('View');
    expect(csv).not.toContain('addrLine_1');
  });

  test('drops a hidden column for this visit and spans the columns still visible', async () => {
    const user = userEvent.setup();
    const view = await renderSearch('/?search=harbor');
    await screen.findByRole('columnheader', { name: 'City' });

    await user.click(screen.getByText('Columns'));
    await user.click(screen.getByRole('checkbox', { name: 'City' }));

    expect(
      screen.queryByRole('columnheader', { name: 'City' }),
    ).not.toBeInTheDocument();

    await user.clear(screen.getByLabelText('Search input'));
    await user.type(screen.getByLabelText('Search input'), 'none');

    expect(await screen.findByText('No Results Found')).toBeInTheDocument();
    expect(screen.getByText('No Results Found').closest('td')).toHaveAttribute(
      'colspan',
      '7',
    );

    view.unmount();
    await renderSearch('/?search=none');
    expect(
      await screen.findByRole('columnheader', { name: 'City' }),
    ).toBeInTheDocument();
  });
});
