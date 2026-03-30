import { getLandUseColumns } from "./LandUseColumnConfiguration";

describe('getLandUseColumns', () => {
  it('includes SR column for internal users', () => {
    const columns = getLandUseColumns([], false, true);

    expect(columns.some(
      col => col.graphQLPropertyName === 'srApprovalStatus'
    )).toBe(true);
  });

  it('excludes SR column for external users', () => {
    const columns = getLandUseColumns([], false, false);

    expect(columns.some(
      col => col.graphQLPropertyName === 'srApprovalStatus'
    )).toBe(false);
  });
});