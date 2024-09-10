import { EntityManager, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ParcelDescriptionsService } from './parcelDescriptions.service';

describe('SiteSubdivisionsService', () => {
  let siteSubdivisionService: ParcelDescriptionsService;
  let entityManager: EntityManager;
  let queryMock: jest.Mock;

  let siteId: number;
  let page: number;
  let pageSize: number;
  let searchParam: string;
  let sortBy: string;
  let sortByDir: string;

  let returnCount: number;
  let returnId: number;
  let returnDescriptionType: string;
  let returnIdPinNumber: string;
  let returnDateNoted: string;
  let returnLandDescription: string;

  let returnHttpStatusCode: number;
  let returnSuccess: boolean;

  beforeEach(async () => {
    siteId = 123;
    page = 1;
    pageSize = 10;
    searchParam = 'searchParam';
    sortBy = 'date_noted';
    sortByDir = 'DESC';

    returnCount = 1;
    returnId = 1;
    returnDescriptionType = 'Parcel Id';
    returnIdPinNumber = '123456';
    returnDateNoted = '2024-08-07T00:00:00.000Z';
    returnLandDescription = 'A parcel of land';

    returnHttpStatusCode = 200;
    returnSuccess = true;

    const testingModule: TestingModule = await Test.createTestingModule({
      providers: [
        ParcelDescriptionsService,
        {
          provide: EntityManager,
          useValue: {
            query: jest.fn(),
          },
        },
      ],
    }).compile();

    siteSubdivisionService = testingModule.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
    entityManager = testingModule.get<EntityManager>(EntityManager);

    queryMock = jest
      .fn()
      .mockReturnValueOnce([{ count: returnCount }])
      .mockReturnValueOnce([
        {
          id: returnId,
          description_type: returnDescriptionType,
          id_pin_number: returnIdPinNumber,
          date_noted: returnDateNoted,
          land_description: returnLandDescription,
        },
      ]);

    entityManager.query = queryMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when everything is correct.', () => {
    it('Runs a count query.', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        expect.stringMatching(/.*COUNT.*/),
        expect.anything(),
      );
    });

    it('Does not sort the count query.', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        expect.stringMatching(/.*(?!OFFSET).*/),
        expect.anything(),
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        expect.stringMatching(/.*(?!LIMIT).*/),
        expect.anything(),
      );
    });

    it('Does not page the count query.', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        expect.stringMatching(/.*(?!OFFSET).*/),
        expect.anything(),
      );
    });

    it('Passes in the site id and search param for the count query.', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.arrayContaining([String(siteId)]),
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        1,
        expect.anything(),
        expect.arrayContaining([searchParam]),
      );
    });

    it('Makes the main query to the database.', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/.*(?!COUNT).*/),
        expect.anything(),
      );
    });

    it('Sorts the main query', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(
          new RegExp(`ORDER BY parcel_descriptions.${sortBy} ${sortByDir}`),
        ),
        expect.anything(),
      );
    });

    it('Pages the main query', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/.*OFFSET.*/),
        expect.anything(),
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(/.*LIMIT.*/),
        expect.anything(),
      );
    });

    it('Passes the site id, search param, and paging paramters to the main query', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.arrayContaining([String(siteId)]),
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.arrayContaining([searchParam]),
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.arrayContaining([String((page - 1) * pageSize)]),
      );
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.anything(),
        expect.arrayContaining([String(pageSize)]),
      );
    });

    it('returns the correct results.', async () => {
      let response = await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(response).toEqual(
        expect.objectContaining({
          data: expect.arrayContaining([
            expect.objectContaining({
              id: returnId,
              descriptionType: returnDescriptionType,
              idPinNumber: returnIdPinNumber,
              dateNoted: new Date(returnDateNoted),
              landDescription: returnLandDescription,
            }),
          ]),
          count: returnCount,
          page: page,
          pageSize: pageSize,
          success: returnSuccess,
          httpStatusCode: 200,
          message: 'Parcel Descriptions fetched successfully.',
        }),
      );
    });
  });

  describe('when the sortParam is invalid', () => {
    it('defaults to sorting by id', async () => {
      sortBy = 'invalid_parameter';

      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(
          new RegExp(`ORDER BY parcel_descriptions.id ${sortByDir}`),
        ),
        expect.anything(),
      );
    });
  });

  describe('when the sortDir is invalid', () => {
    it('defaults to ascending', async () => {
      sortByDir = 'turnwise';

      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(queryMock).toHaveBeenCalledTimes(2);
      expect(queryMock).toHaveBeenNthCalledWith(
        2,
        expect.stringMatching(
          new RegExp(`ORDER BY parcel_descriptions.${sortBy} ASC`),
        ),
        expect.anything(),
      );
    });
  });

  describe('when the database throws an exception', () => {
    beforeEach(async () => {
      queryMock = jest.fn().mockImplementation(() => {
        throw new Error('A bad thing happened!');
      });

      entityManager.query = queryMock;
    });

    it('produces the correct result', async () => {
      let response = await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

      expect(response).toEqual(
        expect.objectContaining({
          data: [],
          httpStatusCode: 500,
          count: 0,
          page: 0,
          pageSize: 0,
          success: false,
          message:
            'There was an error communicating with the database. Try again later.',
        }),
      );
    });
  });
});
