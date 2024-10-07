import { Test, TestingModule } from '@nestjs/testing';
import { ParcelDescriptionsService } from '../../services/parcelDescriptions/parcelDescriptions.service';
import { ParcelDescriptionResolver } from './parcelDescription.resolver';
import { ParcelDescriptionDto } from '../../dto/parcelDescription.dto';
import { GenericPagedResponse } from '../../dto/response/genericResponse';
import { LoggerService } from '../../logger/logger.service';

describe('ParcelDescriptionResolver', () => {
  let parcelDescriptionResolver: ParcelDescriptionResolver;
  let parcelDescriptionService: ParcelDescriptionsService;
  let loggerService: LoggerService;
  let logMock: jest.Mock;

  const parcelDescriptionsServiceResult = jest.fn();

  beforeEach(async () => {
    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelDescriptionResolver,
        {
          provide: ParcelDescriptionsService,
          useValue: {
            getParcelDescriptionsBySiteId: parcelDescriptionsServiceResult,
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
          },
        },
      ],
    }).compile();

    parcelDescriptionResolver = testingModule.get<ParcelDescriptionResolver>(
      ParcelDescriptionResolver,
    );
    parcelDescriptionService = testingModule.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
    loggerService = testingModule.get<LoggerService>(LoggerService);

    logMock = jest.fn();
    loggerService.log = logMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('Logs the call to the resolver', async () => {
    const siteId = 123;
    const page = 1;
    const pageSize = 10;
    const searchParam = 'searchParam';
    const sortBy = 'sortBy';
    const sortByDir = 'sortByDir';
    const showPending = false;
    const user = {};
    parcelDescriptionsServiceResult.mockReturnValue(
      new GenericPagedResponse<ParcelDescriptionDto[]>(),
    );

    await parcelDescriptionResolver.getParcelDescriptionsBySiteId(
      siteId,
      page,
      pageSize,
      searchParam,
      sortBy,
      sortByDir,
      showPending,
      user,
    );

    expect(logMock).toHaveBeenCalled();
  });

  it('calls the site subdivision service with the expected parameters.', async () => {
    const siteId = 123;
    const page = 1;
    const pageSize = 10;
    const searchParam = 'searchParam';
    const sortBy = 'sortBy';
    const sortByDir = 'sortByDir';
    const showPending = false;
    const user = {};
    parcelDescriptionsServiceResult.mockReturnValue(
      new GenericPagedResponse<ParcelDescriptionDto[]>(),
    );

    await parcelDescriptionResolver.getParcelDescriptionsBySiteId(
      siteId,
      page,
      pageSize,
      searchParam,
      sortBy,
      sortByDir,
      showPending,
      user,
    );
    expect(
      parcelDescriptionService.getParcelDescriptionsBySiteId,
    ).toHaveBeenCalledWith(
      siteId,
      page,
      pageSize,
      searchParam,
      sortBy,
      sortByDir,
      showPending,
      user,
    );
  });

  it('returns the result provided by the parcel description service.', async () => {
    const siteId = 123;
    const page = 1;
    const pageSize = 10;
    const searchParam = 'searchParam';
    const sortBy = 'sortBy';
    const sortByDir = 'sortByDir';
    const showPending = false;
    const user = {};
    const expectedResponse = new GenericPagedResponse<ParcelDescriptionDto[]>();
    parcelDescriptionsServiceResult.mockReturnValue(expectedResponse);

    const response =
      await parcelDescriptionResolver.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
        showPending,
        user,
      );
    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
