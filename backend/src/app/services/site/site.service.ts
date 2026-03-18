import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Brackets, EntityManager, In, Repository } from 'typeorm';
import {
  FetchSiteDetail,
  FetchSiteDetailsResponse,
  FetchSiteResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteUtil } from '../../utils/site.util';
import { SaveSiteDetailsDTO } from '../../dto/saveSiteDetails.dto';
import { Events } from '../../entities/events.entity';
import { EventPartics } from '../../entities/eventPartics.entity';
import { SitePartics } from '../../entities/sitePartics.entity';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { LandHistories } from '../../entities/landHistories.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { HistoryLog } from '../../entities/siteHistoryLog.entity';
import { LandHistoryService } from '../landHistory/landHistory.service';
import { TransactionManagerService } from '../transactionManager/transactionManager.service';
import { UserActionEnum } from '../../common/userActionEnum';

import { SiteParticRoles } from '../../entities/siteParticRoles.entity';
import { LoggerService } from '../../logger/logger.service';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { SiteDocPartics } from '../../entities/siteDocPartics.entity';
import {
  BulkApproveRejectChangesDTO,
  QueryResultForPendingSites,
  SearchParams,
  SitePendingApprovalRecords,
  SiteRecordsForSRAction,
} from '../../dto/sitesPendingReview.dto';
import { ParcelDescriptionsService } from '../parcelDescriptions/parcelDescriptions.service';
import { SiteFilters } from '../../resolvers/site/sitePublic.resolver';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { Snapshots } from '../../entities/snapshots.entity';
import { Place } from '../../entities/placeEntity';
import { UserTypeEum } from '../../common/userType';
import {
  BC_ALBERS,
  dmsToDecimal,
  LatLngTuple,
  WGS_84,
} from '../../utils/geometry';

import { MAX_CIRCLE_RADIUS, MIN_CIRCLE_RADIUS } from '../../utils/constants';
import { SiteRegistry } from '../../entities/siteRegistry.entity';
import { SortByDirection } from '../../utils/enums/sortByDirection.enum';
import { SiteSortBy } from '../../utils/enums/sortByFields.enum';
import { SiteInsightsDto } from '../../dto/siteInsights.dto';
import { RadiusSearchParams } from '../../dto/radiusSearchParams.dto';
import { SiteProfileSchedule2Ref } from '../../entities/siteProfileSchedule2Ref';

/**
 * Nestjs Service For Region Entity
 */
@Injectable()
export class SiteService {
  constructor(
    @InjectRepository(Sites)
    private siteRepository: Repository<Sites>,
    @InjectRepository(Events)
    private eventsRepositoryRepo: Repository<Events>,
    @InjectRepository(EventPartics)
    private eventsParticipantsRepo: Repository<EventPartics>,
    @InjectRepository(SitePartics)
    private siteParticipantsRepo: Repository<SitePartics>,
    @InjectRepository(SiteParticRoles)
    private siteParticipantRolesRepo: Repository<SiteParticRoles>,
    @InjectRepository(SiteDocs)
    private siteDocumentsRepo: Repository<SiteDocs>,
    @InjectRepository(SiteDocPartics)
    private siteDocumentParticsRepo: Repository<SiteDocPartics>,
    @InjectRepository(SiteAssocs)
    private siteAssociationsRepo: Repository<SiteAssocs>,
    @InjectRepository(LandHistories)
    private landHistoriesRepo: Repository<LandHistories>,
    @InjectRepository(SiteSubdivisions)
    private siteSubDivisionsRepo: Repository<SiteSubdivisions>,
    @InjectRepository(SiteProfiles)
    private siteProfilesRepo: Repository<SiteProfiles>,
    @InjectEntityManager()
    private readonly entityManager: EntityManager,
    @InjectRepository(HistoryLog)
    private historyLogRepository: Repository<HistoryLog>,
    @InjectRepository(Place)
    private placeRepository: Repository<Place>,
    @InjectRepository(SiteRegistry)
    private siteRegistryRepository: Repository<SiteRegistry>,

    private readonly landHistoryService: LandHistoryService,
    private readonly parcelDescriptionService: ParcelDescriptionsService,
    private transactionManagerService: TransactionManagerService,
    private readonly sitesLogger: LoggerService,
    private readonly snapShotService: SnapshotsService,
  ) {}

  /**
   * Find All method for returining all sites
   * @returns FetchSiteResponse -- returns sites
   */
  async findAll() {
    this.sitesLogger.log('SiteService.findAll() start');
    this.sitesLogger.debug('SiteService.findAll() start');
    const response = new FetchSiteResponse();

    response.httpStatusCode = 200;

    response.data = await this.siteRepository.find();

    this.sitesLogger.log('SiteService.findAll() end');
    this.sitesLogger.debug('SiteService.findAll() end');
    return response;
  }

  /**
   * Find sites where search parameter matches a site id or address
   * @param searchParam search parameter
   * @returns sites where id or address matches the search param
   */
  async searchSites(
    userInfo: any,
    searchParam: string,
    page: number,
    pageSize: number,
    sortBy: SiteSortBy,
    sortByDir: SortByDirection,
    filters: SiteFilters,
  ) {
    const {
      siteIds,
      id,
      srStatus,
      siteRiskCode,
      commonName,
      addrLine_1,
      city,
      whoCreated,
      latlongReliabilityFlag,
      latdeg,
      latDegrees,
      latMinutes,
      latSeconds,
      longdeg,
      longDegrees,
      longMinutes,
      longSeconds,
      whenCreated,
      whenUpdated,
    } = filters;

    this.sitesLogger.log('SiteService.searchSites() start');

    const siteUtil: SiteUtil = new SiteUtil();
    const response = new SearchSiteResponse();

    if (!searchParam?.trim() && (!siteIds || siteIds.length === 0)) {
      response.sites = [];
      response.count = 0;
      response.page = page;
      response.pageSize = pageSize;
      return response;
    } else {
      const query = this.siteRepository.createQueryBuilder('sites');

      if (siteIds && siteIds.length === 0) {
        throw new HttpException(
          `If provided, siteIds filter array must not be empty`,
          HttpStatus.BAD_REQUEST,
        );
      } else if (siteIds && siteIds.length > 0) {
        query.whereInIds(siteIds);
      }

      let pid;
      if (searchParam?.length === 11 || searchParam?.length === 9) {
        pid = searchParam.replace(/-/g, '');
      }

      if (pid) {
        query
          .innerJoin('sites.siteSubdivisions', 'siteSubdivisions')
          .innerJoin('siteSubdivisions.subdivision', 'subdivision');
      }

      if (searchParam?.trim()) {
        const keywords = searchParam.trim().toLowerCase().split(/\s+/);
        query.andWhere(
          new Brackets((qb) => {
            for (const word of keywords) {
              qb.andWhere(
                new Brackets((subQb) => {
                  subQb
                    .orWhere('LOWER(sites.addr_line_1) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.addr_line_2) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.addr_line_3) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.addr_line_4) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.city) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.common_name) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.provState) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('LOWER(sites.postalCode) LIKE :word', {
                      word: `%${word}%`,
                    })
                    .orWhere('CAST(sites.id AS TEXT) LIKE :word', {
                      word: `%${word}%`,
                    });
                }),
              );
            }
            if (pid) {
              qb.orWhere('subdivision.pid = :pid', { pid });
              qb.orWhere('subdivision.pin = :pin', { pin: pid });
            }
          }),
        );
      }

      if (!userInfo || userInfo?.identity_provider !== UserTypeEum.IDIR) {
        query.andWhere('sites.srAction = :srAction', {
          srAction: SRApprovalStatusEnum.PUBLIC,
        });
      }

      if (id) {
        const ids = id.split(',').map((v) => v.trim());
        this.sitesLogger.log(`Applying id filter: ${JSON.stringify(ids)}`);
        // Build OR conditions for each ID
        query.andWhere(
          new Brackets((qb) => {
            ids.forEach((siteId, index) => {
              if (index === 0) {
                qb.where(`CAST(sites.id AS TEXT) = :id${index}`, {
                  [`id${index}`]: siteId,
                });
              } else {
                qb.orWhere(`CAST(sites.id AS TEXT) = :id${index}`, {
                  [`id${index}`]: siteId,
                });
              }
            });
          }),
        );
      }

      if (srStatus) {
        query.andWhere('sites.srStatus = :srStatus', { srStatus: srStatus });
      }

      if (siteRiskCode) {
        query.andWhere('sites.site_risk_code = :siteRiskCode', {
          siteRiskCode: siteRiskCode,
        });
      }

      if (commonName) {
        query.andWhere('sites.common_name = :commonName', {
          commonName: commonName,
        });
      }

      if (addrLine_1) {
        const cleanedAddress = siteUtil.removeSpecialCharacters(addrLine_1);
        query.andWhere(
          `regexp_replace(concat_ws('', sites.addr_line_1, sites.addr_line_2, sites.addr_line_3, sites.addr_line_4), '[^a-zA-Z0-9]', '', 'g') LIKE :cleanedAddress`,
          { cleanedAddress: `%${cleanedAddress}%` },
        );
      }

      if (city) query.andWhere('sites.city = :city', { city });
      if (whoCreated)
        query.andWhere('sites.who_created = :whoCreated', { whoCreated });
      if (latlongReliabilityFlag)
        query.andWhere(
          'sites.latlong_reliability_flag = :latlongReliabilityFlag',
          { latlongReliabilityFlag },
        );

      if (latdeg) query.andWhere('sites.latdeg = :latdeg', { latdeg });
      if (latDegrees)
        query.andWhere('sites.lat_degrees = :latDegrees', { latDegrees });
      if (latMinutes)
        query.andWhere('sites.lat_minutes = :latMinutes', { latMinutes });
      if (latSeconds)
        query.andWhere('sites.lat_seconds = :latSeconds', { latSeconds });
      if (longdeg) query.andWhere('sites.longdeg = :longdeg', { longdeg });
      if (longDegrees)
        query.andWhere('sites.long_degrees = :longDeg', {
          longDeg: longDegrees,
        });
      if (longMinutes)
        query.andWhere('sites.long_minutes = :longMinutes', { longMinutes });
      if (longSeconds)
        query.andWhere('sites.long_seconds = :longSeconds', { longSeconds });

      if (
        whenCreated?.length === 2 &&
        whenCreated.every((date) => date instanceof Date)
      ) {
        query.andWhere('sites.whenCreated BETWEEN :start AND :end', {
          start: whenCreated[0],
          end: whenCreated[1],
        });
      }

      if (
        whenUpdated?.length === 2 &&
        whenUpdated.every((date) => date instanceof Date)
      ) {
        query.andWhere('sites.whenUpdated BETWEEN :start AND :end', {
          start: whenUpdated[0],
          end: whenUpdated[1],
        });
      }

      const sortFieldMap: Record<SiteSortBy, string> = {
        [SiteSortBy.ID]: 'sites.id',
        [SiteSortBy.SR_STATUS]: 'sites.srStatus',
        [SiteSortBy.SITE_RISK_CODE]: 'sites.site_risk_code',
        [SiteSortBy.COMMON_NAME]: 'sites.common_name',
        [SiteSortBy.CITY]: 'sites.city',
        [SiteSortBy.SITE_ADDRESS]: `
        CASE
          WHEN sites.addr_line_1 IS NOT NULL THEN sites.addr_line_1
          WHEN sites.addr_line_2 IS NOT NULL THEN sites.addr_line_2
          WHEN sites.addr_line_3 IS NOT NULL THEN sites.addr_line_3
          ELSE ''
        END
      `,
        [SiteSortBy.WHO_CREATED]: 'sites.who_created',
        [SiteSortBy.LAT_DEGREES_MINUTES_SECONDS]: `
        CASE
          WHEN sites.lat_degrees IS NOT NULL THEN sites.lat_degrees
          WHEN sites.lat_minutes IS NOT NULL THEN sites.lat_minutes
          WHEN sites.lat_seconds IS NOT NULL THEN sites.lat_seconds
          ELSE NULL
        END
      `,
        [SiteSortBy.LONG_DEGREES_MINUTES_SECONDS]: `
        CASE
          WHEN sites.long_degrees IS NOT NULL THEN sites.long_degrees
          WHEN sites.long_minutes IS NOT NULL THEN sites.long_minutes
          WHEN sites.long_seconds IS NOT NULL THEN sites.long_seconds
          ELSE NULL
        END
      `,
        [SiteSortBy.WHEN_CREATED]: 'sites.whenCreated',
        [SiteSortBy.WHEN_UPDATED]: 'sites.whenUpdated',
        [SiteSortBy.GENERAL_DESCRIPTION]: 'sites.general_description',
        [SiteSortBy.LAT_LONG_RELIABILITY_FLAG]:
          'sites.latlong_reliability_flag',
        [SiteSortBy.LAT_DEG]: 'sites.latdeg',
        [SiteSortBy.LONG_DEG]: 'sites.longdeg',
        [SiteSortBy.CONSULTANT_SUBMITTED]: 'sites.consultant_submitted',
      };

      if (sortBy && sortFieldMap[sortBy]) {
        query.orderBy(
          sortFieldMap[sortBy],
          sortByDir === SortByDirection.DESC ? 'DESC' : 'ASC',
        );
      }

      const result = await query
        .skip((page - 1) * pageSize)
        .take(pageSize)
        .getManyAndCount();

      response.sites = result[0] || [];
      response.count = result[1] || 0;
      response.page = page;
      response.pageSize = pageSize;

      this.sitesLogger.log('SiteService.searchSites() end');
      return response;
    }
  }

  async mapSearch({
    searchTerm,
    polygon,
    circle,
  }: {
    searchTerm?: string;
    polygon?: LatLngTuple[];
    circle?: RadiusSearchParams;
  }) {
    this.sitesLogger.log('SiteService.mapSearch() start');

    if (polygon && polygon.length < 3) {
      throw new HttpException(
        'Polygon must have at least 3 vertices',
        HttpStatus.BAD_REQUEST,
      );
    }

    const searchTermClean = (searchTerm ?? '').toLowerCase().trim();
    const query = this.siteRepository.createQueryBuilder('sites');

    if (searchTermClean.length) {
      query
        .where('LOWER(sites.addr_line_1) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        })
        .orWhere('LOWER(sites.addr_line_2) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        })
        .orWhere('LOWER(sites.addr_line_3) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        })
        .orWhere('LOWER(sites.addr_line_4) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        })
        .orWhere('LOWER(sites.city) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        })
        .orWhere('LOWER(sites.provState) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        })
        .orWhere('LOWER(sites.postalCode) LIKE LOWER(:searchTerm)', {
          searchTerm: `%${searchTermClean}%`,
        });
    }

    if (polygon) {
      const polygonVertices = [...polygon];

      // This makes sure that the provided shape is enclosed
      if (polygonVertices[0] !== polygonVertices[polygonVertices.length - 1]) {
        polygonVertices.push(polygonVertices[0]);
      }

      const polygonString = polygonVertices
        .map(([lat, long]) => `${long} ${lat}`)
        .join(', ');

      query.where(
        `ST_Within(
          ST_Transform(sites.geometry, ${BC_ALBERS}), 
          ST_Transform(ST_GeomFromText('POLYGON((${polygonString}))', ${WGS_84}), ${BC_ALBERS})
        )`,
      );
    }

    if (circle && circle.radius < MIN_CIRCLE_RADIUS) {
      throw new HttpException(
        'Circle radius must be at least 500 meters',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (circle && circle.radius > MAX_CIRCLE_RADIUS) {
      throw new HttpException(
        'Circle radius cannot exceed 500 km',
        HttpStatus.BAD_REQUEST,
      );
    }

    if (circle && circle.center) {
      const [latitude, longitude] = circle.center;
      if (
        latitude === null ||
        latitude === undefined ||
        longitude === null ||
        longitude === undefined
      ) {
        throw new HttpException(
          'Latitude and longitude cannot be null or undefined',
          HttpStatus.BAD_REQUEST,
        );
      }
    }

    if (circle) {
      const { center, radius } = circle;
      const [latitude, longitude] = center;

      query.where(
        `ST_DWithin(
          ST_Transform(sites.geometry, ${BC_ALBERS}),
          ST_Transform(ST_SetSRID(ST_MakePoint(${longitude}, ${latitude}),${WGS_84}), ${BC_ALBERS}),
          ${radius}
          )`,
      );
    }

    const [result] = await query.getManyAndCount();
    this.sitesLogger.log('SiteService.mapSearch() end');
    return result;
  }

  async findSitesAndPlaces(searchTerm = '', limit = 3) {
    this.sitesLogger.log('SiteService.findSitesAndPlaces() start');

    const searchTermClean = searchTerm.toLowerCase().trim();
    const sitesQuery = this.siteRepository.createQueryBuilder('sites');
    const placesQuery = this.placeRepository.createQueryBuilder('places');

    if (searchTermClean.length === 0) {
      return {
        sites: [],
        places: [],
      };
    }

    sitesQuery
      .where('CAST(sites.id AS TEXT) = :searchTermId', {
        searchTermId: searchTermClean,
      })
      .orWhere('LOWER(sites.common_name) LIKE LOWER(:searchTermName)', {
        searchTermName: `%${searchTermClean}%`,
      })
      .limit(limit)
      // This makes sure that sites found by ID match appear first on the list, sites found by common_name match follow
      .orderBy(
        `CASE 
          WHEN CAST(sites.id AS TEXT) LIKE :searchTermId THEN 0 
          ELSE 1 
        END`,
        'ASC',
      )
      .addOrderBy('sites.id', 'ASC');
    placesQuery
      .where('LOWER(places.name) LIKE LOWER(:searchTerm)', {
        searchTerm: `%${searchTermClean}%`,
      })
      .limit(limit);

    const [[sites], [places]] = await Promise.all([
      sitesQuery.getManyAndCount(),
      placesQuery.getManyAndCount(),
    ]);

    this.sitesLogger.log('SiteService.findSitesAndPlaces() end');
    return { sites, places };
  }

  /**
   * Find sites by its ID
   * @param siteId site Id
   * @returns a single site matching the site ID
   */
  async findSiteBySiteId(siteId: string, pending: boolean, userInfo: any) {
    this.sitesLogger.log('SiteService.findSiteBySiteId() start');
    this.sitesLogger.debug('SiteService.findSiteBySiteId() start');
    const response = new FetchSiteDetailsResponse();

    response.httpStatusCode = 200;

    let snapShot: Snapshots = null;

    if (!userInfo) {
      this.sitesLogger.log('SiteService.findSiteBySiteId() user not logged in');

      snapShot = null;
    } else if (userInfo?.identity_provider === 'idir') {
      this.sitesLogger.log(
        'SiteService.findSiteBySiteId() idir user - no snapshot',
      );
    } else {
      snapShot = await this.snapShotService.getMostRecentSnapshot(
        siteId,
        userInfo.sub,
      );
    }

    if (!snapShot) {
      if (pending) {
        const result = await this.siteRepository.findOne({
          where: { id: siteId, srAction: SRApprovalStatusEnum.PENDING },
          relations: ['siteAssocs', 'siteAssocs.siteIdAssociatedWith2'],
        });
        response.data = result ? result : null;
      } else {
        const result = await this.siteRepository.findOne({
          where: { id: siteId },
          relations: ['siteAssocs', 'siteAssocs.siteIdAssociatedWith2'],
        });
        response.data = result ? result : null;
      }
    } else {
      response.data = snapShot.snapshotData?.sitesSummary;
    }

    this.sitesLogger.log('SiteService.findSiteBySiteId() end');
    this.sitesLogger.debug('SiteService.findSiteBySiteId() end');

    return response;
  }

  async searchSiteIds(searchParam: string) {
    this.sitesLogger.log('SiteService.searchSiteIds() start');
    this.sitesLogger.debug('SiteService.searchSiteIds() start');
    try {
      // Use query builder to type cast the 'id' field to a string
      const queryBuilder = this.siteRepository
        .createQueryBuilder('sites')
        .where('CAST(sites.id AS TEXT) LIKE :searchParam', {
          searchParam: `%${searchParam}%`,
        })
        .orderBy('sites.id', 'ASC'); // Ordering by 'id' in ascending order;
      const result = await queryBuilder.getMany();
      if (result) {
        this.sitesLogger.log('SiteService.searchSiteIds() end');
        this.sitesLogger.debug('SiteService.searchSiteIds() end');
        return result.map((obj: any) => ({ key: obj.id, value: obj.id }));
      } else {
        this.sitesLogger.log('SiteService.searchSiteIds() end');
        this.sitesLogger.debug('SiteService.searchSiteIds() end');
        return []; // Return an empty array if no results
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SiteService.searchSiteIds() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve site ids.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async saveSiteDetails(
    inputDTO: SaveSiteDetailsDTO,
    userInfo: any,
  ): Promise<boolean> {
    try {
      if (!inputDTO) {
        return false;
      } else {
        const transactionResult = await this.entityManager.transaction(
          async (transactionalEntityManager: EntityManager) => {
            this.transactionManagerService.setEntityManager(
              transactionalEntityManager,
            );
            try {
              return this.commitSiteDetails(
                transactionalEntityManager,
                inputDTO,
                userInfo,
              );
            } catch (error) {
              console.error('Save Site Details Transaction failed', error);
              return false;
            }
          },
        );

        if (transactionResult) return true;
        else return false;
      }
    } catch (error) {
      this.sitesLogger.log(
        `SiteService.saveSiteDetails(): Save site details error
        ${error}`,
      );
      throw new HttpException(
        `Failed to save site details.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  async commitSiteDetails(
    transactionalEntityManager: EntityManager,
    inputDTO: SaveSiteDetailsDTO,
    userInfo: any,
  ): Promise<boolean> {
    let {
      siteId,
      sitesSummary,
      events,
      eventsParticipants,
      siteParticipants,
      documents,
      siteAssociations,
      parcelDescriptions,
      landHistories,
      profiles,
    } = inputDTO;

    if (sitesSummary) {
      const { apiAction, ...summary } = sitesSummary;

      switch (apiAction) {
        case UserActionEnum.ADDED:
          let siteCurrentMaxId = await this.getMaxId(this.siteRepository, 'id');
          siteId = (siteCurrentMaxId + 1).toString();
          this.sitesLogger.log(
            `SiteService.saveSiteDetails(): Adding new site with id ${siteId}`,
          );

          const {
            latDegrees,
            latMinutes,
            latSeconds,
            longDegrees,
            longMinutes,
            longSeconds,
          } = summary;

          if (!!latDegrees) {
            summary.latdeg = dmsToDecimal(latDegrees, latMinutes, latSeconds);
          }

          if (!!longDegrees) {
            summary.longdeg = dmsToDecimal(
              longDegrees,
              longMinutes,
              longSeconds,
            );
          }

          const newSitesSummary = {
            ...summary,
            id: siteId,
            userAction: UserActionEnum.ADDED,
            srAction: SRApprovalStatusEnum.PENDING,
            whenCreated: new Date(),
            whoCreated: userInfo?.givenName,
            whenUpdated: new Date(),
            whoUpdated: userInfo?.givenName,
          };
          await transactionalEntityManager.save(Sites, newSitesSummary);
          break;
        case UserActionEnum.UPDATED:
          this.sitesLogger.log(
            `SiteService.saveSiteDetails(): Updating site with id ${sitesSummary.id}`,
          );

          const existingSite = await transactionalEntityManager.findOneOrFail(
            Sites,
            {
              where: { id: sitesSummary.id },
            },
          );

          if (existingSite) {
            const updatedSite = {
              ...existingSite,
              ...summary,
              userAction:
                sitesSummary.srAction === SRApprovalStatusEnum.PUBLIC ||
                sitesSummary.srAction === SRApprovalStatusEnum.PRIVATE
                  ? UserActionEnum.DEFAULT
                  : UserActionEnum.UPDATED,
              whenUpdated: new Date(),
              whoUpdated: userInfo?.givenName,
            };
            await transactionalEntityManager.update(
              Sites,
              { id: sitesSummary.id },
              updatedSite,
            );
          } else {
            this.sitesLogger.log(
              `SiteService.saveSiteDetails(): Site with id ${sitesSummary.id} not found`,
            );
          }

          break;
        default:
          this.sitesLogger.warn(
            'SiteService.siteSummary(): Unknown action for site summary:',
          );
      }
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails(): No changes To Site Summary',
      );
    }

    if (events?.length > 0) {
      await this.processEvents(
        events,
        userInfo,
        transactionalEntityManager,
        siteId,
      );
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails(): No changes To Site Events',
      );
    }

    if (siteParticipants?.length > 0) {
      await this.processSiteParticipants(
        siteParticipants,
        userInfo,
        transactionalEntityManager,
        siteId,
      );
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails(): No changes To Site Participants',
      );
    }

    if (documents?.length > 0) {
      await this.processDocuments(
        documents,
        userInfo,
        transactionalEntityManager,
        siteId,
      );
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails(): No changes To Site Documents',
      );
    }

    if (siteAssociations?.length > 0) {
      await this.processSiteAssociated(
        siteAssociations,
        userInfo,
        transactionalEntityManager,
        siteId,
      );
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails(): No changes To Site Associations',
      );
    }

    if (parcelDescriptions) {
      await this.parcelDescriptionService.saveParcelDescriptionsForSite(
        siteId,
        parcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails(): No changes to Parcel Descriptions.',
      );
    }

    if (landHistories) {
      await this.landHistoryService.updateLandHistoriesForSite(
        siteId,
        landHistories,
        userInfo,
      );
    } else {
      console.log('No changes To Site LandHistories');
    }

    if (profiles?.length > 0) {
      await this.processSiteDisclosure(
        profiles,
        userInfo,
        transactionalEntityManager,
        siteId,
      );
    } else {
      this.sitesLogger.log(
        'SiteService.saveSiteDetails():No changes To Site profiles',
      );
    }

    const historyLog: HistoryLog = {
      userId: userInfo ? userInfo.sub : '',
      content: inputDTO,
      id: null,
      whoCreated: userInfo ? userInfo.givenName : '',
      whenCreated: new Date(),
      whenUpdated: new Date(),
      whoUpdated: userInfo ? userInfo.givenName : '',
      siteId: siteId,
    };

    await transactionalEntityManager.save(HistoryLog, historyLog);

    const hasPublicSrAction =
      sitesSummary?.srAction === SRApprovalStatusEnum.PUBLIC ||
      events?.some(
        (event) =>
          event.srAction === SRApprovalStatusEnum.PUBLIC ||
          event.notationParticipant?.some(
            (participant) =>
              participant.srAction === SRApprovalStatusEnum.PUBLIC,
          ),
      ) ||
      eventsParticipants?.some(
        (participant) => participant.srAction === SRApprovalStatusEnum.PUBLIC,
      ) ||
      siteParticipants?.some(
        (participant) => participant.srAction === SRApprovalStatusEnum.PUBLIC,
      ) ||
      documents?.some((doc) => doc.srAction === SRApprovalStatusEnum.PUBLIC) ||
      siteAssociations?.some(
        (assoc) => assoc.srAction === SRApprovalStatusEnum.PUBLIC,
      ) ||
      parcelDescriptions?.some(
        (parcel) => parcel.srAction === SRApprovalStatusEnum.PUBLIC,
      ) ||
      landHistories?.some(
        (history) => history.srAction === SRApprovalStatusEnum.PUBLIC,
      ) ||
      profiles?.some(
        (profile) => profile.srAction === SRApprovalStatusEnum.PUBLIC,
      );

    if (hasPublicSrAction) {
      await this.updateSiteRegistryLastApprovedDate(
        transactionalEntityManager,
        siteId,
        userInfo,
      );
    }

    return true;
  }

  /**
   * Processes and saves site documents based on the provided actions.
   * @param documents - Array of documents data including actions to be performed.
   * @param userInfo - Information about the user performing the actions.
   * @param transactionalEntityManager - Entity manager for handling transactions.
   */
  async processDocuments(
    documents: any[],
    userInfo: any,
    transactionalEntityManager: EntityManager,
    siteId: string,
  ) {
    try {
      if (documents?.length > 0) {
        const newDocuments: SiteDocs[] = [];
        const updateDocuments: { id: string; changes: Partial<SiteDocs> }[] =
          [];
        const deleteDocuments: { id: string; changes: Partial<SiteDocs> }[] =
          [];
        const deleteDocumentParticipants: {
          id: string;
          changes: Partial<SiteDocPartics>;
        }[] = [];
        const newDocumentParticipants: SiteDocPartics[] = [];
        const updateDocumentParticipants: {
          id: string;
          changes: Partial<SiteDocPartics>;
        }[] = [];

        // Use the utility function to get the current max ID for the documents table
        let currentDocMaxId = await this.getMaxId(this.siteDocumentsRepo, 'id');

        // Use the utility function to get the current max ID for the document participants table
        let currentDocParticsMaxId = await this.getMaxId(
          this.siteDocumentParticsRepo,
          'id',
        );

        const siteDocuments = documents.map(async (document) => {
          const {
            displayName,
            psnorgId,
            organizationName,
            docParticId,
            apiAction,
            srAction,
            ...siteDocumentData
          } = document;

          // Validate participant ID
          let documentId = document.id || ''; // Ensure it's a string

          const siteDocument = {
            ...new SiteDocs(),
            ...siteDocumentData,
            srAction,
          };
          const siteDocumentParticipant = {
            ...new SiteDocPartics(),
            psnorgId,
            srAction,
          };

          switch (apiAction) {
            case UserActionEnum.ADDED:
              // Only fetch the MAX(id) when adding new documents
              currentDocMaxId += 1;
              documentId = currentDocMaxId.toString();
              const currentDate = new Date();
              newDocuments.push({
                ...siteDocument,
                id: documentId,
                siteId: siteId,
                userAction: UserActionEnum.ADDED,
                srAction: SRApprovalStatusEnum.PENDING,
                whenCreated: currentDate,
                whoCreated: userInfo ? userInfo.givenName : '',
                whenUpdated: currentDate,
                whoUpdated: userInfo ? userInfo.givenName : '',
              });

              currentDocParticsMaxId += 1;
              let newDocParticId = currentDocParticsMaxId.toString();
              newDocumentParticipants.push({
                ...siteDocumentParticipant,
                id: newDocParticId,
                sdocId: documentId,
                dprCode: 'ATH', // dprCode is always ATH. We don't have a UI for this value and keeping this column allows us to maintain historical data.
                userAction: UserActionEnum.ADDED,
                srAction: SRApprovalStatusEnum.PENDING,
                whenCreated: currentDate,
                whoCreated: userInfo ? userInfo.givenName : '',
                whenUpdated: currentDate,
                whoUpdated: userInfo ? userInfo.givenName : '',
              });

              break;
            case UserActionEnum.UPDATED:
              const existingDocument =
                await this.siteDocumentsRepo.findOneByOrFail({
                  id: documentId,
                });
              if (existingDocument) {
                updateDocuments.push({
                  id: documentId,
                  changes: {
                    ...existingDocument,
                    ...siteDocument,
                    userAction:
                      document.srAction === SRApprovalStatusEnum.PUBLIC ||
                      document.srAction === SRApprovalStatusEnum.PRIVATE
                        ? UserActionEnum.DEFAULT
                        : UserActionEnum.UPDATED,
                    whenUpdated: new Date(),
                    whoUpdated: userInfo ? userInfo.givenName : '',
                  },
                });

                const existingDocumentParticipant =
                  docParticId &&
                  (await this.siteDocumentParticsRepo.findOneByOrFail({
                    id: docParticId,
                  }));
                if (existingDocumentParticipant) {
                  updateDocumentParticipants.push({
                    id: docParticId,
                    changes: {
                      ...existingDocumentParticipant,
                      ...siteDocumentParticipant,
                      userAction:
                        document.srAction === SRApprovalStatusEnum.PUBLIC ||
                        document.srAction === SRApprovalStatusEnum.PRIVATE
                          ? UserActionEnum.DEFAULT
                          : UserActionEnum.UPDATED,
                      whenUpdated: new Date(),
                      whoUpdated: userInfo ? userInfo.givenName : '',
                    },
                  });
                } else {
                  this.sitesLogger.log(
                    `SiteService.processDocuments(): There is no document participant in database againts id : ${docParticId}`,
                  );
                }
              } else {
                this.sitesLogger.log(
                  `SiteService.processDocuments(): There is no document in database againts document id : ${documentId}`,
                );
              }
              break;
            case UserActionEnum.DELETED:
              this.sitesLogger.log(
                `SiteService.processDocuments(): Document deletion process start();`,
              );
              deleteDocuments.push({
                id: documentId,
                changes: {
                  whenDeleted: new Date(),
                  whoDeleted: userInfo ? userInfo.givenName : '',
                },
              });
              deleteDocumentParticipants.push({
                id: docParticId,
                changes: {
                  whenDeleted: new Date(),
                  whoDeleted: userInfo ? userInfo.givenName : '',
                },
              });
              this.sitesLogger.log(
                `SiteService.processDocuments(): Document deletion process end();`,
              );
              break;
            default:
              this.sitesLogger.warn(
                'SiteService.processDocuments(): Unknown action for document:',
              );
          }
        });

        await Promise.all(siteDocuments);

        // Save new site documents and site document participants in bulk
        if (newDocuments?.length > 0) {
          await transactionalEntityManager.save(SiteDocs, newDocuments);
        }

        if (newDocumentParticipants?.length > 0) {
          await transactionalEntityManager.save(
            SiteDocPartics,
            newDocumentParticipants,
          );
        }

        // Update existing site documents and site document participants in bulk
        if (updateDocuments?.length > 0) {
          await Promise.all(
            updateDocuments.map(({ id, changes }) =>
              transactionalEntityManager.update(SiteDocs, { id }, changes),
            ),
          );
        }

        if (updateDocumentParticipants?.length > 0) {
          await Promise.all(
            updateDocumentParticipants.map(({ id, changes }) =>
              transactionalEntityManager.update(
                SiteDocPartics,
                { id },
                changes,
              ),
            ),
          );
        }

        // Delete existing site documents and site document participants in bulk
        if (deleteDocuments?.length > 0) {
          await Promise.all(
            deleteDocuments.map(({ id, changes }) =>
              transactionalEntityManager.update(SiteDocs, { id }, changes),
            ),
          );
        }

        if (deleteDocumentParticipants?.length > 0) {
          await Promise.all(
            deleteDocumentParticipants.map(({ id, changes }) =>
              transactionalEntityManager.update(
                SiteDocPartics,
                { id },
                changes,
              ),
            ),
          );
        }
      }
    } catch (error) {
      throw new HttpException(
        `Failed to process documents.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Processes and saves site participants based on the provided actions.
   * @param siteParticipants - Array of site participant data including actions to be performed.
   * @param userInfo - Information about the user performing the actions.
   * @param transactionalEntityManager - Entity manager for handling transactions.
   */
  async processSiteParticipants(
    siteParticipants: any[],
    userInfo: any,
    transactionalEntityManager: EntityManager,
    siteId: string,
  ) {
    try {
      if (siteParticipants?.length) {
        // Arrays to store new and updated entities
        const newSitePartics: SitePartics[] = [];
        const updatedSitePartics: {
          id: string;
          changes: Partial<SitePartics>;
        }[] = [];
        const deleteSitePartics: { id: string }[] = [];
        const newSiteParticRoles: SiteParticRoles[] = [];
        const updatedSiteParticRoles: {
          id: string;
          changes: Partial<SiteParticRoles>;
        }[] = [];
        const deleteSiteParticRoles: { id: string }[] = [];
        let currentSiteParticMaxId = await this.getMaxId(
          this.siteParticipantsRepo,
          'id',
        );

        // Main processing loop for site participants
        const siteParticsPromises = siteParticipants.map(
          async (participant) => {
            const {
              description,
              displayName,
              prCode,
              apiAction,
              particRoleId,
              srAction,
              srValue,
              ...siteParticsData
            } = participant;

            // Validate participant ID
            let participantId = participant.id || ''; // Ensure it's a string

            const sitePartic: SitePartics = {
              ...new SitePartics(),
              ...siteParticsData,
              srAction,
            };

            const siteParticRole: SiteParticRoles = {
              ...new SiteParticRoles(),
              prCode,
              srAction,
            };

            switch (apiAction) {
              case UserActionEnum.ADDED:
                // Get the ID of the newly created participant
                currentSiteParticMaxId += 1;
                participantId = currentSiteParticMaxId.toString();
                const currentDate = new Date();
                newSitePartics.push({
                  ...sitePartic,
                  id: participantId,
                  siteId: siteId,
                  userAction: UserActionEnum.ADDED,
                  whenCreated: currentDate,
                  whoCreated: userInfo ? userInfo.givenName : '',
                  whenUpdated: currentDate,
                  whoUpdated: userInfo ? userInfo.givenName : '',
                });

                newSiteParticRoles.push({
                  ...siteParticRole,
                  spId: participantId,
                  userAction: UserActionEnum.ADDED,
                  whenCreated: currentDate,
                  whoCreated: userInfo ? userInfo.givenName : '',
                  whenUpdated: currentDate,
                  whoUpdated: userInfo ? userInfo.givenName : '',
                });
                break;

              case UserActionEnum.UPDATED:
                const existingSitePartic =
                  await this.siteParticipantsRepo.findOneByOrFail({
                    id: participantId,
                  });

                if (existingSitePartic) {
                  updatedSitePartics.push({
                    id: participantId,
                    changes: {
                      ...new SitePartics(),
                      ...existingSitePartic,
                      ...sitePartic,
                      userAction:
                        sitePartic.srAction === SRApprovalStatusEnum.PUBLIC ||
                        sitePartic.srAction === SRApprovalStatusEnum.PRIVATE
                          ? UserActionEnum.DEFAULT
                          : UserActionEnum.UPDATED,
                      whenUpdated: new Date(),
                      whoUpdated: userInfo ? userInfo.givenName : '',
                    },
                  });

                  const existingSiteParticRole =
                    await this.siteParticipantRolesRepo.findOneByOrFail({
                      id: particRoleId,
                    });
                  if (existingSiteParticRole) {
                    updatedSiteParticRoles.push({
                      id: particRoleId,
                      changes: {
                        ...existingSiteParticRole,
                        ...siteParticRole,
                        userAction: UserActionEnum.UPDATED,
                        whenUpdated: new Date(),
                        whoUpdated: userInfo ? userInfo.givenName : '',
                      },
                    });
                  } else {
                    this.sitesLogger.log(
                      `SiteService.processSiteParticipants(): There is no site participant role in database againts id : ${particRoleId}`,
                    );
                  }
                } else {
                  this.sitesLogger.log(
                    `SiteService.processSiteParticipants(): There is no site participant in database againts id : ${participantId}`,
                  );
                }
                break;

              case UserActionEnum.DELETED:
                // Handle deletion if necessary
                deleteSitePartics.push({ id: participantId });
                deleteSiteParticRoles.push({ id: particRoleId });
                break;

              default:
                this.sitesLogger.warn(
                  'SiteService.processSiteParticipants(): Unknown action for participant:',
                );
            }
          },
        );

        await Promise.all(siteParticsPromises);

        // Save new site participants and site participant roles in bulk
        if (newSitePartics?.length > 0) {
          await transactionalEntityManager.save(SitePartics, newSitePartics);
        }
        if (newSiteParticRoles?.length > 0) {
          await transactionalEntityManager.save(
            SiteParticRoles,
            newSiteParticRoles,
          );
        }

        // Update existing site participants and site participant roles in bulk
        if (updatedSitePartics?.length > 0) {
          await Promise.all(
            updatedSitePartics.map(({ id, changes }) =>
              transactionalEntityManager.update(SitePartics, { id }, changes),
            ),
          );
        }

        if (updatedSiteParticRoles?.length > 0) {
          await Promise.all(
            updatedSiteParticRoles.map(({ id, changes }) =>
              transactionalEntityManager.update(
                SiteParticRoles,
                { id },
                changes,
              ),
            ),
          );
        }

        // Delete existing site participants and site participant roles in bulk
        if (deleteSiteParticRoles?.length > 0) {
          await Promise.all(
            deleteSiteParticRoles.map(({ id }) =>
              transactionalEntityManager.delete(SiteParticRoles, { id }),
            ),
          );
        }
        if (deleteSitePartics?.length > 0) {
          await Promise.all(
            deleteSitePartics.map(({ id }) =>
              transactionalEntityManager.delete(SitePartics, { id }),
            ),
          );
        }
      }
    } catch (error) {
      throw new HttpException(
        `Failed to process site participants.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Processes and saves events and participants based on the provided actions.
   * @param events - Array of event data including actions to be performed.
   * @param userInfo - Information about the user performing the actions.
   * @param transactionalEntityManager - Entity manager for handling transactions.
   */
  async processEvents(
    events: any[],
    userInfo: any,
    transactionalEntityManager: EntityManager,
    siteId: string,
  ) {
    try {
      if (events?.length > 0) {
        // Arrays to store new and updated entities
        const newEvents: Events[] = [];
        const updatedEvents: { id: string; changes: Partial<Events> }[] = [];
        const newEventPartics: EventPartics[] = [];
        const updatedEventPartics: {
          id: string;
          changes: Partial<EventPartics>;
        }[] = [];

        // Process participants based on their action
        const processParticipants = async (
          eventId: string,
          participants: any[],
        ) => {
          const participantPromises = participants.map(async (partic) => {
            const {
              eventParticId,
              displayName,
              apiAction,
              srValue,
              ...particData
            } = partic;
            switch (apiAction) {
              case UserActionEnum.ADDED:
                const currentDate = new Date();
                return {
                  ...particData,
                  eventId,
                  userAction: UserActionEnum.ADDED,
                  whenCreated: currentDate,
                  whoCreated: userInfo ? userInfo.givenName : '',
                  whenUpdated: currentDate,
                  whoUpdated: userInfo ? userInfo.givenName : '',
                };
              case UserActionEnum.UPDATED:
                const existingPartic =
                  await this.eventsParticipantsRepo.findOneByOrFail({
                    id: eventParticId,
                  });
                return {
                  id: eventParticId,
                  changes: {
                    ...existingPartic,
                    ...particData,
                    userAction:
                      partic.srAction === SRApprovalStatusEnum.PUBLIC ||
                      partic.srAction === SRApprovalStatusEnum.PRIVATE
                        ? UserActionEnum.DEFAULT
                        : UserActionEnum.UPDATED,
                    whenUpdated: new Date(),
                    whoUpdated: userInfo ? userInfo.givenName : '',
                  },
                };
              case UserActionEnum.DELETED:
                await transactionalEntityManager.delete(EventPartics, {
                  id: eventParticId,
                });
                return null;
              default:
                this.sitesLogger.warn(
                  'SiteService.processEvents.processParticipants(): Unknown action for event participant:',
                );
                return null;
            }
          });
          const participantResults = await Promise.all(participantPromises);

          participantResults.forEach((result) => {
            if (result) {
              if (result.eventId) {
                newEventPartics.push(result);
              } else if (result.id) {
                updatedEventPartics.push(result);
              }
            }
          });
        };

        // Use the utility function to get the current max ID for the documents table
        let currentNotationMaxId = await this.getMaxId(
          this.eventsRepositoryRepo,
          'id',
        );

        // Main processing loop for events
        const eventPromises = events.map(async (notation) => {
          const { notationParticipant, apiAction, ...eventData } = notation;
          let notationId = notation.id;
          const event: Events = {
            ...new Events(),
            ...eventData,
          };
          switch (apiAction) {
            case UserActionEnum.ADDED:
              // Get the ID of the newly created event
              currentNotationMaxId += 1;
              notationId = currentNotationMaxId.toString();
              const currentDate = new Date();
              newEvents.push({
                ...event,
                id: notationId,
                siteId: siteId,
                eventDate: new Date(),
                userAction: UserActionEnum.ADDED,
                whenCreated: currentDate,
                whoCreated: userInfo ? userInfo.givenName : '',
                whenUpdated: currentDate,
                whoUpdated: userInfo ? userInfo.givenName : '',
              });
              break;

            case UserActionEnum.UPDATED:
              const existingEvent =
                await this.eventsRepositoryRepo.findOneByOrFail({
                  id: notation.id,
                });

              if (existingEvent) {
                updatedEvents.push({
                  id: notation.id,
                  changes: {
                    ...new Events(),
                    ...existingEvent,
                    ...event,
                    userAction:
                      notation.srAction === SRApprovalStatusEnum.PUBLIC ||
                      notation.srAction === SRApprovalStatusEnum.PRIVATE
                        ? UserActionEnum.DEFAULT
                        : UserActionEnum.UPDATED,
                    whenUpdated: new Date(),
                    whoUpdated: userInfo ? userInfo.givenName : '',
                  },
                });
              } else {
                this.sitesLogger.log(
                  `SiteService.processEvents(): There is no event in database againts event id : ${notation.id}`,
                );
              }
              break;

            case UserActionEnum.DELETED:
              // Handle deletion if necessary
              break;

            default:
              this.sitesLogger.warn(
                'SiteService.processEvents Unknown action for event',
              );
              break;
          }

          // Process related participants regardless of event action
          if (notationParticipant?.length > 0) {
            await processParticipants(notationId, notationParticipant);
          } else {
            this.sitesLogger.warn(
              `SiteService.processEvents(): There is no notation participants. Atleast every notation should have one notation participant.`,
            );
            throw new HttpException(
              `Failed to process site notation participants. There is no notation participants. Atleast every notation should have one notation participant.`,
              HttpStatus.NOT_FOUND,
            );
          }
        });

        await Promise.all(eventPromises);

        // Save new events and event participants in bulk
        if (newEvents?.length > 0) {
          await transactionalEntityManager.save(Events, newEvents);
        }

        if (newEventPartics?.length > 0) {
          await transactionalEntityManager.save(EventPartics, newEventPartics);
        }

        // Update existing events and participants in bulk
        if (updatedEvents?.length > 0) {
          await Promise.all(
            updatedEvents.map(({ id, changes }) =>
              transactionalEntityManager.update(Events, { id }, changes),
            ),
          );
        }

        if (updatedEventPartics?.length > 0) {
          await Promise.all(
            updatedEventPartics.map(({ id, changes }) =>
              transactionalEntityManager.update(EventPartics, { id }, changes),
            ),
          );
        }
      }
    } catch (error) {
      throw new HttpException(
        `Failed to process site notations.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Processes and saves associated sites based on the provided actions.
   * @param siteAccociated - Array of associated sites data including actions to be performed.
   * @param userInfo - Information about the user performing the actions.
   * @param transactionalEntityManager - Entity manager for handling transactions.
   */
  async processSiteAssociated(
    siteAccociated: any[],
    userInfo: any,
    transactionalEntityManager: EntityManager,
    siteId: string,
  ) {
    try {
      if (siteAccociated?.length > 0) {
        const newSiteAssociates: SiteAssocs[] = [];
        const updatedSiteAssociates: {
          id: string;
          changes: Partial<SiteAssocs>;
        }[] = [];
        const deleteSiteAssociates: { id: string }[] = [];

        const siteAssociatePromises = siteAccociated.map(async (asscos) => {
          const { id, apiAction, srValue, ...siteAssocsData } = asscos;
          const siteAssoc = { ...new SiteAssocs(), ...siteAssocsData };
          switch (apiAction) {
            case UserActionEnum.ADDED:
              const currentDate = new Date();
              newSiteAssociates.push({
                ...siteAssoc,
                // Need to know common pid relation as it is non-nullable field in DB and we don't have visibility in our design for same.
                commonPid: 'N',
                siteId: siteId,
                userAction: UserActionEnum.ADDED,
                whenCreated: currentDate,
                whoCreated: userInfo ? userInfo.givenName : '',
                whenUpdated: currentDate,
                whoUpdated: userInfo ? userInfo.givenName : '',
              });
              break;
            case UserActionEnum.UPDATED:
              const existingSiteAssoc =
                await this.siteAssociationsRepo.findOneByOrFail({
                  id: asscos.id,
                });
              if (existingSiteAssoc) {
                updatedSiteAssociates.push({
                  id: asscos.id,
                  changes: {
                    ...existingSiteAssoc,
                    ...siteAssoc,
                    userAction:
                      asscos.srAction === SRApprovalStatusEnum.PUBLIC ||
                      asscos.srAction === SRApprovalStatusEnum.PRIVATE
                        ? UserActionEnum.DEFAULT
                        : UserActionEnum.UPDATED,
                    whenUpdated: new Date(),
                    whoUpdated: userInfo ? userInfo.givenName : '',
                  },
                });
              } else {
                this.sitesLogger.log(
                  `SiteService.processSiteAssociated(): There is no site associated in database againts id : ${asscos.id}`,
                );
              }
              break;
            case UserActionEnum.DELETED:
              // Handle deletion if necessary
              deleteSiteAssociates.push({ id: asscos.id });
              break;
          }
        });

        await Promise.all(siteAssociatePromises);

        // Save new site associates in bulk
        if (newSiteAssociates?.length > 0) {
          await transactionalEntityManager.save(SiteAssocs, newSiteAssociates);
        }

        // Update existing site participants and site participant roles in bulk
        if (updatedSiteAssociates?.length > 0) {
          await Promise.all(
            updatedSiteAssociates.map(({ id, changes }) =>
              transactionalEntityManager.update(SiteAssocs, { id }, changes),
            ),
          );
        }

        if (deleteSiteAssociates?.length > 0) {
          await Promise.all(
            deleteSiteAssociates.map(({ id }) =>
              transactionalEntityManager.delete(SiteAssocs, { id }),
            ),
          );
        }
      }
    } catch (error) {
      throw new HttpException(
        `Failed to process site associate.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Processes and saves site disclosure based on the provided actions.
   * @param siteDisclosure - Site disclosure data including actions to be performed.
   * @param userInfo - Information about the user performing the actions.
   * @param transactionalEntityManager - Entity manager for handling transactions.
   */
  async processSiteDisclosure(
    siteDisclosure: any[],
    userInfo: any,
    transactionalEntityManager: EntityManager,
    siteId: string,
  ) {
    try {
      if (siteDisclosure?.length > 0) {
        const disclosurePromises = siteDisclosure?.map(async (disclosure) => {
          const {
            apiAction,
            id,
            siteProfileSchedule2Refs = [],
            ...disclosureData
          } = disclosure;
          let siteProfile: SiteProfiles = {
            ...new SiteProfiles(),
            id,
            ...disclosureData,
          };

          switch (apiAction) {
            case UserActionEnum.ADDED:
              const currentDate = new Date();
              siteProfile = transactionalEntityManager.create(SiteProfiles, {
                ...disclosureData,
                siteId,
                userAction: UserActionEnum.ADDED,
                whenCreated: currentDate,
                whoCreated: userInfo?.givenName || '',
                whenUpdated: currentDate,
                whoUpdated: userInfo?.givenName || '',
              });

              siteProfile = await transactionalEntityManager.save(
                SiteProfiles,
                siteProfile,
              );
              break;
            case UserActionEnum.UPDATED:
              const existing = await this.siteProfilesRepo.findOne({
                where: { id },
                relations: ['siteProfileSchedule2Refs'],
              });

              if (!existing) {
                this.sitesLogger.log(`No site profile found for id: ${id}`);
                return;
              }

              Object.assign(existing, {
                ...disclosureData,
                userAction:
                  disclosure.srAction === SRApprovalStatusEnum.PUBLIC ||
                  disclosure.srAction === SRApprovalStatusEnum.PRIVATE
                    ? UserActionEnum.DEFAULT
                    : UserActionEnum.UPDATED,
                whenUpdated: new Date(),
                whoUpdated: userInfo?.givenName || '',
              });

              siteProfile = await transactionalEntityManager.save(
                SiteProfiles,
                existing,
              );
              break;
            default:
              this.sitesLogger.warn(`Unknown apiAction: ${apiAction}`);
              break;
          }

          if (siteProfile?.id && siteProfileSchedule2Refs.length > 0) {
            await this.processSchedule2Refs(
              siteProfileSchedule2Refs,
              siteProfile.id,
              userInfo,
              transactionalEntityManager,
            );
          }
        });

        // Handle schedule2Ref (ADD, UPDATE, DELETE)
        await Promise.all(disclosurePromises);
      }
    } catch (error) {
      throw new HttpException(
        `Failed to process site disclosure.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  private async processSchedule2Refs(
    refs: any[],
    profileId: string,
    userInfo: any,
    transactionalEntityManager: EntityManager,
  ) {
    // Get current DB state
    const currentRefs = await transactionalEntityManager.find(
      SiteProfileSchedule2Ref,
      {
        where: { profileId },
      },
    );

    const currentMap = new Map(currentRefs.map((r) => [r.id, r]));

    const toSave: SiteProfileSchedule2Ref[] = [];
    const toDelete: SiteProfileSchedule2Ref[] = [];

    for (const ref of refs) {
      const { apiAction, id, schedule2ReferenceCode } = ref;
      const existing = currentMap.get(id);

      switch (apiAction) {
        case UserActionEnum.ADDED:
          if (!existing) {
            toSave.push(
              transactionalEntityManager.create(SiteProfileSchedule2Ref, {
                schedule2ReferenceCode,
                profileId,
                srAction: ref.srAction,
                userAction: UserActionEnum.ADDED,
                whoCreated: userInfo?.givenName || '',
                whenCreated: new Date(),
                whoUpdated: userInfo?.givenName || '',
                whenUpdated: new Date(),
              }),
            );
          }
          break;

        case UserActionEnum.UPDATED:
          if (existing) {
            Object.assign(existing, {
              ...ref,
              userAction:
                ref.srAction === SRApprovalStatusEnum.PUBLIC ||
                ref.srAction === SRApprovalStatusEnum.PRIVATE
                  ? UserActionEnum.DEFAULT
                  : UserActionEnum.UPDATED,
              whoUpdated: userInfo?.givenName || '',
              whenUpdated: new Date(),
            });
            toSave.push(existing);
          }
          break;

        case UserActionEnum.DELETED:
          if (existing) {
            toDelete.push(existing);
          }
          break;
      }
    }

    if (toDelete.length) {
      await transactionalEntityManager.remove(
        SiteProfileSchedule2Ref,
        toDelete,
      );
    }

    if (toSave.length) {
      await transactionalEntityManager.save(SiteProfileSchedule2Ref, toSave);
    }
  }

  async getSiteDetailsPendingSRApproval(
    searchParam: SearchParams,
    page: number,
    pageSize: number,
  ): Promise<QueryResultForPendingSites> {
    try {
      this.sitesLogger.log(
        'SiteService.getSiteDetailsPendingSRApproval() start',
      );
      this.sitesLogger.debug(
        'SiteService.getSiteDetailsPendingSRApproval() start',
      );

      // The following query fetches the sites with SR status as pending and group them by user and shows the last updated timestamp
      const query = `
       select ROW_NUMBER() OVER (ORDER BY site_id) AS row_num,ResultInFo.site_id,ResultInFo.changes,ResultInFo.Latest_Update,ResultInFo.who as who_updated, SiteInfo.addr_line_1, SiteInfo.addr_line_2,SiteInfo.addr_line_3 from (WITH LatestUpdates AS (
          SELECT site_id,
                MAX(when_Updated) AS Latest_Update,
            who_updated as who
          FROM (
              SELECT id AS site_id, when_Updated ,who_updated 
              FROM sites.sites
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT site_id, when_Updated , who_updated 
              FROM sites.events
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT e.site_id, e.when_Updated, e.who_updated 
              FROM sites.event_partics ep
              INNER JOIN sites.events e ON ep.event_id = e.id
              WHERE e.sr_action = 'pending' or e.user_action = 'updated'
              
              UNION ALL
              
              SELECT site_id, when_Updated, who_updated 
              FROM sites.site_partics
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT site_id, when_Updated, who_updated 
              FROM sites.site_docs
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT site_id, when_Updated,who_updated 
              FROM sites.site_assocs
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT site_id, when_Updated,who_updated 
              FROM sites.land_histories
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT site_id, when_Updated,who_updated 
              FROM sites.site_subdivisions
              WHERE sr_action = 'pending' or user_action = 'updated'
              
              UNION ALL
              
              SELECT sp.site_id, sp.when_Updated , sp.who_updated 
              FROM sites.site_profiles sp
              INNER JOIN sites.site_profile_schedule2_ref sp2r ON sp2r.site_profile_id = sp.id
              WHERE sp.sr_action = 'pending' or sp.user_action = 'updated' or sp2r.sr_action = 'pending' or sp2r.user_action = 'updated'
          ) AS updates
          GROUP BY site_id, who_updated
      )

      SELECT Final.site_id,Final.Changes,Final.who_updated, lu.latest_update, lu.who FROM (
      SELECT c.site_id, 
            STRING_AGG(DISTINCT c.Change, ', ' ORDER BY c.Change) AS Changes,
		  c.who_updated
      FROM (
          SELECT id AS site_id, 'summary' AS Change, when_Updated, who_updated ,addr_line_1,addr_line_2,addr_line_3 
          FROM sites.sites
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'notation', when_Updated, who_updated , '' , '', '' 
          FROM sites.events
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT e.site_id, 'notation participants' AS Change, e.when_Updated, e.who_updated , '' , '', '' 
          FROM sites.event_partics ep
          INNER JOIN sites.events e ON ep.event_id = e.id
          WHERE e.sr_action = 'pending' or e.user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'site participants' AS Change, when_Updated, who_updated ,  '' , '', '' 
          FROM sites.site_partics
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'documents' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.site_docs
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'associated sites' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.site_assocs
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'land histories' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.land_histories
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'parcel description' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.site_subdivisions
          WHERE sr_action = 'pending' or user_action = 'updated'
          
          UNION ALL
          
          SELECT site_id, 'site profiles' AS Change, sp.when_Updated, sp.who_updated ,  '' , '', '' 
          FROM sites.site_profiles sp
          INNER JOIN sites.site_profile_schedule2_ref sp2r ON sp2r.site_profile_id = sp.id
          WHERE sp.sr_action = 'pending' or sp.user_action = 'updated' or sp2r.sr_action = 'pending' or sp2r.user_action = 'updated'
      ) AS c
      GROUP BY c.site_id,c.who_updated) Final
      JOIN LatestUpdates lu ON Final.site_id = lu.site_id and Final.who_updated = lu.who ) ResultInFo
      JOIN sites.sites SiteInfo on SiteInfo.id = ResultInFo.site_id
        `;

      const entityManager = this.siteRepository.manager;
      const queryResult = await entityManager.query(query);

      let result: SitePendingApprovalRecords[] = [];

      if (queryResult?.length > 0) {
        result = queryResult.map((res) => {
          return {
            id: res.row_num,
            siteId: res.site_id,
            changes: res.changes,
            whoUpdated: res.who_updated,
            whenUpdated: res.latest_update,
            address: [res.addr_line_1, res.addr_line_2, res.addr_line_3]
              .filter(Boolean)
              .join(' '),
          };
        });
      }

      if (searchParam != null) {
        if (searchParam.whenUpdated != null && searchParam.whenUpdated != '') {
          const startDate = new Date(
            searchParam.whenUpdated
              .split(' - ')[0]
              .replace(/(st|nd|rd|th)/, ''),
          );
          const endDate = new Date(
            searchParam.whenUpdated
              .split(' - ')[1]
              .replace(/(st|nd|rd|th)/, ''),
          );

          result = result.filter((res) => {
            const whenUpdatedDate = new Date(res.whenUpdated);
            return whenUpdatedDate >= startDate && whenUpdatedDate <= endDate;
          });
        }

        if (searchParam.id != null && searchParam.id != '') {
          result = result.filter((res) => {
            return res.siteId.indexOf(searchParam.id) !== -1;
          });
        }

        if (searchParam.changes != null && searchParam.changes != '') {
          result = result.filter((res) => {
            return res.changes.indexOf(searchParam.changes) !== -1;
          });
        }

        if (searchParam.addrLine != null && searchParam.addrLine != '') {
          result = result.filter((res) => {
            return res.address.indexOf(searchParam.addrLine) !== -1;
          });
        }

        if (searchParam.whoCreated != null && searchParam.whoCreated != '') {
          result = result.filter((res) => {
            return (
              res.whoUpdated
                .toLowerCase()
                .indexOf(searchParam.whoCreated.toLowerCase()) !== -1
            );
          });
        }
      }

      const startIndex = (page - 1) * pageSize;

      const paginatedRecords = result.slice(startIndex, startIndex + pageSize);

      const resultDTO: QueryResultForPendingSites = {
        data: paginatedRecords,
        totalRecords: result?.length,
      };

      this.sitesLogger.log('SiteService.getSiteDetailsPendingSRApproval() end');
      this.sitesLogger.debug(
        'SiteService.getSiteDetailsPendingSRApproval() end',
      );

      return resultDTO;
    } catch (error) {
      this.sitesLogger.log(
        'SiteService.getSiteDetailsPendingSRApproval() error' +
          JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to get site details having SR approval pending.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Bulk Approval/ Reject For Site Registry Approvals
   * @param inputDTO list of site
   * @param userInfo authenticated user
   * @returns true/false
   */
  async bulkUpdateForSR(
    inputDTO: BulkApproveRejectChangesDTO,
    userInfo: any,
  ): Promise<boolean> {
    try {
      this.sitesLogger.log('SiteService.bulkUpdateForSR() start');
      this.sitesLogger.debug('SiteService.bulkUpdateForSR() start');

      if (!inputDTO) {
        this.sitesLogger.debug(
          'SiteService.bulkUpdateForSR() inputDTO invalid returning false',
        );
        return false;
      } else {
        const { isApproved, sites, fromSiteDetails } = inputDTO;

        for (const site of sites) {
          await this.entityManager.transaction(
            async (transactionalEntityManager: EntityManager) => {
              if (
                (site != null && site.siteId === null) ||
                site.siteId === undefined
              ) {
                return false;
              }
              await this.processSRBulkUpdates(
                transactionalEntityManager,
                site,
                isApproved,
                fromSiteDetails,
                userInfo,
              );
            },
          );
        }
        return true;
      }
    } catch (error) {
      this.sitesLogger.log(
        'SiteService.bulkUpdateForSR() error' + JSON.stringify(error),
      );
      return false;
    }
  }

  async processSRBulkUpdates(
    transactionalEntityManager: EntityManager,
    site: SiteRecordsForSRAction,
    isApproved: boolean,
    fromSiteDetails: boolean,
    userInfo: any,
  ) {
    try {
      this.sitesLogger.log('SiteService.processSRBulkUpdates() start');

      if ((site != null && site.siteId === null) || site.siteId === undefined) {
        this.sitesLogger.log(
          'SiteService.processSRBulkUpdates() site is empty',
        );
        return false;
      }

      if (site.changes.indexOf('summary') !== -1) {
        const sitesForUpdates = !fromSiteDetails
          ? await transactionalEntityManager.find(Sites, {
              where: {
                id: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(Sites, {
              where: {
                id: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (sitesForUpdates?.length > 0) {
          sitesForUpdates.forEach((site) => {
            this.setUpdatedStatus(site, isApproved, userInfo);
          });
          await transactionalEntityManager.save(Sites, sitesForUpdates);
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no summary to process.',
          );
        }
      }

      if (site.changes.indexOf('notation') !== -1) {
        const events = !fromSiteDetails
          ? await transactionalEntityManager.find(Events, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(Events, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (events?.length > 0) {
          events.forEach((event) => {
            this.setUpdatedStatus(event, isApproved, userInfo);
          });

          await transactionalEntityManager.save(Events, events);

          const eventIds = events.map((event) => event.id);

          const eventsParticipants = !fromSiteDetails
            ? await transactionalEntityManager.find(EventPartics, {
                where: {
                  eventId: In(eventIds),
                  whoUpdated: site.whoUpdated,
                  srAction: SRApprovalStatusEnum.PENDING,
                },
              })
            : await transactionalEntityManager.find(EventPartics, {
                where: {
                  eventId: In(eventIds),
                  srAction: SRApprovalStatusEnum.PENDING,
                },
              });

          if (eventsParticipants?.length > 0) {
            eventsParticipants.forEach((eventsParticipant) => {
              this.setUpdatedStatus(eventsParticipant, isApproved, userInfo);
            });

            await transactionalEntityManager.save(
              EventPartics,
              eventsParticipants,
            );
          } else {
            this.sitesLogger.log(
              'SiteService.processSRBulkUpdates() no eventsParticipants to process.',
            );
          }
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no events to process.',
          );
        }
      }

      if (site.changes.indexOf('site participants') !== -1) {
        const siteParticipants = !fromSiteDetails
          ? await transactionalEntityManager.find(SitePartics, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(SitePartics, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (siteParticipants?.length > 0) {
          siteParticipants.forEach((siteParticipant) => {
            this.setUpdatedStatus(siteParticipant, isApproved, userInfo);
          });

          await transactionalEntityManager.save(SitePartics, siteParticipants);
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no siteParticipants to process.',
          );
        }
      }

      if (site.changes.indexOf('documents') !== -1) {
        const siteDocs = !fromSiteDetails
          ? await transactionalEntityManager.find(SiteDocs, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(SiteDocs, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (siteDocs?.length > 0) {
          siteDocs.forEach((doc) => {
            this.setUpdatedStatus(doc, isApproved, userInfo);
          });

          await transactionalEntityManager.save(SiteDocs, siteDocs);
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no siteDocs to process.',
          );
        }
      }

      if (site.changes.indexOf('associated sites') !== -1) {
        const siteAssociations = !fromSiteDetails
          ? await transactionalEntityManager.find(SiteAssocs, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(SiteAssocs, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (siteAssociations?.length > 0) {
          siteAssociations.forEach((siteAssociation) => {
            this.setUpdatedStatus(siteAssociation, isApproved, userInfo);
          });

          await transactionalEntityManager.save(SiteAssocs, siteAssociations);
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no siteAssociations to process.',
          );
        }
      }

      if (site.changes.indexOf('land histories') !== -1) {
        const landHistories = !fromSiteDetails
          ? await transactionalEntityManager.find(LandHistories, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(LandHistories, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (landHistories?.length > 0) {
          landHistories.forEach((history) => {
            this.setUpdatedStatus(history, isApproved, userInfo);
          });

          await transactionalEntityManager.save(LandHistories, landHistories);
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no landHistories to process.',
          );
        }
      }

      if (site.changes.indexOf('site profiles') !== -1) {
        const profiles = !fromSiteDetails
          ? await transactionalEntityManager.find(SiteProfiles, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(SiteProfiles, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (profiles?.length > 0) {
          profiles.forEach((profile) => {
            this.setUpdatedStatus(profile, isApproved, userInfo);
          });

          await transactionalEntityManager.save(SiteProfiles, profiles);
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no profiles to process.',
          );
        }
      }

      if (site.changes.indexOf('parcel description') !== -1) {
        const siteSubDivisions = !fromSiteDetails
          ? await transactionalEntityManager.find(SiteSubdivisions, {
              where: {
                siteId: site.siteId,
                whoUpdated: site.whoUpdated,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            })
          : await transactionalEntityManager.find(SiteSubdivisions, {
              where: {
                siteId: site.siteId,
                srAction: SRApprovalStatusEnum.PENDING,
              },
            });

        if (siteSubDivisions?.length > 0) {
          const subDivIds = siteSubDivisions.map((x) => x.subdivId);

          const subDivisions = !fromSiteDetails
            ? await transactionalEntityManager.find(Subdivisions, {
                where: {
                  id: In(subDivIds),
                  whoUpdated: site.whoUpdated,
                  srAction: SRApprovalStatusEnum.PENDING,
                },
              })
            : await transactionalEntityManager.find(Subdivisions, {
                where: {
                  id: In(subDivIds),
                  srAction: SRApprovalStatusEnum.PENDING,
                },
              });

          if (subDivisions?.length > 0) {
            subDivisions.forEach((sub) => {
              this.setUpdatedStatus(sub, isApproved, userInfo);
            });

            await transactionalEntityManager.save(Subdivisions, subDivisions);
          }

          siteSubDivisions.forEach((siteDiv) => {
            this.setUpdatedStatus(siteDiv, isApproved, userInfo);
          });

          await transactionalEntityManager.save(
            SiteSubdivisions,
            siteSubDivisions,
          );
        } else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no siteSubDivisions to process.',
          );
        }
      }

      const historyLog: HistoryLog = {
        userId: userInfo ? userInfo.sub : '',
        content: { ...site, isApproved: isApproved },
        id: null,
        whoCreated: userInfo ? userInfo.givenName : '',
        whenCreated: new Date(),
        whenUpdated: new Date(),
        whoUpdated: userInfo ? userInfo.givenName : '',
        siteId: site.siteId,
      };

      await transactionalEntityManager.save(HistoryLog, historyLog);

      if (isApproved) {
        await this.updateSiteRegistryLastApprovedDate(
          transactionalEntityManager,
          site.siteId,
          userInfo,
        );
      }

      this.sitesLogger.log('SiteService.processSRBulkUpdates() end');

      return true;
    } catch (error) {
      this.sitesLogger.log(
        'SiteService.processSRBulkUpdates() error' + JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to process SR operations.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  updateSiteRegistryLastApprovedDate = async (
    transactionalEntityManager: EntityManager,
    siteId: string,
    userInfo?: any,
  ) => {
    try {
      if (!siteId)
        throw new HttpException(
          'Failed to update site registry last approved date as Site Id is missing.',
          HttpStatus.BAD_REQUEST,
        );
      this.sitesLogger.log('SiteService.updateSiteRegistryLastApprovedDate()');
      const siteRegistryRecord = await transactionalEntityManager.findOne(
        SiteRegistry,
        {
          where: { siteId: siteId },
        },
      );
      if (siteRegistryRecord !== null) {
        siteRegistryRecord.lastApprovalDate = new Date();
        siteRegistryRecord.regUserid = userInfo?.givenName
          ? userInfo?.givenName
          : '';
        await transactionalEntityManager.save(siteRegistryRecord);
      }
      this.sitesLogger.log(
        'SiteService.updateSiteRegistryLastApprovedDate() end',
      );
    } catch (error) {
      this.sitesLogger.log(
        'SiteService.updateSiteRegistryLastApprovedDate() error',
      );
      throw error;
    }
  };

  /**
   * SET Updated Status
   * @param entity
   * @param isApproved
   * @param userInfo
   */
  setUpdatedStatus = (entity: any, isApproved: boolean, userInfo: any) => {
    entity.userAction = UserActionEnum.DEFAULT;
    entity.srAction = isApproved
      ? SRApprovalStatusEnum.PUBLIC
      : SRApprovalStatusEnum.PRIVATE;
    entity.whenUpdated = new Date();
    entity.whoUpdated = userInfo?.givenName;
  };

  // Generic function to fetch the max id from any table and column
  async getMaxId(repository: any, column: string): Promise<number> {
    try {
      const result = await repository
        .createQueryBuilder()
        .select(`MAX(${column})`, 'maxid')
        .getRawOne();

      return result?.maxid ? Number(result.maxid) : 0; // Return 0 if no result found
    } catch (error) {
      this.sitesLogger.error(
        `Error fetching max ID from ${repository.metadata.tableName}:`,
        error,
      );
      return 0; // Return 0 on error
    }
  }

  async getSiteInsights(siteId: string): Promise<SiteInsightsDto> {
    try {
      const result = await this.siteRepository.query(
        `
        SELECT
          (SELECT COUNT(id) FROM sites.events WHERE site_id = $1) AS event_count,
          (SELECT COUNT(sd.id) FROM sites.site_docs sd
		  join sites.site_doc_partics  spr on sdoc_id = sd.id
		  where site_id = $1) AS site_doc_count,
          (SELECT COUNT(id) FROM sites.event_partics WHERE event_id IN (
              SELECT id FROM sites.events WHERE site_id = $1
          )) AS event_partic_count,
          (SELECT COUNT(Lut_code) FROM sites.land_histories WHERE site_id = $1) AS land_history_count,
          (SELECT COUNT(id) FROM sites.site_assocs WHERE site_id = $1) AS site_assoc_count,
          (SELECT COUNT(subdiv_id) FROM sites.site_subdivisions WHERE site_id = $1) AS site_subdiv_count
        `,
        [siteId],
      );

      if (!result || result.length === 0) {
        return null;
      }

      const raw = result[0];
      const dto: SiteInsightsDto = {
        eventCount: Number(raw.event_count),
        siteDocCount: Number(raw.site_doc_count),
        eventParticCount: Number(raw.event_partic_count),
        landHistoryCount: Number(raw.land_history_count),
        siteAssocCount: Number(raw.site_assoc_count),
        siteSubdivCount: Number(raw.site_subdiv_count),
      };

      return dto;
    } catch (error) {
      // ✅ Optional: log error, rethrow as NestJS exception
      this.sitesLogger.error(
        `Error fetching site insights for siteId= ${siteId}:`,
        error,
      );
      throw new InternalServerErrorException('Failed to fetch site counts');
    }
  }
}
