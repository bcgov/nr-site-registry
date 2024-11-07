import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, InsertResult, Repository } from 'typeorm';
import {
  ParcelDescriptionDto,
  ParcelDescriptionType,
} from '../../dto/parcelDescription.dto';
import { GenericPagedResponse } from '../../dto/response/genericResponse';
import {
  getExternalUserQueries,
  getInternalUserQueries,
} from './parcelDescriptions.queryBuilder';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { LoggerService } from '../../logger/logger.service';
import { ParcelDescriptionInputDTO } from '../../dto/parcelDescriptionInput.dto';
import { UserActionEnum } from '../../common/userActionEnum';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';

@Injectable()
export class ParcelDescriptionsService {
  constructor(
    @InjectEntityManager() private readonly entityManager: EntityManager,
    @InjectRepository(Subdivisions)
    private subdivisionsRepository: Repository<Subdivisions>,
    @InjectRepository(SiteSubdivisions)
    private siteSubdivisionsRepository: Repository<SiteSubdivisions>,
    private snapshotService: SnapshotsService,
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
    showPending: boolean,
    user: any,
  ): Promise<GenericPagedResponse<ParcelDescriptionDto[]>> {
    this.sitesLogger.log(
      'ParcelDescriptionsService.getParcelDescriptionsBySiteId() start',
    );
    this.sitesLogger.debug(
      'ParcelDescriptionsService.getParcelDescriptionsBySiteId() start',
    );

    const userId: string = user?.sub ? user.sub : '';
    const internalUser: boolean = user?.identity_provider === 'idir';

    // Fail fast if the user is invalid
    if (userId?.length === 0) {
      this.sitesLogger.error(
        'An invalid user was passed into ParcelDescriptionsService.getParcelDescriptionsBySiteId() end',
        '',
      );
      return new GenericPagedResponse<ParcelDescriptionDto[]>(
        'User id is invalid.',
        500,
        false,
        [],
        0,
        0,
        0,
      );
    }

    let query: string;
    let queryParams: string[];
    let countQuery: string;
    let countQueryParams: string[];

    let countResult: any;
    let rawResults: any;
    let results: ParcelDescriptionDto[] = [];
    let count: number;
    const responsePage = page;
    const responsePageSize = pageSize;
    const offset = (page - 1) * pageSize;

    if (internalUser) {
      [query, queryParams, countQuery, countQueryParams] =
        getInternalUserQueries(
          siteId,
          searchParam,
          offset,
          pageSize,
          sortParam,
          sortDir,
          showPending,
        );
    } else {
      const snapshot = await this.snapshotService.getMostRecentSnapshot(
        String(siteId),
        userId,
      );
      if (!snapshot) {
        return new GenericPagedResponse<ParcelDescriptionDto[]>(
          'Parcel Descriptions fetched successfully.',
          200,
          true,
          [],
          0,
          0,
          0,
        );
      }
      const siteSubdivisionsIds = snapshot.snapshotData.subDivisions.map(
        (siteSubdivision) => {
          return siteSubdivision.siteSubdivId;
        },
      );
      [query, queryParams, countQuery, countQueryParams] =
        getExternalUserQueries(
          siteSubdivisionsIds,
          searchParam,
          offset,
          pageSize,
          sortParam,
          sortDir,
          showPending,
        );
    }

    try {
      countResult = await this.entityManager.query(
        countQuery,
        countQueryParams,
      );
      rawResults = await this.entityManager.query(query, queryParams);
      count = countResult?.length > 0 ? countResult[0]?.count : 0;
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
        rawResult.user_action,
        rawResult.sr_action,
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

  async saveParcelDescriptionsForSite(
    siteId: string,
    parcelDescriptions: ParcelDescriptionInputDTO[],
    userInfo: any,
  ) {
    this.sitesLogger.log(
      'parcelDescriptionService.saveParcelDescriptionsForSite() start',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.saveParcelDescriptionsForSite() start',
    );
    const parcelDescriptionsToUpdate = parcelDescriptions.filter(
      (parcelDescription: ParcelDescriptionInputDTO) => {
        return parcelDescription.apiAction === UserActionEnum.UPDATED;
      },
    );
    if (parcelDescriptionsToUpdate.length > 0) {
      await this.updateParcelDescriptionsForSite(
        siteId,
        parcelDescriptionsToUpdate,
        userInfo,
      );
    }
    const parcelDescriptionsToAdd = parcelDescriptions.filter(
      (parcelDescription: ParcelDescriptionInputDTO) => {
        return parcelDescription.apiAction === UserActionEnum.ADDED;
      },
    );
    if (parcelDescriptionsToAdd.length > 0) {
      await this.addParcelDescriptionsForSite(
        siteId,
        parcelDescriptionsToAdd,
        userInfo,
      );
    }
    const parcelDescriptionsToDelete = parcelDescriptions.filter(
      (parcelDescription: ParcelDescriptionInputDTO) => {
        return parcelDescription.apiAction === UserActionEnum.DELETED;
      },
    );
    if (parcelDescriptionsToDelete.length > 0) {
      await this.deleteParcelDescriptionsForSite(
        siteId,
        parcelDescriptionsToDelete,
      );
    }
    this.sitesLogger.log(
      'parcelDescriptionService.saveParcelDescriptionsForSite() end',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.saveParcelDescriptionsForSite() end',
    );
  }

  async addParcelDescriptionsForSite(
    siteId: string,
    parcelDescriptions: ParcelDescriptionInputDTO[],
    userInfo: any,
  ) {
    this.sitesLogger.log(
      'parcelDescriptionService.addParcelDescriptionsForSite() start',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.addParcelDescriptionsForSite() start',
    );

    const now = new Date();
    // Parse the parcel description into a subdivision database entity.
    const subdivisions: Subdivisions[] = parcelDescriptions.map(
      (parcelDescription) => {
        const pid =
          parcelDescription.descriptionType === ParcelDescriptionType.ParcelID
            ? parcelDescription.idPinNumber
            : null;
        const pin =
          parcelDescription.descriptionType ===
          ParcelDescriptionType.CrownLandPIN
            ? parcelDescription.idPinNumber
            : null;
        const crownLandsFileNo =
          parcelDescription.descriptionType ===
          ParcelDescriptionType.CrownLandFileNumber
            ? parcelDescription.idPinNumber
            : null;
        return {
          pid: pid,
          pin: pin,
          crownLandsFileNo: crownLandsFileNo,
          dateNoted: parcelDescription.dateNoted,
          srAction: parcelDescription.srAction,
          userAction: parcelDescription.userAction,
          whoUpdated: userInfo?.givenName,
          whenUpdated: now,
          whoCreated: userInfo?.givenName,
          whenCreated: now,
          // This value is enforced to be NOT NULL at the database level, but
          // aren't used anywhere in this application.
          pidStatusCd: 'N', // TODO: Determine what this is and set appropriately.
        } as Subdivisions;
      },
    );

    // Insert the new subdivisions into the database.
    let insertResult: InsertResult;
    try {
      // There is a bug with TypeORM where it will only return columns for the
      // first parent entity of an entity that uses inheritence. Here I'm using
      // the querybuilder to work around it.
      insertResult = await this.subdivisionsRepository
        .createQueryBuilder()
        .insert()
        .into(Subdivisions)
        .values(subdivisions)
        .returning('*')
        .execute();
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in parcelDescriptionService.addParcelDescriptionsForSite() end',
        JSON.stringify(error),
      );
      throw new BadRequestException('Failed to add Parcel Description.');
    }
    const newSubdivisions = insertResult.generatedMaps as Subdivisions[];

    // Use the id from the newly created subdivisions to create the related
    // siteSubdivisions.
    const siteSubdivisions: SiteSubdivisions[] = newSubdivisions.map(
      (newSubdivision) => {
        return {
          siteId: siteId,
          subdivId: newSubdivision.id,
          dateNoted: newSubdivision.dateNoted,
          userAction: newSubdivision.userAction,
          srAction: newSubdivision.userAction,
          whoUpdated: newSubdivision.whoUpdated,
          whenUpdated: newSubdivision.whenUpdated,
          whoCreated: newSubdivision.whoCreated,
          whenCreated: newSubdivision.whenCreated,
          // These two values are enforced to be NOT NULL at the database level,
          // but aren't used anywhere in this application.
          initialIndicator: 'N', // TODO: Determine what this is an set appropriately.
          sendToSr: newSubdivision.srAction === 'pending' ? 'Y' : 'N', // TODO: Validate that this is the correct mapping (I don't think we'll actually use this column).
        } as SiteSubdivisions;
      },
    );

    // Commit the new siteSubdivisions to the database.
    try {
      await this.siteSubdivisionsRepository.insert(siteSubdivisions);
    } catch (error) {
      // This code is called within a transaction in the site service, so the
      // previous insert should be rolled back if there is a failure here.
      this.sitesLogger.error(
        'Exception occured in parcelDescriptionService.addParcelDescriptionsForSite() end',
        JSON.stringify(error),
      );
      throw new BadRequestException('Failed to add Parcel Description.');
    }

    this.sitesLogger.log(
      'parcelDescriptionService.addParcelDescriptionsForSite() end',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.addParcelDescriptionsForSite() end',
    );
  }

  async updateParcelDescriptionsForSite(
    siteId: string,
    parcelDescriptions: ParcelDescriptionInputDTO[],
    userInfo: any,
  ) {
    this.sitesLogger.log(
      'parcelDescriptionService.updateParcelDescriptionsForSite() start',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.updateParcelDescriptionsForSite() start',
    );

    const now = new Date();
    // Fetch subdivision and siteSubdivision entities to update.
    const subdivIds = parcelDescriptions.map((parcelDescription) => {
      return parcelDescription.id;
    });
    let subdivisions = await this.subdivisionsRepository.findBy({
      id: In(subdivIds),
    });
    let siteSubdivisions = await this.siteSubdivisionsRepository.findBy({
      subdivId: In(subdivIds),
      siteId: siteId,
    });

    // Parse each parcel description's properties into its subdivision and
    // siteSubdivision database entities.
    parcelDescriptions.forEach((parcelDescription) => {
      let subdivision = subdivisions.find((subdivision) => {
        return subdivision.id === parcelDescription.id;
      });
      let siteSubdivision = siteSubdivisions.find((siteSubdivision) => {
        return siteSubdivision.subdivId === parcelDescription.id;
      });
      if (subdivision === undefined || siteSubdivision === undefined) {
        // This should only happen if the front end becomes out of sync with the
        // database, or the client modifies the request somehow.
        const error = new BadRequestException(
          'Failed to update Parcel Description.',
        );
        this.sitesLogger.error(
          'Exception occured in parcelDescriptionService.updateParcelDescriptionsForSite() end',
          JSON.stringify(error),
        );
        throw error;
      }
      subdivision.pid =
        parcelDescription.descriptionType === ParcelDescriptionType.ParcelID
          ? parcelDescription.idPinNumber
          : null;
      subdivision.pin =
        parcelDescription.descriptionType === ParcelDescriptionType.CrownLandPIN
          ? parcelDescription.idPinNumber
          : null;
      subdivision.crownLandsFileNo =
        parcelDescription.descriptionType ===
        ParcelDescriptionType.CrownLandFileNumber
          ? parcelDescription.idPinNumber
          : null;
      subdivision.dateNoted = parcelDescription.dateNoted;
      subdivision.srAction = parcelDescription.srAction;
      subdivision.userAction = parcelDescription.userAction;
      subdivision.whoUpdated = userInfo?.givenName;
      subdivision.whenUpdated = now;
      // Note: the user is never able to update the subdivision's legal/land
      // description. This data comes from LTSA.

      siteSubdivision.dateNoted = parcelDescription.dateNoted;
      siteSubdivision.userAction = parcelDescription.userAction;
      siteSubdivision.srAction = parcelDescription.srAction;
      siteSubdivision.whoUpdated = userInfo?.givenName;
      siteSubdivision.whenUpdated = now;
    });

    // Commit the updates.
    try {
      await this.subdivisionsRepository.save(subdivisions);
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in parcelDescriptionService.updateParcelDescriptionsForSite() end',
        JSON.stringify(error),
      );
      throw new BadRequestException('Failed to update Parcel Description.');
    }
    try {
      await this.siteSubdivisionsRepository.save(siteSubdivisions);
    } catch (error) {
      // This code is called within a transaction in the site service, so the
      // previous save should be rolled back if there is a failure here.
      this.sitesLogger.error(
        'Exception occured in parcelDescriptionService.updateParcelDescriptionsForSite() end',
        JSON.stringify(error),
      );
      throw new BadRequestException('Failed to update Parcel Description.');
    }

    this.sitesLogger.log(
      'parcelDescriptionService.updateParcelDescriptionsForSite() end',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.updateParcelDescriptionsForSite() end',
    );
  }

  async deleteParcelDescriptionsForSite(
    siteId: string,
    parcelDescriptions: ParcelDescriptionInputDTO[],
  ) {
    this.sitesLogger.log(
      'parcelDescriptionService.deleteParcelDescriptionsForSite() start',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.deleteParcelDescriptionsForSite() start',
    );

    const subdivIds = parcelDescriptions.map((parcelDescription) => {
      return parcelDescription.id;
    });
    let siteSubdivisions = await this.siteSubdivisionsRepository.findBy({
      subdivId: In(subdivIds),
      siteId: siteId,
    });
    let subdivisions = await this.subdivisionsRepository.findBy({
      id: In(subdivIds),
    });

    try {
      await this.subdivisionsRepository.remove(subdivisions);
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in parcelDescriptionService.deleteParcelDescriptionsForSite() end',
        JSON.stringify(error),
      );
      throw new BadRequestException('Failed removing Parcel Description.');
    }

    try {
      await this.siteSubdivisionsRepository.remove(siteSubdivisions);
    } catch (error) {
      // This code is called within a transaction in the site service, so the
      // previous save should be rolled back if there is a failure here.
      this.sitesLogger.error(
        'Exception occured in parcelDescriptionService.deleteParcelDescriptionsForSite() end',
        JSON.stringify(error),
      );
      throw new BadRequestException('Failed removing Parcel Description.');
    }

    this.sitesLogger.log(
      'parcelDescriptionService.deleteParcelDescriptionsForSite() end',
    );
    this.sitesLogger.debug(
      'parcelDescriptionService.deleteParcelDescriptionsForSite() end',
    );
  }
}
