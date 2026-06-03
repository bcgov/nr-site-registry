import { resolveGraphqlOperationName } from './resolve-graphql-operation-name';

describe('resolveGraphqlOperationName', () => {
  it('uses client operationName when provided', () => {
    expect(
      resolveGraphqlOperationName('searchSites', 'query other { x }'),
    ).toBe('searchSites');
  });

  it('parses operation name from query when operationName is missing', () => {
    const query = `query searchSites { searchSites { count } }`;
    expect(resolveGraphqlOperationName(undefined, query)).toBe('searchSites');
  });

  it('returns anonymous when name cannot be resolved', () => {
    expect(resolveGraphqlOperationName(undefined, '')).toBe('anonymous');
    expect(resolveGraphqlOperationName(undefined, 'not valid graphql')).toBe(
      'anonymous',
    );
  });
});
