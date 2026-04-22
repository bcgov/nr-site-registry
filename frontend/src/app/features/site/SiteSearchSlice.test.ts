import siteSearchReducer, { fetchSearchSites } from './SiteSearchSlice';
import { RequestStatus } from '../../helpers/requests/status';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { GRAPHQL } from '../../helpers/endpoints';
import { SiteSortBy, SortByDirection } from '../../../graphql/generated';

const mock = new MockAdapter(axios);

describe('siteSearchSlice', () => {
  const initialState = {
    sites: [],
    searchParam: '',
    page: 1,
    pageSize: 5,
    count: 0,
    sortBy: SiteSortBy.Id,
    sortByDir: SortByDirection.Asc,
    filter: {},
    error: '',
    status: RequestStatus.idle,
  };

  beforeEach(() => {
    mock.reset();
  });

  afterEach(() => {
    mock.reset();
  });

  it('should return the initial state', () => {
    expect(siteSearchReducer(undefined, { type: '' })).toEqual(initialState);
  });

  it('should handle fetchSearchSites.pending', () => {
    const action = { type: fetchSearchSites.pending.type };
    const state = siteSearchReducer(initialState, action);
    expect(state.status).toEqual(RequestStatus.loading);
  });

  it('should handle fetchSearchSites.fulfilled', () => {
    const payload = {
      sites: [{ id: 1, name: 'Site 1' }],
      count: 1,
      page: 1,
      pageSize: 5,
    };
    const action = {
      type: fetchSearchSites.fulfilled.type,
      payload,
      meta: { arg: { searchParam: 'test', filter: {} } },
    };
    const state = siteSearchReducer(initialState, action);
    expect(state.status).toEqual(RequestStatus.success);
    expect(state.sites).toEqual(payload.sites);
    expect(state.count).toBe(1);
    expect(state.searchParam).toBe('test');
  });

  it('should handle fetchSearchSites.rejected', () => {
    const action = {
      type: fetchSearchSites.rejected.type,
      error: { message: 'Request failed' },
    };
    const state = siteSearchReducer(initialState, action);
    expect(state.status).toEqual(RequestStatus.failed);
    expect(state.error).toEqual('Request failed');
  });

  it('fetchSearchSites thunk should dispatch fulfilled on success', async () => {
    const mockResponse = {
      data: {
        data: {
          searchSites: {
            sites: [{ id: 123, name: 'Mock Site' }],
            count: 1,
            page: 1,
            pageSize: 5,
          },
        },
      },
    };

    mock.onPost(GRAPHQL).reply(200, mockResponse.data);

    const dispatch = jest.fn();
    const thunk = fetchSearchSites({ searchParam: 'Mock' });
    await thunk(dispatch, () => ({}), undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchSearchSites.pending.type }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchSearchSites.fulfilled.type,
        payload: mockResponse.data.data.searchSites,
      }),
    );
  });

  it('fetchSearchSites thunk should dispatch rejected on error', async () => {
    mock.onPost(GRAPHQL).reply(500);

    const dispatch = jest.fn();
    const thunk = fetchSearchSites({ searchParam: 'Fail' });
    await thunk(dispatch, () => ({}), undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchSearchSites.pending.type }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchSearchSites.rejected.type }),
    );
  });

  it('should handle search param with 3 or more blank spaces by returning empty results', async () => {
    const dispatch = jest.fn();
    const thunk = fetchSearchSites({ searchParam: '   ' }); // 3 spaces
    await thunk(dispatch, () => ({}), undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchSearchSites.pending.type }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchSearchSites.fulfilled.type,
        payload: {
          sites: [],
          count: 0,
          page: 1,
          pageSize: 5,
        },
      }),
    );
  });

  it('should handle search param with multiple blank spaces by returning empty results', async () => {
    const dispatch = jest.fn();
    const thunk = fetchSearchSites({ searchParam: '     ' }); // 5 spaces
    await thunk(dispatch, () => ({}), undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchSearchSites.pending.type }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchSearchSites.fulfilled.type,
        payload: {
          sites: [],
          count: 0,
          page: 1,
          pageSize: 5,
        },
      }),
    );
  });

  it('should trim search param with leading and trailing spaces before making API call', async () => {
    const mockResponse = {
      data: {
        data: {
          searchSites: {
            sites: [{ id: 456, name: 'Trimmed Site' }],
            count: 1,
            page: 1,
            pageSize: 5,
          },
        },
      },
    };

    mock.onPost(GRAPHQL).reply((config) => {
      const requestData = JSON.parse(config.data);
      // Verify that the searchParam was trimmed
      expect(requestData.variables.searchParam).toBe('test');
      return [200, mockResponse.data];
    });

    const dispatch = jest.fn();
    const thunk = fetchSearchSites({ searchParam: '  test  ' }); // spaces around 'test'
    await thunk(dispatch, () => ({}), undefined);

    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({ type: fetchSearchSites.pending.type }),
    );
    expect(dispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: fetchSearchSites.fulfilled.type,
        payload: mockResponse.data.data.searchSites,
      }),
    );
  });
});
