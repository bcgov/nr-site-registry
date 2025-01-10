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
import { SiteDetailsMode } from '../dto/SiteDetailsMode';
import { ParcelDescriptionType } from './parcelDescriptionsConfig';
import { IChangeType } from '../../../components/common/IChangeType';
import { act } from '@testing-library/react';

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
          },
          {
            id: '12',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '987654321',
            dateNoted: '2023-06-16T00:00:00',
            landDescription: 'second land description',
            srAction: '',
            userAction: '',
          },
          {
            id: '13',
            descriptionType: ParcelDescriptionType.CrownLandFileNumber,
            idPinNumber: 'ax12345',
            dateNoted: '2023-06-17T00:00:00',
            landDescription: 'third land description',
            srAction: '',
            userAction: '',
          },
          {
            id: '14',
            descriptionType: ParcelDescriptionType.ParcelID,
            idPinNumber: '789012345',
            dateNoted: '2023-06-18T00:00:00',
            landDescription: 'fourth land description',
            srAction: '',
            userAction: '',
          },
          {
            id: '15',
            descriptionType: ParcelDescriptionType.CrownLandPIN,
            idPinNumber: '4321098765',
            dateNoted: '2023-06-19T00:00:00',
            landDescription: 'fifth land description',
            srAction: '',
            userAction: '',
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
      it('sets up the parcel description for saving, and tracks the action', async () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        // The first row on the table.
        const descriptionTypeInputs =
          await screen.findAllByDisplayValue('Crown Land PIN');

        fireEvent.change(descriptionTypeInputs[0], {
          target: { value: 'Crown Land File Number' },
        });

        jest.runAllTimers();

        let actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'siteDetails/setupParcelDescriptionsDataForSaving',
              payload: expect.arrayContaining([
                expect.objectContaining({
                  descriptionType: 'Crown Land File Number',
                  apiAction: 'updated',
                }),
              ]),
            }),
            expect.objectContaining({
              type: 'sites/trackChanges',
              payload: expect.objectContaining({
                changeType: IChangeType.Modified,
                label: 'Parcel Descriptions: 11',
              }),
            }),
          ]),
        );
      });

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

          // the first id/pin/number should have been truncated from 123456789 to 1234567.
          expect(
            await screen.findByDisplayValue('1234567'),
          ).toBeInTheDocument();
          expect(
            screen.queryByDisplayValue('123456789'),
          ).not.toBeInTheDocument();
        });
      });
    });

    describe('when editing the id/pin/number', () => {
      it('sets up the parcel description for saving, and tracks the action', () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions />
          </Provider>,
        );

        const descriptionTypeInput = screen.getByDisplayValue('123456789');

        fireEvent.change(descriptionTypeInput, {
          target: { value: '192837465' },
        });

        jest.runAllTimers();

        let actions = store.getActions();
        expect(actions).toEqual(
          expect.arrayContaining([
            expect.objectContaining({
              type: 'siteDetails/setupParcelDescriptionsDataForSaving',
              payload: expect.arrayContaining([
                expect.objectContaining({
                  idPinNumber: '192837465',
                  apiAction: 'updated',
                }),
              ]),
            }),
            expect.objectContaining({
              type: 'sites/trackChanges',
              payload: expect.objectContaining({
                changeType: IChangeType.Modified,
                label: 'Parcel Descriptions: 11',
              }),
            }),
          ]),
        );
      });

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

    describe('when editing the date noted', () => {
      const originalConsoleError = console.error;

      beforeAll(() => {
        console.error = (msg: any) => {
          // Suppress react printing an error about wrapping updates in act(...)
          // this is an issue caused by rsuite's date picker component
          // performing updates asynchronously. I have thoroughly tested that
          // everything works as expected during these tests.
          if (
            !msg.toString().includes('inside a test was not wrapped in act')
          ) {
            originalConsoleError(msg);
          }
        };
      });

      afterAll(() => {
        console.error = originalConsoleError;
      });

      describe('when inputting a new date', () => {
        it('sets up the parcel description for saving, and tracks the action', async () => {
          await act(async () => {
            render(
              <Provider store={store}>
                <ParcelDescriptions />
              </Provider>,
            );
          });

          // Get the first date picker input (Jun 15, 2023).
          let dateNotedInput = screen.getByDisplayValue('Jun 15, 2023');
          await act(async () => {
            fireEvent.click(dateNotedInput);
          });
          let targetDate = screen.getByText('11');
          await act(async () => {
            // Click on Jun 11, 2023
            fireEvent.click(targetDate);
          });

          let actions = store.getActions();
          expect(actions).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'siteDetails/setupParcelDescriptionsDataForSaving',
                payload: expect.arrayContaining([
                  expect.objectContaining({
                    // Match only the date without the timezone. This is necessary
                    // because the timezone will necessarily be in the test
                    // environment's timezone which will be different in our
                    // development and CI environments.
                    dateNoted: expect.stringMatching(/^2023-06-11.*$/),
                    apiAction: 'updated',
                  }),
                ]),
              }),
              expect.objectContaining({
                type: 'sites/trackChanges',
                payload: expect.objectContaining({
                  changeType: IChangeType.Modified,
                  label: expect.stringMatching(/^Parcel Descriptions: 11$/),
                }),
              }),
            ]),
          );
        });
      });

      describe('when clearing the date', () => {
        it('sets up the parcel description for saving, and tracks the action', async () => {
          await act(async () => {
            render(
              <Provider store={store}>
                <ParcelDescriptions />
              </Provider>,
            );
          });

          // Get the first (Parcel Description 11) date clear button.
          let clearButton = screen.getAllByLabelText('Clear')[0];
          await act(async () => {
            fireEvent.click(clearButton);
          });

          let actions = store.getActions();
          expect(actions).toEqual(
            expect.arrayContaining([
              expect.objectContaining({
                type: 'siteDetails/setupParcelDescriptionsDataForSaving',
                payload: expect.arrayContaining([
                  expect.objectContaining({
                    dateNoted: expect.stringMatching(/^$/),
                    apiAction: 'updated',
                  }),
                ]),
              }),
              expect.objectContaining({
                type: 'sites/trackChanges',
                payload: expect.objectContaining({
                  changeType: IChangeType.Modified,
                  label: expect.stringMatching(/^Parcel Descriptions: 11$/),
                }),
              }),
            ]),
          );
        });
      });
    });
  });
});
