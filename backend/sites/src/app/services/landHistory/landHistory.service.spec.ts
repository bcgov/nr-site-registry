import { Test } from '@nestjs/testing';
import { LandHistoryService } from './landHistory.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
import { Repository } from 'typeorm';

describe('LandHistoryService', () => {
  let landHistoryService: LandHistoryService;
  let landHistoryRepository: Repository<LandHistories>;

  const whereMock = jest.fn().mockReturnThis();

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        LandHistoryService,
        {
          provide: getRepositoryToken(LandHistories),
          useValue: {
            createQueryBuilder: jest.fn(() => ({
              innerJoinAndSelect: jest.fn().mockReturnThis(),
              where: whereMock,
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
            })),
          },
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

  describe('getLandHistoriesForSite', () => {
    it('should call LandHistories repository with correct data', async () => {
      const siteId = 'site123';
      await landHistoryService.getLandHistoriesForSite(siteId, '', 'ASC');

      expect(whereMock).toHaveBeenCalledWith('site_id = :siteId', {
        siteId,
      });
    });
  });
});
