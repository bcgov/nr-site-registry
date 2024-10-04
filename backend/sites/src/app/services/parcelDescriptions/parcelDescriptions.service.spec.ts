import { EntityManager } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ParcelDescriptionsService } from './parcelDescriptions.service';
import {
  getExternalUserQueries,
  getInternalUserQueries,
} from './parcelDescriptions.queryBuilder';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { LoggerService } from '../../logger/logger.service';

jest.mock('./parcelDescriptions.queryBuilder');

describe('SiteSubdivisionsService', () => {
  let siteSubdivisionService: ParcelDescriptionsService;
  let entityManager: EntityManager;
  let snapshotsService: SnapshotsService;
  let loggerService: LoggerService;
  let queryMock: jest.Mock;
  let getMostRecentSnapshotMock: jest.Mock;
  let getInternalUserQueriesMock: jest.Mock;
  let getExternalUserQueriesMock: jest.Mock;
  let logMock: jest.Mock;
  let debugMock: jest.Mock;
  let errorMock: jest.Mock;

  let siteId: number;
  let page: number;
  let pageSize: number;
  let searchParam: string;
  let sortBy: string;
  let sortByDir: string;
  let user: any;
  let showPending: false;

  let queryText: string;
  let queryParams: string[];
  let countQueryText: string;
  let countQueryParams: string[];

  let returnCount: number;
  let returnId: number;
  let returnDescriptionType: string;
  let returnIdPinNumber: string;
  let returnDateNoted: string;
  let returnLandDescription: string;

  let returnSuccess: boolean;

  beforeEach(async () => {
    siteId = 123;
    page = 1;
    pageSize = 10;
    searchParam = 'searchParam';
    sortBy = 'date_noted';
    sortByDir = 'DESC';
    user = {
      sub: '1',
      identity_provider: 'idir',
    };

    queryText = 'query';
    queryParams = ['queryParam1', 'queryParam2', 'queryParam3', 'queryParam4'];
    countQueryText = 'countQuery';
    countQueryParams = ['countQueryParam1', 'countQueryParam2'];

    returnCount = 1;
    returnId = 1;
    returnDescriptionType = 'Parcel Id';
    returnIdPinNumber = '123456';
    returnDateNoted = '2024-08-07T00:00:00.000Z';
    returnLandDescription = 'A parcel of land';

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
        {
          provide: SnapshotsService,
          useValue: {
            getMostRecentSnapshot: jest.fn(),
          },
        },
        {
          provide: LoggerService,
          useValue: {
            log: jest.fn(),
            debug: jest.fn(),
            error: jest.fn(),
          },
        },
      ],
    }).compile();

    siteSubdivisionService = testingModule.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
    entityManager = testingModule.get<EntityManager>(EntityManager);
    snapshotsService = testingModule.get<SnapshotsService>(SnapshotsService);
    loggerService = testingModule.get<LoggerService>(LoggerService);

    getInternalUserQueriesMock = jest
      .mocked(getInternalUserQueries)
      .mockReturnValue([
        queryText,
        queryParams,
        countQueryText,
        countQueryParams,
      ]);
    getExternalUserQueriesMock = jest
      .mocked(getExternalUserQueries)
      .mockReturnValue([
        queryText,
        queryParams,
        countQueryText,
        countQueryParams,
      ]);
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

    getMostRecentSnapshotMock = jest.fn().mockReturnValue({
      snapshotData: {
        subDivisions: [{ siteSubdivId: 1 }],
      },
    });
    snapshotsService.getMostRecentSnapshot = getMostRecentSnapshotMock;

    logMock = jest.fn();
    debugMock = jest.fn();
    errorMock = jest.fn();
    loggerService.log = logMock;
    loggerService.debug = debugMock;
    loggerService.error = errorMock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('when the user is an internal user', () => {
    beforeEach(async () => {
      user = {
        sub: '1',
        identity_provider: 'idir',
      };
    });

    describe('when everything is correct.', () => {
      it('Logs the call to the function', async () => {
        await siteSubdivisionService.getParcelDescriptionsBySiteId(
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
        expect(debugMock).toHaveBeenCalled();
      });

      it('Runs a count query.', async () => {
        await siteSubdivisionService.getParcelDescriptionsBySiteId(
          siteId,
          page,
          pageSize,
          searchParam,
          sortBy,
          sortByDir,
          showPending,
          user,
        );

        expect(getInternalUserQueriesMock).toHaveBeenCalled();
        expect(queryMock).toHaveBeenCalledTimes(2);
        expect(queryMock).toHaveBeenNthCalledWith(
          1,
          countQueryText,
          countQueryParams,
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
          showPending,
          user,
        );

        expect(getInternalUserQueriesMock).toHaveBeenCalled();
        expect(queryMock).toHaveBeenCalledTimes(2);
        expect(queryMock).toHaveBeenNthCalledWith(2, queryText, queryParams);
      });

      it('returns the correct results.', async () => {
        let response =
          await siteSubdivisionService.getParcelDescriptionsBySiteId(
            siteId,
            page,
            pageSize,
            searchParam,
            sortBy,
            sortByDir,
            showPending,
            user,
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
  });

  describe('when the user is an external user', () => {
    beforeEach(async () => {
      user = {
        sub: '1',
        identity_provider: 'bceid',
      };
    });

    describe('when everything is correct.', () => {
      it('Logs the call to the function', async () => {
        await siteSubdivisionService.getParcelDescriptionsBySiteId(
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
        expect(debugMock).toHaveBeenCalled();
      });

      it('Runs a count query.', async () => {
        await siteSubdivisionService.getParcelDescriptionsBySiteId(
          siteId,
          page,
          pageSize,
          searchParam,
          sortBy,
          sortByDir,
          showPending,
          user,
        );

        expect(getMostRecentSnapshotMock).toHaveBeenCalled();
        expect(getExternalUserQueriesMock).toHaveBeenCalled();
        expect(queryMock).toHaveBeenCalledTimes(2);
        expect(queryMock).toHaveBeenNthCalledWith(
          1,
          countQueryText,
          countQueryParams,
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
          showPending,
          user,
        );

        expect(getMostRecentSnapshotMock).toHaveBeenCalled();
        expect(getExternalUserQueriesMock).toHaveBeenCalled();
        expect(queryMock).toHaveBeenCalledTimes(2);
        expect(queryMock).toHaveBeenNthCalledWith(2, queryText, queryParams);
      });

      it('Returns the correct results.', async () => {
        let response =
          await siteSubdivisionService.getParcelDescriptionsBySiteId(
            siteId,
            page,
            pageSize,
            searchParam,
            sortBy,
            sortByDir,
            showPending,
            user,
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

    describe('When there is not snapshot data for the user', () => {
      beforeEach(async () => {
        getMostRecentSnapshotMock.mockReturnValue(null);
      });

      it('Returns an empty response', async () => {
        let response =
          await siteSubdivisionService.getParcelDescriptionsBySiteId(
            siteId,
            page,
            pageSize,
            searchParam,
            sortBy,
            sortByDir,
            showPending,
            user,
          );

        expect(response).toEqual(
          expect.objectContaining({
            data: [],
            httpStatusCode: 200,
            count: 0,
            page: 0,
            pageSize: 0,
            success: true,
            message: 'Parcel Descriptions fetched successfully.',
          }),
        );
      });
    });
  });

  describe('when the database throws an exception', () => {
    beforeEach(async () => {
      queryMock = jest.fn().mockImplementation(() => {
        throw new Error('A bad thing happened!');
      });

      entityManager.query = queryMock;
    });

    it('Logs the error', async () => {
      await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
        showPending,
        user,
      );

      expect(errorMock).toHaveBeenCalled();
    });

    it('Produces the correct result', async () => {
      let response = await siteSubdivisionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
        showPending,
        user,
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
