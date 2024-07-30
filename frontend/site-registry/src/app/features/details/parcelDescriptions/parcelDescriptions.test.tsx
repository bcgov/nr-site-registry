import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore, {
  MockStoreCreator,
  MockStoreEnhanced,
} from 'redux-mock-store';
import ParcelDescriptions from './parcelDescriptions';
import { RequestStatus } from '../../../helpers/requests/status';
import { IParcelDescriptionState } from './parcelDescriptionsSlice';
import { act } from 'react';
import { getParcelDescriptions } from './getParcelDescriptions';
import {
  IParcelDescriptionDto,
  IParcelDescriptionResponseDto,
} from './parcelDescriptionDto';

jest.mock('./getParcelDescriptions');
const mockedGetParcelDescriptions = jest.mocked(getParcelDescriptions);

describe('Parcel Descriptions Component', () => {
  const mockStore: MockStoreCreator<unknown, {}> = configureStore([]);

  let store: MockStoreEnhanced<unknown, {}>;
  let siteId = 1;
  let currentPage = 1;
  let resultsPerPage = 5;
  let totalResults = 10;
  let getParcelDescriptionsReturnValue = {
    page: 2,
    pageSize: 5,
    count: 10,
    data: [
      {
        id: 16,
        descriptionType: 'Parcel ID',
        idPinNumber: '123456',
        dateNoted: 'May 26th, 2023',
        landDescription: 'sixth land description',
      },
      {
        id: 17,
        descriptionType: 'Crown Land PIN',
        idPinNumber: '654321',
        dateNoted: 'May 25th, 2023',
        landDescription: 'seventh land description',
      },
      {
        id: 18,
        descriptionType: 'Crown Land File Number',
        idPinNumber: 'ax213456',
        dateNoted: 'May 24th, 2023',
        landDescription: 'eigth land description',
      },
      {
        id: 19,
        descriptionType: 'Parcel ID',
        idPinNumber: '789012',
        dateNoted: 'May 23rd, 2023',
        landDescription: 'ninth land description',
      },
      {
        id: 20,
        descriptionType: 'Crown Land PIN',
        idPinNumber: '210987',
        dateNoted: 'May 22nd, 2023',
        landDescription: 'tenth land description',
      },
    ] as IParcelDescriptionDto[],
  } as IParcelDescriptionResponseDto;

  type TestState = { parcelDescriptions: IParcelDescriptionState };
  let testState: TestState = {
    parcelDescriptions: {
      siteId: siteId,
      data: [
        {
          id: 11,
          descriptionType: 'Parcel ID',
          idPinNumber: '123456',
          dateNoted: 'June 26th, 2023',
          landDescription: 'first land description',
        },
        {
          id: 12,
          descriptionType: 'Crown Land PIN',
          idPinNumber: '654321',
          dateNoted: 'June 25th, 2023',
          landDescription: 'second land description',
        },
        {
          id: 13,
          descriptionType: 'Crown Land File Number',
          idPinNumber: 'ax213456',
          dateNoted: 'June 24th, 2023',
          landDescription: 'third land description',
        },
        {
          id: 14,
          descriptionType: 'Parcel ID',
          idPinNumber: '789012',
          dateNoted: 'June 23rd, 2023',
          landDescription: 'fourth land description',
        },
        {
          id: 15,
          descriptionType: 'Crown Land PIN',
          idPinNumber: '210987',
          dateNoted: 'June 22nd, 2023',
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

  beforeEach(() => {
    store = mockStore(testState);
    mockedGetParcelDescriptions.mockResolvedValue(
      getParcelDescriptionsReturnValue,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('renders the Parcel Descriptions components', async () => {
    render(
      <Provider store={store}>
        <ParcelDescriptions siteId={siteId} />
      </Provider>,
    );

    const parcelDescriptionsComponent = screen.getByTestId(
      'parcel-descriptions-component',
    );
    expect(parcelDescriptionsComponent).toBeInTheDocument();
  });

  describe('when rendering for a new site', () => {
    let siteId = 2;

    it("updates the site id to the loaded site's id", async () => {
      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/resetStateForNewSiteId',
            payload: siteId,
          }),
        ]),
      );
    });
  });

  describe('when rendering for the same site', () => {
    it("updates the site id to the loaded site's id", async () => {
      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const actions = store.getActions();
      expect(actions).not.toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/resetStateForNewSiteId',
            payload: siteId,
          }),
        ]),
      );
    });

    it('handles selecting the page.', () => {
      const newPage = 2;

      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const pageSelect = screen.getByTestId('pagination-control-select');
      fireEvent.change(pageSelect, { target: { value: newPage } });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setCurrentPage',
            payload: newPage,
          }),
        ]),
      );
    });

    it('handles changing the results per page.', () => {
      const newResultsPerPage = 10;

      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const resultsPerPageSelect = screen.getByTestId(
        'results-per-page-select',
      );
      fireEvent.change(resultsPerPageSelect, {
        target: { value: newResultsPerPage },
      });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setResultsPerPage',
            payload: newResultsPerPage,
          }),
        ]),
      );
    });

    it('handles changing the search parameter.', () => {
      const newSearchParam = 'first';

      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const searchInput = screen.getByTestId('Search');
      fireEvent.change(searchInput, { target: { value: newSearchParam } });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSearchParam',
            payload: newSearchParam,
          }),
        ]),
      );
    });

    it('handles changing the sort by input to new to old', () => {
      const newSortBy = 'newToOld';

      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const sortByInput = screen.getByTestId('Sort_By');
      fireEvent.change(sortByInput, { target: { value: newSortBy } });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByInputValue',
            payload: { sortBy: newSortBy },
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortBy',
            payload: 'date_noted',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByDir',
            payload: 'DESC',
          }),
        ]),
      );
    });

    it('handles changing the sort by input to old to new', () => {
      const newSortBy = 'oldTonew';

      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const sortByInput = screen.getByTestId('Sort_By');
      fireEvent.change(sortByInput, { target: { value: newSortBy } });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByInputValue',
            payload: { sortBy: newSortBy },
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortBy',
            payload: 'date_noted',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByDir',
            payload: 'ASC',
          }),
        ]),
      );
    });

    it('handles changing the sort by input to the default option', () => {
      const newSortBy = '';

      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const sortByInput = screen.getByTestId('Sort_By');
      fireEvent.change(sortByInput, { target: { value: newSortBy } });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByInputValue',
            payload: { sortBy: newSortBy },
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortBy',
            payload: 'id',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByDir',
            payload: 'ASC',
          }),
        ]),
      );
    });

    it('handles clicking on the description type table sort', () => {
      render(
        <Provider store={store}>
          <ParcelDescriptions siteId={siteId} />
        </Provider>,
      );

      const descriptionTypeSortButton = screen.getByTestId(
        'descriptionType-table-sort',
      );
      fireEvent.click(descriptionTypeSortButton);
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'pending',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortBy',
            payload: 'description_type',
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setSortByDir',
            payload: 'DESC',
          }),
        ]),
      );
    });

    it('handles loading new data', async () => {
      await act(async () => {
        render(
          <Provider store={store}>
            <ParcelDescriptions siteId={siteId} />
          </Provider>,
        );
      });
      await waitFor(() => {
        expect(mockedGetParcelDescriptions).toHaveBeenCalled();
      });
      const actions = store.getActions();
      expect(actions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            type: 'parcelDescriptions/setData',
            payload: getParcelDescriptionsReturnValue.data,
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setTotalResults',
            payload: getParcelDescriptionsReturnValue.count,
          }),
          expect.objectContaining({
            type: 'parcelDescriptions/setRequestStatus',
            payload: 'idle',
          }),
        ]),
      );
    });
  });
});
