import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ParcelDescriptionDto } from '../../dto/parcelDescription.dto';
import { GenericPagedResponse } from '../../dto/response/genericResponse';

@Injectable()
export class ParcelDescriptionsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
  ) {}

  /**
   * Find subdivisions where search parameter matches a site id.
   * @param siteId The id of the site to get parcel descriptions.
   * @param page Page number for the results.
   * @param pageSize The numerical size of the page requested.
   * @param searchParam A search term to filter the results
   * @param orderBy Which column to sort the results by.
   * @param orderByDir Sort direction. Either ASC or DESC.
   * @returns A response including the requested parcel descriptions.
   */
  async getParcelDescriptionsBySiteId(
    siteId: number,
    page: number,
    pageSize: number,
    searchParam: string,
    sortParam: string,
    sortDir: string,
    showPending: boolean
  ): Promise<GenericPagedResponse<ParcelDescriptionDto[]>> {
    // Sanitize the query parameters.
    const filterTerm = searchParam ? searchParam : '';
    const orderBy = [
      'id',
      'description_type',
      'id_pin_number',
      'date_noted',
      'land_description',
    ].includes(sortParam)
      ? `parcel_descriptions.${sortParam}`
      : `parcel_descriptions.id`;
    const orderByDir = sortDir == 'DESC' ? 'DESC' : 'ASC';
    const offset = (page - 1) * pageSize;
    const countQueryParams: string[] = [String(siteId), filterTerm];
    const queryParams: string[] = [
      String(siteId),
      filterTerm,
      String(offset),
      String(pageSize),
    ];

    // The Parcel Descriptions table (front end) is constructed from some
    // conditional values on the subdivisions table (database). TypeORM doesn't
    // allow us to be this expressive so we've elected to write a raw SQL query.
    // Based on briefly profiling this query this method is somewhat more
    // efficient than querying all the subdivisions for a site and performing
    // the sorting, filtering, and pagination in Node.
    let query = `
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
        WHERE sites.site_subdivisions.site_id = $1
     ;`

     if(showPending)
     {
        query = query + `AND sites.site_subdivisions.user_action = 'updated'`
     }

    const combinedQuery = ` ${query} ) parcel_descriptions
    WHERE (
      LOWER(parcel_descriptions.description_type) ~* $2
      OR LOWER(parcel_descriptions.id_pin_number) ~* $2
      OR LOWER(CAST(parcel_descriptions.date_noted AS TEXT)) ~* $2
      OR LOWER(parcel_descriptions.land_description) ~* $2
    )
  `
    const countQuery = `SELECT COUNT(*) FROM ( ${query} ) AS subquery`;

    // Add sorting and pagination. Including sorting here is a minor
    // optimization so that it isn't included in the count query.
    query += `
      ORDER BY ${orderBy} ${orderByDir}
      OFFSET $3
      LIMIT $4 
    `;

    let countResult: any;
    let rawResults: any;
    let results: ParcelDescriptionDto[] = [];
    let count: number;
    const responsePage = page;
    const responsePageSize = pageSize;

    try {
      countResult = await this.entityManager.query(
        countQuery,
        countQueryParams,
      );
      rawResults = await this.entityManager.query(combinedQuery, queryParams);
      count = countResult.length > 0 ? countResult[0]?.count : 0;
    } catch (error) {
      return new GenericPagedResponse<ParcelDescriptionDto[]>(
        'There was an error communicating with the database. Try again later.',
        500,
        false,
        [],
        0,
        0,
        0,
      );
    }

    results = rawResults.map((rawResult: any): ParcelDescriptionDto => {
      return new ParcelDescriptionDto(
        rawResult.id,
        rawResult.description_type,
        rawResult.id_pin_number,
        new Date(rawResult.date_noted),
        rawResult.land_description,
      );
    });

    return new GenericPagedResponse<ParcelDescriptionDto[]>(
      'Parcel Descriptions fetched successfully.',
      200,
      true,
      results,
      count,
      responsePage,
      responsePageSize,
    );
  }
}
