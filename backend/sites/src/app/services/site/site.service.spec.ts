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
          },
        },
        {
          provide: getRepositoryToken(Events),
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
          provide: getRepositoryToken(EventPartics),
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
          provide: getRepositoryToken(SitePartics),
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
          provide: getRepositoryToken(SiteParticRoles),
          useValue: {
            find: jest.fn(() => {
              return [
                { id: 'fff-jjjj-lll', siteId: '123' },
                { id: 'sdsff-jjhh-llkkj', siteId: '123' },
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
          provide: getRepositoryToken(SiteDocs),
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
          provide: getRepositoryToken(SiteDocPartics),
          useValue: {
            find: jest.fn(() => {
              return [
                { id: '123', siteId: '123', psnorgId: '1253' },
                { id: '124', siteId: '123', psnorgId: '1253' },
              ];
            }),
            save: jest.fn(() => {
              return [
                { id: '123', siteId: '123', psnorgId: '1253' },
                { id: '124', siteId: '123', psnorgId: '1253' },
              ];
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
            findOneByOrFail: jest.fn(),
            save: jest.fn(),
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

  describe('saveSiteDetails', () => {
    describe('when there are no errors', () => {
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

        const result = await siteService.saveSiteDetails(inputDTO, userInfo);

        expect(result).toBe(true);
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
