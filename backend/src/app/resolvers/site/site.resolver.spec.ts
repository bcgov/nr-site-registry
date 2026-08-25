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
    it('calls siteService when azp is site-service', async () => {
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
      ).toThrow('not allowed to call this service query');
      expect(siteService.findSiteBySiteIdForService).not.toHaveBeenCalled();
    });

    it('rejects a missing azp', () => {
      expect(() => siteResolver.findSiteBySiteIdForService('123', {})).toThrow(
        'not allowed to call this service query',
      );
      expect(siteService.findSiteBySiteIdForService).not.toHaveBeenCalled();
    });
  });
});
