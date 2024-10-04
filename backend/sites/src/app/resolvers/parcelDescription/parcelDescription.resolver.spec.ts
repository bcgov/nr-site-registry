import { Test, TestingModule } from '@nestjs/testing';
import { ParcelDescriptionsService } from '../../services/parcelDescriptions/parcelDescriptions.service';
import { ParcelDescriptionResolver } from './parcelDescription.resolver';
import { ParcelDescriptionDto } from '../../dto/parcelDescription.dto';
import { GenericPagedResponse } from '../../dto/response/genericResponse';

describe('ParcelDescriptionResolver', () => {
  let parcelDescriptionResolver: ParcelDescriptionResolver;
  let parcelDescriptionService: ParcelDescriptionsService;

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
      ],
    }).compile();

    parcelDescriptionResolver = testingModule.get<ParcelDescriptionResolver>(
      ParcelDescriptionResolver,
    );
    parcelDescriptionService = testingModule.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the site subdivision service with the expected parameters.', async () => {
    const siteId = 123;
    const page = 1;
    const pageSize = 10;
    const searchParam = 'searchParam';
    const sortBy = 'sortBy';
    const sortByDir = 'sortByDir';
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
      false,
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
    );
  });

  it('returns the result provided by the parcel description service.', async () => {
    const siteId = 123;
    const page = 1;
    const pageSize = 10;
    const searchParam = 'searchParam';
    const sortBy = 'sortBy';
    const sortByDir = 'sortByDir';
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
        false,
      );
    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
