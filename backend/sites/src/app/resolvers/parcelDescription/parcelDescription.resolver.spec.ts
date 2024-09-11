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
    let siteId = 123;
    let page = 1;
    let pageSize = 10;
    let searchParam = 'searchParam';
    let sortBy = 'sortBy';
    let sortByDir = 'sortByDir';
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
    let siteId = 123;
    let page = 1;
    let pageSize = 10;
    let searchParam = 'searchParam';
    let sortBy = 'sortBy';
    let sortByDir = 'sortByDir';
    let expectedResponse = new GenericPagedResponse<ParcelDescriptionDto[]>();
    parcelDescriptionsServiceResult.mockReturnValue(expectedResponse);

    let response =
      await parcelDescriptionResolver.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );
    expect(response).toEqual(expect.objectContaining(expectedResponse));
  });
});
