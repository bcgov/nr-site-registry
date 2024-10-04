import { Test, TestingModule } from '@nestjs/testing';
import { DisclosureService } from './disclosure.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { LoggerService } from '../../logger/logger.service';

jest.mock('../../entities/siteProfiles.entity');

describe('DisclosureService', () => {
  let service: DisclosureService;
  let repository: Repository<SiteProfiles>;
  let sitesLogger: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DisclosureService,
        LoggerService,
        {
          provide: getRepositoryToken(SiteProfiles),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<DisclosureService>(DisclosureService);
    sitesLogger = module.get<LoggerService>(LoggerService);
    repository = module.get<Repository<SiteProfiles>>(
      getRepositoryToken(SiteProfiles),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Test case for getSiteDisclosureBySiteId method
  describe('getSiteDisclosureBySiteId', () => {
    it('should return site profiles for a given siteId', async () => {
      const siteId = '1';
      const dateCompleted = new Date();

      const mockSiteProfile = generateMockSiteProfile(siteId, dateCompleted);
      jest.spyOn(repository, 'find').mockResolvedValueOnce(mockSiteProfile);

      const result = await service.getSiteDisclosureBySiteId(siteId);

      expect(result).toEqual(mockSiteProfile);
      expect(repository.find).toBeCalledWith({ where: { siteId } });
    });

    it('should throw an error when repository find fails', async () => {
      const siteId = 'site123';
      const error = new Error(
        `Failed to retrieve site disclosures for siteId ${siteId}`,
      );
      jest.spyOn(repository, 'find').mockRejectedValueOnce(error);

      await expect(service.getSiteDisclosureBySiteId(siteId)).rejects.toThrow(
        error,
      );
    });
  });
});

export function generateMockSiteProfile(siteId: string, dateCompleted: Date) {
  const mockSiteProfile = new SiteProfiles();

  mockSiteProfile.siteId = siteId;
  mockSiteProfile.dateCompleted = dateCompleted;
  mockSiteProfile.localAuthDateRecd = new Date(); // Example of setting a default value
  mockSiteProfile.localAuthName = 'Local Auth Name';
  mockSiteProfile.localAuthAgency = 'Local Auth Agency';
  mockSiteProfile.whoCreated = 'Test User'; // Example of required field
  return [mockSiteProfile];
}
