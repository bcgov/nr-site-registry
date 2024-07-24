import { Test } from '@nestjs/testing';
import { LandHistoryService } from './landHistory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
import { Repository } from 'typeorm';

describe('LandHistoryService', () => {
  let landHistoryService: LandHistoryService;
  let landHistoryRepository: Repository<LandHistories>;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LandHistoryService,
        {
          provide: getRepositoryToken(LandHistories),
          useClass: Repository,
        },
      ],
    }).compile();

    landHistoryService = moduleRef.get<LandHistoryService>(LandHistoryService);
    landHistoryRepository = moduleRef.get<Repository<LandHistories>>(
      getRepositoryToken(LandHistories),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(landHistoryService).toBeDefined();
  });

  //   describe('LandHistoryService', () => {
  //     it('should return something', async () => {
  //       //   landHistoryService.getLandHistoriesForSite;
  //       const siteId = 'site123';
  //       const mockLandHistories: any[] = [
  //         {
  //           siteId: '1',
  //           lutCode: 'land-use-code',
  //           note: 'mock note',
  //           landUse: {
  //             code: 'land-use-code',
  //             description: 'CONSTRUCTION DEMOLITION MATERIAL LANDFILLING',
  //           },
  //         },
  //       ];
  //       const result = await landHistoryService.getLandHistoriesForSite(
  //         siteId,
  //         '',
  //         'ASC',
  //       );
  //       console.log('FFFFF', result);
  //       expect(1 + 1).toBe(2);
  //     });
  //   });
});
