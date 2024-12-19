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

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

type TestState = { parcelDescriptions: IParcelDescriptionsState };

describe('Parcel Descriptions Component', () => {
  let mockStore: MockStoreCreator<unknown, {}>;
  let store: MockStoreEnhanced<unknown, {}>;
  let siteId: number;
  let currentPage: number;
  let resultsPerPage: number;
  let totalResults: number;
  let testState: TestState;

  const resetAllDataForSiteActionType =
    'parcelDescriptions/resetAllDataForSite';
  const fetchParcelDescriptionsActionType =
    'parcelDescriptions/fetchParcelDescriptions/pending';
  const updateCurrentPageActionType = 'parcelDescriptions/updateCurrentPage';
  const updateResultsPerPageActionType =
    'parcelDescriptions/updateResultsPerPage';
  const updateSearchParamActionType = 'parcelDescriptions/updateSearchParam';
  const updateSortByActionType = 'parcelDescriptions/updateSortBy';
  const updateSortByDirActionType = 'parcelDescriptions/updateSortByDir';
  const updateSortByInputValueActionType =
    'parcelDescriptions/updateSortByInputValue';

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
      },
    };
    store = mockStore(testState);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when initializing', () => {
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

    describe('when the site id has changed', () => {
      beforeEach(() => {
        siteId = 2;
        testState.parcelDescriptions.siteId = siteId;
      });

      it('resets the parcel descriptions state to its initial value.', () => {
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
              type: resetAllDataForSiteActionType,
              payload: newSiteId,
            }),
          ]),
        );
      });

      it('fetches new parcel descriptions.', () => {
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
              type: fetchParcelDescriptionsActionType,
              meta: expect.objectContaining({
                arg: expect.objectContaining({
                  siteId: newSiteId,
                  page: initialParcelDescriptionsState.currentPage,
                  pageSize: initialParcelDescriptionsState.resultsPerPage,
                  searchParam: initialParcelDescriptionsState.searchParam,
                  sortBy: initialParcelDescriptionsState.sortBy,
                  sortByDir: initialParcelDescriptionsState.sortByDir,
                }),
              }),
            }),
          ]),
        );
      });
    });
  });

  describe('when selecting the page', () => {
    const newPage = 2;

    it('updates the redux cache state.', () => {
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
            type: updateCurrentPageActionType,
            payload: newPage,
          }),
        ]),
      );
    });

    it('fetches new parcel descriptions.', () => {
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
            type: fetchParcelDescriptionsActionType,
            meta: expect.objectContaining({
              arg: expect.objectContaining({
                page: newPage,
              }),
            }),
          }),
        ]),
      );
    });
  });

  describe('when changing the results per page', () => {
    const newResultsPerPage = 10;

    it('updates the redux cache state.', () => {
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
            type: updateResultsPerPageActionType,
            payload: newResultsPerPage,
          }),
        ]),
      );
    });

    it('fetches new parcel descriptions.', () => {
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
            type: fetchParcelDescriptionsActionType,
            meta: expect.objectContaining({
              arg: expect.objectContaining({
                pageSize: newResultsPerPage,
              }),
            }),
          }),
        ]),
      );
    });
  });

  describe('when changing the search parameter', () => {
    describe('when typing in a new search param', () => {
      const newSearchParam = 'first';

      it('updates the redux cache state', () => {
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
              type: updateSearchParamActionType,
              payload: newSearchParam,
            }),
          ]),
        );
      });

      it('fetches new parcel descriptions', () => {
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
              type: fetchParcelDescriptionsActionType,
              meta: expect.objectContaining({
                arg: expect.objectContaining({
                  searchParam: newSearchParam,
                }),
              }),
            }),
          ]),
        );
      });
    });
  });

  describe('when changing the sort by input', () => {
    describe('when selecting new to old', () => {
      const newSortBy = 'date_noted';
      const newSortByDir = 'DESC';
      const newSortByInputValue = 'newToOld';

      it('updates the redux cache state.', () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        const sortByInput = screen.getByTestId(/^Sort_By.*/);
        fireEvent.change(sortByInput, {
          target: { value: newSortByInputValue },
        });

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: updateSortByActionType,
              payload: newSortBy,
            }),
            expect.objectContaining({
              type: updateSortByDirActionType,
              payload: newSortByDir,
            }),
            expect.objectContaining({
              type: updateSortByInputValueActionType,
              payload: { sortBy: newSortByInputValue },
            }),
          ]),
        );
      });

      it('fetches new parcel descriptions.', () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        const sortByInput = screen.getByTestId(/^Sort_By.*/);
        fireEvent.change(sortByInput, {
          target: { value: newSortByInputValue },
        });

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: fetchParcelDescriptionsActionType,
              meta: expect.objectContaining({
                arg: expect.objectContaining({
                  sortBy: newSortBy,
                  sortByDir: newSortByDir,
                }),
              }),
            }),
          ]),
        );
      });
    });

    describe('when selecting old to new', () => {
      const newSortBy = 'date_noted';
      const newSortByDir = 'ASC';
      const newSortByInputValue = 'oldTonew';

      it('updates the redux cache state.', () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        const sortByInput = screen.getByTestId(/^Sort_By.*/);
        fireEvent.change(sortByInput, {
          target: { value: newSortByInputValue },
        });

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: updateSortByActionType,
              payload: newSortBy,
            }),
            expect.objectContaining({
              type: updateSortByDirActionType,
              payload: newSortByDir,
            }),
            expect.objectContaining({
              type: updateSortByInputValueActionType,
              payload: { sortBy: newSortByInputValue },
            }),
          ]),
        );
      });

      it('fetches new parcel descriptions.', () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        const sortByInput = screen.getByTestId(/^Sort_By.*/);
        fireEvent.change(sortByInput, {
          target: { value: newSortByInputValue },
        });

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: fetchParcelDescriptionsActionType,
              meta: expect.objectContaining({
                arg: expect.objectContaining({
                  sortBy: newSortBy,
                  sortByDir: newSortByDir,
                }),
              }),
            }),
          ]),
        );
      });
    });

    describe('when selecting the default option', () => {
      const newSortBy = 'id';
      const newSortByDir = 'ASC';
      const newSortByInputValue = '';

      it('updates the redux cache.', () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        const sortByInput = screen.getByTestId(/^Sort_By.*/);
        fireEvent.change(sortByInput, {
          target: { value: newSortByInputValue },
        });

        const actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: updateSortByActionType,
              payload: newSortBy,
            }),
            expect.objectContaining({
              type: updateSortByDirActionType,
              payload: newSortByDir,
            }),
            expect.objectContaining({
              type: updateSortByInputValueActionType,
              payload: { sortBy: newSortByInputValue },
            }),
          ]),
        );
      });

      it('fetches new parcel descriptions.', () => {
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
              type: fetchParcelDescriptionsActionType,
              meta: expect.objectContaining({
                arg: expect.objectContaining({
                  sortBy: newSortBy,
                  sortByDir: newSortByDir,
                }),
              }),
            }),
          ]),
        );
      });
    });
  });

  describe('when clicking the description type table sort', () => {
    const newSortBy = 'description_type';
    const newSortByDir = 'DESC';

    it('updates the redux cache state.', () => {
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
            type: 'parcelDescriptions/updateSortBy',
            payload: newSortBy,
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/updateSortByDir',
            payload: newSortByDir,
          }),
        ]),
      );
    });

    it('fetches new parcel descriptions.', () => {
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
            type: fetchParcelDescriptionsActionType,
            meta: expect.objectContaining({
              arg: expect.objectContaining({
                sortBy: newSortBy,
                sortByDir: newSortByDir,
              }),
            }),
          }),
        ]),
      );
    });
  });
});
