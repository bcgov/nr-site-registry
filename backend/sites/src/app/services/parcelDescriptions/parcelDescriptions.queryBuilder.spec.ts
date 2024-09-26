import { getInternalUserQueries } from './parcelDescriptions.queryBuilder';

describe('ParcelDescriptionsQueryBuilder', () => {
  describe('getInternalUserQueries', () => {
    let siteId: number = 1;
    let filterTerm: string = 'filterTerm';
    let offset: number = 0;
    let limit: number = 5;
    let orderBy: string = 'id';
    let orderByDir: string = 'DESC';

    describe('when everything is correct.', () => {
      it('Returns the main query', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(query).toEqual(
          expect.stringMatching(/.*sites\.site_subdivisions\.site_id = \$1.*/),
        );
        expect(query).not.toEqual(expect.stringMatching(/.*COUNT.*/));
      });

      it('Sorts the main query', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(query).toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id DESC.*/),
        );
      });

      it('Pages the main query', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(query).toEqual(expect.stringMatching(/.*OFFSET.*/));
        expect(query).toEqual(expect.stringMatching(/.*LIMIT.*/));
      });

      it('Returns the expected main query parameters', () => {
        const [_query, queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(queryParams).toEqual(expect.arrayContaining([String(siteId)]));
        expect(queryParams).toEqual(expect.arrayContaining([filterTerm]));
        expect(queryParams).toEqual(expect.arrayContaining([String(offset)]));
        expect(queryParams).toEqual(expect.arrayContaining([String(limit)]));
      });

      it('Returns a count query.', () => {
        const [_query, _queryParams, countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(countQuery).toEqual(
          expect.stringMatching(/.*sites\.site_subdivisions\.site_id = \$1.*/),
        );
        expect(countQuery).toEqual(expect.stringMatching(/.*COUNT.*/));
      });

      it('Does not sort the count query.', () => {
        const [_query, _queryParams, countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(countQuery).not.toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id DESC.*/),
        );
      });

      it('Does not page the count query.', () => {
        const [_query, _queryParams, countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(countQuery).not.toEqual(expect.stringMatching(/.*OFFSET.*/));
        expect(countQuery).not.toEqual(expect.stringMatching(/.*LIMIT.*/));
      });

      it('Returns the correct query parameters for the count query', () => {
        const [_query, _queryParams, _countQuery, countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(countQueryParams).toEqual(
          expect.arrayContaining([String(siteId)]),
        );
        expect(countQueryParams).toEqual(expect.arrayContaining([filterTerm]));
      });
    });

    describe('when the orderBy is invalid', () => {
      it('defaults to ordering by id', () => {
        let orderBy = 'blunderbuss';
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(query).not.toEqual(expect.stringMatching(/blunderbuss/));
        expect(query).toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id DESC.*/),
        );
      });
    });

    describe('when the sortDir is invalid', () => {
      it('defaults to ascending', () => {
        let orderByDir = 'turnwise';
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
          );
        expect(query).not.toEqual(expect.stringMatching(/turnwuse/));
        expect(query).toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id ASC.*/),
        );
      });
    });
  });
});
