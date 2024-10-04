import { Test, TestingModule } from '@nestjs/testing';
import { AssociatedSiteService } from '../../services/associatedSite/associatedSite.service';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';
import { AssociatedSiteResolver } from './associatedSite.resolver';
import { LoggerService } from '../../logger/logger.service';

describe('AssociatedSiteResolver', () => {
  let resolver: AssociatedSiteResolver;
  let associatedSiteService: AssociatedSiteService;
  let genericResponseProvider: GenericResponseProvider<AssociatedSiteDto[]>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AssociatedSiteResolver,
        {
          provide: AssociatedSiteService,
          useValue: {
            getAssociatedSitesBySiteId: jest.fn(),
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
            createResponse: jest.fn(),
          },
        },
      ],
    }).compile();

    resolver = module.get<AssociatedSiteResolver>(AssociatedSiteResolver);
    associatedSiteService = module.get<AssociatedSiteService>(
      AssociatedSiteService,
    );
    loggerService = module.get<LoggerService>(LoggerService);
    genericResponseProvider = module.get<
      GenericResponseProvider<AssociatedSiteDto[]>
    >(GenericResponseProvider);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  describe('getAssociatedSitesBySiteId', () => {
    it('should return associated sites successfully', async () => {
      const siteId = 'site123';
      const expectedResult: AssociatedSiteDto[] = [
        {
          id: 'guid1',
          siteId: 'site123',
          effectiveDate: new Date(),
          siteIdAssociatedWith: 'site456',
          note: 'Note 1',
          srAction: 'pending',
          userAction: 'pending',
        },
      ];

      (
        associatedSiteService.getAssociatedSitesBySiteId as jest.Mock
      ).mockResolvedValueOnce(expectedResult);
      (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce(
        {
          message: 'Associated sites fetched successfully',
          httpStatusCode: 200,
          success: true,
          data: expectedResult,
        },
      );

      const result = await resolver.getAssociatedSitesBySiteId(siteId);

      expect(result.message).toBe('Associated sites fetched successfully');
      expect(result.httpStatusCode).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
    });

    it('should return not found error when associated sites are empty', async () => {
      const siteId = 'site123';

      (
        associatedSiteService.getAssociatedSitesBySiteId as jest.Mock
      ).mockResolvedValueOnce([]);
      (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce(
        {
          message: `Associated sites data not found for site id: ${siteId}`,
          httpStatusCode: 404,
          success: false,
        },
      );

      const result = await resolver.getAssociatedSitesBySiteId(siteId);

      expect(result.message).toBe(
        `Associated sites data not found for site id: ${siteId}`,
      );
      expect(result.httpStatusCode).toBe(404);
      expect(result.success).toBe(false);
    });
  });
});
