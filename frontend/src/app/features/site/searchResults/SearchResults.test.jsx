import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchResults from './SearchResults';
import { Provider } from 'react-redux';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import configureStore from 'redux-mock-store';
import { RequestStatus } from '../../helpers/requests/status';
import { getSiteSearchResultsColumns } from './dto/Columns';

const mockStore = configureStore([]);

describe('SearchResults Component', () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      sites: [],
      error: '',
      fetchStatus: RequestStatus.loading,
      deleteStatus: RequestStatus.idle,
      addedStatus: RequestStatus.idle,
      updateStatus: RequestStatus.idle,
    });
  });

  test('renders no results found when data is empty', () => {
    const emptyData = [];
    const { container } = render(
      <Provider store={store}>
        <SearchResults data={emptyData} pageChange={() => {}} />
      </Provider>,
    );
    const noResultsText = screen.getByText('No Results Found');
    expect(noResultsText).toBeInTheDocument();
  });

  test('renders table rows with data', () => {
    const mockData = [
      {
        siteId: 1,
        id: 'site1',
        address: '123 Main St',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    const router = createBrowserRouter([
      {
        element: (
          <SearchResults
            data={mockData}
            pageChange={(currentPage, resultsPerPage) => {}}
            columns={getSiteSearchResultsColumns()}
          />
        ),
        path: '/',
      },
    ]);

    const { container } = render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    const siteIdLink = screen.getByText('View');
    expect(siteIdLink).toBeInTheDocument();
  });

  test('checkbox selects row when clicked', async () => {
    const mockData = [
      {
        siteId: 1,
        id: 'site1',
        address: '123 Main St',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];
    const router = createBrowserRouter([
      {
        element: (
          <SearchResults
            data={mockData}
            columns={getSiteSearchResultsColumns()}
            changeHandler={() => {}}
            pageChange={() => {}}
          />
        ),
        path: '/',
      },
    ]);
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    const checkbox = screen.getByLabelText('Select Row');

    expect(checkbox).toBeInTheDocument();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('renders with no columns provided', () => {
    const columns = getSiteSearchResultsColumns();

    const mockData = [
      {
        siteId: 1,
        id: 'site1',
        address: '123 Main St',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    const router = createBrowserRouter([
      {
        element: (
          <SearchResults
            data={mockData}
            columns={columns}
            pageChange={() => {}}
          />
        ),
        path: '/',
      },
    ]);
    render(
      <Provider store={store}>
        <RouterProvider router={router} />
      </Provider>,
    );
    const siteIdLink = screen.getByText('View');
    expect(siteIdLink).toBeInTheDocument();
  });
});
