import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { SiteService } from './site.service';
import { Sites } from '../../entities/sites.entity';
import { FetchSiteDetail } from '../../dto/response/genericResponse';
import { sampleSites } from '../../mockData/site.mockData';
import { EventPartics } from '../../entities/eventPartics.entity';
import { SitePartics } from '../../entities/sitePartics.entity';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { LandHistories } from '../../entities/landHistories.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { HistoryLog } from '../../entities/siteHistoryLog.entity';
import { Events } from '../../entities/events.entity';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { SaveSiteDetailsDTO } from '../../dto/saveSiteDetails.dto';
import { LandHistoryService } from '../landHistory/landHistory.service';
import { TransactionManagerService } from '../transactionManager/transactionManager.service';
import { LoggerService } from '../../logger/logger.service';
import { SiteParticRoles } from '../../entities/siteParticRoles.entity';
import { SiteDocPartics } from '../../entities/siteDocPartics.entity';
import {
  BulkApproveRejectChangesDTO,
  QueryResultForPendingSites,
  SearchParams,
  SitePendingApprovalRecords,
} from 'src/app/dto/sitesPendingReview.dto';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { ParcelDescriptionInputDTO } from 'src/app/dto/parcelDescriptionInput.dto';
import { ParcelDescriptionsService } from '../parcelDescriptions/parcelDescriptions.service';
import { UserActionEnum } from '../../common/userActionEnum';

describe('SiteService', () => {
  let siteService: SiteService;
  let siteRepository: Repository<Sites>;
  let eventsRepository: Repository<Events>;
  let eventsParticipantsRepository: Repository<EventPartics>;
  let siteParticipantsRepository: Repository<SitePartics>;
  let siteDocumentsRepo: Repository<SiteDocs>;
  let siteDocumentParticsRepo: Repository<SiteDocPartics>;
  let siteAssociationsRepo: Repository<SiteAssocs>;
  let landHistoriesRepo: Repository<LandHistories>;
  let siteSubDivisionsRepo: Repository<SiteSubdivisions>;
  let siteProfilesRepo: Repository<SiteProfiles>;
  let entityManager: EntityManager;
  let historyLogRepository: Repository<HistoryLog>;
  let loggerService: LoggerService;
  let parcelDescriptionService: ParcelDescriptionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: LandHistoryService,
          useValue: {},
        },
        {
          provide: TransactionManagerService,
          useValue: {},
        },
        {
          provide: getRepositoryToken(Sites),
          useValue: {
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ]),
            })),
            findOneOrFail: jest.fn(() => {
              return { id: '123', region_name: 'victoria' };
            }),
            save: jest.fn(() => {
              return [
                { id: '123', siteId: '123' },
                { id: '124', siteId: '123' },
              ];
            }),
            manager: {
              query: jest.fn(() => {
                return [
                  { id: '123', siteId: '123' },
                  { id: '124', siteId: '123' },
                ];
              }),
            },
          },
        },
        {
          provide: getRepositoryToken(Events),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return [
                {
                  id: '1',
                  siteId: '1',
                  psnorgId: '1',
                  completionDate: '2004-06-16T07:00:00.000Z',
                  requirementDueDate: '1970-01-01T00:00:00.000Z',
                  requirementReceivedDate: '1970-01-01T00:00:00.000Z',
                  requiredAction: null,
                  note: null,
                  etypCode: 'test type code',
                  eclsCode: 'test class code',
                  srAction: 'false',
                },
              ];
            }),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ maxid: '1' }), // Ensure this returns a promise
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(EventPartics),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return [
                {
                  eventParticId: 'xxx-xxx',
                  eventId: '1',
                  eprCode: 'test epr code',
                  psnorgId: '1',
                  displayName: 'Display Name',
                  srAction: 'false',
                },
              ];
            }),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ maxid: '1' }), // Ensure this returns a promise
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SitePartics),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return [
                {
                  id: '1',
                  psnorgId: '1',
                  siteId: '1',
                  effectiveDate: '1988-03-12T08:00:00.000Z',
                  endDate: null,
                  note: 'OWNER OF MAJORITY OF FORMER CP RAIL RIGHT OF WAY.',
                  displayName: 'ENVIRO-TEST LABORATORIES (EDMONTON, ALBERTA)',
                  srAction: 'false',
                },
              ];
            }),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ maxid: '1' }), // Ensure this returns a promise
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SiteParticRoles),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return [
                {
                  particRoleId: 'xxx-xxxx-xxx',
                  spId: '1',
                  prCode: 'POWNR',
                  description: 'PROPERTY OWNER',
                  srAction: 'false',
                },
              ];
            }),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ maxid: '1' }), // Ensure this returns a promise
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SiteDocs),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return {
                id: '1',
                siteId: '9',
                submissionDate: new Date(),
                documentDate: new Date(),
                title: 'PROPOSED DREDGING AND LANDFILL (REMEDIAL PLAN)',
                srAction: false,
              };
            }),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ maxid: '1' }), // Ensure this returns a promise
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SiteDocPartics),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return {
                id: '1',
                psnorgId: '123',
                displayName: 'Display Name',
              };
            }),
            save: jest.fn(),
            createQueryBuilder: jest.fn().mockReturnValue({
              select: jest.fn().mockReturnThis(),
              getRawOne: jest.fn().mockResolvedValue({ maxid: '1' }), // Ensure this returns a promise
            }),
          },
        },
        {
          provide: getRepositoryToken(SiteAssocs),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return {
                id: '1',
                siteId: '123',
                siteIdAssociatedWith: '1234',
                note: 'Test Note',
              };
            }),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LandHistories),
          useValue: {
            find: jest.fn(() => {
              return [
                { id: '123', siteId: '123' },
                { id: '124', siteId: '123' },
              ];
            }),
            save: jest.fn(() => {
              return [
                { id: '123', siteId: '123' },
                { id: '124', siteId: '123' },
              ];
            }),
          },
        },
        {
          provide: getRepositoryToken(SiteSubdivisions),
          useValue: {
            find: jest.fn(() => {
              return [
                { siteId: '123', subdivId: '123' },
                { siteId: '124', subdivId: '123' },
              ];
            }),
            save: jest.fn(() => {
              return [
                { id: '123', siteId: '123' },
                { id: '124', siteId: '123' },
              ];
            }),
          },
        },
        {
          provide: getRepositoryToken(SiteProfiles),
          useValue: {
            findOneByOrFail: jest.fn(() => {
              return {
                id: '123',
                siteId: '456',
                dateCompleted: new Date(),
                whenCreated: new Date(),
                whoCreated: 'Test User',
              };
            }),
            save: jest.fn(),
          },
        },
        {
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(async () => {
              return await true;
            }),
            find: jest.fn(async () => {
              return [];
            }),
            save: jest.fn(async () => {
              return true;
            }),
            findOneByOrFail: jest.fn(),
            // save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(HistoryLog),
          useValue: {
            find: jest.fn(() => {
              return [
                { id: '123', userId: '123' },
                { id: '124', userId: '123' },
              ];
            }),
            save: jest.fn(() => {
              return [
                { id: '123', siteId: '123' },
                { id: '124', siteId: '123' },
              ];
            }),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
          },
        },
        {
          provide: ParcelDescriptionsService,
          useValue: {
            saveParcelDescriptionsForSite: jest.fn(),
          },
        },
      ],
    }).compile();

    siteService = module.get<SiteService>(SiteService);
    siteRepository = module.get<Repository<Sites>>(getRepositoryToken(Sites));
    eventsRepository = module.get<Repository<Events>>(
      getRepositoryToken(Events),
    );
    eventsParticipantsRepository = module.get<Repository<EventPartics>>(
      getRepositoryToken(EventPartics),
    );
    siteParticipantsRepository = module.get<Repository<SitePartics>>(
      getRepositoryToken(SitePartics),
    );
    siteDocumentsRepo = module.get<Repository<SiteDocs>>(
      getRepositoryToken(SiteDocs),
    );
    siteAssociationsRepo = module.get<Repository<SiteAssocs>>(
      getRepositoryToken(SiteAssocs),
    );
    landHistoriesRepo = module.get<Repository<LandHistories>>(
      getRepositoryToken(LandHistories),
    );
    siteSubDivisionsRepo = module.get<Repository<SiteSubdivisions>>(
      getRepositoryToken(SiteSubdivisions),
    );
    siteProfilesRepo = module.get<Repository<SiteProfiles>>(
      getRepositoryToken(SiteProfiles),
    );
    historyLogRepository = module.get<Repository<HistoryLog>>(
      getRepositoryToken(HistoryLog),
    );
    entityManager = module.get<EntityManager>(EntityManager);
    loggerService = module.get<LoggerService>(LoggerService);
    parcelDescriptionService = module.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Atleast one site should be returned', async () => {
    const sites = await siteService.findAll();
    expect(sites.data.length).toBe(3);
  });

  /*describe('searchSites', () => {
    it('site search matches a search parameter', async () => {
      // Arrange
      const searchParam = 'v';
      const expectedResult = [
        { id: '123', commonName: 'victoria' },
        { id: '222', commonName: 'vancouver' }]; // Example result
      const whereMock = jest.fn().mockReturnThis();
      const orWhereMock = jest.fn().mockReturnThis();
      const getManyMock = jest.fn().mockResolvedValue(expectedResult);
      const siteRepositoryFindSpy = jest.spyOn(siteRepository, 'createQueryBuilder').mockReturnValue({
        where: whereMock,
        orWhere: orWhereMock,
        getMany: getManyMock,
      } as unknown as SelectQueryBuilder<Sites>);

      // Act
      const result = await siteService.searchSites(searchParam);

      // Assert
      expect(siteRepositoryFindSpy).toHaveBeenCalledWith('sites');
      expect(whereMock).toHaveBeenCalledWith(expect.any(String), { searchParam: `%${searchParam}%` });
      expect(orWhereMock).toHaveBeenCalledTimes(7); // Number of orWhere calls
      expect(getManyMock).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('site search has no matches with the search parameter', async () => {
      // Arrange
      const searchParam = 'xyz';
      const expectedResult = []; // Example result
      const whereMock = jest.fn().mockReturnThis();
      const orWhereMock = jest.fn().mockReturnThis();
      const getManyMock = jest.fn().mockResolvedValue(expectedResult);
      const siteRepositoryFindSpy = jest.spyOn(siteRepository, 'createQueryBuilder').mockReturnValue({
        where: whereMock,
        orWhere: orWhereMock,
        getMany: getManyMock,
      } as unknown as SelectQueryBuilder<Sites>);

      // Act
      const result = await siteService.searchSites(searchParam);

      // Assert
      expect(siteRepositoryFindSpy).toHaveBeenCalledWith('sites');
      expect(whereMock).toHaveBeenCalledWith(expect.any(String), { searchParam: `%${searchParam}%` });
      expect(orWhereMock).toHaveBeenCalledTimes(7); // Number of orWhere calls
      expect(getManyMock).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });*/

  describe.skip('findSiteBySiteId', () => {
    it('should call findOneOrFail method of the repository with the provided siteId', async () => {
      const siteId = '123';
      await siteService.findSiteBySiteId(siteId, false);
      expect(siteRepository.findOneOrFail).toHaveBeenCalledWith({
        where: { id: siteId },
      });
    });

    it('should return the site when findOneOrFail method of the repository resolves', async () => {
      const siteId = '123';
      const expectedResult: FetchSiteDetail = {
        httpStatusCode: 200,
        data: sampleSites[0],
      };
      (siteRepository.findOneOrFail as jest.Mock).mockResolvedValue(
        expectedResult,
      );

      const result = await siteService.findSiteBySiteId(siteId, false);

      expect(result).toBeInstanceOf(FetchSiteDetail);
      expect(result.httpStatusCode).toBe(200);
      expect(result.data).toEqual(expectedResult);
    });

    it('should throw an error when findOneOrFail method of the repository rejects', async () => {
      const siteId = '111';
      const error = new Error('Site not found');
      (siteRepository.findOneOrFail as jest.Mock).mockRejectedValue(error);
      await expect(
        siteService.findSiteBySiteId(siteId, false),
      ).rejects.toThrowError(error);
    });
  });

  describe('commitSiteDetails', () => {
    describe('when there are no errors', () => {
      beforeEach(() => {
        entityManager.save = jest.fn();
      });

      it('returns true.', async () => {
        const userInfo = { sub: 'userId', givenName: 'UserName' };

        const inputDTO: SaveSiteDetailsDTO = {
          siteId: '1',
          events: [
            {
              id: '1',
              psnorgId: '1',
              siteId: '1',
              completionDate: new Date(),
              etypCode: '1',
              eclsCode: '1',
              requiredAction: '1',
              note: '1',
              requirementDueDate: new Date(),
              requirementReceivedDate: new Date(),
              userAction: 'pending',
              apiAction: 'pending',
              srAction: 'pending',
              notationParticipant: null,
            },
          ],
        };

        const result = await siteService.commitSiteDetails(
          entityManager,
          inputDTO,
          userInfo,
        );

        expect(result).toBe(true);
      });

      it('calls the parcel descriptions service.', async () => {
        const userInfo = { sub: 'userId', givenName: 'UserName' };

        const inputDTO: SaveSiteDetailsDTO = {
          siteId: '1',
          parcelDescriptions: [
            {
              id: '1',
              descriptionType: 'Parcel ID',
              dateNoted: new Date(),
              idPinNumber: '123456',
              landDescription: 'Description of Land',
              userAction: 'pending',
              apiAction: 'pending',
              srAction: 'pending',
            } as ParcelDescriptionInputDTO,
          ],
        };

        await siteService.commitSiteDetails(entityManager, inputDTO, userInfo);

        expect(
          parcelDescriptionService.saveParcelDescriptionsForSite,
        ).toHaveBeenCalledWith(
          inputDTO.siteId,
          inputDTO.parcelDescriptions,
          userInfo,
        );
      });

      it('logs when there are no parcel descriptions', async () => {
        const userInfo = { sub: 'userId', givenName: 'UserName' };

        const inputDTO: SaveSiteDetailsDTO = {
          siteId: '1',
        };

        await siteService.commitSiteDetails(entityManager, inputDTO, userInfo);

        expect(loggerService.log).toHaveBeenCalledWith(
          expect.stringMatching(/.*No changes to Parcel Descriptions.*/),
        );
      });
    });
  });

  describe('SR Approval Reject', () => {
    describe('Fetching Records', () => {
      it('Fetch SR Pending Approval Reject Records', async () => {
        const page = 1;
        const pageSize = 5;
        const searchParam: SearchParams = null;

        const data: any[] = [
          {
            site_id: '1',
            who_updated: 'Midhun',
            latest_update: new Date(),
            changes: 'summary',
            addr_line_1: 'address 1',
            addr_line_2: 'address 2 ',
            addr_line_3: 'address 3',
          },
        ];

        jest.spyOn(siteRepository.manager, 'query').mockResolvedValue(data);

        const result = await siteService.getSiteDetailsPendingSRApproval(
          searchParam,
          page,
          pageSize,
        );

        expect(result.totalRecords).toBeGreaterThan(0);
      });

      it('Fetch SR Pending Approval Reject Records - Filter', async () => {
        const page = 1;
        const pageSize = 5;
        const searchParam: SearchParams = {
          changes: 'notation',
        };

        const data: any[] = [
          {
            site_id: '1',
            who_updated: 'Midhun',
            latest_update: new Date(),
            changes: 'summary',
            addr_line_1: 'address 1',
            addr_line_2: 'address 2 ',
            addr_line_3: 'address 3',
          },
          {
            site_id: '2',
            who_updated: 'Midhun',
            latest_update: new Date(),
            changes: 'notation',
            addr_line_1: 'address 1',
            addr_line_2: 'address 2 ',
            addr_line_3: 'address 3',
          },
        ];

        jest.spyOn(siteRepository.manager, 'query').mockResolvedValue(data);

        const result = await siteService.getSiteDetailsPendingSRApproval(
          searchParam,
          page,
          pageSize,
        );

        expect(result.totalRecords).toBeLessThanOrEqual(1);
      });
    });

    describe('Bulk Update For SR', () => {
      it('Bulk Approve/Reject ', async () => {
        const inputDTO: BulkApproveRejectChangesDTO = {
          isApproved: true,
          sites: [
            {
              id: '1',
              siteId: '2',
              whoUpdated: 'Midhun',
              whenUpdated: new Date(),
              changes: 'notation',
              address: 'address 1',
            },
          ],
        };

        const response = await siteService.bulkUpdateForSR(inputDTO, null);

        console.log('response', response);
        expect(response).toBe(true);
      });

      it('Set Public Status Properly', async () => {
        const entity = {
          userAction: '',
          srAction: '',
          whenUpdated: '',
          whoUpdated: '',
        };
        const userInfo = { givenName: 'Midhun' };
        const isApproved = true;
        siteService.setUpdatedStatus(entity, isApproved, userInfo);
        const status = entity.srAction === SRApprovalStatusEnum.PUBLIC;
        expect(status).toBeTruthy();
      });

      it('validate processBulkUpdates', async () => {
        const site = {
          id: '1',
          siteId: '2',
          whoUpdated: 'Midhun',
          whenUpdated: new Date(),
          changes: 'notation',
          address: 'address 1',
        };
        const userInfo = { givenName: 'Midhun' };

        const result = await siteService.processSRBulkUpdates(
          entityManager,
          site,
          true,
          userInfo,
        );

        expect(result).toBeTruthy();
      });
    });
  });

  describe('processSiteDisclosure', () => {
    it('should create a new site profile when action is ADDED', async () => {
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.ADDED,
          id: '123',
          siteId: '456',
          dateCompleted: new Date(),
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
      );
      expect(entityManager.save).toHaveBeenCalled();
      const addedProfile = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(addedProfile.dateCompleted).toBeInstanceOf(Date);
      expect(addedProfile.whenCreated).toBeInstanceOf(Date);
      expect(addedProfile.siteId).toBe('456');
      expect(addedProfile.whoCreated).toBe('Test User');
    });

    it('should update an existing site profile when action is UPDATED', async () => {
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '123',
          siteId: '456',
          dateCompleted: new Date(),
        },
      ];
      const userInfo = { givenName: 'Updated User' };

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
      );
      expect(entityManager.save).toHaveBeenCalled();
      const updatedProfile = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(updatedProfile.dateCompleted).toBeInstanceOf(Date);
      expect(updatedProfile.whenUpdated).toBeInstanceOf(Date);
      expect(updatedProfile.siteId).toBe('456');
      expect(updatedProfile.whoUpdated).toBe('Updated User');
    });
  });

  describe('processSiteAssociated', () => {
    it('should add new site associates', async () => {
      const siteAccociated = [
        {
          apiAction: UserActionEnum.ADDED,
          id: '1',
          siteId: '123',
          siteIdAssociatedWith: '9999',
          note: 'Note added',
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processSiteAssociated(
        siteAccociated,
        userInfo,
        entityManager,
      );
      expect(entityManager.save).toHaveBeenCalled();
      const addedSiteAssoc = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(addedSiteAssoc[0].whenCreated).toBeInstanceOf(Date);
      expect(addedSiteAssoc[0].siteId).toBe('123');
      expect(addedSiteAssoc[0].whoCreated).toBe('Test User');
      expect(addedSiteAssoc[0].siteIdAssociatedWith).toBe('9999');
      expect(addedSiteAssoc[0].note).toBe('Note added');
    });

    it('should update existing site associates', async () => {
      const siteAccociated = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '1',
          siteId: '123',
          siteIdAssociatedWith: '9999',
          note: 'Note Updated',
        },
      ];
      const userInfo = { givenName: 'Updated User' };

      await siteService.processSiteAssociated(
        siteAccociated,
        userInfo,
        entityManager,
      );
      const updatedAssoc = (entityManager.update as jest.Mock).mock.calls[0][2];
      expect(updatedAssoc.whenUpdated).toBeInstanceOf(Date);
      expect(updatedAssoc.siteId).toBe('123');
      expect(updatedAssoc.whoUpdated).toBe('Updated User');
      expect(updatedAssoc.siteIdAssociatedWith).toBe('9999');
      expect(updatedAssoc.note).toBe('Note Updated');
    });

    it('should delete site associates', async () => {
      const siteAccociated = [
        {
          apiAction: UserActionEnum.DELETED,
          id: '1',
        },
      ];
      const userInfo = { givenName: 'User Four' };

      await siteService.processSiteAssociated(
        siteAccociated,
        userInfo,
        entityManager,
      );
      const deletedAssoc = (entityManager.delete as jest.Mock).mock.calls[0][1];
      expect(deletedAssoc.id).toBe('1');
    });
  });

  describe('processDocuments', () => {
    it('should add new documents and participants when action is ADDED', async () => {
      const documents = [
        {
          id: null,
          displayName: 'Display Name',
          psnorgId: '123',
          apiAction: UserActionEnum.ADDED,
          srAction: SRApprovalStatusEnum.PENDING,
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processDocuments(documents, userInfo, entityManager);

      expect(entityManager.save).toHaveBeenCalledTimes(2); // For SiteDocs and SiteDocPartics
      const savedDocuments = (entityManager.save as jest.Mock).mock.calls[0][1];
      const savedDocPartics = (entityManager.save as jest.Mock).mock
        .calls[0][1];

      expect(savedDocuments[0].whenCreated).toBeInstanceOf(Date);
      expect(savedDocuments[0].whoCreated).toBe('Test User');
      expect(savedDocPartics[0].whenCreated).toBeInstanceOf(Date);
      expect(savedDocPartics[0].whoCreated).toBe('Test User');
    });

    it('should update existing documents and participants when action is UPDATED', async () => {
      const documents = [
        {
          id: '1',
          docParticId: '1',
          displayName: 'Updated Document',
          apiAction: UserActionEnum.UPDATED,
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processDocuments(documents, userInfo, entityManager);

      expect(entityManager.update).toHaveBeenCalledTimes(2); // For SiteDocs and SiteDocPartics
      expect(entityManager.update).toHaveBeenCalledWith(
        SiteDocs,
        { id: '1' },
        expect.any(Object),
      );
      expect(entityManager.update).toHaveBeenCalledWith(
        SiteDocPartics,
        { id: '1' },
        expect.any(Object),
      );
    });

    it('should delete documents when action is DELETED', async () => {
      const documents = [
        {
          id: '1',
          apiAction: UserActionEnum.DELETED,
        },
      ];
      const userInfo = { givenName: 'Tester' };

      await siteService.processDocuments(documents, userInfo, entityManager);

      expect(entityManager.delete).toHaveBeenCalledWith(SiteDocs, { id: '1' });
    });
  });

  describe('processSiteParticipants', () => {
    it('should add new site participants and roles', async () => {
      const siteParticipants = [
        {
          apiAction: UserActionEnum.ADDED,
          description: 'New Participant',
          displayName: 'Display Name',
          prCode: 'PR001',
          psnorgId: '123',
          siteId: '1',
          effectiveDate: '1988-03-12T08:00:00.000Z',
          endDate: null,
          note: 'OWNER OF MAJORITY OF FORMER CP RAIL RIGHT OF WAY.',
          srAction: 'false',
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processSiteParticipants(
        siteParticipants,
        userInfo,
        entityManager,
      );

      expect(entityManager.save).toHaveBeenCalledTimes(2);
      const addedSiteParticipant = (entityManager.save as jest.Mock).mock
        .calls[0][1];
      expect(entityManager.save).toHaveBeenCalledWith(
        SitePartics,
        expect.any(Array),
      );
      expect(entityManager.save).toHaveBeenCalledWith(
        SiteParticRoles,
        expect.any(Array),
      );
      expect(addedSiteParticipant[0].whenCreated).toBeInstanceOf(Date);
      expect(addedSiteParticipant[0].whoCreated).toBe('Test User');
    });

    it('should update existing site participants and roles', async () => {
      const siteParticipants = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '1',
          prCode: 'PR002',
          particRoleId: 'xxx-xxxx-xxx',
        },
      ];
      const userInfo = { givenName: 'Updated User' };

      await siteService.processSiteParticipants(
        siteParticipants,
        userInfo,
        entityManager,
      );
      const updatedSiteParticipant = (entityManager.update as jest.Mock).mock
        .calls[0][2];
      expect(updatedSiteParticipant.whoUpdated).toBe('Updated User');
      expect(entityManager.update).toHaveBeenCalledTimes(2);
      expect(entityManager.update).toHaveBeenCalledWith(
        SitePartics,
        { id: '1' },
        expect.any(Object),
      );
      expect(entityManager.update).toHaveBeenCalledWith(
        SiteParticRoles,
        { id: 'xxx-xxxx-xxx' },
        expect.any(Object),
      );
    });

    it('should delete site participants and roles', async () => {
      const siteParticipants = [
        {
          apiAction: UserActionEnum.DELETED,
          id: '1',
          particRoleId: 'xxx-xxxx-xxx',
        },
      ];
      const userInfo = { givenName: 'Deleter User' };

      await siteService.processSiteParticipants(
        siteParticipants,
        userInfo,
        entityManager,
      );
      expect(entityManager.delete).toHaveBeenCalledTimes(2);
      expect(entityManager.delete).toHaveBeenCalledWith(SitePartics, {
        id: '1',
      });
      expect(entityManager.delete).toHaveBeenCalledWith(SiteParticRoles, {
        id: 'xxx-xxxx-xxx',
      });
    });

    it('should handle empty siteParticipants array', async () => {
      const siteParticipants = [];
      const userInfo = { givenName: 'Test User' };

      await siteService.processSiteParticipants(
        siteParticipants,
        userInfo,
        entityManager,
      );

      expect(entityManager.save).not.toHaveBeenCalled();
      expect(entityManager.update).not.toHaveBeenCalled();
      expect(entityManager.delete).not.toHaveBeenCalled();
    });
  });

  describe('processEvents', () => {
    it('should add new events and participants', async () => {
      const events = [
        {
          apiAction: UserActionEnum.ADDED,
          id: '1',
          siteId: '1',
          psnorgId: '1',
          completionDate: '2004-06-16T07:00:00.000Z',
          requirementDueDate: '1970-01-01T00:00:00.000Z',
          requirementReceivedDate: '1970-01-01T00:00:00.000Z',
          requiredAction: null,
          note: null,
          etypCode: 'CMI',
          eclsCode: 'ADM',
          srAction: 'false',
          notationParticipant: [
            {
              apiAction: UserActionEnum.ADDED,
              eventParticId: 'xxx-xxx',
              eventId: '1',
              eprCode: 'RVB',
              psnorgId: '1',
              displayName: 'SAGER, J.',
              srAction: 'false',
            },
          ],
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processEvents(events, userInfo, entityManager);
      const addedEvent = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(addedEvent[0].whenCreated).toBeInstanceOf(Date);
      expect(addedEvent[0].whoCreated).toBe('Test User');
      expect(entityManager.save).toHaveBeenCalledTimes(2);
      expect(entityManager.save).toHaveBeenCalledWith(
        Events,
        expect.any(Array),
      );
      expect(entityManager.save).toHaveBeenCalledWith(
        EventPartics,
        expect.any(Array),
      );
    });

    it('should update existing events and participants', async () => {
      const events = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '1',
          etypCode: 'type',
          eclsCode: 'class',
          notationParticipant: [],
        },
      ];
      const userInfo = { givenName: 'Updated User' };

      await siteService.processEvents(events, userInfo, entityManager);
      const updatedEvent = (entityManager.update as jest.Mock).mock.calls[0][2];
      expect(updatedEvent.whoUpdated).toBe('Updated User');
      expect(entityManager.update).toHaveBeenCalledTimes(1);
      expect(entityManager.update).toHaveBeenCalledWith(
        Events,
        { id: '1' },
        expect.any(Object),
      );
    });

    it('should delete participants when action is DELETED', async () => {
      const events = [
        {
          id: '1',
          notationParticipant: [
            {
              apiAction: UserActionEnum.DELETED,
              eventParticId: 'xxx-xxx',
            },
          ],
        },
      ];
      const userInfo = { givenName: 'Deleter User' };

      await siteService.processEvents(events, userInfo, entityManager);

      expect(entityManager.delete).toHaveBeenCalledWith(EventPartics, {
        id: 'xxx-xxx',
      });
    });
  });

  describe('mapSearch', () => {
    it('should fetch all sites if no search term is passed', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      siteService.mapSearch();

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).not.toHaveBeenCalled();
    });

    it('should filter sites by trimmed lower-cased search term if provided', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      // Padding spaces are intentional here, do not remove
      siteService.mapSearch('   TeSt   ');

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledTimes(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.anything(), {
        searchTerm: '%test%',
      });
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledTimes(6);
      expect(mockQueryBuilder.orWhere).toHaveBeenCalledWith(expect.anything(), {
        searchTerm: '%test%',
      });
    });
  });
});
