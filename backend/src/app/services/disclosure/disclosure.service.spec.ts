import { Test, TestingModule } from '@nestjs/testing';
import { DisclosureService } from './disclosure.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { LoggerService } from '../../logger/logger.service';
import { UserTypeEum } from '../../common/userType';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { ProfileQuestions } from '../../entities/profileQuestions.entity';
import { SRApprovalStatusEnum } from '../../common/srApprovalStatusEnum';
import { SelectQueryBuilder } from 'typeorm';
import { HttpException } from '@nestjs/common';

describe('DisclosureService', () => {
  let service: DisclosureService;
  let disclosureRepository: { find: jest.Mock };
  let profileQuestionsRepository: { createQueryBuilder: jest.Mock };
  let snapshotService: { getMostRecentSnapshot: jest.Mock };
  let sitesLogger: { log: jest.Mock; error: jest.Mock };

  const mockQueryBuilder = {
    distinct: jest.fn().mockReturnThis(),
    innerJoin: jest.fn().mockReturnThis(),
    innerJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  } as unknown as SelectQueryBuilder<ProfileQuestions>;

  beforeEach(async () => {
    disclosureRepository = { find: jest.fn() };
    profileQuestionsRepository = {
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    };
    snapshotService = { getMostRecentSnapshot: jest.fn() };
    sitesLogger = { log: jest.fn(), error: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisclosureService,
        {
          provide: getRepositoryToken(SiteProfiles),
          useValue: disclosureRepository,
        },
        {
          provide: getRepositoryToken(ProfileQuestions),
          useValue: profileQuestionsRepository,
        },
        { provide: SnapshotsService, useValue: snapshotService },
        { provide: LoggerService, useValue: sitesLogger },
      ],
    }).compile();

    service = module.get<DisclosureService>(DisclosureService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getSiteDisclosureBySiteId', () => {
    describe('IDIR user', () => {
      const idirUser = { identity_provider: UserTypeEum.IDIR };

      it('should return empty array when no profiles found', async () => {
        disclosureRepository.find.mockResolvedValueOnce([]);

        const result = await service.getSiteDisclosureBySiteId(
          '1',
          false,
          idirUser,
        );

        expect(result).toEqual([]);
        expect(disclosureRepository.find).toBeCalledWith({
          where: { siteId: '1' },
          relations: ['siteProfileLandUses'],
        });
      });

      it('should return enriched site profiles', async () => {
        const siteId = '1';
        const dateCompleted = new Date();
        const mockProfiles = generateMockSiteProfile(siteId, dateCompleted);

        disclosureRepository.find.mockResolvedValueOnce(mockProfiles);

        const result = await service.getSiteDisclosureBySiteId(
          siteId,
          false,
          idirUser,
        );

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(
          profileQuestionsRepository.createQueryBuilder,
        ).toHaveBeenCalledWith('pq');
      });

      it('should filter by pending srAction when showPending is true', async () => {
        const siteId = '1';
        const dateCompleted = new Date();

        const mockProfiles = [
          {
            ...generateMockSiteProfile(siteId, dateCompleted)[0],
            srAction: SRApprovalStatusEnum.PENDING,
            siteProfileLandUses: [],
          },
          {
            ...generateMockSiteProfile(siteId, dateCompleted)[0],
            srAction: SRApprovalStatusEnum.PUBLIC,
            siteProfileLandUses: [],
          },
        ];

        disclosureRepository.find.mockResolvedValueOnce(mockProfiles);

        const result = await service.getSiteDisclosureBySiteId(
          siteId,
          true,
          idirUser,
        );

        // Only the PENDING profile should survive the filter
        expect(result.length).toBe(1);
      });

      it('should throw HttpException when repository find fails', async () => {
        disclosureRepository.find.mockRejectedValueOnce(new Error('DB error'));

        await expect(
          service.getSiteDisclosureBySiteId('1', false, idirUser),
        ).rejects.toThrow(HttpException);

        expect(sitesLogger.error).toHaveBeenCalled();
      });
    });

    describe('Non-IDIR user', () => {
      const externalUser = { identity_provider: 'bceid', sub: 'user-123' };

      it('should return empty array when no sub is present', async () => {
        const result = await service.getSiteDisclosureBySiteId(
          '1',
          false,
          { identity_provider: 'bceid', sub: '' }, // empty sub
        );

        expect(result).toEqual([]);
        expect(snapshotService.getMostRecentSnapshot).not.toHaveBeenCalled();
      });

      it('should return empty array when no snapshot found', async () => {
        snapshotService.getMostRecentSnapshot.mockResolvedValueOnce(null);

        const result = await service.getSiteDisclosureBySiteId(
          '1',
          false,
          externalUser,
        );

        expect(result).toEqual([]);
        expect(snapshotService.getMostRecentSnapshot).toHaveBeenCalledWith(
          '1',
          'user-123',
        );
      });

      it('should return profiles from snapshot when snapshot exists', async () => {
        const siteId = '1';
        const dateCompleted = new Date();
        const mockProfiles = generateMockSiteProfile(siteId, dateCompleted);

        snapshotService.getMostRecentSnapshot.mockResolvedValueOnce({
          snapshotData: { profiles: mockProfiles },
        });

        const result = await service.getSiteDisclosureBySiteId(
          siteId,
          false,
          externalUser,
        );

        expect(result).toBeDefined();
        expect(snapshotService.getMostRecentSnapshot).toHaveBeenCalledWith(
          siteId,
          'user-123',
        );
      });

      it('should use profileAnswers from snapshot instead of fetching from DB', async () => {
        const mockProfiles = [
          {
            siteId: '1',
            dateCompleted: new Date('2024-01-01'),
            srAction: SRApprovalStatusEnum.PUBLIC,
            whoCreated: 'Mid',
            whenCreated: new Date('2024-01-01'),
            siteProfileLandUses: [
              {
                lutCode: 'RES',
                srAction: SRApprovalStatusEnum.PUBLIC,
                whoCreated: 'Mid',
                whenCreated: new Date('2024-01-01'),
              },
            ],
            profileAnswers: [
              {
                questionId: '10',
                siteId: '1',
                sprofDateCompleted: new Date('2024-01-01'),
                question: {
                  id: '10',
                  description: 'Was soil tested?',
                  category: { id: '1', description: 'Soil' },
                },
              },
              {
                questionId: '20',
                siteId: '1',
                sprofDateCompleted: new Date('2024-01-01'),
                question: {
                  id: '20',
                  description: 'Was water tested?',
                  category: { id: '2', description: 'Water' },
                },
              },
            ],
          },
        ];

        snapshotService.getMostRecentSnapshot.mockResolvedValueOnce({
          snapshotData: { profiles: mockProfiles },
        });

        const result = await service.getSiteDisclosureBySiteId(
          '1',
          false,
          externalUser,
        );

        expect(
          profileQuestionsRepository.createQueryBuilder,
        ).not.toHaveBeenCalled();

        expect(result).toBeDefined();
        expect(result.length).toBe(1);
        expect(result[0].siteProfileQA).toEqual([
          { question: 'Was soil tested?', category: 'Soil' },
          { question: 'Was water tested?', category: 'Water' },
        ]);
      });

      it('should return schedule2 refs from snapshot siteProfileLandUses', async () => {
        const mockProfiles = [
          {
            siteId: '1',
            dateCompleted: new Date('2024-01-01'),
            srAction: SRApprovalStatusEnum.PUBLIC,
            whoCreated: 'Mid',
            whenCreated: new Date('2024-01-01'),
            siteProfileLandUses: [
              {
                lutCode: 'RES',
                srAction: SRApprovalStatusEnum.PUBLIC,
                whoCreated: 'Mid',
                whenCreated: new Date('2024-01-01'),
              },
              {
                lutCode: 'COM',
                srAction: SRApprovalStatusEnum.PUBLIC,
                whoCreated: 'Mid',
                whenCreated: new Date('2024-01-01'),
              },
            ],
            profileAnswers: [],
          },
        ];

        snapshotService.getMostRecentSnapshot.mockResolvedValueOnce({
          snapshotData: { profiles: mockProfiles },
        });

        const result = await service.getSiteDisclosureBySiteId(
          '1',
          false,
          externalUser,
        );

        expect(result).toBeDefined();
        expect(result[0].siteProfileSchedule2Refs).toHaveLength(2);
        expect(result[0].siteProfileSchedule2Refs[0]).toMatchObject({
          schedule2ReferenceCode: 'RES',
          srValue: true,
        });
        expect(result[0].siteProfileSchedule2Refs[1]).toMatchObject({
          schedule2ReferenceCode: 'COM',
          srValue: true,
        });
      });

      it('should fetch from DB when profileAnswers is empty in snapshot or is internal users', async () => {
        const mockProfiles = [
          {
            siteId: '1',
            dateCompleted: new Date('2024-01-01'),
            srAction: SRApprovalStatusEnum.PUBLIC,
            whoCreated: 'Mid',
            whenCreated: new Date('2024-01-01'),
            siteProfileLandUses: [],
            profileAnswers: [],
          },
        ];

        snapshotService.getMostRecentSnapshot.mockResolvedValueOnce({
          snapshotData: { profiles: mockProfiles },
        });

        const result = await service.getSiteDisclosureBySiteId(
          '1',
          false,
          externalUser,
        );

        expect(
          profileQuestionsRepository.createQueryBuilder,
        ).toHaveBeenCalledWith('pq');
        expect(result).toBeDefined();
      });
    });
  });
});

export function generateMockSiteProfile(siteId: string, dateCompleted: Date) {
  return [
    {
      siteId,
      dateCompleted,
      srAction: SRApprovalStatusEnum.PUBLIC,
      localAuthDateRecd: new Date(),
      localAuthName: 'Local Auth Name',
      localAuthAgency: 'Local Auth Agency',
      whoCreated: 'Test User',
      whenCreated: new Date(),
      siteProfileLandUses: [],
      siteProfileQA: [],
    },
  ];
}
