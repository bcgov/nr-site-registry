import { LandHistories } from '../../entities/landHistories.entity';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandHistoryService } from '../../services/landHistory/landHistory.service';
import { LandHistoryResolver } from './landHistory.resolver';
import { Test } from '@nestjs/testing';
import { LandHistoryResponse } from '../../dto/landHistory.dto';

describe('LandHistoryResolver', () => {
  let resolver: LandHistoryResolver;
  let landHistoryService: LandHistoryService;
  let genericResponseProvider: GenericResponseProvider<LandHistories[]>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        LandHistoryResolver,
        {
          provide: LandHistoryService,
          useValue: {
            getLandHistoriesForSite: jest.fn(),
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
                data?: LandHistories[],
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

    resolver = module.get<LandHistoryResolver>(LandHistoryResolver);
    landHistoryService = module.get<LandHistoryService>(LandHistoryService);
    genericResponseProvider = module.get<
      GenericResponseProvider<LandHistories[]>
    >(GenericResponseProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getLandHistoriesForSite', () => {
    it('should return land histories when found', async () => {
      const mockLandHistories = [new LandHistories()];

      const expectedResponse: LandHistoryResponse = {
        message: 'Land uses fetched successfully',
        httpStatusCode: 200,
        success: true,
        data: mockLandHistories,
      };

      jest
        .spyOn(landHistoryService, 'getLandHistoriesForSite')
        .mockResolvedValueOnce(mockLandHistories);

      const result = await resolver.getLandHistoriesForSite('1', '', 'ASC');

      expect(result).toEqual(expectedResponse);
      expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
        'Land uses fetched successfully',
        200,
        true,
        mockLandHistories,
      );
    });

    it('should return 404 error when no data is found', async () => {
      const siteId = '1';
      const expectedResponse: LandHistoryResponse = {
        message: `Land uses data not found for site id: ${siteId}`,
        httpStatusCode: 404,
        success: false,
        data: null,
      };

      jest
        .spyOn(landHistoryService, 'getLandHistoriesForSite')
        .mockResolvedValueOnce([]);

      const result = await resolver.getLandHistoriesForSite(siteId, '', 'ASC');

      expect(result).toEqual(expectedResponse);
      expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
        `Land uses data not found for site id: ${siteId}`,
        404,
        false,
        null,
      );
    });
  });
});
