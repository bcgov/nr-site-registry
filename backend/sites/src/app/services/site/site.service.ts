import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository, Like } from 'typeorm';
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
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { HistoryLog } from '../../entities/siteHistoryLog.entity';
import { UserActionEnum } from '../../common/userActionEnum';
import { SiteParticRoles } from '../../entities/siteParticRoles.entity';
import { SiteDocPartics } from '../../entities/siteDocPartics.entity';

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

  async searchSiteIds(searchParam: string) {
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
        return result.map((obj: any) => ({ key: obj.id, value: obj.id }));
      } else {
        return []; // Return an empty array if no results
      }
    } catch (error) {
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
            try {
              if (sitesSummary) {
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
                console.log('No changes To Site Events');
              }

              if (eventsParticipants) {
                await transactionalEntityManager.save(
                  EventPartics,
                  eventsParticipants,
                );
              } else {
                console.log('No changes To Site Event Participants');
              }

              if (siteParticipants && siteParticipants.length > 0) {
                await this.processSiteParticipants(
                  siteParticipants,
                  userInfo,
                  transactionalEntityManager,
                );
              } else {
                console.log('No changes To Site Participants');
              }

              if (documents && documents.length > 0) {
                await this.processDocuments(
                  documents,
                  userInfo,
                  transactionalEntityManager,
                );
              } else {
                console.log('No changes To Site Documents');
              }

              if (siteAssociations) {
                await transactionalEntityManager.save(
                  SiteAssocs,
                  siteAssociations,
                );
              } else {
                console.log('No changes To Site Associations');
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
                await transactionalEntityManager.save(
                  LandHistories,
                  landHistories,
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
      console.log('Save site details error', error);
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

        let siteDocument = { ...new SiteDocs(), ...siteDocumentData, srAction };
        let siteDocumentParticipant = {
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
                console.log(
                  `There is no document participant in database againts id : ${docParticId}`,
                );
              }
            } else {
              console.log(
                `There is no document in database againts document id : ${documentId}`,
              );
            }
            break;
          case UserActionEnum.DELETED:
            deleteDocuments.push({ id: documentId });
            break;
          default:
            console.warn('Unknown action for document:', apiAction);
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
          partiRoleId,
          srAction,
          ...siteParticsData
        } = participant;

        // Validate participant ID
        let participantId = participant.id || ''; // Ensure it's a string

        let sitePartic: SitePartics = {
          ...new SitePartics(),
          ...siteParticsData,
          srAction,
        };

        let siteParticRole: SiteParticRoles = {
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
                  id: partiRoleId,
                });
              if (existingSiteParticRole) {
                updatedSiteParticRoles.push({
                  id: partiRoleId,
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
                console.log(
                  `There is no site participant role in database againts id : ${partiRoleId}`,
                );
              }
            } else {
              console.log(
                `There is no site participant in database againts id : ${participantId}`,
              );
            }
            break;

          case UserActionEnum.DELETED:
            // Handle deletion if necessary
            deleteSitePartics.push({ id: participantId });
            // deleteSiteParticRoles.push({ id: partiRoleId });
            break;

          default:
            console.warn('Unknown action for participant:', apiAction);
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
                  userAction: UserActionEnum.UPDATED,
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
              console.warn('Unknown action for event participant:', apiAction);
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
        let event: Events = {
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
                  userAction: UserActionEnum.UPDATED,
                  whenUpdated: new Date(),
                  whoUpdated: userInfo ? userInfo.givenName : '',
                },
              });
            } else {
              console.log(
                `There is no event in database againts event id : ${notation.id}`,
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
}
