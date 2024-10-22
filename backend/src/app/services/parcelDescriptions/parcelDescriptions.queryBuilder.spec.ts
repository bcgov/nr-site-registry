import {
  getExternalUserQueries,
  getInternalUserQueries,
} from './parcelDescriptions.queryBuilder';

describe('ParcelDescriptionsQueryBuilder', () => {
  describe('getInternalUserQueries', () => {
    let siteId: number = 1;
    let filterTerm: string = 'filterTerm';
    let offset: number = 0;
    let limit: number = 5;
    let orderBy: string = 'id';
    let orderByDir: string = 'DESC';
    let showPending: boolean = false;

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
            showPending,
          );
        expect(query).toEqual(
          expect.stringMatching(/.*sites\.site_subdivisions\.site_id = \$1.*/),
        );
        expect(query).not.toEqual(expect.stringMatching(/.*COUNT.*/));
      });

      it('Queries all of the expected values.', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getInternalUserQueries(
            siteId,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.id*/),
        );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.description_type*/),
        );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.id_pin_number*/),
        );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.date_noted*/),
        );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.land_description*/),
        );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.user_action*/),
        );
        expect(query).toEqual(
          expect.stringMatching(/.*parcel_descriptions\.sr_action*/),
        );
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
            showPending,
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
            showPending,
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
            showPending,
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
            showPending,
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
            showPending,
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
            showPending,
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
            showPending,
          );
        expect(countQueryParams).toEqual(
          expect.arrayContaining([String(siteId)]),
        );
        expect(countQueryParams).toEqual(expect.arrayContaining([filterTerm]));
      });

      describe('When showPending is true', () => {
        let showPending = true;

        it('Adds the correct condition to the main query.', () => {
          const [query, _queryParams, _countQuery, _countQueryParams] =
            getInternalUserQueries(
              siteId,
              filterTerm,
              offset,
              limit,
              orderBy,
              orderByDir,
              showPending,
            );
          expect(query).toEqual(
            expect.stringMatching(
              /.*AND sites\.site_subdivisions\.user_action = 'updated'.*/,
            ),
          );
        });

        it('Adds the correct condition to the count query.', () => {
          const [_query, _queryParams, countQuery, _countQueryParams] =
            getInternalUserQueries(
              siteId,
              filterTerm,
              offset,
              limit,
              orderBy,
              orderByDir,
              showPending,
            );
          expect(countQuery).toEqual(
            expect.stringMatching(
              /.*AND sites\.site_subdivisions\.user_action = 'updated'.*/,
            ),
          );
        });
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
            showPending,
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
            showPending,
          );
        expect(query).not.toEqual(expect.stringMatching(/turnwuse/));
        expect(query).toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id ASC.*/),
        );
      });
    });
  });

  describe('getExternalUserQueries', () => {
    let siteSubdivisionIds: string[] = ['1', '2', '3'];
    let filterTerm: string = 'filterTerm';
    let offset: number = 0;
    let limit: number = 5;
    let orderBy: string = 'id';
    let orderByDir: string = 'DESC';
    let showPending: boolean = false;

    describe('when everything is correct.', () => {
      it('Returns the main query', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(query).toEqual(
          expect.stringMatching(
            /.*sites\.site_subdivisions\.site_subdiv_id = ANY \(\$1\).*/,
          ),
        );
        expect(query).not.toEqual(expect.stringMatching(/.*COUNT.*/));
      });

      it('Sorts the main query', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(query).toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id DESC.*/),
        );
      });

      it('Pages the main query', () => {
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(query).toEqual(expect.stringMatching(/.*OFFSET.*/));
        expect(query).toEqual(expect.stringMatching(/.*LIMIT.*/));
      });

      it('Returns the expected main query parameters', () => {
        const [_query, queryParams, _countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(queryParams).toEqual(
          expect.arrayContaining([`{${String(siteSubdivisionIds)}}`]),
        );
        expect(queryParams).toEqual(expect.arrayContaining([filterTerm]));
        expect(queryParams).toEqual(expect.arrayContaining([String(offset)]));
        expect(queryParams).toEqual(expect.arrayContaining([String(limit)]));
      });

      it('Returns a count query.', () => {
        const [_query, _queryParams, countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(countQuery).toEqual(
          expect.stringMatching(
            /.*sites\.site_subdivisions\.site_subdiv_id = ANY \(\$1\).*/,
          ),
        );
        expect(countQuery).toEqual(expect.stringMatching(/.*COUNT.*/));
      });

      it('Does not sort the count query.', () => {
        const [_query, _queryParams, countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(countQuery).not.toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id DESC.*/),
        );
      });

      it('Does not page the count query.', () => {
        const [_query, _queryParams, countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(countQuery).not.toEqual(expect.stringMatching(/.*OFFSET.*/));
        expect(countQuery).not.toEqual(expect.stringMatching(/.*LIMIT.*/));
      });

      it('Returns the correct query parameters for the count query', () => {
        const [_query, _queryParams, _countQuery, countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(countQueryParams).toEqual(
          expect.arrayContaining([`{${String(siteSubdivisionIds)}}`]),
        );
        expect(countQueryParams).toEqual(expect.arrayContaining([filterTerm]));
      });

      describe('When showPending is true', () => {
        let showPending = true;

        it('Adds the correct condition to the main query.', () => {
          const [query, _queryParams, _countQuery, _countQueryParams] =
            getExternalUserQueries(
              siteSubdivisionIds,
              filterTerm,
              offset,
              limit,
              orderBy,
              orderByDir,
              showPending,
            );
          expect(query).toEqual(
            expect.stringMatching(
              /.*AND sites\.site_subdivisions\.user_action = 'updated'.*/,
            ),
          );
        });

        it('Adds the correct condition to the count query.', () => {
          const [_query, _queryParams, countQuery, _countQueryParams] =
            getExternalUserQueries(
              siteSubdivisionIds,
              filterTerm,
              offset,
              limit,
              orderBy,
              orderByDir,
              showPending,
            );
          expect(countQuery).toEqual(
            expect.stringMatching(
              /.*AND sites\.site_subdivisions\.user_action = 'updated'.*/,
            ),
          );
        });
      });
    });

    describe('when the orderBy is invalid', () => {
      it('defaults to ordering by id', () => {
        let orderBy = 'blunderbuss';
        const [query, _queryParams, _countQuery, _countQueryParams] =
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
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
          getExternalUserQueries(
            siteSubdivisionIds,
            filterTerm,
            offset,
            limit,
            orderBy,
            orderByDir,
            showPending,
          );
        expect(query).not.toEqual(expect.stringMatching(/turnwuse/));
        expect(query).toEqual(
          expect.stringMatching(/.*ORDER BY parcel_descriptions\.id ASC.*/),
        );
      });
    });
  });
});
