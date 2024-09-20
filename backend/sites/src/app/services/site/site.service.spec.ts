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
import { SaveSiteDetailsDTO } from 'src/app/dto/saveSiteDetails.dto';
import { LandHistoryService } from '../landHistory/landHistory.service';
import { TransactionManagerService } from '../transactionManager/transactionManager.service';

describe('SiteService', () => {
  let siteService: SiteService;
  let siteRepository: Repository<Sites>;
  let eventsRepository: Repository<Events>;
  let eventsParticipantsRepository: Repository<EventPartics>;
  let siteParticipantsRepository: Repository<SitePartics>;
  let siteDocumentsRepo: Repository<SiteDocs>;
  let siteAssociationsRepo: Repository<SiteAssocs>;
  let landHistoriesRepo: Repository<LandHistories>;
  let siteSubDivisionsRepo: Repository<SiteSubdivisions>;
  let siteProfilesRepo: Repository<SiteProfiles>;
  let entityManager: EntityManager;
  let historyLogRepository: Repository<HistoryLog>;

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
          provide: getRepositoryToken(SiteAssocs),
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
          provide: EntityManager,
          useValue: {
            transaction: jest.fn(async () => {
              return await true;
            }),
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

  describe('findSiteBySiteId', () => {
    it('should call findOneOrFail method of the repository with the provided siteId', async () => {
      const siteId = '123';
      await siteService.findSiteBySiteId(siteId);
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

      const result = await siteService.findSiteBySiteId(siteId);

      expect(result).toBeInstanceOf(FetchSiteDetail);
      expect(result.httpStatusCode).toBe(200);
      expect(result.data).toEqual(expectedResult);
    });

    it('should throw an error when findOneOrFail method of the repository rejects', async () => {
      const siteId = '111';
      const error = new Error('Site not found');
      (siteRepository.findOneOrFail as jest.Mock).mockRejectedValue(error);
      await expect(siteService.findSiteBySiteId(siteId)).rejects.toThrowError(
        error,
      );
    });
  });

  describe('Saving Snapshot Data', () => {
    it('Save Snapshot Data', async () => {
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
