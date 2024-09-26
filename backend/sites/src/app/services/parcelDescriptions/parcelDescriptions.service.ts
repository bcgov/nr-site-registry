import { Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager } from 'typeorm';
import { ParcelDescriptionDto } from '../../dto/parcelDescription.dto';
import { GenericPagedResponse } from '../../dto/response/genericResponse';
import { getInternalUserQueries } from './parcelDescriptions.queryBuilder';
import { LoggerService } from 'src/app/logger/logger.service';

@Injectable()
export class ParcelDescriptionsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    private readonly sitesLogger: LoggerService,
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
  ): Promise<GenericPagedResponse<ParcelDescriptionDto[]>> {
    this.sitesLogger.log(
      'ParcelDescriptionsService.getParcelDescriptionsBySiteId() start',
    );
    this.sitesLogger.debug(
      'ParcelDescriptionsService.getParcelDescriptionsBySiteId() start',
    );
    // Sanitize the query parameters.
    const offset = (page - 1) * pageSize;
    let query: string;
    let queryParams: string[];
    let countQuery: string;
    let countQueryParams: string[];

    [query, queryParams, countQuery, countQueryParams] = getInternalUserQueries(
      siteId,
      searchParam,
      offset,
      pageSize,
      sortParam,
      sortDir,
    );

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
      rawResults = await this.entityManager.query(query, queryParams);
      count = countResult.length > 0 ? countResult[0]?.count : 0;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in ParcelDescriptionsService.getParcelDescriptionsBySiteId() end',
        JSON.stringify(error),
      );
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

    this.sitesLogger.log(
      'ParcelDescriptionsService.getParcelDescriptionsBySiteId() end',
    );
    this.sitesLogger.debug(
      'ParcelDescriptionsService.getParcelDescriptionsBySiteId() end',
    );

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
