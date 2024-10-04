// Import necessary modules for testing
import { Test, TestingModule } from '@nestjs/testing';
import { ParticipantService } from './participant.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SitePartics } from '../../entities/sitePartics.entity';
import { SiteParticsDto } from '../../dto/sitePartics.dto';
import { plainToInstance } from 'class-transformer';
import { v4 } from 'uuid';
import { LoggerService } from '../../logger/logger.service';

// Mock SitePartics entity and its Repository
jest.mock('../../entities/sitePartics.entity');

describe('ParticipantService', () => {
  let service: ParticipantService;
  let siteParticsRepository: Repository<SitePartics>;
  let sitesLogger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ParticipantService,
        LoggerService,
        {
          provide: getRepositoryToken(SitePartics),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ParticipantService>(ParticipantService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    siteParticsRepository = module.get<Repository<SitePartics>>(
      getRepositoryToken(SitePartics),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for getSiteParticipantsBySiteId method
  describe('getSiteParticipantsBySiteId', () => {
    it('should return site participants', async () => {
      const siteId = 'site123';
      const mockSitePartics = [
        {
          id: '1',
          siteId: 'site123',
          psnorgId: 'org1',
          effectiveDate: new Date('2023-01-01'),
          endDate: null,
          note: 'Note 1',
          psnorg: {
            id: 'org1',
            displayName: 'Organization 1',
          },
          siteParticRoles: [
            {
              prCode: 'PR001',
              prCode2: {
                description: 'Role 1 Description',
              },
            },
          ],
        },
      ];

      jest
        .spyOn(siteParticsRepository, 'find')
        .mockResolvedValueOnce(mockSitePartics as SitePartics[]);

      const result = await service.getSiteParticipantsBySiteId(siteId);

      const expectedTransformedObjects = mockSitePartics.flatMap((item) =>
        item.siteParticRoles.map((role) => ({
          guid: v4(),
          id: item.id,
          psnorgId: item.psnorgId,
          effectiveDate: item.effectiveDate,
          endDate: null,
          note: item.note?.trim() || null,
          displayName: item.psnorg.displayName,
          prCode: role.prCode,
          description: role.prCode2.description,
        })),
      );
      const sitePartics = plainToInstance(
        SiteParticsDto,
        expectedTransformedObjects,
      );

      expect(result[0].displayName).toEqual(sitePartics[0].displayName);
    });

    it('should throw an error when repository find fails', async () => {
      const siteId = 'site123';
      const error = new Error('Database connection error');
      jest.spyOn(siteParticsRepository, 'find').mockRejectedValueOnce(error);

      await expect(
        service.getSiteParticipantsBySiteId(siteId),
      ).rejects.toThrowError(
        'Failed to retrieve site participants by siteId: Database connection error',
      );
    });
  });
});
