import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import Search from './Search';
import { renderSearchScreen } from './renderSearchScreen';
import { GRAPHQL } from '../../helpers/endpoints';
import * as utility from '../../helpers/utility';

jest.mock('react-oidc-context', () => ({
  useAuth: jest.fn().mockReturnValue({ isAuthenticated: false }),
}));

function renderSearch(initialEntry = '/') {
  return renderSearchScreen(<Search />, initialEntry);
}

describe('Search', () => {
  let mock: MockAdapter;
  let searchParams: string[];

  beforeEach(() => {
    localStorage.clear();
    searchParams = [];
    jest.spyOn(utility, 'getAxiosInstance').mockReturnValue(axios);
    mock = new MockAdapter(axios);
    mock.onPost(GRAPHQL).reply((config) => {
      const body =
        typeof config.data === 'string' ? JSON.parse(config.data) : config.data;
      if (body.operationName === 'searchSites') {
        searchParams.push(body.variables?.searchParam ?? '');
        return [
          200,
          {
            data: {
              searchSites: {
                sites: [{ id: '1', city: 'Victoria', addrLine_1: '1 Main' }],
                count: 1,
                page: 1,
                pageSize: 5,
              },
            },
          },
        ];
      }
      return [200, { data: {} }];
    });
  });

  afterEach(() => {
    mock.restore();
    jest.restoreAllMocks();
  });

  test('renders the search input and the introduction before a search', () => {
    renderSearch();

    expect(
      screen.getByPlaceholderText('Search for site address or name or pid'),
    ).toBeInTheDocument();
    expect(screen.getByTestId('intro')).toBeInTheDocument();
  });

  test('searches once the text is at least three characters', async () => {
    const user = userEvent.setup();
    renderSearch();

    await user.type(
      screen.getByPlaceholderText('Search for site address or name or pid'),
      'ab',
    );
    await new Promise((resolve) => setTimeout(resolve, 400));
    expect(searchParams).toEqual([]);

    await user.type(
      screen.getByPlaceholderText('Search for site address or name or pid'),
      'c',
    );

    await waitFor(() => {
      expect(searchParams).toContain('abc');
      expect(
        screen.getByRole('link', { name: 'Site ID 1' }),
      ).toBeInTheDocument();
    });
  });

  test('clears the search and returns to the introduction', async () => {
    const user = userEvent.setup();
    renderSearch('/?search=harbor');
    await screen.findByRole('link', { name: 'Site ID 1' });

    await user.click(screen.getByLabelText('Clear search'));

    expect(
      screen.getByPlaceholderText('Search for site address or name or pid'),
    ).toHaveValue('');
    expect(screen.getByTestId('intro')).toBeInTheDocument();
  });

  test('restores filter pills for this search and removes one', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'siteFilterPills',
      JSON.stringify([
        { key: 'city', value: 'Victoria', label: 'City' },
        { key: 'id', value: '514', label: 'Site ID' },
      ]),
    );
    renderSearch('/?search=harbor');

    expect(await screen.findByText(/City : Victoria/)).toBeInTheDocument();
    expect(screen.getByText(/Site ID : 514/)).toBeInTheDocument();

    await user.click(screen.getByTestId('remove-filter-city'));

    await waitFor(() => {
      expect(screen.queryByText(/City : Victoria/)).not.toBeInTheDocument();
    });
    expect(screen.getByText(/Site ID : 514/)).toBeInTheDocument();
    const stored = JSON.parse(localStorage.getItem('siteFilterPills') || '[]');
    expect(stored.map((filter: { key: string }) => filter.key)).toEqual(['id']);
  });

  test('resets filters from the filter panel', async () => {
    const user = userEvent.setup();
    localStorage.setItem(
      'siteFilterPills',
      JSON.stringify([{ key: 'city', value: 'Victoria', label: 'City' }]),
    );
    renderSearch('/?search=harbor');
    await screen.findByText(/City : Victoria/);

    await user.click(screen.getByText('Filters'));
    await user.click(screen.getByTestId('Reset Filters'));

    await waitFor(() => {
      expect(screen.queryByText(/City : Victoria/)).not.toBeInTheDocument();
    });
    expect(localStorage.getItem('siteFilterPills')).toBeNull();
  });

  test('does not apply an empty filter form', async () => {
    const user = userEvent.setup();
    renderSearch('/?search=harbor');
    await screen.findByRole('link', { name: 'Site ID 1' });

    await user.click(screen.getByText('Filters'));
    expect(screen.getByTestId('Submit')).toBeDisabled();
    await user.click(screen.getByText('Filters'));
    expect(screen.queryByTestId('form')).not.toBeInTheDocument();
  });

  test('hides a column until the visit ends and can reset the columns', async () => {
    const user = userEvent.setup();
    const view = renderSearch('/?search=harbor');
    await screen.findByRole('columnheader', { name: 'City' });

    await user.click(screen.getByText('Columns'));
    await user.click(screen.getByRole('checkbox', { name: 'City' }));
    expect(
      screen.queryByRole('columnheader', { name: 'City' }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reset Columns/i }));
    expect(
      screen.getByRole('columnheader', { name: 'City' }),
    ).toBeInTheDocument();

    view.unmount();
    renderSearch('/?search=harbor');
    expect(
      await screen.findByRole('columnheader', { name: 'City' }),
    ).toBeInTheDocument();
  });
});
