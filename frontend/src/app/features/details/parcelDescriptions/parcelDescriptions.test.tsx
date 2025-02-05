import { fireEvent, render, screen, within } from '@testing-library/react';
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
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { ParcelDescriptionType } from './parcelDescriptionsConfig';

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useParams: () => ({ id: '1' }),
}));

type TestState = {
  sites: { siteDetailsMode: string };
  siteDetails: { saveRequestStatus: RequestStatus };
  parcelDescriptions: IParcelDescriptionsState;
};

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
      sites: {
        siteDetailsMode: SiteDetailsMode.ViewOnlyMode,
      },
      siteDetails: {
        saveRequestStatus: RequestStatus.idle,
      },
      parcelDescriptions: {
        siteId: siteId,
        data: [
          {
            id: '11',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '123456789',
            dateNoted: '2023-06-15T00:00:00',
            landDescription: 'first land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '12',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '987654321',
            dateNoted: '2023-06-16T00:00:00',
            landDescription: 'second land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '13',
            descriptionType: ParcelDescriptionType.CrownLandFileNumber,
            idPinNumber: 'ax12345',
            dateNoted: '2023-06-17T00:00:00',
            landDescription: 'third land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '14',
            descriptionType: ParcelDescriptionType.ParcelID,
            idPinNumber: '789012345',
            dateNoted: '2023-06-18T00:00:00',
            landDescription: 'fourth land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '15',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '4321098765',
            dateNoted: '2023-06-19T00:00:00',
            landDescription: 'fifth land description',
            srAction: '',
            userAction: '',
            srValue: false,
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
        updatedRows: [],
        mergedRows: [
          {
            id: '11',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '123456789',
            dateNoted: '2023-06-15T00:00:00',
            landDescription: 'first land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '12',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '987654321',
            dateNoted: '2023-06-16T00:00:00',
            landDescription: 'second land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '13',
            descriptionType: ParcelDescriptionType.CrownLandFileNumber,
            idPinNumber: 'ax12345',
            dateNoted: '2023-06-17T00:00:00',
            landDescription: 'third land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '14',
            descriptionType: ParcelDescriptionType.ParcelID,
            idPinNumber: '789012345',
            dateNoted: '2023-06-18T00:00:00',
            landDescription: 'fourth land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
          {
            id: '15',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '4321098765',
            dateNoted: '2023-06-19T00:00:00',
            landDescription: 'fifth land description',
            srAction: '',
            userAction: '',
            srValue: false,
          },
        ],
        addedRows: [],
        deletedRows: [],
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
        'parcel-descriptions-component',
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

  describe('when editing', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      testState.sites.siteDetailsMode = SiteDetailsMode.EditMode;
      store = mockStore(testState);
    });

    afterEach(() => {
      jest.runOnlyPendingTimers();
      jest.useRealTimers();
    });

    describe('when editing the description type', () => {
      describe('when selecting Crown Land File Number', () => {
        it('truncates the value in id/pin/number', async () => {
          render(
            <Provider store={store}>
              <ParcelDescriptions />
            </Provider>,
          );

          const descriptionTypeInputs =
            await screen.findAllByDisplayValue('Crown Land PIN');

          fireEvent.change(descriptionTypeInputs[0], {
            target: { value: 'Crown Land File Number' },
          });

          let actions = store.getActions();
          expect(actions).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'parcelDescriptions/updateUpdatedRows',
                payload: expect.arrayContaining([
                  expect.objectContaining({
                    idPinNumber: '1234567',
                  }),
                ]),
              }),
            ]),
          );
        });
      });
    });

    describe('when editing the id/pin/number', () => {
      describe('when entering an id/pin/number that is too long', () => {
        describe('and the row is a crown land PIN or parcel ID', () => {
          it('does not update the input value', async () => {
            render(
              <Provider store={store}>
                <ParcelDescriptions />
              </Provider>,
            );

            // The first row is a crown land PIN
            const idPinNumberInput = screen.getByDisplayValue('123456789');

            fireEvent.change(idPinNumberInput, {
              target: { value: '1234567890' },
            });

            // This is a crown land PIN, so the tenth digit should be disregarded.
            expect(
              await screen.findByDisplayValue('123456789'),
            ).toBeInTheDocument();
            expect(
              screen.queryByDisplayValue('1234567890'),
            ).not.toBeInTheDocument();
          });
        });

        describe('and the row is a crown land File Number', () => {
          it('does not update the input value', async () => {
            render(
              <Provider store={store}>
                <ParcelDescriptions />
              </Provider>,
            );

            // The third row is a crown land file number.
            const idPinNumberInput = screen.getByDisplayValue('ax12345');

            fireEvent.change(idPinNumberInput, {
              target: { value: 'ax123456' },
            });

            // This is a crown land PIN, so the tenth digit should be disregarded.
            expect(
              await screen.findByDisplayValue('ax12345'),
            ).toBeInTheDocument();
            expect(
              screen.queryByDisplayValue('ax123456'),
            ).not.toBeInTheDocument();
          });
        });
      });
    });
  });
});
