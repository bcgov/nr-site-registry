import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { DisclosureService } from '../../services/disclosure/disclosure.service';
import { DisclosureResolver } from './disclosure.resolver';
import { Test } from '@nestjs/testing';
import { DisclosureResponse } from '../../dto/disclosure.dto';
import { LoggerService } from '../../logger/logger.service';

describe('DisclosureResolver', () => {
  let resolver: DisclosureResolver;
  let disclosureService: DisclosureService;
  let genericResponseProvider: GenericResponseProvider<SiteProfiles[]>;
  let loggerService: LoggerService;
  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DisclosureResolver,
        {
          provide: DisclosureService,
          useValue: {
            getSiteDisclosureBySiteId: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
          },
        },
        {
          provide: GenericResponseProvider,
          useValue: {
            createResponse: jest.fn(
              (
                message: string,
                httpStatusCode: number,
                success: boolean,
                data?: SiteProfiles[],
              ) => ({
                message,
                httpStatusCode,
                success,
                data,
              }),
            ),
          },
        },
      ],
    }).compile();

    resolver = module.get<DisclosureResolver>(DisclosureResolver);
    disclosureService = module.get<DisclosureService>(DisclosureService);
    loggerService = module.get<LoggerService>(LoggerService);
    genericResponseProvider = module.get<
      GenericResponseProvider<SiteProfiles[]>
    >(GenericResponseProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getSiteDisclosureBySiteId', () => {
    it('should return site disclosure when data is found', async () => {
      const siteId = '1';
      const dateCompleted = new Date();

      const mockSiteProfile = generateMockSiteProfile(siteId, dateCompleted);

      const expectedResponse: DisclosureResponse = {
        message: 'Site Disclosure fetched successfully',
        httpStatusCode: 200,
        success: true,
        data: mockSiteProfile,
      };

      jest
        .spyOn(disclosureService, 'getSiteDisclosureBySiteId')
        .mockResolvedValueOnce(mockSiteProfile);

      const result = await resolver.getSiteDisclosureBySiteId(siteId);

      expect(result).toEqual(expectedResponse);
      expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
        'Site Disclosure fetched successfully',
        200,
        true,
        mockSiteProfile,
      );
    });

    it('should return 404 error when no data is found', async () => {
      const siteId = '2';

      const expectedResponse: DisclosureResponse = {
        message: `Site Disclosure data not found for site id: ${siteId}`,
        httpStatusCode: 404,
        success: false,
        data: null,
      };

      jest
        .spyOn(disclosureService, 'getSiteDisclosureBySiteId')
        .mockResolvedValueOnce([]);

      const result = await resolver.getSiteDisclosureBySiteId(siteId);

      expect(result).toEqual(expectedResponse);
      expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
        `Site Disclosure data not found for site id: ${siteId}`,
        404,
        false,
        null,
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
  // Set other fields as needed

  mockSiteProfile.whoCreated = 'Test User'; // Example of required field

  // Populate other fields similarly

  return [mockSiteProfile];
}
