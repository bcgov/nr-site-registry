import { Test, TestingModule } from '@nestjs/testing';
import { NotationResolver } from './notation.resolver';
import { NotationService } from '../../services/notation/notation.service';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { NotationDto, NotationResponse } from '../../dto/notation.dto';
import { LoggerService } from '../../logger/logger.service';

describe('NotationResolver', () => {
  let resolver: NotationResolver;
  let notationService: NotationService;
  let genericResponseProvider: GenericResponseProvider<NotationDto[]>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotationResolver,
        {
          provide: NotationService,
          useValue: {
            getSiteNotationBySiteId: jest.fn(),
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
                data?: NotationDto[],
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

    resolver = module.get<NotationResolver>(NotationResolver);
    notationService = module.get<NotationService>(NotationService);
    loggerService = module.get<LoggerService>(LoggerService);
    genericResponseProvider = module.get<
      GenericResponseProvider<NotationDto[]>
    >(GenericResponseProvider);
  });

  it('should return site notations if found', async () => {
    const siteId = '123';
    const mockNotations: NotationDto[] = [
      {
        id: '1',
        psnorgId: 'PSNORG123',
        siteId: 'SITE456',
        completionDate: new Date('2024-07-17'),
        etypCode: 'ETYP001',
        eclsCode: 'ECLS002',
        requiredAction: 'Fix issue',
        note: 'This is a note',
        requirementDueDate: new Date('2024-08-01'),
        requirementReceivedDate: new Date('2024-07-10'),
        srAction: 'pending',
        userAction: 'pending',
        notationParticipant: [
          {
            eventParticId: 'GUID001',
            eprCode: 'EPR001',
            psnorgId: 'PSNORG123',
            displayName: 'John Doe',
            srAction: 'pending',
            userAction: 'pending',
            eventId: '',
          },
          {
            eventParticId: 'GUID002',
            eprCode: 'EPR002',
            psnorgId: 'PSNORG456',
            displayName: 'Jane Smith',
            srAction: 'pending',
            userAction: 'pending',
            eventId: '',
          },
        ],
      },
    ];
    const expectedResult: NotationResponse = {
      message: 'Site Notation fetched successfully',
      httpStatusCode: 200,
      success: true,
      data: mockNotations,
    };
    jest
      .spyOn(notationService, 'getSiteNotationBySiteId')
      .mockResolvedValueOnce(mockNotations);

    const result = await resolver.getSiteNotationBySiteId(siteId);

    expect(result).toEqual(expectedResult);
    expect(mockNotations[0].id).toEqual('1');
    expect(mockNotations[0].notationParticipant).toHaveLength(2);
    expect(mockNotations[0].notationParticipant[0].displayName).toEqual(
      'John Doe',
    );
    expect(notationService.getSiteNotationBySiteId).toHaveBeenCalledWith(
      siteId,
    );
    expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
      'Site Notation fetched successfully',
      200,
      true,
      mockNotations,
    );
  });

  it('should return error message if site notations not found', async () => {
    const siteId = '123';
    const mockEmptyNotations: NotationDto[] = [];
    const expectedResult: NotationResponse = {
      message: `Site Notation data not found for site id: ${siteId}`,
      httpStatusCode: 404,
      success: false,
      data: null,
    };

    jest
      .spyOn(notationService, 'getSiteNotationBySiteId')
      .mockResolvedValueOnce(mockEmptyNotations);

    const result = await resolver.getSiteNotationBySiteId(siteId);

    expect(result).toEqual(expectedResult);
    expect(notationService.getSiteNotationBySiteId).toHaveBeenCalledWith(
      siteId,
    );
    expect(genericResponseProvider.createResponse).toHaveBeenCalledWith(
      `Site Notation data not found for site id: ${siteId}`,
      404,
      false,
      null,
    );
  });

  it('should validate siteId parameter type', async () => {
    const siteId = 123; // Invalid type
    const mockEmptyNotations: NotationDto[] = [];

    jest
      .spyOn(notationService, 'getSiteNotationBySiteId')
      .mockResolvedValueOnce(mockEmptyNotations);

    const result = await resolver.getSiteNotationBySiteId(siteId as any);

    expect(result.httpStatusCode).toEqual(404);
    expect(result.success).toEqual(false);
    expect(result.message).toContain(
      `Site Notation data not found for site id: ${siteId}`,
    );
  });

  it('should return an error for empty siteId parameter', async () => {
    const siteId = '';
    const mockEmptyNotations: NotationDto[] = [];

    const result = await resolver.getSiteNotationBySiteId(siteId);

    expect(result.httpStatusCode).toEqual(404);
    expect(result.success).toEqual(false);
    expect(result.message).toContain(
      'Site Notation data not found for site id: ',
    );
  });

  it('should handle large data response efficiently', async () => {
    const siteId = '123';
    const mockLargeNotations: NotationDto[] = new Array(1000).fill({
      id: '1',
      psnorgId: 'PSNORG123',
      siteId: 'SITE456',
      completionDate: new Date('2024-07-17'),
      etypCode: 'ETYP001',
      eclsCode: 'ECLS002',
      requiredAction: 'Fix issue',
      note: 'This is a note',
      requirementDueDate: new Date('2024-08-01'),
      requirementReceivedDate: new Date('2024-07-10'),
      notationParticipant: [
        {
          guid: 'GUID001',
          eprCode: 'EPR001',
          psnorgId: 'PSNORG123',
          displayName: 'John Doe',
        },
      ],
    });

    jest
      .spyOn(notationService, 'getSiteNotationBySiteId')
      .mockResolvedValueOnce(mockLargeNotations);

    const result = await resolver.getSiteNotationBySiteId(siteId);

    expect(result.success).toEqual(true);
    expect(result.data).toHaveLength(1000);
  });
});
