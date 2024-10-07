// The Parcel Descriptions table (front end) is constructed from some
// conditional values on the subdivisions table (database). TypeORM doesn't
// allow us to be this expressive so we've elected to write a raw SQL query.
// Based on briefly profiling this query this method is somewhat more
// efficient than querying all the subdivisions for a site and performing
// the sorting, filtering, and pagination in Node.
const parcelDescriptionQueryHead = `
  SELECT
    parcel_descriptions.id,
    parcel_descriptions.description_type,
    parcel_descriptions.id_pin_number,
    parcel_descriptions.date_noted,
    parcel_descriptions.land_description
  FROM (
    SELECT
      sites.subdivisions.id AS id,
      CASE
        WHEN sites.subdivisions.pid IS NOT NULL THEN 'Parcel ID'
        WHEN sites.subdivisions.pin IS NOT NULL THEN 'Crown Land PIN'
        WHEN sites.subdivisions.crown_lands_file_no IS NOT NULL THEN 'Crown Land File Number'
        ELSE 'Unknown'
      END AS description_type,
      CASE
        WHEN sites.subdivisions.pid IS NOT NULL THEN sites.subdivisions.pid
        WHEN sites.subdivisions.pin IS NOT NULL THEN sites.subdivisions.pin
        WHEN sites.subdivisions.crown_lands_file_no IS NOT NULL THEN sites.subdivisions.crown_lands_file_no
        ELSE NULL
      END AS id_pin_number,
      sites.subdivisions.date_noted AS date_noted,
      sites.subdivisions.legal_description AS land_description
    FROM sites.site_subdivisions
    LEFT JOIN sites.subdivisions 
      ON sites.site_subdivisions.subdiv_id = sites.subdivisions.id
`;
const internalUserCondition = `
  WHERE sites.site_subdivisions.site_id = $1
`;
const externalUserCondition = `
  WHERE sites.site_subdivisions.site_subdiv_id = ANY ($1)
`;
const showPendingCondition = `
  AND sites.site_subdivisions.user_action = 'updated'
`;
const parcelDescriptionQueryTail = `
  ) parcel_descriptions
  WHERE (
    LOWER(parcel_descriptions.description_type) ~* $2
    OR LOWER(parcel_descriptions.id_pin_number) ~* $2
    OR LOWER(CAST(parcel_descriptions.date_noted AS TEXT)) ~* $2
    OR LOWER(parcel_descriptions.land_description) ~* $2
  )
`;

const getPagingAndSortingQueryPart = (orderBy: string, orderByDir: string) => {
  return `
    ORDER BY ${orderBy} ${orderByDir}
    OFFSET $3
    LIMIT $4 
  `;
};

const getSanitizedSiteId = (siteId: number) => {
  return String(siteId);
};

const getSanitizedFilterTerm = (filterTerm: string) => {
  return filterTerm ? filterTerm : '';
};

const getSanitizedOffset = (offset: number) => {
  return String(offset);
};

const getSanitizedPageSize = (pageSize: number) => {
  return String(pageSize);
};

const getSanitizedOrderBy = (orderBy: string) => {
  return [
    'id',
    'description_type',
    'id_pin_number',
    'date_noted',
    'land_description',
  ].includes(orderBy)
    ? `parcel_descriptions.${orderBy}`
    : `parcel_descriptions.id`;
};

const getSanitizedSiteSubdivisionsIds = (siteSubdivisionsIds: string[]) => {
  // Formatting the ids as a postgres array and passing it as a parameter to
  // an ANY clause in the query is a workaround for a TypeORM bug where the
  // driver wont recognize that the query is expecting an array and attempt
  // to cast the input parameter as a bigint rather than bigint[] which will
  // always cause an exception.
  return `{${String(siteSubdivisionsIds)}}`;
};

const getSanitizedOrderByDir = (orderByDir: string) => {
  return orderByDir === 'DESC' ? 'DESC' : 'ASC';
};

export const getInternalUserQueries = (
  siteId: number,
  filterTerm: string,
  limit: number,
  pageSize: number,
  orderBy: string,
  orderByDir: string,
  showPending: boolean,
): [string, string[], string, string[]] => {
  const sanitizedSiteId = getSanitizedSiteId(siteId);
  const sanitizedFilterTerm = getSanitizedFilterTerm(filterTerm);
  const sanitizedOffset = getSanitizedOffset(limit);
  const sanitizedPageSize = getSanitizedPageSize(pageSize);
  const sanitizedOrderBy = getSanitizedOrderBy(orderBy);
  const sanitizedOrderByDir = getSanitizedOrderByDir(orderByDir);

  let query: string = parcelDescriptionQueryHead + internalUserCondition;
  if (showPending) {
    query += showPendingCondition;
  }
  query += parcelDescriptionQueryTail;

  const countQuery: string = `SELECT COUNT(*) FROM ( ${query} ) AS subquery`;

  // Add sorting and pagination. Including sorting here is a minor
  // optimization so that it isn't included in the count query.
  query += getPagingAndSortingQueryPart(sanitizedOrderBy, sanitizedOrderByDir);

  const queryParams: string[] = [
    sanitizedSiteId,
    sanitizedFilterTerm,
    sanitizedOffset,
    sanitizedPageSize,
  ];
  const countQueryParams: string[] = [sanitizedSiteId, sanitizedFilterTerm];
  return [query, queryParams, countQuery, countQueryParams];
};

export const getExternalUserQueries = (
  siteSubdivisionsIds: string[],
  filterTerm: string,
  limit: number,
  pageSize: number,
  orderBy: string,
  orderByDir: string,
  showPending: boolean,
): [string, string[], string, string[]] => {
  const sanitizedSiteSubdivisionIds =
    getSanitizedSiteSubdivisionsIds(siteSubdivisionsIds);
  const sanitizedFilterTerm = getSanitizedFilterTerm(filterTerm);
  const sanitizedOffset = getSanitizedOffset(limit);
  const sanitizedPageSize = getSanitizedPageSize(pageSize);
  const sanitizedOrderBy = getSanitizedOrderBy(orderBy);
  const sanitizedOrderByDir = getSanitizedOrderByDir(orderByDir);

  let query: string = parcelDescriptionQueryHead + externalUserCondition;
  if (showPending) {
    query += showPendingCondition;
  }
  query += parcelDescriptionQueryTail;

  const countQuery: string = `SELECT COUNT(*) FROM ( ${query} ) AS subquery`;

  // Add sorting and pagination. Including sorting here is a minor
  // optimization so that it isn't included in the count query.
  query += getPagingAndSortingQueryPart(sanitizedOrderBy, sanitizedOrderByDir);

  const queryParams: string[] = [
    sanitizedSiteSubdivisionIds,
    sanitizedFilterTerm,
    sanitizedOffset,
    sanitizedPageSize,
  ];
  const countQueryParams: string[] = [
    sanitizedSiteSubdivisionIds,
    sanitizedFilterTerm,
  ];
  return [query, queryParams, countQuery, countQueryParams];
};
