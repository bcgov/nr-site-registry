import {
  extendSearchResultBounds,
  flyToBoundsForTextSearch,
  sitesWhenMapToolCleared,
} from './mapViewHelpers';

describe('extendSearchResultBounds', () => {
  it('returns invalid bounds for empty sites', () => {
    const b = extendSearchResultBounds([]);
    expect(b.isValid()).toBe(false);
  });

  it('skips sites without coordinates', () => {
    const b = extendSearchResultBounds([
      { latdeg: null, longdeg: -123 },
      { latdeg: 49, longdeg: null },
    ]);
    expect(b.isValid()).toBe(false);
  });

  it('extends bounds for valid sites', () => {
    const b = extendSearchResultBounds([
      { latdeg: 49, longdeg: -123 },
      { latdeg: 50, longdeg: -124 },
    ]);
    expect(b.isValid()).toBe(true);
    expect(b.getSouthWest().lat).toBeLessThanOrEqual(49);
    expect(b.getNorthEast().lat).toBeGreaterThanOrEqual(50);
  });

  it('handles single site', () => {
    const b = extendSearchResultBounds([{ latdeg: 48.5, longdeg: -125 }]);
    expect(b.isValid()).toBe(true);
  });
});

describe('sitesWhenMapToolCleared', () => {
  it('returns map search data when activeTool is null', () => {
    const data = [{ id: 1 }];
    expect(sitesWhenMapToolCleared(null, data)).toEqual(data);
  });

  it('returns empty array when data undefined and tool cleared', () => {
    expect(sitesWhenMapToolCleared(null, undefined)).toEqual([]);
  });

  it('returns null when a draw tool is active', () => {
    expect(sitesWhenMapToolCleared('polygon', [{ id: 1 }])).toBeNull();
    expect(sitesWhenMapToolCleared('radius', undefined)).toBeNull();
  });

  it('returns null when activeTool is undefined', () => {
    expect(sitesWhenMapToolCleared(undefined, [{ id: 1 }])).toBeNull();
  });
});

describe('flyToBoundsForTextSearch', () => {
  it('does nothing when searchTerm empty', () => {
    const flyToBounds = jest.fn();
    flyToBoundsForTextSearch('', [{ latdeg: 49, longdeg: -123 }], {
      flyToBounds,
    });
    expect(flyToBounds).not.toHaveBeenCalled();
  });

  it('does nothing when map is null', () => {
    flyToBoundsForTextSearch('x', [{ latdeg: 49, longdeg: -123 }], null);
  });

  it('does nothing when bounds invalid', () => {
    const flyToBounds = jest.fn();
    flyToBoundsForTextSearch('x', [], { flyToBounds });
    expect(flyToBounds).not.toHaveBeenCalled();
  });

  it('calls flyToBounds when search term and valid sites and map', () => {
    const flyToBounds = jest.fn();
    flyToBoundsForTextSearch('victoria', [{ latdeg: 48.4, longdeg: -123.4 }], {
      flyToBounds,
    });
    expect(flyToBounds).toHaveBeenCalledTimes(1);
    const [bounds, opts] = flyToBounds.mock.calls[0];
    expect(bounds.isValid()).toBe(true);
    expect(opts).toBeDefined();
  });
});
