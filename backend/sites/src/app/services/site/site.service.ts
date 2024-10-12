import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, EntityTarget, In, Repository } from 'typeorm';
import {
  FetchSiteDetail,
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
} from 'src/app/dto/SitesPendingApproval.dto';

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

    private readonly landHistoryService: LandHistoryService,
    private transactionManagerService: TransactionManagerService,
    private readonly sitesLogger: LoggerService,
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
    this.sitesLogger.log('SiteService.searchSites() start');
    this.sitesLogger.debug('SiteService.searchSites() start');
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
    this.sitesLogger.log('SiteService.searchSites() end');
    this.sitesLogger.debug('SiteService.searchSites() end');
    return response;
  }

  /**
   * Find sites by its ID
   * @param siteId site Id
   * @returns a single site matching the site ID
   */
  async findSiteBySiteId(siteId: string, pending: boolean) {
    this.sitesLogger.log('SiteService.findSiteBySiteId() start');
    this.sitesLogger.debug('SiteService.findSiteBySiteId() start');
    const response = new FetchSiteDetail();

    response.httpStatusCode = 200;

    if (pending) {
      const result = await this.siteRepository.findOne({
        where: { id: siteId, userAction: UserActionEnum.UPDATED },
      });

      response.data = result ? result : null;
    } else {
      const result = await this.siteRepository.findOne({
        where: { id: siteId },
      });

      response.data = result ? result : null;
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
      throw new Error('Failed to retrieve site ids.');
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
        const {
          siteId,
          sitesSummary,
          events,
          eventsParticipants,
          siteParticipants,
          documents,
          siteAssociations,
          subDivisions,
          landHistories,
          profiles,
        } = inputDTO;

        const transactionResult = await this.entityManager.transaction(
          async (transactionalEntityManager: EntityManager) => {
            this.transactionManagerService.setEntityManager(
              transactionalEntityManager,
            );

            try {
              if (sitesSummary) {
                sitesSummary.whenUpdated = new Date();
                sitesSummary.whoUpdated = userInfo?.givenName;
                await transactionalEntityManager.save(Sites, sitesSummary);
              } else {
                console.log('No changes To Site Summary');
              }

              if (events && events.length > 0) {
                await this.processEvents(
                  events,
                  userInfo,
                  transactionalEntityManager,
                );
              } else {
                this.sitesLogger.log(
                  'SiteService.saveSiteDetails(): No changes To Site Events',
                );
              }

              // if (eventsParticipants) {
              //   await transactionalEntityManager.save(
              //     EventPartics,
              //     eventsParticipants,
              //   );
              // } else {
              //   console.log('No changes To Site Event Participants');
              // }

              if (siteParticipants && siteParticipants.length > 0) {
                await this.processSiteParticipants(
                  siteParticipants,
                  userInfo,
                  transactionalEntityManager,
                );
              } else {
                this.sitesLogger.log(
                  'SiteService.saveSiteDetails(): No changes To Site Participants',
                );
              }

              if (documents && documents.length > 0) {
                await this.processDocuments(
                  documents,
                  userInfo,
                  transactionalEntityManager,
                );
              } else {
                this.sitesLogger.log(
                  'SiteService.saveSiteDetails(): No changes To Site Documents',
                );
              }

              if (siteAssociations && siteAssociations.length > 0) {
                await this.processSiteAssociated(
                  siteAssociations,
                  userInfo,
                  transactionalEntityManager,
                );
              } else {
                this.sitesLogger.log(
                  'SiteService.saveSiteDetails(): No changes To Site Associations',
                );
              }

              if (subDivisions) {
                await transactionalEntityManager.save(
                  Subdivisions,
                  subDivisions,
                );
              } else {
                console.log('No changes To Site subDivisions');
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

              if (profiles) {
                await transactionalEntityManager.save(SiteProfiles, profiles);
              } else {
                console.log('No changes To Site profiles');
              }

              const historyLog: HistoryLog = {
                userId: userInfo ? userInfo.sub : '',
                content: inputDTO,
                id: null,
                whoCreated: userInfo ? userInfo.givenName : '',
                whenCreated: new Date(),
                whenUpdated: new Date(),
                whoUpdated: userInfo ? userInfo.givenName : '',
                siteId: inputDTO.siteId,
              };

              await transactionalEntityManager.save(HistoryLog, historyLog);

              return true;
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
      throw error;
    }
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
  ) {
    if (documents && documents.length > 0) {
      const newDocuments: SiteDocs[] = [];
      const updateDocuments: { id: string; changes: Partial<SiteDocs> }[] = [];
      const deleteDocuments: { id: string }[] = [];
      const newDocumentParticipants: SiteDocPartics[] = [];
      const updateDocumentParticipants: {
        id: string;
        changes: Partial<SiteDocPartics>;
      }[] = [];

      const siteDocuments = documents.map(async (document) => {
        const {
          displayName,
          psnorgId,
          dprCode,
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
            //Generate new id for new document
            const newDocId = await this.siteDocumentsRepo
              .createQueryBuilder()
              .select('Max(id)', 'maxid')
              .getRawOne()
              .then((result) => (Number(result.maxid) || 0) + 1);

            //Get the Id of newly created document
            documentId = newDocId.toString();
            newDocuments.push({
              ...siteDocument,
              id: documentId,
              rwmFlag: 0,
              userAction: UserActionEnum.ADDED,
              // srAction: SRApprovalStatusEnum.PENDING,
              whenCreated: new Date(),
              whoCreated: userInfo ? userInfo.givenName : '',
            });

            //Generate new id for new document participant.
            const newDocParticId = await this.siteDocumentParticsRepo
              .createQueryBuilder()
              .select('Max(id)', 'maxid')
              .getRawOne()
              .then((result) => (Number(result.maxid) || 0) + 1);

            newDocumentParticipants.push({
              ...siteDocumentParticipant,
              id: newDocParticId.toString(),
              sdocId: documentId,
              rwmFlag: 0,
              dprCode: dprCode ?? 'ATH',
              userAction: UserActionEnum.ADDED,
              // srAction: SRApprovalStatusEnum.PENDING,
              whenCreated: new Date(),
              whoCreated: userInfo ? userInfo.givenName : '',
            });

            break;
          case UserActionEnum.UPDATED:
            const existingDocument =
              await this.siteDocumentsRepo.findOneByOrFail({ id: documentId });
            if (existingDocument) {
              updateDocuments.push({
                id: documentId,
                changes: {
                  ...existingDocument,
                  ...siteDocument,
                  userAction: UserActionEnum.UPDATED,
                  // srAction: SRApprovalStatusEnum.PENDING,
                  whenUpdated: new Date(),
                  whoUpdated: userInfo ? userInfo.givenName : '',
                },
              });

              const existingDocumentParticipant =
                await this.siteDocumentParticsRepo.findOneByOrFail({
                  id: docParticId,
                });
              if (existingDocumentParticipant) {
                updateDocumentParticipants.push({
                  id: docParticId,
                  changes: {
                    ...existingDocumentParticipant,
                    ...siteDocumentParticipant,
                    userAction: UserActionEnum.UPDATED,
                    // srAction: SRApprovalStatusEnum.PENDING,
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
            deleteDocuments.push({ id: documentId });
            break;
          default:
            this.sitesLogger.warn(
              'SiteService.processDocuments(): Unknown action for document:',
            );
        }
      });

      await Promise.all(siteDocuments);

      // Save new site documents and site document participants in bulk
      if (newDocuments.length > 0) {
        await transactionalEntityManager.save(SiteDocs, newDocuments);
      }

      if (newDocumentParticipants.length > 0) {
        await transactionalEntityManager.save(
          SiteDocPartics,
          newDocumentParticipants,
        );
      }

      // Update existing site documents and site document participants in bulk
      if (updateDocuments.length > 0) {
        await Promise.all(
          updateDocuments.map(({ id, changes }) =>
            transactionalEntityManager.update(SiteDocs, { id }, changes),
          ),
        );
      }

      if (updateDocumentParticipants.length > 0) {
        await Promise.all(
          updateDocumentParticipants.map(({ id, changes }) =>
            transactionalEntityManager.update(SiteDocPartics, { id }, changes),
          ),
        );
      }

      // Delete existing site documents and site document participants in bulk
      if (deleteDocuments.length > 0) {
        await Promise.all(
          deleteDocuments.map(({ id }) =>
            transactionalEntityManager.delete(SiteDocs, { id }),
          ),
        );
      }
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
  ) {
    if (siteParticipants && siteParticipants.length) {
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
      // const deleteSiteParticRoles: { id: string }[] = [];

      // Main processing loop for site participants
      const siteParticsPromises = siteParticipants.map(async (participant) => {
        const {
          description,
          displayName,
          prCode,
          apiAction,
          particRoleId,
          srAction,
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
            // Generate new ID for the new participant
            const newId = await this.siteParticipantsRepo
              .createQueryBuilder()
              .select('MAX(id)', 'maxid')
              .getRawOne()
              .then((result) => (Number(result.maxid) || 0) + 1);

            // Get the ID of the newly created participant
            participantId = newId.toString();

            newSitePartics.push({
              ...sitePartic,
              id: participantId,
              rwmFlag: 0,
              rwmNoteFlag: 0,
              userAction: UserActionEnum.ADDED,
              // srAction: srAction,
              whenCreated: new Date(),
              whoCreated: userInfo ? userInfo.givenName : '',
            });

            newSiteParticRoles.push({
              ...siteParticRole,
              spId: participantId,
              rwmFlag: 0,
              userAction: UserActionEnum.ADDED,
              // srAction: srAction,
              whenCreated: new Date(),
              whoCreated: userInfo ? userInfo.givenName : '',
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
                  userAction: UserActionEnum.UPDATED,
                  // srAction: srAction,
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
                    // srAction: srAction,
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
            // deleteSiteParticRoles.push({ id: particRoleId });
            break;

          default:
            this.sitesLogger.warn(
              'SiteService.processSiteParticipants(): Unknown action for participant:',
            );
        }
      });

      await Promise.all(siteParticsPromises);

      // Save new site participants and site participant roles in bulk
      if (newSitePartics.length > 0) {
        await transactionalEntityManager.save(SitePartics, newSitePartics);
      }
      if (newSiteParticRoles.length > 0) {
        await transactionalEntityManager.save(
          SiteParticRoles,
          newSiteParticRoles,
        );
      }

      // Update existing site participants and site participant roles in bulk
      if (updatedSitePartics.length > 0) {
        await Promise.all(
          updatedSitePartics.map(({ id, changes }) =>
            transactionalEntityManager.update(SitePartics, { id }, changes),
          ),
        );
      }

      if (updatedSiteParticRoles.length > 0) {
        await Promise.all(
          updatedSiteParticRoles.map(({ id, changes }) =>
            transactionalEntityManager.update(SiteParticRoles, { id }, changes),
          ),
        );
      }

      // Delete existing site participants and site participant roles in bulk
      // if (deleteSiteParticRoles.length > 0) {
      //   await Promise.all(
      //     deleteSiteParticRoles.map(({ id }) =>
      //       transactionalEntityManager.delete(SiteParticRoles, { id }),
      //     ),
      //   );
      // }
      if (deleteSitePartics.length > 0) {
        await Promise.all(
          deleteSitePartics.map(({ id }) =>
            transactionalEntityManager.delete(SitePartics, { id }),
          ),
        );
      }
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
  ) {
    if (events && events.length > 0) {
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
          const { eventParticId, displayName, apiAction, ...particData } =
            partic;
          switch (apiAction) {
            case UserActionEnum.ADDED:
              return {
                ...particData,
                eventId,
                rwmFlag: 50,
                userAction: UserActionEnum.ADDED,
                whenCreated: new Date(),
                whoCreated: userInfo ? userInfo.givenName : '',
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
            // Generate new ID for the new event
            const newId = await this.eventsRepositoryRepo
              .createQueryBuilder()
              .select('MAX(id)', 'maxid')
              .getRawOne()
              .then((result) => (Number(result.maxid) || 0) + 1);

            // Get the ID of the newly created event
            notationId = newId.toString();

            newEvents.push({
              ...event,
              id: notationId,
              eventDate: new Date(),
              rwmFlag: 50,
              rwmNoteFlag: 50,
              userAction: UserActionEnum.ADDED,
              whenCreated: new Date(),
              whoCreated: userInfo ? userInfo.givenName : '',
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
            console.warn('Unknown action for event:', apiAction);
        }

        // Process related participants regardless of event action
        if (notationParticipant && notationParticipant.length > 0) {
          await processParticipants(notationId, notationParticipant);
        }
      });

      await Promise.all(eventPromises);

      // Save new events and event participants in bulk
      if (newEvents.length > 0) {
        await transactionalEntityManager.save(Events, newEvents);
      }

      if (newEventPartics.length > 0) {
        await transactionalEntityManager.save(EventPartics, newEventPartics);
      }

      // Update existing events and participants in bulk
      if (updatedEvents.length > 0) {
        await Promise.all(
          updatedEvents.map(({ id, changes }) =>
            transactionalEntityManager.update(Events, { id }, changes),
          ),
        );
      }

      if (updatedEventPartics.length > 0) {
        await Promise.all(
          updatedEventPartics.map(({ id, changes }) =>
            transactionalEntityManager.update(EventPartics, { id }, changes),
          ),
        );
      }
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
  ) {
    if (siteAccociated && siteAccociated.length > 0) {
      const newSiteAssociates: SiteAssocs[] = [];
      const updatedSiteAssociates: {
        id: string;
        changes: Partial<SiteAssocs>;
      }[] = [];
      const deleteSiteAssociates: { id: string }[] = [];

      const siteAssociatePromises = siteAccociated.map(async (asscos) => {
        const { id, apiAction, ...siteAssocsData } = asscos;
        const siteAssoc = { ...new SiteAssocs(), ...siteAssocsData };
        switch (apiAction) {
          case UserActionEnum.ADDED:
            newSiteAssociates.push({
              ...siteAssoc,
              rwmFlag: 0,
              rwmNoteFlag: 0,
              // Need to know common pid relation as it is non-nullable field in DB and we don't and visibility in our design for same.
              commonPid: 'N',
              userAction: UserActionEnum.ADDED,
              whenCreated: new Date(),
              whoCreated: userInfo ? userInfo.givenName : '',
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
                  userAction: UserActionEnum.UPDATED,
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
      if (newSiteAssociates.length > 0) {
        await transactionalEntityManager.save(SiteAssocs, newSiteAssociates);
      }

      // Update existing site participants and site participant roles in bulk
      if (updatedSiteAssociates.length > 0) {
        await Promise.all(
          updatedSiteAssociates.map(({ id, changes }) =>
            transactionalEntityManager.update(SiteAssocs, { id }, changes),
          ),
        );
      }

      if (deleteSiteAssociates.length > 0) {
        await Promise.all(
          deleteSiteAssociates.map(({ id }) =>
            transactionalEntityManager.delete(SiteAssocs, { id }),
          ),
        );
      }
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

      const query = `
       select ResultInFo.site_id,ResultInFo.changes,ResultInFo.Latest_Update,ResultInFo.who as who_updated, SiteInfo.addr_line_1, SiteInfo.addr_line_2,SiteInfo.addr_line_3 from (WITH LatestUpdates AS (
          SELECT site_id,
                MAX(when_Updated) AS Latest_Update,
            who_updated as who
          FROM (
              SELECT id AS site_id, when_Updated ,who_updated 
              FROM sites.sites
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated , who_updated 
              FROM sites.events
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT e.site_id, e.when_Updated, e.who_updated 
              FROM sites.event_partics ep
              INNER JOIN sites.events e ON ep.event_id = e.id
              WHERE e.sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated, who_updated 
              FROM sites.site_partics
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated, who_updated 
              FROM sites.site_docs
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated,who_updated 
              FROM sites.site_assocs
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated,who_updated 
              FROM sites.land_histories
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated,who_updated 
              FROM sites.site_subdivisions
              WHERE sr_action = 'pending'
              
              UNION ALL
              
              SELECT site_id, when_Updated ,who_updated 
              FROM sites.site_profiles
              WHERE sr_action = 'pending'
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
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'notation', when_Updated, who_updated , '' , '', '' 
          FROM sites.events
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT e.site_id, 'notation participants' AS Change, e.when_Updated, e.who_updated , '' , '', '' 
          FROM sites.event_partics ep
          INNER JOIN sites.events e ON ep.event_id = e.id
          WHERE e.sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'site participants' AS Change, when_Updated, who_updated ,  '' , '', '' 
          FROM sites.site_partics
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'documents' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.site_docs
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'associated sites' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.site_assocs
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'land histories' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.land_histories
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'parcel description' AS Change, when_Updated, who_updated,  '' , '', '' 
          FROM sites.site_subdivisions
          WHERE sr_action = 'pending'
          
          UNION ALL
          
          SELECT site_id, 'site profiles' AS Change, when_Updated, who_updated ,  '' , '', '' 
          FROM sites.site_profiles
          WHERE sr_action = 'pending'
      ) AS c
      GROUP BY c.site_id,c.who_updated) Final
      JOIN LatestUpdates lu ON Final.site_id = lu.site_id and Final.who_updated = lu.who ) ResultInFo
      JOIN sites.sites SiteInfo on SiteInfo.id = ResultInFo.site_id
        `;

      const entityManager = this.siteRepository.manager;
      const queryResult = await entityManager.query(query);

      let result: SitePendingApprovalRecords[] = [];

      if (queryResult && queryResult.length > 0) {
        result = queryResult.map((res) => {
          return {
            siteId: res.site_id,
            changes: res.changes,
            whoUpdated: res.who_updated,
            whenUpdated: res.latest_update,
            address:
              res.addr_line_1 + ' ' + res.addr_line_2 + ' ' + res.addr_line_3,
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
        totalRecords: result.length,
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

      throw new Error('Failed to determine banner type.');
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
        return false;
      } else {
        const { isApproved, sites } = inputDTO;

        sites.forEach(async (site: SiteRecordsForSRAction) => {
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
                userInfo,
              );
            });
          },
        );

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
    userInfo: any,
  ) {
    try {
      this.sitesLogger.log('SiteService.processSRBulkUpdates() start');

      if ((site != null && site.siteId === null) || site.siteId === undefined) {
        return false;
      }

      if (site.changes.indexOf('summary') !== -1) {
        const sitesForUpdates = await transactionalEntityManager.find(Sites, {
          where: { id: site.siteId, whoUpdated: site.whoUpdated },
        });

        if (sitesForUpdates.length > 0) {
          sitesForUpdates.forEach((site) => {
            this.setUpdatedStatus(site, isApproved, userInfo);
          });
          await transactionalEntityManager.save(Sites, sitesForUpdates);
        }
        else {
          this.sitesLogger.log(
            'SiteService.processSRBulkUpdates() no summary to process.',
          );
        }
      }

      if (site.changes.indexOf('notation') !== -1) {
        const events = await transactionalEntityManager.find(Events, {
          where: { siteId: site.siteId, whoUpdated: site.whoUpdated },
        });

        if (events.length > 0) {
          events.forEach((event) => {
            this.setUpdatedStatus(event, isApproved, userInfo);
          });

          await transactionalEntityManager.save(Events, events);

          const eventIds = events.map((event) => event.id);

          const eventsParticipants = await transactionalEntityManager.find(
            EventPartics,
            {
              where: {
                eventId: In(eventIds),
                whoUpdated: site.whoUpdated,
              },
            },
          );

          if (eventsParticipants.length > 0) {
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
        const siteParticipants = await transactionalEntityManager.find(
          SitePartics,
          {
            where: {
              siteId: site.siteId,
              whoUpdated: site.whoUpdated,
            },
          },
        );

        if (siteParticipants.length > 0) {
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
        const siteDocs = await transactionalEntityManager.find(SiteDocs, {
          where: {
            siteId: site.siteId,
            whoUpdated: site.whoUpdated,
          },
        });

        if (siteDocs.length > 0) {
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
        const siteAssociations = await transactionalEntityManager.find(
          SiteAssocs,
          {
            where: {
              siteId: site.siteId,
              whoUpdated: site.whoUpdated,
            },
          },
        );

        if (siteAssociations.length > 0) {
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
        const landHistories = await transactionalEntityManager.find(
          LandHistories,
          {
            where: {
              siteId: site.siteId,
              whoUpdated: site.whoUpdated,
            },
          },
        );

        if (landHistories.length > 0) {
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
        const profiles = await transactionalEntityManager.find(SiteProfiles, {
          where: {
            siteId: site.siteId,
            whoUpdated: site.whoUpdated,
          },
        });

        if (profiles.length > 0) {
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
        const siteSubDivisions = await transactionalEntityManager.find(
          SiteSubdivisions,
          {
            where: {
              siteId: site.siteId,
              whoUpdated: site.whoUpdated,
            },
          },
        );

        if (siteSubDivisions.length > 0) {
          const subDivIds = siteSubDivisions.map((x) => x.subdivId);

          const subDivisions = await transactionalEntityManager.find(
            Subdivisions,
            {
              where: { id: In(subDivIds), whoUpdated: site.whoUpdated },
            },
          );

          if (subDivisions.length > 0) {
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

      this.sitesLogger.log('SiteService.processSRBulkUpdates() end');
      return true;
    } catch (error) {
      this.sitesLogger.log(
        'SiteService.processSRBulkUpdates() error' + JSON.stringify(error),
      );
      throw error;
    }
  }

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
}
