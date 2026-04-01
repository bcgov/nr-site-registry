import { getLandUseColumns } from './LandUseColumnConfiguration';

describe('getLandUseColumns', () => {
  it('includes SR column for internal users', () => {
    const columns = getLandUseColumns([], false, true);

    const hasSrColumn = columns.some(
      (column) => column.displayName === 'SR'
    );

    expect(hasSrColumn).toBe(true);
    expect(columns.length).toBe(3);
  });

  it('excludes SR column for external users', () => {
    const columns = getLandUseColumns([], false, false);

    const hasSrColumn = columns.some(
      (column) => column.displayName === 'SR'
    );

    expect(hasSrColumn).toBe(false);
    expect(columns.length).toBe(2);
  });
});
