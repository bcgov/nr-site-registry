import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';
import { plainToInstance } from 'class-transformer';
import { v4 } from 'uuid';
import { AssociatedSiteService } from './associatedSite.service';
import { LoggerService } from '../../logger/logger.service';
import { UserTypeEum } from '../../common/userType';
import { SnapshotsService } from '../snapshot/snapshot.service';

// Mock SiteAssocs entity and its Repository
jest.mock('../../entities/siteAssocs.entity');
jest.mock('../snapshot/snapshot.service');
describe('AssociatedSiteService', () => {
  let service: AssociatedSiteService;
  let snapshotService: SnapshotsService;
  let assocSiteRepository: Repository<SiteAssocs>;
  let sitesLogger: LoggerService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociatedSiteService,
        LoggerService,
        SnapshotsService,
        {
          provide: getRepositoryToken(SiteAssocs),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AssociatedSiteService>(AssociatedSiteService);
    snapshotService = module.get<SnapshotsService>(SnapshotsService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    assocSiteRepository = module.get<Repository<SiteAssocs>>(
      getRepositoryToken(SiteAssocs),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for getAssociatedSitesBySiteId method
  describe('getAssociatedSitesBySiteId', () => {
    it('should return associated sites', async () => {
      const siteId = 'site123';
      const mockSiteAssocs = [
        {
          siteId: 'site123',
          effectiveDate: new Date('2023-01-01'),
          siteIdAssociatedWith: 'site456',
          note: 'Note 1',
        },
      ];

      jest
        .spyOn(assocSiteRepository, 'find')
        .mockResolvedValueOnce(mockSiteAssocs as SiteAssocs[]);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      const result = await service.getAssociatedSitesBySiteId(
        siteId,
        false,
        user,
      );

      const expectedTransformedObjects = mockSiteAssocs.map((item) => ({
        guid: v4(),
        siteId: item.siteId,
        effectiveDate: item.effectiveDate,
        siteIdAssociatedWith: item.siteIdAssociatedWith,
        note: item.note,
      }));
      const associatedSiteDtos = plainToInstance(
        AssociatedSiteDto,
        expectedTransformedObjects,
      );

      expect(assocSiteRepository.find).toHaveBeenCalledWith({
        where: { siteId },
      });
    });

    it('should throw an error when repository find fails', async () => {
      const siteId = 'site123';
      const error = new Error(
        `Failed to retrieve associated sites by site ID: ${siteId}`,
      );
      jest.spyOn(assocSiteRepository, 'find').mockRejectedValueOnce(error);
      const user = {
        identity_provider: UserTypeEum.IDIR,
      };
      await expect(
        service.getAssociatedSitesBySiteId(siteId, false, user),
      ).rejects.toThrowError(
        `Failed to retrieve associated sites by site ID: ${siteId}`,
      );
    });
  });
});
