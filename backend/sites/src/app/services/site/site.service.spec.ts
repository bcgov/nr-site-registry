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
            find: jest.fn(async () => {
              return [];
            }),
            save: jest.fn(async () => {
              return true;
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
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
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
});
