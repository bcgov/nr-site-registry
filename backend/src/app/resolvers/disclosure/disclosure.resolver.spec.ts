import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { DisclosureService } from '../../services/disclosure/disclosure.service';
import { DisclosureResolver } from './disclosure.resolver';
import { Test } from '@nestjs/testing';
import { DisclosureResponse, SiteProfilesDTO } from '../../dto/disclosure.dto';
import { LoggerService } from '../../logger/logger.service';
import { UserTypeEum } from '../../common/userType';

describe('DisclosureResolver', () => {
  let resolver: DisclosureResolver;
  let disclosureService: DisclosureService;
  let genericResponseProvider: GenericResponseProvider<SiteProfilesDTO[]>;
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
                data?: SiteProfilesDTO[],
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
      GenericResponseProvider<SiteProfilesDTO[]>
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
      const mockSiteProfile = generateMockSiteProfileDTO(siteId);

      const expectedResponse: DisclosureResponse = {
        message: 'Site Disclosure fetched successfully',
        httpStatusCode: 200,
        success: true,
        data: mockSiteProfile,
      };

      jest
        .spyOn(disclosureService, 'getSiteDisclosureBySiteId')
        .mockResolvedValueOnce(mockSiteProfile);

      const result = await resolver.getSiteDisclosureBySiteId(siteId, false, {
        identity_provider: UserTypeEum.IDIR,
      });

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

      const result = await resolver.getSiteDisclosureBySiteId(siteId, false, {
        identity_provider: UserTypeEum.IDIR,
      });

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

function generateMockSiteProfileDTO(siteId: string): SiteProfilesDTO[] {
  const dto = new SiteProfilesDTO();
  dto.id = 'profile-uuid-1';
  dto.siteId = siteId;
  dto.dateCompleted = new Date();
  dto.localAuthDateRecd = null;
  dto.localAuthDateSubmitted = null;
  dto.localAuthDateForwarded = null;
  dto.rwmDateReceived = null;
  dto.rwmDateDecision = null;
  dto.siteRegDateRecd = null;
  dto.siteRegDateEntered = null;
  dto.rwmParticId = null;
  dto.plannedActivityComment = null;
  dto.siteDisclosureComment = null;
  dto.govDocumentsComment = null;
  dto.whenCreated = new Date();
  dto.whenUpdated = null;
  dto.siteProfileSchedule2Refs = [];
  return [dto];
}
