import { Test, TestingModule } from '@nestjs/testing';
import { SiteResolver } from './site.resolver';
import { SiteService } from '../../services/site/site.service';
import {
  FetchSiteDetail,
  FetchSiteResponse,
  SaveSiteDetailsResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { sampleSites } from '../../mockData/site.mockData';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { DropdownDto } from '../../dto/dropdown.dto';
import { LoggerService } from '../../logger/logger.service';
import { CustomRoles } from '../../common/role';

describe('SiteResolver', () => {
  let siteResolver: SiteResolver;
  let siteService: SiteService;
  let loggerService: LoggerService;
  // let genericResponseProvider: GenericResponseProvider<SaveSiteDetailsResponse>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SiteResolver,
        {
          provide: SiteService,
          useValue: {
            findAll: jest.fn(() => {
              const result = new FetchSiteResponse();
              result.httpStatusCode = 200;
              result.data = sampleSites;
              return result;
            }),
            searchSites: jest.fn(() => {
              const result = new SearchSiteResponse();
              result.sites = sampleSites;
              result.page = 1;
              result.pageSize = 1;
              result.count = 1;
              return result;
            }),
            findSiteBySiteId: jest.fn(() => {
              const result = new FetchSiteDetail();
              result.httpStatusCode = 200;
              result.data = sampleSites[0];
              return result;
            }),
            findSiteBySiteIdForService: jest.fn(() => {
              const result = new FetchSiteDetail();
              result.httpStatusCode = 200;
              result.data = sampleSites[0];
              return result;
            }),
            saveSiteDisclosureForService: jest.fn(),
            searchSiteIds: jest.fn(),
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
                data: DropdownDto[],
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

    siteResolver = module.get<SiteResolver>(SiteResolver);
    siteService = module.get<SiteService>(SiteService);
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should call siteService.findAll() and return the result', async () => {
    // Act
    const sites = await siteResolver.findAll();
    // Assert
    expect(sites.data.length).toBe(2);
    expect(sites.httpStatusCode).toBe(200);
    expect(siteService.findAll).toHaveBeenCalled();
  });

  /*it('site search matches a search parameter with filter conditions', async () => {
      const searchParam = '123';
      const page = 1;
      const pageSize = 1;
      const expectedFilteredSites = new SearchSiteResponse();
      expectedFilteredSites.sites = [];
      expectedFilteredSites.sites.push(sampleSites[0]); // Only Site 1 matches the searchParam
      expectedFilteredSites.page = 1;
      expectedFilteredSites.pageSize = 1;
      expectedFilteredSites.count = 1;

      (siteService.searchSites as jest.Mock).mockResolvedValue(expectedFilteredSites);

      const result: SearchSiteResponse = await siteResolver.searchSites(searchParam, page, pageSize);

      expect(siteService.searchSites).toHaveBeenCalledWith(searchParam, page, pageSize, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined);
      expect(result).toEqual(expectedFilteredSites);
    });*/

  describe('findSiteBySiteIdForService', () => {
    it('calls siteService when azp is allowlisted', async () => {
      const result = await siteResolver.findSiteBySiteIdForService('123', {
        azp: 'site-service',
      });

      expect(siteService.findSiteBySiteIdForService).toHaveBeenCalledWith(
        '123',
      );
      expect(result.httpStatusCode).toBe(200);
      expect(result.data).toEqual(sampleSites[0]);
    });

    it('rejects a token from another client', () => {
      expect(() =>
        siteResolver.findSiteBySiteIdForService('123', { azp: 'site-web' }),
      ).toThrow('not allowed to call this service endpoint');
      expect(siteService.findSiteBySiteIdForService).not.toHaveBeenCalled();
    });

    it('rejects a missing azp', () => {
      expect(() =>
        siteResolver.findSiteBySiteIdForService('123', {}),
      ).toThrow('not allowed to call this service endpoint');
      expect(siteService.findSiteBySiteIdForService).not.toHaveBeenCalled();
    });

    it('rejects a human JWT with other SITE roles when azp is not allowlisted', () => {
      expect(() =>
        siteResolver.findSiteBySiteIdForService('123', {
          azp: 'site-web',
          realm_access: { roles: ['site-internal-user', 'site-registrar'] },
        }),
      ).toThrow('not allowed to call this service endpoint');
      expect(siteService.findSiteBySiteIdForService).not.toHaveBeenCalled();
    });
  });

  describe('saveSiteDisclosureForService', () => {
    const input = {
      dateCompleted: new Date('2024-06-01'),
      schedule2ReferenceCodes: ['AG'],
    };

    it('calls siteService when azp is allowlisted', async () => {
      const expected = {
        message: 'Site disclosure added successfully',
        httpStatusCode: 200,
        success: true,
        data: null,
      };
      (siteService.saveSiteDisclosureForService as jest.Mock).mockResolvedValue(
        expected,
      );

      const result = await siteResolver.saveSiteDisclosureForService(
        '123',
        input,
        { azp: 'site-service' },
      );

      expect(siteService.saveSiteDisclosureForService).toHaveBeenCalledWith(
        '123',
        input,
      );
      expect(result).toEqual(expected);
    });

    it('rejects a non-allowlisted service client', () => {
      expect(() =>
        siteResolver.saveSiteDisclosureForService('123', input, {
          azp: 'other-service',
        }),
      ).toThrow('not allowed to call this service endpoint');
      expect(siteService.saveSiteDisclosureForService).not.toHaveBeenCalled();
    });

    it('rejects a human-only caller even with other SITE roles', () => {
      expect(() =>
        siteResolver.saveSiteDisclosureForService('123', input, {
          azp: 'site-web',
          realm_access: { roles: ['site-internal-user'] },
        }),
      ).toThrow('not allowed to call this service endpoint');
      expect(siteService.saveSiteDisclosureForService).not.toHaveBeenCalled();
    });

    it('passes through a typed duplicate response', async () => {
      const duplicate = {
        message: 'A site disclosure already exists for this site and date completed.',
        httpStatusCode: 409,
        success: false,
        data: null,
        errorCode: 'DUPLICATE_DATE_COMPLETED',
      };
      (siteService.saveSiteDisclosureForService as jest.Mock).mockResolvedValue(
        duplicate,
      );

      const result = await siteResolver.saveSiteDisclosureForService(
        '123',
        input,
        { azp: 'site-service' },
      );

      expect(result).toEqual(duplicate);
    });
  });

  describe('full site-details save is not callable by a service account', () => {
    it('updateSiteDetails requires human SITE roles only', () => {
      const rolesMetadata = Reflect.getMetadata(
        'roles',
        SiteResolver.prototype.updateSiteDetails,
      );

      expect(rolesMetadata.roles).toContain(CustomRoles.External);
      expect(rolesMetadata.roles).toContain(CustomRoles.Internal);
      expect(rolesMetadata.roles).toContain(CustomRoles.SiteRegistrar);
      expect(rolesMetadata.roles).not.toContain(CustomRoles.ServiceCaller);
      expect(rolesMetadata.roles).not.toContain(
        `realm:${CustomRoles.ServiceCaller}`,
      );
    });
  });
});
