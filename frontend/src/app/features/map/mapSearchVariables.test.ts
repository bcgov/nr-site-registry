import { buildMapSearchQueryVariables } from './mapSearchVariables';

describe('buildMapSearchQueryVariables', () => {
  it('sets searchParam from search term', () => {
    expect(buildMapSearchQueryVariables('foo', [], null, 0, 500)).toEqual({
      searchParam: 'foo',
    });
  });

  it('uses empty string when search term empty', () => {
    expect(buildMapSearchQueryVariables('', [], null, 0, 500)).toEqual({
      searchParam: '',
    });
  });

  it('includes polygon when vertices present', () => {
    const poly: [number, number][] = [
      [1, 2],
      [3, 4],
    ];
    const v = buildMapSearchQueryVariables('', poly, null, 0, 500);
    expect(v.polygon).toEqual(poly);
  });

  it('adds circle when center and radius meet minimum', () => {
    const v = buildMapSearchQueryVariables('', [], [49, -123], 1000, 500);
    expect(v.circle).toEqual({ center: [49, -123], radius: 1000 });
  });

  it('omits circle when radius below minimum', () => {
    const v = buildMapSearchQueryVariables('', [], [49, -123], 100, 500);
    expect(v.circle).toBeUndefined();
  });

  it('omits circle when center is null', () => {
    const v = buildMapSearchQueryVariables('', [], null, 5000, 500);
    expect(v.circle).toBeUndefined();
  });

  it('combines search param polygon and circle', () => {
    const v = buildMapSearchQueryVariables('x', [[0, 0]], [1, 1], 600, 500);
    expect(v).toMatchObject({
      searchParam: 'x',
      polygon: [[0, 0]],
      circle: { center: [1, 1], radius: 600 },
    });
  });
});
