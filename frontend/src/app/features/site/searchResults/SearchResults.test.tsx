import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SearchResults from './SearchResults';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore, { MockStoreEnhanced } from 'redux-mock-store';
import { RequestStatus } from '../../../helpers/requests/status';
import { getSiteSearchResultsColumns } from '../dto/Columns';

const mockStore = configureStore([]);

interface SiteData {
  siteId: number;
  id: string;
  addrLine_1: string;
  addrLine_2: string;
  addrLine_3: string;
  city: string;
  provState: string;
  whenCreated: string;
}

describe('SearchResults Component', () => {
  let store: MockStoreEnhanced<unknown, {}>;

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
    const emptyData: SiteData[] = [];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={emptyData}
            pageChange={() => {}}
            columns={[]}
            totalRecords={0}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    const noResultsText = screen.getByText('No Results Found');
    expect(noResultsText).toBeInTheDocument();
  });

  test('renders table rows with data', () => {
    const mockData: SiteData[] = [
      {
        siteId: 1,
        id: 'site1',
        addrLine_1: '123 Main St',
        addrLine_2: '',
        addrLine_3: '',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={mockData}
            pageChange={jest.fn}
            columns={getSiteSearchResultsColumns()}
            totalRecords={1}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    const siteIdLink = screen.getByText('View');
    expect(siteIdLink).toBeInTheDocument();
  });

  test('checkbox selects row when clicked', async () => {
    const mockData: SiteData[] = [
      {
        siteId: 1,
        id: 'site1',
        addrLine_1: '123 Main St',
        addrLine_2: '',
        addrLine_3: '',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={mockData}
            columns={getSiteSearchResultsColumns()}
            pageChange={jest.fn}
            totalRecords={1}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    const checkbox = screen.getByLabelText('Select Row');
    expect(checkbox).toBeInTheDocument();
    await userEvent.click(checkbox);
    expect(checkbox).toBeChecked();
  });

  test('renders with no columns provided', () => {
    const mockData: SiteData[] = [
      {
        siteId: 1,
        id: 'site1',
        addrLine_1: '123 Main St',
        addrLine_2: '',
        addrLine_3: '',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={mockData}
            columns={[]}
            pageChange={jest.fn}
            totalRecords={1}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    const siteIdLink = screen.queryByText('View');
    expect(siteIdLink).not.toBeInTheDocument(); // No columns, so "View" shouldn't show
  });

  test('triggers pageChange when currentPage or resultsPerPage changes', () => {
    const pageChangeMock = jest.fn();

    const mockData: SiteData[] = [
      {
        siteId: 1,
        id: 'site1',
        addrLine_1: '123 Main St',
        addrLine_2: '',
        addrLine_3: '',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={mockData}
            columns={getSiteSearchResultsColumns()}
            pageChange={pageChangeMock}
            totalRecords={1}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(pageChangeMock).toHaveBeenCalledWith(1, 5); // default values
  });

  test('handles large number of records and pagination works', () => {
    const data: SiteData[] = Array.from({ length: 10 }, (_, index) => ({
      siteId: index + 1,
      id: `site${index + 1}`,
      addrLine_1: `Address ${index + 1}`,
      addrLine_2: '',
      addrLine_3: '',
      city: 'Cityville',
      provState: 'State',
      whenCreated: '2024-04-04',
    }));

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={data}
            columns={getSiteSearchResultsColumns()}
            pageChange={jest.fn}
            totalRecords={50}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('Address 1')).toBeInTheDocument();
  });

  test('triggers changeHandler when a row checkbox is clicked', async () => {
    const changeHandlerMock = jest.fn();

    const data: SiteData[] = [
      {
        siteId: 1,
        id: 'site1',
        addrLine_1: '123 Main St',
        addrLine_2: '',
        addrLine_3: '',
        city: 'Cityville',
        provState: 'State',
        whenCreated: '2024-04-04',
      },
    ];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={data}
            columns={getSiteSearchResultsColumns()}
            pageChange={jest.fn}
            totalRecords={1}
            changeHandler={changeHandlerMock}
          />
        </MemoryRouter>
      </Provider>,
    );

    const checkbox = screen.getByLabelText('Select Row');
    await userEvent.click(checkbox);
    expect(changeHandlerMock).toHaveBeenCalled();
  });

  test('renders correctly with minimal props and empty state', () => {
    const data: SiteData[] = [];

    render(
      <Provider store={store}>
        <MemoryRouter>
          <SearchResults
            data={data}
            columns={[]}
            pageChange={jest.fn}
            totalRecords={0}
            changeHandler={jest.fn}
          />
        </MemoryRouter>
      </Provider>,
    );

    expect(screen.getByText('No Results Found')).toBeInTheDocument();
  });
});
