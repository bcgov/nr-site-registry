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

  describe('searchSites', () => {
    it('should call siteService.searchSites with the provided searchParam and no filter conditions', () => {
      const searchParam = 'example';
      const page = 1;
      const pageSize = 1;
      siteResolver.searchSites(searchParam, page, pageSize);
      expect(siteService.searchSites).toHaveBeenCalledWith(
        searchParam,
        page,
        pageSize,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
    });

    it('site search matches a search parameter and no filter conditions', async () => {
      const searchParam = '123';
      const page = 1;
      const pageSize = 1;
      const expectedFilteredSites = new SearchSiteResponse();
      expectedFilteredSites.sites = [];
      expectedFilteredSites.sites.push(sampleSites[0]); // Only Site 1 matches the searchParam
      expectedFilteredSites.page = 1;
      expectedFilteredSites.pageSize = 1;
      expectedFilteredSites.count = 1;

      (siteService.searchSites as jest.Mock).mockResolvedValue(
        expectedFilteredSites,
      );

      const result: SearchSiteResponse = await siteResolver.searchSites(
        searchParam,
        page,
        pageSize,
      );

      expect(siteService.searchSites).toHaveBeenCalledWith(
        searchParam,
        page,
        pageSize,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedFilteredSites);
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

    it('site search has no matches with the search parameter and no filter conditions', async () => {
      const searchParam = 'example';
      const page = 1;
      const pageSize = 1;
      const expectedFilteredSites = new SearchSiteResponse();
      expectedFilteredSites.sites = [];
      expectedFilteredSites.page = 1;
      expectedFilteredSites.pageSize = 1;
      expectedFilteredSites.count = 0;
      (siteService.searchSites as jest.Mock).mockResolvedValue(
        expectedFilteredSites,
      );

      const result: SearchSiteResponse = await siteResolver.searchSites(
        searchParam,
        page,
        pageSize,
      );

      expect(siteService.searchSites).toHaveBeenCalledWith(
        searchParam,
        page,
        pageSize,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      );
      expect(result).toEqual(expectedFilteredSites);
    });
  });

  describe('findSiteBySiteId', () => {
    it('should call siteService.findSiteBySiteId with the provided siteId', () => {
      const siteId = '123';
      siteResolver.findSiteBySiteId(siteId, false);
      expect(siteService.findSiteBySiteId).toHaveBeenCalledWith(siteId, false);
    });

    it('finds a matching site id', async () => {
      const expectedResult = [sampleSites[0]];
      const siteId = '123';

      (siteService.findSiteBySiteId as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const result = await siteResolver.findSiteBySiteId(siteId, false);
      expect(result).toEqual(expectedResult);
    });

    it('has no matches with the site Id parameter', async () => {
      const expectedResult = undefined;
      const siteId = '111';

      (siteService.findSiteBySiteId as jest.Mock).mockResolvedValue(
        expectedResult,
      );
      const result = await siteResolver.findSiteBySiteId(siteId, false);
      expect(result).toEqual(expectedResult);
    });
  });
});
