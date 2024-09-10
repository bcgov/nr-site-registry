import { Test, TestingModule } from '@nestjs/testing';
import { ParcelDescriptionsService } from '../../services/parcelDescriptions/parcelDescriptions.service';
import { ParcelDescriptionResolver } from './parcelDescription.resolver';
import { ParcelDescriptionsResponse } from '../../dto/response/parcelDescriptionsResponse';
import { ParcelDescriptionsServiceResult } from 'src/app/services/parcelDescriptions/parcelDescriptions.service.types';
import { ParcelDescriptionDto } from '../../dto/parcelDescription.dto';

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
    parcelDescriptionsServiceResult.mockReturnValue({
      data: [],
      count: 0,
      page: 0,
      pageSize: 0,
      success: true,
      message: 'Success',
    } as ParcelDescriptionsServiceResult);

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

  describe('When the service response is a success', () => {
    it('returns a successful response', async () => {
      let siteId = 123;
      let page = 1;
      let pageSize = 10;
      let searchParam = 'searchParam';
      let sortBy = 'sortBy';
      let sortByDir = 'sortByDir';
      let parcelDescription = new ParcelDescriptionDto(
        1,
        'Parcel ID',
        '123456',
        new Date(),
        'description',
      );
      parcelDescriptionsServiceResult.mockReturnValue({
        data: [parcelDescription],
        count: 1,
        page: 1,
        pageSize: 10,
        success: true,
        message: 'Success',
      } as ParcelDescriptionsServiceResult);
      let expectedResponse = new ParcelDescriptionsResponse();
      expectedResponse.data = [parcelDescription];
      expectedResponse.count = 1;
      expectedResponse.page = 1;
      expectedResponse.pageSize = 10;
      expectedResponse.success = true;
      expectedResponse.message = 'Success';

      let response =
        await parcelDescriptionResolver.getParcelDescriptionsBySiteId(
          siteId,
          page,
          pageSize,
          searchParam,
          sortBy,
          sortByDir,
        );
      expect(response).toEqual(
        expect.objectContaining({
          data: expectedResponse.data,
          count: expectedResponse.count,
          page: expectedResponse.page,
          pageSize: expectedResponse.pageSize,
          success: expectedResponse.success,
          message: expectedResponse.message,
          httpStatusCode: 200,
        }),
      );
    });
  });

  describe('When the service response is a failure', () => {
    it('returns a failure response', async () => {
      let siteId = 123;
      let page = 1;
      let pageSize = 10;
      let searchParam = 'searchParam';
      let sortBy = 'sortBy';
      let sortByDir = 'sortByDir';
      parcelDescriptionsServiceResult.mockReturnValue({
        data: [],
        count: 0,
        page: 0,
        pageSize: 0,
        success: false,
        message: 'There was an error',
      } as ParcelDescriptionsServiceResult);
      let expectedResponse = new ParcelDescriptionsResponse();
      expectedResponse.data = [];
      expectedResponse.count = 0;
      expectedResponse.page = 0;
      expectedResponse.pageSize = 0;
      expectedResponse.success = false;
      expectedResponse.message = 'There was an error';

      let response =
        await parcelDescriptionResolver.getParcelDescriptionsBySiteId(
          siteId,
          page,
          pageSize,
          searchParam,
          sortBy,
          sortByDir,
        );
      expect(response).toEqual(
        expect.objectContaining({
          data: expectedResponse.data,
          count: expectedResponse.count,
          page: expectedResponse.page,
          pageSize: expectedResponse.pageSize,
          success: expectedResponse.success,
          message: expectedResponse.message,
          httpStatusCode: 500,
        }),
      );
    });
  });
});
