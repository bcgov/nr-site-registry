import siteSearchReducer, { setSearchFilter } from './SiteSearchSlice';

describe('siteSearchSlice', () => {
  it('keeps only the filter in search state', () => {
    expect(siteSearchReducer(undefined, { type: '' })).toEqual({ filter: {} });
  });

  it('stores the submitted filter', () => {
    const state = siteSearchReducer(
      { filter: {} },
      setSearchFilter({ city: 'Victoria' }),
    );

    expect(state).toEqual({ filter: { city: 'Victoria' } });
    expect(state).not.toHaveProperty('sites');
    expect(state).not.toHaveProperty('page');
    expect(state).not.toHaveProperty('pageSize');
  });

  it('replaces the filter when the next search has none', () => {
    const state = siteSearchReducer(
      { filter: { city: 'Victoria' } },
      setSearchFilter({}),
    );

    expect(state.filter).toEqual({});
  });
});
