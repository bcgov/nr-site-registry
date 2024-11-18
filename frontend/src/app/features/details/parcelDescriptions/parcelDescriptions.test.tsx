import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore, {
  MockStoreCreator,
  MockStoreEnhanced,
} from 'redux-mock-store';
import ParcelDescriptions from './parcelDescriptions';
import { RequestStatus } from '../../../helpers/requests/status';
import { IParcelDescriptionsState } from './parcelDescriptionsInterfaces';
import thunk from 'redux-thunk';
import { initialParcelDescriptionsState } from './parcelDescriptionsSlice';

type TestState = { parcelDescriptions: IParcelDescriptionsState };

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

describe('Parcel Descriptions Component', () => {
  let mockStore: MockStoreCreator<unknown, {}>;
  let store: MockStoreEnhanced<unknown, {}>;

  let siteId: number;
  let currentPage: number;
  let resultsPerPage: number;
  let totalResults: number;
  let testState: TestState;

  beforeEach(() => {
    mockStore = configureStore([thunk]);

    siteId = 1;
    currentPage = 1;
    resultsPerPage = 5;
    totalResults = 10;
    testState = {
      parcelDescriptions: {
        siteId: siteId,
        data: [
          {
            id: 11,
            descriptionType: 'Parcel ID',
            idPinNumber: '123456',
            dateNoted: '2023-06-15T00:00:00Z',
            landDescription: 'first land description',
          },
          {
            id: 12,
            descriptionType: 'Crown Land PIN',
            idPinNumber: '654321',
            dateNoted: '2023-06-16T00:00:00Z',
            landDescription: 'second land description',
          },
          {
            id: 13,
            descriptionType: 'Crown Land File Number',
            idPinNumber: 'ax213456',
            dateNoted: '2023-06-17T00:00:00Z',
            landDescription: 'third land description',
          },
          {
            id: 14,
            descriptionType: 'Parcel ID',
            idPinNumber: '789012',
            dateNoted: '2023-06-18T00:00:00Z',
            landDescription: 'fourth land description',
          },
          {
            id: 15,
            descriptionType: 'Crown Land PIN',
            idPinNumber: '210987',
            dateNoted: '2023-06-19T00:00:00Z',
            landDescription: 'fifth land description',
          },
        ],
        requestStatus: RequestStatus.idle,
        totalResults: totalResults,
        currentPage: currentPage,
        resultsPerPage: resultsPerPage,
        searchParam: '',
        sortBy: 'id',
        sortByDir: 'ASC',
        sortByInputValue: {},
        needsUpdate: false,
      },
    };

    store = mockStore(testState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Parcel Descriptions components', async () => {
    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const parcelDescriptionsComponent = screen.getByTestId(
      /^parcel-descriptions-component.*/,
    );
    expect(parcelDescriptionsComponent).toBeInTheDocument();
  });

  it('handles selecting the page.', () => {
    const newPage = 2;

    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const pageSelect = screen.getByTestId(/^pagination-control-select.*/);
    fireEvent.change(pageSelect, { target: { value: newPage } });
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              currentPage: newPage,
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  it('handles changing the results per page.', () => {
    const newResultsPerPage = 10;

    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const resultsPerPageSelect = screen.getByTestId(
      /^results-per-page-select.*/,
    );
    fireEvent.change(resultsPerPageSelect, {
      target: { value: newResultsPerPage },
    });
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              resultsPerPage: newResultsPerPage,
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  it('handles changing the search parameter.', () => {
    const newSearchParam = 'first';

    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const searchInput = screen.getByTestId(/^Search.*/);
    fireEvent.change(searchInput, { target: { value: newSearchParam } });
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              searchParam: newSearchParam,
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  it('handles changing the sort by input to new to old', () => {
    const newSortBy = 'newToOld';

    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const sortByInput = screen.getByTestId(/^Sort_By.*/);
    fireEvent.change(sortByInput, { target: { value: newSortBy } });
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              sortByInputValue: { sortBy: newSortBy },
              sortBy: 'date_noted',
              sortByDir: 'DESC',
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  it('handles changing the sort by input to old to new', () => {
    const newSortBy = 'oldTonew';

    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const sortByInput = screen.getByTestId(/^Sort_By.*/);
    fireEvent.change(sortByInput, { target: { value: newSortBy } });
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              sortByInputValue: { sortBy: newSortBy },
              sortBy: 'date_noted',
              sortByDir: 'ASC',
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  it('handles changing the sort by input to the default option', () => {
    const newSortBy = '';

    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const sortByInput = screen.getByTestId(/^Sort_By.*/);
    fireEvent.change(sortByInput, { target: { value: newSortBy } });
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              sortByInputValue: { sortBy: newSortBy },
              sortBy: 'id',
              sortByDir: 'ASC',
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  it('handles clicking on the description type table sort', () => {
    render(
      <Provider store={store}>
        <ParcelDescriptions />
      </Provider>,
    );

    const descriptionTypeSortButton = screen.getByTestId(
      /^descriptionType-table-sort.*/,
    );
    fireEvent.click(descriptionTypeSortButton);
    const actions = store.getActions();
    expect(actions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          type: 'parcelDescriptions/fetchParcelDescriptions/pending',
          meta: expect.objectContaining({
            arg: expect.objectContaining({
              sortBy: 'description_type',
              sortByDir: 'DESC',
              requestStatus: RequestStatus.loading,
              needsUpdate: true,
            }),
          }),
        }),
      ]),
    );
  });

  describe('when the site id has changed', () => {
    beforeEach(() => {
      siteId = 2;
      testState.parcelDescriptions.siteId = siteId;
    });

    it('resets the parcel descriptions state to its initial value', () => {
      const newSiteId = 1;

      render(
        <Provider store={store}>
          <ParcelDescriptions />
        </Provider>,
      );

      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/fetchParcelDescriptions/pending',
            meta: expect.objectContaining({
              arg: expect.objectContaining({
                ...initialParcelDescriptionsState,
                requestStatus: RequestStatus.loading,
                siteId: newSiteId,
              }),
            }),
          }),
        ]),
      );
    });
  });
});
