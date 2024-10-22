import { Test, TestingModule } from '@nestjs/testing';
import { DropdownResolver } from './dropdown.resolver';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { DropdownDto } from '../../dto/dropdown.dto';
import { LoggerService } from '../../logger/logger.service';

describe('DropdownResolver', () => {
  let resolver: DropdownResolver;
  let dropdownService: DropdownService;
  let genericResponseProvider: GenericResponseProvider<DropdownDto[]>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DropdownResolver,
        {
          provide: DropdownService,
          useValue: {
            getParticipantRoleCd: jest.fn(),
            getPeopleOrgsCd: jest.fn(),
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

    resolver = module.get<DropdownResolver>(DropdownResolver);
    dropdownService = module.get<DropdownService>(DropdownService);
    loggerService = module.get<LoggerService>(LoggerService);
    genericResponseProvider = module.get<
      GenericResponseProvider<DropdownDto[]>
    >(GenericResponseProvider);
  });

  afterEach(() => {
    jest.clearAllMocks(); // Clear mock calls after each test
  });

  describe('getParticipantRoleCd', () => {
    it('should return participants role codes successfully', async () => {
      const expectedResult: DropdownDto[] = [{ key: '1', value: 'Admin' }];
      (dropdownService.getParticipantRoleCd as jest.Mock).mockResolvedValueOnce(
        expectedResult,
      );
      (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce(
        {
          message: 'Participants role code fetched successfully',
          httpStatusCode: 200,
          success: true,
          data: expectedResult,
        },
      );

      const result = await resolver.getParticipantRoleCd();

      expect(result.message).toBe(
        'Participants role code fetched successfully',
      );
      expect(result.httpStatusCode).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
    });

    it('should return not found error when participants role codes are empty', async () => {
      (dropdownService.getParticipantRoleCd as jest.Mock).mockResolvedValueOnce(
        [],
      );
      (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce(
        {
          message: 'Participants role code not found',
          httpStatusCode: 404,
          success: false,
        },
      );

      const result = await resolver.getParticipantRoleCd();

      expect(result.message).toBe('Participants role code not found');
      expect(result.httpStatusCode).toBe(404);
      expect(result.success).toBe(false);
    });
  });

  describe('getPeopleOrgsCd', () => {
    it('should return people organizations successfully', async () => {
      const expectedResult: DropdownDto[] = [
        { key: '1', value: 'Organization A' },
      ];
      (dropdownService.getPeopleOrgsCd as jest.Mock).mockResolvedValueOnce(
        expectedResult,
      );
      (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce(
        {
          message: 'People Organization fetched successfully',
          httpStatusCode: 200,
          success: true,
          data: expectedResult,
        },
      );

      const result = await resolver.getPeopleOrgsCd();

      expect(result.message).toBe('People Organization fetched successfully');
      expect(result.httpStatusCode).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(expectedResult);
    });

    it('should return not found error when people organizations are empty', async () => {
      (dropdownService.getPeopleOrgsCd as jest.Mock).mockResolvedValueOnce([]);
      (genericResponseProvider.createResponse as jest.Mock).mockReturnValueOnce(
        {
          message: 'People Organization not found',
          httpStatusCode: 404,
          success: false,
        },
      );

      const result = await resolver.getPeopleOrgsCd();

      expect(result.message).toBe('People Organization not found');
      expect(result.httpStatusCode).toBe(404);
      expect(result.success).toBe(false);
    });
  });
});
