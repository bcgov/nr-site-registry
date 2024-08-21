import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import {
  FetchSiteDetail,
  FetchSiteResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteUtil } from '../../utils/site.util';
import { RecentViews } from 'src/app/entities/recentViews.entity';
import { SaveSiteDetailsDTO } from 'src/app/dto/saveSiteDetails.dto';
import { Events } from 'src/app/entities/events.entity';
import { EventPartics } from 'src/app/entities/eventPartics.entity';
import { SitePartics } from 'src/app/entities/sitePartics.entity';
import { SiteDocs } from 'src/app/entities/siteDocs.entity';
import { SiteAssocs } from 'src/app/entities/siteAssocs.entity';
import { LandHistories } from 'src/app/entities/landHistories.entity';
import { SiteSubdivisions } from 'src/app/entities/siteSubdivisions.entity';
import { SiteProfiles } from 'src/app/entities/siteProfiles.entity';
import { Subdivisions } from 'src/app/entities/subdivisions.entity';
import { SRApprovalStatusEnum } from 'src/app/dto/srApprovalStatus';
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
    @InjectRepository(SiteDocs)
    private siteDocumentsRepo: Repository<SiteDocs>,
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
  ) {}

  /**
   * Find All method for returining all sites
   * @returns FetchSiteResponse -- returns sites
   */
  async findAll() {
    const response = new FetchSiteResponse();

    response.httpStatusCode = 200;

    response.data = await this.siteRepository.find();

    return response;
  }

  /**
   * Find sites where search parameter matches a site id or address
   * @param searchParam search parameter
   * @returns sites where id or address matches the search param
   */
  async searchSites(
    searchParam: string,
    page: number,
    pageSize: number,
    id?: string,
    srStatus?: string,
    siteRiskCode?: string,
    commonName?: string,
    addrLine_1?: string,
    city?: string,
    whoCreated?: string,
    latlongReliabilityFlag?: string,
    latdeg?: number,
    latDegrees?: number,
    latMinutes?: number,
    latSeconds?: string,
    longdeg?: number,
    longDegrees?: number,
    longMinutes?: number,
    longSeconds?: string,
    whenCreated?: Date,
    whenUpdated?: Date,
  ) {
    const siteUtil: SiteUtil = new SiteUtil();
    const response = new SearchSiteResponse();

    const query = this.siteRepository
      .createQueryBuilder('sites')
      .where('CAST(sites.id AS TEXT) like :searchParam', {
        searchParam: `%${searchParam}%`,
      })
      .orWhere('LOWER(sites.addr_line_1) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      })
      .orWhere('LOWER(sites.addr_line_2) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      })
      .orWhere('LOWER(sites.addr_line_3) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      })
      .orWhere('LOWER(sites.addr_line_4) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      })
      .orWhere('LOWER(sites.city) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      })
      .orWhere('LOWER(sites.provState) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      })
      .orWhere('LOWER(sites.postalCode) LIKE LOWER(:searchParam)', {
        searchParam: `%${searchParam.toLowerCase()}%`,
      });

    if (id) {
      query.andWhere('sites.id = :id', { id: id });
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
      const cleanedAddress = siteUtil.removeSpecialCharacters(addrLine_1); // clean all special characters from address
      query.andWhere(
        `regexp_replace(concat_ws('', sites.addr_line_1, sites.addr_line_2, sites.addr_line_3, sites.addr_line_4), '[^a-zA-Z0-9]', '', 'g') LIKE :cleanedAddress`,
        { cleanedAddress: `%${cleanedAddress}%` },
      );
    }

    if (city) {
      query.andWhere('sites.city = :city', { city: city });
    }

    if (whoCreated) {
      query.andWhere('sites.who_created = :whoCreated', {
        whoCreated: whoCreated,
      });
    }

    if (latlongReliabilityFlag) {
      query.andWhere(
        'sites.latlong_reliability_flag = :latlongReliabilityFlag',
        { latlongReliabilityFlag: latlongReliabilityFlag },
      );
    }

    if (latdeg) {
      query.andWhere('sites.latdeg = :latdeg', { latdeg: latdeg });
    }

    if (latDegrees) {
      query.andWhere('sites.lat_degrees = :latDegrees', {
        latDegrees: latDegrees,
      });
    }

    if (latMinutes) {
      query.andWhere('sites.lat_minutes = :latMinutes', {
        latMinutes: latMinutes,
      });
    }

    if (latSeconds) {
      query.andWhere('sites.lat_seconds = :latSeconds', {
        latSeconds: latSeconds,
      });
    }

    if (longdeg) {
      query.andWhere('sites.longdeg = :longdeg', { longdeg: longdeg });
    }

    if (longDegrees) {
      query.andWhere('sites.long_degrees = :longDeg', { longDeg: longDegrees });
    }

    if (longMinutes) {
      query.andWhere('sites.long_minutes = :longMinutes', {
        longMinutes: longMinutes,
      });
    }

    if (longSeconds) {
      query.andWhere('sites.long_seconds = :longSeconds', {
        longSeconds: longSeconds,
      });
    }

    if (whenCreated) {
      query.andWhere('sites.whenCreated = :whenCreated', {
        whenCreated: whenCreated,
      });
    }

    if (whenUpdated) {
      query.andWhere('sites.whenUpdated = :whenUpdated', {
        whenUpdated: whenUpdated,
      });
    }
    const result = await query
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    response.sites = result[0] ? result[0] : [];
    response.count = result[1] ? result[1] : 0;
    response.page = page;
    response.pageSize = pageSize;

    return response;
  }

  /**
   * Find sites by its ID
   * @param siteId site Id
   * @returns a single site matching the site ID
   */
  async findSiteBySiteId(siteId: string) {
    const response = new FetchSiteDetail();

    response.httpStatusCode = 200;

    response.data = await this.siteRepository.findOneOrFail({
      where: { id: siteId },
    });

    return response;
  }

  async saveSiteDetails(inputDTO: SaveSiteDetailsDTO, userInfo: any): Promise<boolean> {

    try
    {
    if (!inputDTO) {
      return false;
    }

    const {
      sitesSummary,
      events,
      eventsParticipants,
      siteParticipants,
      siteAssociations,
      subDivisions,
      landHistories,
      profiles,
    } = inputDTO;

    return await this.entityManager.transaction(
      async (transactionalEntityManager: EntityManager) => {
        try {
          if (sitesSummary) {            
            sitesSummary.srStatus = SRApprovalStatusEnum.Pending;
            await transactionalEntityManager.save(Sites, sitesSummary);
          } else {
            console.log('No changes To Site Summary');
          }

          if (events) {

            events.map(event=> event.srAction = SRApprovalStatusEnum.Pending);

            transactionalEntityManager.save(Events, events);
            
          } else {
            console.log('No changes To Site Events');
          }

          if (eventsParticipants) {

            eventsParticipants.map(participant => participant.srAction = SRApprovalStatusEnum.Pending);

            await transactionalEntityManager.save(
              EventPartics,
              eventsParticipants,
            );
          } else {
            console.log('No changes To Site Event Participants');
          }

          if (siteParticipants) {
            siteParticipants.map(participant => participant.srAction = SRApprovalStatusEnum.Pending);
            await transactionalEntityManager.save(
              SitePartics,
              siteParticipants,
            );
          } else {
            console.log('No changes To Site Participants');
          }

          if (siteAssociations) {
            siteAssociations.map(association => association.srAction = SRApprovalStatusEnum.Pending);
            await transactionalEntityManager.save(SiteAssocs, siteAssociations);
          } else {
            console.log('No changes To Site Associations');
          }

          if (subDivisions) {
            subDivisions.map(subDivison => subDivison.srAction = SRApprovalStatusEnum.Pending);
            await transactionalEntityManager.save(Subdivisions, subDivisions);
          } else {
            console.log('No changes To Site subDivisions');
          }

          if (landHistories) {
            landHistories.map(history => history.srAction = SRApprovalStatusEnum.Pending);
            await transactionalEntityManager.save(LandHistories, landHistories);
          } else {
            console.log('No changes To Site LandHistories');
          }

          if (profiles) {
            profiles.map(profile => profile.srAction = SRApprovalStatusEnum.Pending);
            await transactionalEntityManager.save(SiteProfiles, profiles);
          } else {
            console.log('No changes To Site profiles');
          }
         
        } catch (error) {
          console.error('Save Site Details Transaction failed', error);
          return false;
        }
      },
    );
  }
  catch(error)
  {
    console.log("Save site details error", error);
    throw error;
  }
  }
}
