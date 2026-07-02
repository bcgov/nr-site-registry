import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { HttpException, HttpStatus } from '@nestjs/common';
import { Brackets, EntityManager, FindOneOptions, Repository } from 'typeorm';
import { SiteService, sortSRReviewTableResults } from './site.service';
import { Sites } from '../../entities/sites.entity';
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
  SearchParams,
} from '../../dto/sitesPendingReview.dto';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { ParcelDescriptionInputDTO } from '../../dto/parcelDescriptionInput.dto';
import { ParcelDescriptionsService } from '../parcelDescriptions/parcelDescriptions.service';
import { UserActionEnum } from '../../common/userActionEnum';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { Place } from '../../entities/placeEntity';

import { SiteRegistry } from '../../entities/siteRegistry.entity';
import { SortByDirection } from '../../utils/enums/sortByDirection.enum';
import { SiteSortBy } from '../../utils/enums/sortByFields.enum';
import { RadiusSearchParams } from '../../dto/radiusSearchParams.dto';
import { RecentViews } from '../../entities/recentViews.entity';
import { SiteProfileLandUses } from '../../entities/siteProfileLandUses.entity';

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
  let siteRegistryRepo: Repository<SiteRegistry>;
  let placesRepo: Repository<Place>;
  let entityManager: EntityManager;
  let historyLogRepository: Repository<HistoryLog>;
  let loggerService: LoggerService;
  let parcelDescriptionService: ParcelDescriptionsService;
  let snapShotService: SnapshotsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteService,
        {
          provide: SnapshotsService,
          useValue: {
            getMostRecentSnapshot: jest.fn().mockResolvedValue(null),
          },
        },
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
            query: jest.fn(),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            createQueryBuilder: jest.fn(() => ({
              where: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
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
            findOne: jest.fn().mockResolvedValue(null),
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
                siteProfileSchedule2Refs: [],
              };
            }),
            save: jest.fn(),
            create: jest.fn(() => {
              return {
                id: '123',
                siteId: '456',
                dateCompleted: new Date(),
                whenCreated: new Date(),
                whoCreated: 'Test User',
                siteProfileSchedule2Refs: [],
              };
            }),
          },
        },
        {
          provide: getRepositoryToken(SiteRegistry),
          useValue: {
            findOne: jest.fn(() => {
              return {
                id: '123',
                siteId: '456',
                lastApprovalDate: new Date(),
                initApprovalDate: new Date(),
                tombstoneDate: new Date(),
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
            create: jest.fn(),
            findOne: jest.fn(
              async <T>(entityClass: T, options: FindOneOptions<T>) =>
                entityClass === SiteRegistry &&
                (options as any).where?.siteId === '123'
                  ? ({
                      siteId: '456',
                      lastApprovalDate: new Date(),
                      initApprovalDate: new Date(),
                      tombstoneDate: new Date(),
                      regFlag: 1,
                      regUserid: '123',
                    } as unknown as T)
                  : null,
            ) as typeof entityManager.findOne,
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
          provide: getRepositoryToken(Place),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnThis(),
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
    placesRepo = module.get<Repository<Place>>(getRepositoryToken(Place));
    entityManager = module.get<EntityManager>(EntityManager);
    loggerService = module.get<LoggerService>(LoggerService);
    parcelDescriptionService = module.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
    snapShotService = module.get<SnapshotsService>(SnapshotsService);

    siteRegistryRepo = module.get<Repository<SiteRegistry>>(
      getRepositoryToken(SiteRegistry),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Atleast one site should be returned', async () => {
    const sites = await siteService.findAll();
    expect(sites.data.length).toBe(3);
  });

  describe('searchSites', () => {
    it('returns sites that match matches a search parameter', async () => {
      const searchParam = 'v';
      const page = 1;
      const pageSize = 20;
      const expectedResult = [
        { id: '123', commonName: 'victoria' },
        { id: '222', commonName: 'vancouver' },
      ];

      jest.mock('typeorm', () => {
        const originalModule = jest.requireActual('typeorm');
        return {
          ...originalModule,
          Brackets: jest.fn().mockImplementation((whereFactory) => {
            const mockBrackets = {
              '@instanceof': Symbol('Brackets'),
              whereFactory,
            };
            whereFactory(mockBrackets);
            return mockBrackets;
          }),
        };
      });

      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        skip: jest.fn().mockImplementation(() => mockQueryBuilder),
        take: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest
          .fn()
          .mockReturnValue([expectedResult, expectedResult.length]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      const result = await siteService.searchSites(
        {},
        searchParam,
        page,
        pageSize,
        null,
        SortByDirection.ASC,
        {},
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.who_deleted IS NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Brackets),
      );

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(result).toEqual({
        sites: expectedResult,
        count: 2,
        page,
        pageSize,
      });
    });

    it('throws an input error when filters.siteIds is an empty array', async () => {
      expect(async () => {
        await siteService.searchSites({}, 'searchParam', 1, 1, null, null, {
          siteIds: [],
        });
      }).rejects.toThrow(HttpException);
    });

    it('should generate a query with joins and conditions when pid is provided', async () => {
      jest.mock('typeorm', () => {
        const originalModule = jest.requireActual('typeorm');
        return {
          ...originalModule,
          Brackets: jest.fn().mockImplementation((whereFactory) => {
            const mockBrackets = {
              '@instanceof': Symbol('Brackets'),
              whereFactory,
            };
            whereFactory(mockBrackets);
            return mockBrackets;
          }),
        };
      });

      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]), // Mock empty results and count
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder as any);

      //const siteIds = [1, 2, 3];
      const searchParam = '123-456-789'; // Example pid with hyphen
      await siteService.searchSites({}, searchParam, 1, 1, null, null, {});

      //expect(mockQueryBuilder.whereInIds).toHaveBeenCalledWith(siteIds);
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'sites.siteSubdivisions',
        'siteSubdivisions',
      );
      expect(mockQueryBuilder.innerJoin).toHaveBeenCalledWith(
        'siteSubdivisions.subdivision',
        'subdivision',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.who_deleted IS NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Brackets),
      );
      expect(mockQueryBuilder.skip).toHaveBeenCalledWith(expect.any(Number));
      expect(mockQueryBuilder.take).toHaveBeenCalledWith(expect.any(Number));
      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
    });

    it('should not add joins if pid is not provided', async () => {
      const mockQueryBuilder = {
        whereInIds: jest.fn().mockReturnThis(),
        innerJoin: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn().mockResolvedValue([[], 0]), // Mock empty results and count
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder as any);

      const searchParam = '123';
      await siteService.searchSites({}, searchParam, 1, 1, null, null, {});

      expect(mockQueryBuilder.innerJoin).not.toHaveBeenCalled(); // No joins without pid
    });
  });

  describe('findSiteBySiteId', () => {
    const relations = [
      'siteAssocs',
      'siteAssocs.siteIdAssociatedWith2',
      'bcerCode2',
    ];

    it('unauthenticated user without snapshot loads non-pending site by id and public srAction only', async () => {
      const siteId = '999';
      (siteRepository.findOne as jest.Mock).mockResolvedValue({
        id: siteId,
        srAction: SRApprovalStatusEnum.PUBLIC,
      });

      await siteService.findSiteBySiteId(siteId, false, null);

      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: siteId, srAction: SRApprovalStatusEnum.PUBLIC },
        relations,
      });
    });

    it('non-IDIR user without snapshot loads non-pending site by id and public srAction only', async () => {
      const siteId = '888';
      // First call is the deletion-check (select id + whoDeleted); second is the actual site lookup
      (siteRepository.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: siteId, whoDeleted: null })
        .mockResolvedValueOnce(null);

      await siteService.findSiteBySiteId(siteId, false, {
        sub: 'user-1',
        identity_provider: 'bceid',
      });

      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: siteId, srAction: SRApprovalStatusEnum.PUBLIC },
        relations,
      });
    });

    it('IDIR user without snapshot loads non-pending site by id without srAction filter', async () => {
      const siteId = '777';
      (siteRepository.findOne as jest.Mock).mockResolvedValue({
        id: siteId,
        srAction: SRApprovalStatusEnum.PRIVATE,
      });

      await siteService.findSiteBySiteId(siteId, false, {
        sub: 'idir-user',
        identity_provider: 'idir',
      });

      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: siteId },
        relations,
      });
    });

    it('non-IDIR user cannot load pending site details (pending flag is ignored)', async () => {
      const siteId = '8002';
      // First call is the deletion-check; second is the actual site lookup
      (siteRepository.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: siteId, whoDeleted: null })
        .mockResolvedValueOnce(null);

      await siteService.findSiteBySiteId(siteId, true, {
        sub: 'external-user',
        identity_provider: 'bceid',
      });

      expect(siteRepository.findOne).toHaveBeenCalledWith({
        where: { id: siteId, srAction: SRApprovalStatusEnum.PUBLIC },
        relations,
      });
    });
  });

  describe('updateSiteRegistryRecord', () => {
    beforeEach(() => {
      entityManager.save = jest.fn();
    });

    let userInfo: any = { givenName: 'test' };

    it('should throw an error if siteId is missing', async () => {
      await expect(
        siteService.updateSiteRegistryLastApprovedDate(
          entityManager,
          '',
          userInfo,
        ),
      ).rejects.toThrow(
        new HttpException(
          'Failed to update site registry last approved date as Site Id is missing.',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should update lastApprovalDate if site record exists', async () => {
      await siteService.updateSiteRegistryLastApprovedDate(
        entityManager,
        '123',
        userInfo,
      );

      expect(entityManager.findOne).toHaveBeenCalledWith(SiteRegistry, {
        where: { siteId: '123' },
      });
      expect(entityManager.save).toHaveBeenCalled();
    });

    it('should not update anything if no site record is found', async () => {
      await siteService.updateSiteRegistryLastApprovedDate(
        entityManager,
        '1234',
        userInfo,
      );

      expect(entityManager.findOne).toHaveBeenCalled();
      expect(entityManager.save).not.toHaveBeenCalled();
    });

    it('should log and rethrow errors', async () => {
      (entityManager.findOne as jest.Mock).mockRejectedValue(
        new Error('DB error'),
      );

      await expect(
        siteService.updateSiteRegistryLastApprovedDate(
          entityManager,
          '123',
          userInfo,
        ),
      ).rejects.toThrow('DB error');

      expect(loggerService.log).toHaveBeenCalledWith(
        'SiteService.updateSiteRegistryLastApprovedDate() error',
      );
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
              eventDate: new Date(),
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
              srValue: true,
              whenCreated: new Date(),
              whenUpdated: new Date(),
              whenDeleted: null,
              whenRestored: null,
              notationParticipant: [
                {
                  apiAction: UserActionEnum.ADDED,
                  eventParticId: 'xxx-xxx',
                  eventId: '1',
                  eprCode: 'RVB',
                  psnorgId: '1',
                  displayName: 'SAGER, J.',
                  srAction: 'false',
                  userAction: 'pending',
                  srValue: true,
                  whenCreated: new Date(),
                  whenUpdated: new Date(),
                },
              ],
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
          entityManager,
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

      it('returns empty result when query returns no data', async () => {
        jest.spyOn(siteRepository.manager, 'query').mockResolvedValue([]);

        const result = await siteService.getSiteDetailsPendingSRApproval(
          null,
          1,
          5,
        );

        expect(result.totalRecords).toBe(0);
        expect(result.data).toEqual([]);
      });

      it('filters by site id when searchParam.id is provided', async () => {
        const data = [
          {
            site_id: '100',
            who_updated: 'User1',
            latest_update: new Date(),
            changes: 'summary',
            addr_line_1: 'Addr1',
            addr_line_2: '',
            addr_line_3: '',
          },
          {
            site_id: '200',
            who_updated: 'User2',
            latest_update: new Date(),
            changes: 'notation',
            addr_line_1: 'Addr2',
            addr_line_2: '',
            addr_line_3: '',
          },
        ];
        jest.spyOn(siteRepository.manager, 'query').mockResolvedValue(data);

        const result = await siteService.getSiteDetailsPendingSRApproval(
          { id: '100' },
          1,
          10,
        );

        expect(result.totalRecords).toBe(1);
        expect(result.data[0].siteId).toBe('100');
      });

      it('filters by address when searchParam.addrLine is provided', async () => {
        const data = [
          {
            site_id: '1',
            who_updated: 'User1',
            latest_update: new Date(),
            changes: 'summary',
            addr_line_1: '123 Main St',
            addr_line_2: '',
            addr_line_3: '',
          },
          {
            site_id: '2',
            who_updated: 'User2',
            latest_update: new Date(),
            changes: 'notation',
            addr_line_1: '456 Oak Ave',
            addr_line_2: '',
            addr_line_3: '',
          },
        ];
        jest.spyOn(siteRepository.manager, 'query').mockResolvedValue(data);

        const result = await siteService.getSiteDetailsPendingSRApproval(
          { addrLine: 'Main' },
          1,
          10,
        );

        expect(result.totalRecords).toBe(1);
        expect(result.data[0].address).toContain('Main');
      });

      it('handles null address fields', async () => {
        const data = [
          {
            site_id: '1',
            who_updated: 'User',
            latest_update: new Date(),
            changes: 'summary',
            addr_line_1: '123 Main',
            addr_line_2: null,
            addr_line_3: null,
          },
        ];
        jest.spyOn(siteRepository.manager, 'query').mockResolvedValue(data);

        const result = await siteService.getSiteDetailsPendingSRApproval(
          null,
          1,
          10,
        );

        expect(result.data[0].address).toBe('123 Main');
      });
    });

    describe('Bulk Update For SR', () => {
      it('Bulk Approve/Reject ', async () => {
        const inputDTO: BulkApproveRejectChangesDTO = {
          isApproved: true,
          fromSiteDetails: false,
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
          false,
          userInfo,
        );

        expect(result).toBeTruthy();
      });

      it('should approve site disclosure and schedule2 refs in bulk', async () => {
        const site = {
          id: '1',
          siteId: '2',
          whoUpdated: 'jane',
          whenUpdated: new Date(),
          changes: 'site disclosure',
          address: '123 Main St',
        };
        const userInfo = { givenName: 'jane' };

        const mockProfiles = [
          { id: 'p1', siteId: '2', srAction: 'pending', userAction: '' },
        ];
        const mockLandUses = [
          { siteId: '2', lutCode: 'RES', srAction: 'pending', userAction: '' },
        ];

        (entityManager.find as jest.Mock).mockImplementation((entity) => {
          if (entity.name === 'SiteProfiles') return mockProfiles;
          if (entity.name === 'SiteProfileLandUses') return mockLandUses;
          return [];
        });

        const result = await siteService.processSRBulkUpdates(
          entityManager,
          site,
          true,
          true,
          userInfo,
        );

        expect(result).toBeTruthy();
        expect(entityManager.save).toHaveBeenCalled();
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
          siteProfileSchedule2Refs: [],
        },
      ];
      const userInfo = { givenName: 'Test User' };

      const mockSave = jest.fn(async (_entity, siteProfile) => ({
        ...siteProfile,
        id: siteProfile.id || '123',
      }));
      const mockCreate = jest.fn((_entity, data) => ({
        ...data,
        id: '123',
      }));

      // Injecting mocks into the shared `entityManager` object
      (entityManager.save as jest.Mock) = mockSave;
      (entityManager.create as jest.Mock) = mockCreate;

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
        '456',
      );

      expect(mockSave).toHaveBeenCalled();

      const savedInput = mockSave.mock.calls[0][1];
      expect(savedInput.siteId).toBe('456');
      expect(savedInput.whoCreated).toBe('Test User');
      expect(savedInput.whenCreated).toBeInstanceOf(Date);
      expect(savedInput.whenUpdated).toBeInstanceOf(Date);
      expect(savedInput.userAction).toBe(UserActionEnum.ADDED);
      expect(savedInput.dateCompleted).toBeInstanceOf(Date);
    });

    it('should update an existing site profile when action is UPDATED', async () => {
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '123',
          siteId: '456',
          dateCompleted: new Date(),
          siteProfileSchedule2Refs: [],
        },
      ];
      const userInfo = { givenName: 'Updated User' };
      const id = '123';
      const existingSiteProfile = { id };

      siteProfilesRepo.findOne = jest
        .fn()
        .mockResolvedValue(existingSiteProfile);
      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
        '456',
      );
      expect(entityManager.save).toHaveBeenCalled();
      const updatedProfile = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(updatedProfile.dateCompleted).toBeInstanceOf(Date);
      expect(updatedProfile.whenUpdated).toBeInstanceOf(Date);
      expect(updatedProfile.siteId).toBe('456');
      expect(updatedProfile.whoUpdated).toBe('Updated User');
    });

    it('should only update srAction and userAction for SR approval (public)', async () => {
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '123',
          siteId: '456',
          dateCompleted: new Date('2024-06-01'),
          srAction: SRApprovalStatusEnum.PUBLIC,
          siteProfileSchedule2Refs: [],
        },
      ];
      const userInfo = { givenName: 'SR User' };
      const existingSiteProfile = {
        id: '123',
        siteId: '456',
        dateCompleted: new Date('2024-01-01'),
        srAction: SRApprovalStatusEnum.PENDING,
        userAction: UserActionEnum.ADDED,
        siteProfileLandUses: [],
      };

      siteProfilesRepo.findOne = jest
        .fn()
        .mockResolvedValue(existingSiteProfile);

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
        '456',
      );

      expect(entityManager.save).toHaveBeenCalled();
      const savedProfile = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(savedProfile.srAction).toBe(SRApprovalStatusEnum.PUBLIC);
      expect(savedProfile.userAction).toBe(UserActionEnum.DEFAULT);
      expect(savedProfile.dateCompleted).toEqual(new Date('2024-01-01'));
      expect(savedProfile.whoUpdated).toBe('SR User');
    });

    it('should only update srAction and userAction for SR rejection (private)', async () => {
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: '123',
          siteId: '456',
          dateCompleted: new Date('2024-06-01'),
          srAction: SRApprovalStatusEnum.PRIVATE,
          siteProfileSchedule2Refs: [],
        },
      ];
      const userInfo = { givenName: 'SR User' };
      const existingSiteProfile = {
        id: '123',
        siteId: '456',
        dateCompleted: new Date('2024-01-01'),
        srAction: SRApprovalStatusEnum.PENDING,
        userAction: UserActionEnum.ADDED,
        siteProfileLandUses: [],
      };

      siteProfilesRepo.findOne = jest
        .fn()
        .mockResolvedValue(existingSiteProfile);

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
        '456',
      );

      expect(entityManager.save).toHaveBeenCalled();
      const savedProfile = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(savedProfile.srAction).toBe(SRApprovalStatusEnum.PRIVATE);
      expect(savedProfile.userAction).toBe(UserActionEnum.DEFAULT);
      expect(savedProfile.dateCompleted).toEqual(new Date('2024-01-01'));
    });
  });

  describe('processProfileLandUses (via processSiteDisclosure)', () => {
    it('should add a new land use when action is ADDED and lutCode does not exist', async () => {
      const profileDate = new Date('2020-01-01');
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.ADDED,
          id: null,
          siteId: '456',
          dateCompleted: profileDate,
          // service reads schedule2ReferenceCode and maps it to lutCode
          siteProfileSchedule2Refs: [
            { apiAction: UserActionEnum.ADDED, schedule2ReferenceCode: 'AG' },
          ],
        },
      ];
      const userInfo = { givenName: 'Test User' };

      const savedProfile = {
        id: 'profile-uuid',
        siteId: '456',
        dateCompleted: profileDate,
      };
      const mockCreate = jest.fn((_entity, data) => ({ ...data }));
      const mockSave = jest.fn(async (_entity, data) => {
        if (_entity === SiteProfiles) return savedProfile;
        return data;
      });
      const mockFind = jest.fn().mockResolvedValue([]); // no existing land uses

      (entityManager.create as jest.Mock) = mockCreate;
      (entityManager.save as jest.Mock) = mockSave;
      (entityManager.find as jest.Mock) = mockFind;

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
        '456',
      );

      // First save = profile, second save = land uses
      expect(mockSave).toHaveBeenCalledTimes(2);
      const landUseSaveCall = mockSave.mock.calls[1];
      expect(landUseSaveCall[0]).toBe(SiteProfileLandUses);
      const savedLandUses = landUseSaveCall[1];
      expect(savedLandUses[0].lutCode).toBe('AG');
      expect(savedLandUses[0].whoCreated).toBe('Test User');
      expect(savedLandUses[0].whenCreated).toBeInstanceOf(Date);
    });

    it('should delete a land use when action is DELETED and schedule2ReferenceCode exists', async () => {
      const profileDate = new Date('2020-01-01');
      // existingLandUse is keyed by lutCode in the currentMap
      const existingLandUse = {
        siteId: '456',
        sprofDateCompleted: profileDate,
        lutCode: 'AG',
      };
      const siteDisclosure = [
        {
          apiAction: UserActionEnum.UPDATED,
          id: 'profile-uuid',
          siteId: '456',
          dateCompleted: profileDate,
          siteProfileSchedule2Refs: [
            {
              apiAction: UserActionEnum.DELETED,
              // service reads schedule2ReferenceCode for DELETED case
              schedule2ReferenceCode: 'AG',
            },
          ],
        },
      ];
      const userInfo = { givenName: 'Test User' };

      const existingProfile = {
        id: 'profile-uuid',
        siteId: '456',
        dateCompleted: profileDate,
      };

      siteProfilesRepo.findOne = jest.fn().mockResolvedValue(existingProfile);

      // save must return the profile so siteProfile.id is set and processSchedule2Refs runs
      (entityManager.save as jest.Mock) = jest
        .fn()
        .mockResolvedValue(existingProfile);

      const mockFind = jest.fn().mockResolvedValue([existingLandUse]);
      const mockRemove = jest.fn().mockResolvedValue([]);
      (entityManager.find as jest.Mock) = mockFind;
      (entityManager.remove as jest.Mock) = mockRemove;

      await siteService.processSiteDisclosure(
        siteDisclosure,
        userInfo,
        entityManager,
        '456',
      );

      expect(mockRemove).toHaveBeenCalledWith(SiteProfileLandUses, [
        existingLandUse,
      ]);
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
        '123',
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
        '123',
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
        '1',
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

      await siteService.processDocuments(
        documents,
        userInfo,
        entityManager,
        '1',
      );

      expect(entityManager.save).toHaveBeenCalledTimes(2); // For SiteDocs and SiteDocPartics
      const savedDocuments = (entityManager.save as jest.Mock).mock.calls[0][1];
      expect(savedDocuments[0].whenCreated).toBeInstanceOf(Date);
      expect(savedDocuments[0].whoCreated).toBe('Test User');
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

      await siteService.processDocuments(
        documents,
        userInfo,
        entityManager,
        '1',
      );

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
          docParticId: '1',
          displayName: 'Updated Document',
          apiAction: UserActionEnum.DELETED,
        },
      ];
      const userInfo = { givenName: 'Tester' };

      await siteService.processDocuments(
        documents,
        userInfo,
        entityManager,
        '1',
      );

      expect(entityManager.update).toHaveBeenCalledTimes(2); // For SiteDocs and SiteDocPartics
      expect(entityManager.update).toHaveBeenCalledWith(
        SiteDocs,
        { id: '1' },
        expect.any(Object),
      );
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
        '1',
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
        '1',
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
        '1',
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
        '1',
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
          completionDate: new Date('2004-06-16T07:00:00.000Z'),
          requirementDueDate: new Date('1970-01-01T00:00:00.000Z'),
          requirementReceivedDate: new Date('1970-01-01T00:00:00.000Z'),
          requiredAction: null,
          note: null,
          etypCode: 'CMI',
          eclsCode: 'ADM',
          srAction: 'false',
          userAction: UserActionEnum.ADDED,
          whenCreated: new Date(),
          whenUpdated: new Date(),
          whenDeleted: null,
          whenRestored: null,
          notationParticipant: [
            {
              apiAction: UserActionEnum.ADDED,
              eventParticId: 'xxx-xxx',
              eventId: '1',
              eprCode: 'RVB',
              psnorgId: '1',
              displayName: 'SAGER, J.',
              srAction: 'false',
              userAction: UserActionEnum.ADDED,
              whenCreated: new Date(),
              whenUpdated: new Date(),
              whenDeleted: null,
              whenRestored: null,
            },
          ],
        },
      ];
      const userInfo = { givenName: 'Test User' };

      await siteService.processEvents(events, userInfo, entityManager, '1');
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
          whenCreated: new Date(),
          whenUpdated: new Date(),
          whenDeleted: null,
          whenRestored: null,
          notationParticipant: [
            {
              apiAction: UserActionEnum.ADDED,
              eventParticId: 'xxx-xxx',
              eventId: '1',
              eprCode: 'RVB',
              psnorgId: '1',
              displayName: 'SAGER, J.',
              srAction: 'false',
              userAction: UserActionEnum.ADDED,
              whenCreated: new Date(),
              whenUpdated: new Date(),
              whenDeleted: null,
              whenRestored: null,
            },
          ],
        },
      ];
      const userInfo = { givenName: 'Updated User' };

      await siteService.processEvents(events, userInfo, entityManager, '1');
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
          whenCreated: new Date(),
          whenUpdated: new Date(),
          whenDeleted: null,
          whenRestored: null,
          notationParticipant: [
            {
              apiAction: UserActionEnum.DELETED,
              eventParticId: 'xxx-xxx',
              whenCreated: new Date(),
              whenUpdated: new Date(),
              whenDeleted: null,
              whenRestored: null,
            },
          ],
        },
      ];
      const userInfo = { givenName: 'Deleter User' };

      await siteService.processEvents(events, userInfo, entityManager, '1');

      expect(entityManager.delete).toHaveBeenCalledWith(EventPartics, {
        id: 'xxx-xxx',
      });
    });

    it('should soft delete notation when action is DELETED', async () => {
      const existingEvent = {
        id: '1',
        siteId: '1',
        note: 'existing notation',
        whoDeleted: null,
        whenDeleted: null,
        whoRestored: null,
        whenRestored: null,
      };
      jest
        .spyOn(eventsRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(existingEvent as any);

      const events = [
        {
          apiAction: UserActionEnum.DELETED,
          id: '1',
          notationParticipant: [
            {
              apiAction: UserActionEnum.ADDED,
              eventParticId: 'ep-1',
              eventId: '1',
              eprCode: 'RVB',
              psnorgId: '1',
              displayName: 'Participant',
              srAction: SRApprovalStatusEnum.PENDING,
            },
          ],
        },
      ];

      await siteService.processEvents(
        events,
        { givenName: 'Deleter User' },
        entityManager,
        '1',
      );

      // Verify that update was called once for the event
      expect(entityManager.update).toHaveBeenCalledWith(
        Events,
        { id: '1' },
        expect.objectContaining({
          id: '1',
          siteId: '1',
          note: 'existing notation',
          whoDeleted: 'Deleter User',
          whoRestored: null,
          whenRestored: null,
        }),
      );

      // Validate the complete updatedEvents array content via the update call
      const updateCall = (entityManager.update as jest.Mock).mock.calls.find(
        (call) => call[0] === Events && call[1]?.id === '1',
      );
      expect(updateCall).toBeDefined();
      expect(updateCall[1]).toEqual({ id: '1' });

      const deletedEvent = updateCall[2];
      expect(deletedEvent).toBeDefined();
      expect(deletedEvent.id).toBe('1');
      expect(deletedEvent.siteId).toBe('1');
      expect(deletedEvent.note).toBe('existing notation');
      expect(deletedEvent.whoDeleted).toBe('Deleter User');
      expect(deletedEvent.whenDeleted).toBeInstanceOf(Date);
      expect(deletedEvent.whoRestored).toBeNull();
      expect(deletedEvent.whenRestored).toBeNull();
    });

    it('should restore notation when action is RESTORED', async () => {
      const existingEvent = {
        id: '1',
        siteId: '1',
        note: 'deleted notation',
        whoDeleted: 'Old User',
        whenDeleted: new Date('2024-01-01T00:00:00.000Z'),
        whoRestored: null,
        whenRestored: null,
      };
      jest
        .spyOn(eventsRepository, 'findOneByOrFail')
        .mockResolvedValueOnce(existingEvent as any);

      const events = [
        {
          apiAction: UserActionEnum.RESTORED,
          id: '1',
          notationParticipant: [
            {
              apiAction: UserActionEnum.ADDED,
              eventParticId: 'ep-2',
              eventId: '1',
              eprCode: 'RVB',
              psnorgId: '1',
              displayName: 'Participant',
              srAction: SRApprovalStatusEnum.PENDING,
            },
          ],
        },
      ];

      await siteService.processEvents(
        events,
        { givenName: 'Restorer User' },
        entityManager,
        '1',
      );

      // Verify that update was called once for the event
      expect(entityManager.update).toHaveBeenCalledWith(
        Events,
        { id: '1' },
        expect.objectContaining({
          id: '1',
          siteId: '1',
          note: 'deleted notation',
          whoRestored: 'Restorer User',
          whoDeleted: null,
          whenDeleted: null,
        }),
      );

      // Validate the complete updatedEvents array content via the update call
      const updateCall = (entityManager.update as jest.Mock).mock.calls.find(
        (call) => call[0] === Events && call[1]?.id === '1',
      );
      expect(updateCall).toBeDefined();
      expect(updateCall[1]).toEqual({ id: '1' });

      const restoredEvent = updateCall[2];
      expect(restoredEvent).toBeDefined();
      expect(restoredEvent.id).toBe('1');
      expect(restoredEvent.siteId).toBe('1');
      expect(restoredEvent.note).toBe('deleted notation');
      expect(restoredEvent.whoRestored).toBe('Restorer User');
      expect(restoredEvent.whenRestored).toBeInstanceOf(Date);
      expect(restoredEvent.whoDeleted).toBeNull();
      expect(restoredEvent.whenDeleted).toBeNull();
    });
  });

  describe('mapSearch', () => {
    it('should fetch all sites if no search term is passed for IDIR users', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      siteService.mapSearch({ userInfo: { identity_provider: 'idir' } });

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'sites.who_deleted IS NULL',
      );
      expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
    });

    it('should apply public-only visibility filter for non-IDIR users', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      siteService.mapSearch({ userInfo: { identity_provider: 'bceid' } });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.srAction = :srAction',
        { srAction: 'public' },
      );
    });

    it('should apply public-only visibility filter when userInfo is missing (unauthenticated)', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      siteService.mapSearch({});

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'sites.who_deleted IS NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.srAction = :srAction',
        { srAction: 'public' },
      );
    });

    it('should filter sites by trimmed lower-cased search term if provided', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      // Padding spaces are intentional here, do not remove
      siteService.mapSearch({
        searchTerm: '   TeSt   ',
        userInfo: { identity_provider: 'idir' },
      });

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalled();
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'sites.who_deleted IS NULL',
      );
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.any(Brackets),
      );
    });

    it('should throw an input error when polygon array contains less than three vertices', () => {
      expect(async () =>
        siteService.mapSearch({ polygon: [[0, 0]] }),
      ).rejects.toThrow(HttpException);
    });

    it('should format array of LatLong tuples for the DB query and enclose the polygon if start and end point do not match', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      siteService.mapSearch({
        polygon: [
          [1, 2],
          [10, 20],
          [100, 200],
        ],
        userInfo: { identity_provider: 'idir' },
      });
      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining('POLYGON((2 1, 20 10, 200 100, 2 1))'),
      );
    });

    it('should throw an error if the circle has latitude with value null', () => {
      const circle: RadiusSearchParams = {
        center: [null, -123.1207],
        radius: 1000,
      };

      expect(async () => siteService.mapSearch({ circle })).rejects.toThrow(
        new HttpException(
          'Latitude and longitude cannot be null or undefined',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if circle has longitude with value null', () => {
      const circle: RadiusSearchParams = {
        center: [50, null],
        radius: 1000,
      };

      expect(async () => siteService.mapSearch({ circle })).rejects.toThrow(
        new HttpException(
          'Latitude and longitude cannot be null or undefined',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if circle has undefined latitude', () => {
      const circle: RadiusSearchParams = {
        center: [undefined, -123.1207],
        radius: 1000,
      };

      expect(async () => siteService.mapSearch({ circle })).rejects.toThrow(
        new HttpException(
          'Latitude and longitude cannot be null or undefined',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if circle has undefined longitude', () => {
      const circle: RadiusSearchParams = {
        center: [50, undefined],
        radius: 1000,
      };

      expect(async () => siteService.mapSearch({ circle })).rejects.toThrow(
        new HttpException(
          'Latitude and longitude cannot be null or undefined',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if circle has radius less than 500m', () => {
      const circle: RadiusSearchParams = {
        center: [120, -123.1207],
        radius: 200,
      };

      expect(async () => siteService.mapSearch({ circle })).rejects.toThrow(
        new HttpException(
          'Circle radius must be at least 500 meters',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should throw an error if circle has radius more than 500km', () => {
      const circle: RadiusSearchParams = {
        center: [120, -123.1207],
        radius: 600000,
      };

      expect(async () => siteService.mapSearch({ circle })).rejects.toThrow(
        new HttpException(
          'Circle radius cannot exceed 500 km',
          HttpStatus.BAD_REQUEST,
        ),
      );
    });

    it('should call ST_MakePoint with correct longitude and latitude', () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      const circle: RadiusSearchParams = {
        center: [49.2827, -123.1207],
        radius: 1000,
      };

      siteService.mapSearch({
        circle,
        userInfo: { identity_provider: 'idir' },
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        expect.stringContaining(`ST_MakePoint(-123.1207, 49.2827)`),
      );
    });
  });

  describe('findSitesAndPlaces', () => {
    it('should apply search term and limit if provided', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        limit: jest.fn().mockImplementation(() => mockQueryBuilder),
        orderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        addOrderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      jest
        .spyOn(placesRepo, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      await siteService.findSitesAndPlaces('test', 20, {
        identity_provider: 'idir',
      });

      expect(mockQueryBuilder.getManyAndCount).toHaveBeenCalledTimes(2);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(expect.anything(), {
        searchTerm: '%test%',
      });
      expect(mockQueryBuilder.limit).toHaveBeenCalledWith(20);
    });

    it('should apply public-only visibility filter for non-IDIR users (sites only)', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        limit: jest.fn().mockImplementation(() => mockQueryBuilder),
        orderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        addOrderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      jest
        .spyOn(placesRepo, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      await siteService.findSitesAndPlaces('test', 20, {
        identity_provider: 'bceid',
      });

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.srAction = :srAction',
        { srAction: 'public' },
      );
    });

    it('should apply public-only visibility filter when userInfo is missing (unauthenticated) (sites only)', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        limit: jest.fn().mockImplementation(() => mockQueryBuilder),
        orderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        addOrderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      jest
        .spyOn(placesRepo, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      await siteService.findSitesAndPlaces('test', 20);

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.srAction = :srAction',
        { srAction: 'public' },
      );
    });

    it('should bypass DB calls if no search term provided', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockImplementation(() => mockQueryBuilder),
        andWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        orWhere: jest.fn().mockImplementation(() => mockQueryBuilder),
        limit: jest.fn().mockImplementation(() => mockQueryBuilder),
        orderBy: jest.fn().mockImplementation(() => mockQueryBuilder),
        getManyAndCount: jest.fn().mockReturnValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      jest
        .spyOn(placesRepo, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      expect(await siteService.findSitesAndPlaces()).toMatchObject({
        sites: [],
        places: [],
      });

      expect(mockQueryBuilder.getManyAndCount).not.toHaveBeenCalled();
    });
  });

  describe('soft delete coverage', () => {
    it('deleteSite should soft delete site, remove recent views, and write history log audit fields', async () => {
      const siteId = '1001';
      const userId = 'very-long-user-id-value-that-will-be-trimmed-for-audit';

      const transactionalEntityManager: any = {
        findOne: jest.fn().mockResolvedValue({
          id: siteId,
          whoDeleted: null,
          commonName: 'Test Site',
          addrLine_1: '123 Main St',
        }),
        update: jest.fn().mockResolvedValue(undefined),
        delete: jest.fn().mockResolvedValue(undefined),
        save: jest.fn().mockResolvedValue(undefined),
      };

      (entityManager.transaction as jest.Mock).mockImplementation(
        async (callback) => callback(transactionalEntityManager),
      );
      (historyLogRepository as any).create = jest.fn((payload) => payload);

      const message = await siteService.deleteSite(siteId, userId);

      expect(transactionalEntityManager.update).toHaveBeenCalledWith(
        Sites,
        { id: siteId },
        expect.objectContaining({
          whoDeleted: userId.slice(0, 30),
          whenDeleted: expect.any(Date),
        }),
      );
      expect(transactionalEntityManager.delete).toHaveBeenCalledWith(
        RecentViews,
        { siteId },
      );
      expect(historyLogRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          userId,
          siteId,
          whoCreated: userId.slice(0, 30),
          whoUpdated: userId.slice(0, 30),
          whenCreated: expect.any(Date),
          whenUpdated: expect.any(Date),
        }),
      );
      expect(message).toContain(`Site ${siteId}`);
    });

    it('findSiteBySiteId should return null data for deleted sites', async () => {
      const findOneMock = jest.spyOn(siteRepository, 'findOne');
      findOneMock.mockResolvedValueOnce({
        id: '2002',
        whoDeleted: 'tester',
      } as any);

      (snapShotService as any).getMostRecentSnapshot = jest.fn();

      const result = await siteService.findSiteBySiteId('2002', false, {
        sub: 'user-1',
        identity_provider: 'bceid',
      });

      expect(result.data).toBeNull();
      expect(
        (snapShotService as any).getMostRecentSnapshot,
      ).not.toHaveBeenCalled();
    });

    it('findSiteBySiteId should return null data for missing sites', async () => {
      jest.spyOn(siteRepository, 'findOne').mockResolvedValueOnce(null as any);

      const result = await siteService.findSiteBySiteId('999999', false, null);

      expect(result.data).toBeNull();
    });

    it('searchSiteIds should exclude soft-deleted sites', async () => {
      const mockQueryBuilder: any = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };

      jest
        .spyOn(siteRepository, 'createQueryBuilder')
        .mockImplementation(() => mockQueryBuilder);

      await siteService.searchSiteIds('12');

      expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
        'sites.who_deleted IS NULL',
      );
    });
  });

  describe('getSiteInsights', () => {
    const mockQueryResult = [
      {
        event_count: '5',
        site_doc_count: '3',
        event_partic_count: '10',
        site_participants: '4',
        land_history_count: '2',
        site_assoc_count: '1',
        site_subdiv_count: '0',
      },
    ];

    it('should return site insights with counts', async () => {
      jest.spyOn(siteRepository, 'query').mockResolvedValue(mockQueryResult);

      const result = await siteService.getSiteInsights('123');

      expect(result.eventCount).toBe(5);
      expect(result.siteDocCount).toBe(3);
      expect(result.eventParticCount).toBe(10);
      expect(result.landHistoryCount).toBe(2);
      expect(result.siteAssocCount).toBe(1);
      expect(result.siteSubdivCount).toBe(0);
    });

    it('should include sr_action filter for non-pending (public) view', async () => {
      jest.spyOn(siteRepository, 'query').mockResolvedValue(mockQueryResult);

      await siteService.getSiteInsights('123', false);

      expect(siteRepository.query).toHaveBeenCalledWith(
        expect.stringContaining("sr_action != 'pending'"),
        ['123'],
      );
    });

    it('should not include sr_action filter for pending view (returns all)', async () => {
      jest.spyOn(siteRepository, 'query').mockResolvedValue(mockQueryResult);

      await siteService.getSiteInsights('123', true);

      expect(siteRepository.query).toHaveBeenCalledWith(
        expect.not.stringContaining('sr_action'),
        ['123'],
      );
    });

    it('should return null when query returns empty result', async () => {
      jest.spyOn(siteRepository, 'query').mockResolvedValue([]);

      const result = await siteService.getSiteInsights('999');

      expect(result).toBeNull();
    });
  });

  describe('sortPendingResults', () => {
    const mockData = [
      {
        siteId: '3',
        whoUpdated: 'Charlie',
        whenUpdated: '2026-03-19',
        address: '789 Oak St',
      },
      {
        siteId: '1',
        whoUpdated: 'Alice',
        whenUpdated: '2025-07-28',
        address: '123 Main St',
      },
      {
        siteId: '2',
        whoUpdated: 'Bob',
        whenUpdated: '2026-03-11',
        address: '456 Elm St',
      },
    ];

    it('should sort by siteId ascending by default', () => {
      const result = sortSRReviewTableResults(mockData);
      expect(result.map((r) => r.siteId)).toEqual(['1', '2', '3']);
    });

    it('should sort by siteId descending', () => {
      const result = sortSRReviewTableResults(
        mockData,
        SiteSortBy.ID,
        SortByDirection.DESC,
      );
      expect(result.map((r) => r.siteId)).toEqual(['3', '2', '1']);
    });

    it('should sort by whenUpdated ascending (date comparison)', () => {
      const result = sortSRReviewTableResults(
        mockData,
        SiteSortBy.WHEN_UPDATED,
        SortByDirection.ASC,
      );
      expect(result.map((r) => r.whenUpdated)).toEqual([
        '2025-07-28',
        '2026-03-11',
        '2026-03-19',
      ]);
    });

    it('should sort by whenUpdated descending (date comparison)', () => {
      const result = sortSRReviewTableResults(
        mockData,
        SiteSortBy.WHEN_UPDATED,
        SortByDirection.DESC,
      );
      expect(result.map((r) => r.whenUpdated)).toEqual([
        '2026-03-19',
        '2026-03-11',
        '2025-07-28',
      ]);
    });

    it('should sort by whoUpdated ascending', () => {
      const result = sortSRReviewTableResults(
        mockData,
        SiteSortBy.WHO_CREATED,
        SortByDirection.ASC,
      );
      expect(result.map((r) => r.whoUpdated)).toEqual([
        'Alice',
        'Bob',
        'Charlie',
      ]);
    });

    it('should sort by address descending', () => {
      const result = sortSRReviewTableResults(
        mockData,
        SiteSortBy.SITE_ADDRESS,
        SortByDirection.DESC,
      );
      expect(result.map((r) => r.address)).toEqual([
        '789 Oak St',
        '456 Elm St',
        '123 Main St',
      ]);
    });

    it('should not mutate the original array', () => {
      const original = [...mockData];
      sortSRReviewTableResults(mockData, SiteSortBy.ID, SortByDirection.DESC);
      expect(mockData).toEqual(original);
    });

    it('should handle null/undefined values gracefully', () => {
      const dataWithNulls = [
        {
          siteId: '2',
          whoUpdated: 'Bob',
          whenUpdated: null,
          address: '456 Elm St',
        },
        {
          siteId: '1',
          whoUpdated: 'Alice',
          whenUpdated: '2026-03-11',
          address: '123 Main St',
        },
      ];
      const result = sortSRReviewTableResults(
        dataWithNulls,
        SiteSortBy.WHEN_UPDATED,
        SortByDirection.ASC,
      );
      expect(result).toHaveLength(2);
    });

    it('should return empty array when given empty input', () => {
      const result = sortSRReviewTableResults([]);
      expect(result).toEqual([]);
    });
  });

  describe('processSRBulkUpdates - site whenUpdated/whoUpdated', () => {
    it('should update site whenUpdated and whoUpdated on every bulk update', async () => {
      const site = {
        id: '1',
        siteId: '10',
        whoUpdated: 'tester',
        whenUpdated: new Date(),
        changes: 'notation',
        address: '1 Main St',
      };
      const userInfo = { givenName: 'SRUser', sub: 'sr-1' };

      (entityManager.find as jest.Mock).mockResolvedValue([]);
      (entityManager.save as jest.Mock).mockResolvedValue(true);
      (entityManager.update as jest.Mock).mockResolvedValue(undefined);

      await siteService.processSRBulkUpdates(
        entityManager,
        site,
        true,
        false,
        userInfo,
      );

      expect(entityManager.update).toHaveBeenCalledWith(
        Sites,
        { id: '10' },
        expect.objectContaining({
          whenUpdated: expect.any(Date),
          whoUpdated: 'SRUser',
        }),
      );
    });
  });

  describe('commitSiteDetails - hasSrApprovalOrRejection site update', () => {
    beforeEach(() => {
      entityManager.save = jest.fn().mockResolvedValue(true);
      entityManager.update = jest.fn().mockResolvedValue(undefined);
      entityManager.findOneOrFail = jest.fn().mockResolvedValue({
        id: '1',
        srAction: SRApprovalStatusEnum.PENDING,
      });
    });

    it('should update site whenUpdated when SR approves events (no summary)', async () => {
      const userInfo = { sub: 'sr-user', givenName: 'SRApprover' };
      const inputDTO: SaveSiteDetailsDTO = {
        siteId: '1',
        siteParticipants: [
          {
            apiAction: UserActionEnum.UPDATED,
            id: '1',
            prCode: 'POWNR',
            particRoleId: 'role-1',
            srAction: SRApprovalStatusEnum.PUBLIC,
          } as any,
        ],
      };

      await siteService.commitSiteDetails(entityManager, inputDTO, userInfo);

      const updateCalls = (entityManager.update as jest.Mock).mock.calls;
      const siteUpdateCall = updateCalls.find(
        (call) =>
          call[0] === Sites &&
          call[1]?.id === '1' &&
          call[2]?.whenUpdated &&
          call[2]?.whoUpdated === 'SRApprover' &&
          !call[2]?.userAction,
      );
      expect(siteUpdateCall).toBeDefined();
      expect(siteUpdateCall[2]).toEqual(
        expect.objectContaining({
          whenUpdated: expect.any(Date),
          whoUpdated: 'SRApprover',
        }),
      );
    });
  });
});
