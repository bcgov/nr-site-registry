import { buildSitesToShow } from './buildSitesToShow';

type Row = {
  id: number | string;
  latdeg?: number | null;
  longdeg?: number | null;
};

describe('buildSitesToShow', () => {
  const sites: Row[] = [
    { id: 1, latdeg: 49, longdeg: -123 },
    { id: 2, latdeg: 50, longdeg: -124 },
  ];

  it('returns sites unchanged when no selectedSiteId', () => {
    expect(
      buildSitesToShow(sites, null, { id: 99, latdeg: 49, longdeg: -123 }),
    ).toBe(sites);
    expect(
      buildSitesToShow(sites, undefined, { id: 99, latdeg: 49, longdeg: -123 }),
    ).toBe(sites);
  });

  it('returns sites unchanged when selected site has no coordinates', () => {
    expect(buildSitesToShow(sites, '99', { id: 99 })).toBe(sites);
    expect(
      buildSitesToShow(sites, '99', { id: 99, latdeg: null, longdeg: -123 }),
    ).toBe(sites);
  });

  it('returns sites unchanged when selected id already in list (string vs number)', () => {
    expect(
      buildSitesToShow(sites, '1', { id: 1, latdeg: 49, longdeg: -123 }),
    ).toBe(sites);
  });

  it('appends selected site with id forced to selectedSiteId string', () => {
    const selected = {
      id: 999,
      latdeg: 48.5,
      longdeg: -125.2,
      extra: 'x',
    } as Row & { extra: string };
    const out = buildSitesToShow(sites, '42', selected);
    expect(out).toHaveLength(3);
    expect(out[2]).toMatchObject({
      id: '42',
      latdeg: 48.5,
      longdeg: -125.2,
      extra: 'x',
    });
  });
});
