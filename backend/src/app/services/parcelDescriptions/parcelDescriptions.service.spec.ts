import { EntityManager, InsertResult, Repository } from 'typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import { ParcelDescriptionsService } from './parcelDescriptions.service';
import {
  getExternalUserQueries,
  getInternalUserQueries,
} from './parcelDescriptions.queryBuilder';
import { SnapshotsService } from '../snapshot/snapshot.service';
import { LoggerService } from '../../logger/logger.service';
import { ParcelDescriptionInputDTO } from '../../dto/parcelDescriptionInput.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { ParcelDescriptionType } from '../../dto/parcelDescription.dto';
import { BadRequestException } from '@nestjs/common';

jest.useFakeTimers();
jest.mock('./parcelDescriptions.queryBuilder');

describe('ParcelDescriptionsService', () => {
  let parcelDescriptionsService: ParcelDescriptionsService;
  let entityManager: EntityManager;
  let snapshotsService: SnapshotsService;
  let loggerService: LoggerService;

  let logMock: jest.Mock;
  let debugMock: jest.Mock;
  let errorMock: jest.Mock;

  beforeEach(async () => {
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
          provide: getRepositoryToken(Subdivisions),
          useClass: Repository,
        },
        {
          provide: getRepositoryToken(SiteSubdivisions),
          useClass: Repository,
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

    parcelDescriptionsService = testingModule.get<ParcelDescriptionsService>(
      ParcelDescriptionsService,
    );
    entityManager = testingModule.get<EntityManager>(EntityManager);
    snapshotsService = testingModule.get<SnapshotsService>(SnapshotsService);
    loggerService = testingModule.get<LoggerService>(LoggerService);

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

  describe('getParcelDescriptionsBySiteId', () => {
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
    let returnUserAction: string;
    let returnSrAction: string;

    let returnSuccess: boolean;

    let queryMock: jest.Mock;
    let getMostRecentSnapshotMock: jest.Mock;
    let getInternalUserQueriesMock: jest.Mock;
    let getExternalUserQueriesMock: jest.Mock;

    beforeEach(async () => {
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
            user_action: returnUserAction,
            sr_action: returnSrAction,
          },
        ]);
      entityManager.query = queryMock;

      getMostRecentSnapshotMock = jest.fn().mockReturnValue({
        snapshotData: {
          subDivisions: [{ siteSubdivId: 1 }],
        },
      });
      snapshotsService.getMostRecentSnapshot = getMostRecentSnapshotMock;

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
      queryParams = [
        'queryParam1',
        'queryParam2',
        'queryParam3',
        'queryParam4',
      ];
      countQueryText = 'countQuery';
      countQueryParams = ['countQueryParam1', 'countQueryParam2'];

      returnCount = 1;
      returnId = 1;
      returnDescriptionType = 'Parcel Id';
      returnIdPinNumber = '123456';
      returnDateNoted = '2024-08-07T00:00:00.000Z';
      returnLandDescription = 'A parcel of land';
      returnUserAction = 'updated';
      returnSrAction = 'approved'; // I don't actually know if this is a real-world value it could assume.

      returnSuccess = true;
    });

    describe('when the user is an internal user', () => {
      beforeEach(async () => {
        user = {
          sub: '1',
          identity_provider: 'idir',
        };
      });

      it('Logs the call to the function', async () => {
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
          await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
                userAction: returnUserAction,
                srAction: returnSrAction,
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

    describe('when the user is an external user', () => {
      beforeEach(async () => {
        user = {
          sub: '1',
          identity_provider: 'bceid',
        };
      });

      it('Logs the call to the function', async () => {
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
          await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
                userAction: returnUserAction,
                srAction: returnSrAction,
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

      describe('When there is no snapshot data for the user', () => {
        beforeEach(async () => {
          getMostRecentSnapshotMock.mockReturnValue(null);
        });

        it('Returns an empty response', async () => {
          let response =
            await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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

      it('Produces the correct response', async () => {
        let response =
          await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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

    describe('when the user is invalid', () => {
      beforeEach(async () => {
        user = {
          sub: '',
          identity_provider: '',
        };
      });

      it('Logs the error', async () => {
        await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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

      it('Produces the correct response.', async () => {
        let response =
          await parcelDescriptionsService.getParcelDescriptionsBySiteId(
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
            message: 'User id is invalid.',
          }),
        );
      });
    });
  });

  describe('saveParcelDescriptionsForSite', () => {
    let idForUpdatedParcelDescription: string;
    let idForAddedParcelDescription: string;
    let idForDeletedParcelDescription: string;

    let parcelDescriptionToUpdate: ParcelDescriptionInputDTO;
    let parcelDescriptionToAdd: ParcelDescriptionInputDTO;
    let parcelDescriptionToDelete: ParcelDescriptionInputDTO;
    let siteId: string;
    let inputParcelDescriptions: ParcelDescriptionInputDTO[];
    let userInfo: any;

    let updateParcelDescriptionsForSiteMock: jest.Mock;
    let addParcelDescriptionsForSiteMock: jest.Mock;
    let deleteParcelDescriptionsForSiteMock: jest.Mock;

    let transactionalEntityManager: EntityManager;

    beforeEach(async () => {
      idForUpdatedParcelDescription = '1';
      idForAddedParcelDescription = '2';
      idForDeletedParcelDescription = '3';

      parcelDescriptionToUpdate = {
        id: idForUpdatedParcelDescription,
        descriptionType: ParcelDescriptionType.CrownLandPIN,
        idPinNumber: '123456',
        dateNoted: new Date(),
        landDescription: 'should be ignored',
        srAction: 'approved',
        userAction: 'approved',
        apiAction: 'updated',
      };
      parcelDescriptionToAdd = {
        id: idForAddedParcelDescription,
        descriptionType: ParcelDescriptionType.CrownLandPIN,
        idPinNumber: '654321',
        dateNoted: new Date(),
        landDescription: 'should be ignored',
        srAction: 'pending',
        userAction: 'pending',
        apiAction: 'added',
      };
      parcelDescriptionToDelete = {
        id: idForDeletedParcelDescription,
        descriptionType: ParcelDescriptionType.CrownLandPIN,
        idPinNumber: '162534',
        dateNoted: new Date(),
        landDescription: 'should be ignored',
        srAction: 'pending',
        userAction: 'pending',
        apiAction: 'deleted',
      };

      siteId = '100';
      inputParcelDescriptions = [
        parcelDescriptionToUpdate,
        parcelDescriptionToAdd,
        parcelDescriptionToDelete,
      ];
      userInfo = { givenName: 'testUser' };

      updateParcelDescriptionsForSiteMock = jest.fn();
      addParcelDescriptionsForSiteMock = jest.fn();
      deleteParcelDescriptionsForSiteMock = jest.fn();

      // Reusing the injected entity manager as the passed-in entity manager
      // isn't strictly accurate, but it makes the mocking process much easier.
      transactionalEntityManager = entityManager;

      parcelDescriptionsService._updateParcelDescriptionsForSite =
        updateParcelDescriptionsForSiteMock;
      parcelDescriptionsService._addParcelDescriptionsForSite =
        addParcelDescriptionsForSiteMock;
      parcelDescriptionsService._deleteParcelDescriptionsForSite =
        deleteParcelDescriptionsForSiteMock;
    });

    it('logs the call to saveParcelDescriptionsForSite', async () => {
      await parcelDescriptionsService.saveParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(logMock).toHaveBeenCalledWith(
        'parcelDescriptionService.saveParcelDescriptionsForSite() start',
      );
      expect(debugMock).toHaveBeenCalledWith(
        'parcelDescriptionService.saveParcelDescriptionsForSite() start',
      );
      expect(logMock).toHaveBeenCalledWith(
        'parcelDescriptionService.saveParcelDescriptionsForSite() end',
      );
      expect(debugMock).toHaveBeenCalledWith(
        'parcelDescriptionService.saveParcelDescriptionsForSite() end',
      );
    });

    it('calls updateParcelDescriptionsForSite with the correct input', async () => {
      await parcelDescriptionsService.saveParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(updateParcelDescriptionsForSiteMock).toHaveBeenCalledWith(
        siteId,
        expect.arrayContaining([
          expect.objectContaining({
            id: idForUpdatedParcelDescription,
          }),
        ]),
        userInfo,
        transactionalEntityManager,
      );
    });

    it('calls addParcelDescriptionsForSite with the correct input', async () => {
      await parcelDescriptionsService.saveParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(addParcelDescriptionsForSiteMock).toHaveBeenCalledWith(
        siteId,
        expect.arrayContaining([
          expect.objectContaining({
            id: idForAddedParcelDescription,
          }),
        ]),
        userInfo,
        transactionalEntityManager,
      );
    });

    it('calls deleteParcelDescriptionsForSite with the correct input', async () => {
      await parcelDescriptionsService.saveParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(deleteParcelDescriptionsForSiteMock).toHaveBeenCalledWith(
        siteId,
        expect.arrayContaining([
          expect.objectContaining({
            id: idForDeletedParcelDescription,
          }),
        ]),
        transactionalEntityManager,
      );
    });

    describe('when there is no parcel description to update', () => {
      beforeEach(() => {
        inputParcelDescriptions = [
          parcelDescriptionToAdd,
          parcelDescriptionToDelete,
        ];
      });

      it('does not call updateParcelDescriptionsForSite', async () => {
        await parcelDescriptionsService.saveParcelDescriptionsForSite(
          siteId,
          inputParcelDescriptions,
          userInfo,
          transactionalEntityManager,
        );

        expect(updateParcelDescriptionsForSiteMock).not.toHaveBeenCalled();
      });
    });

    describe('when there is no parcel description to add', () => {
      beforeEach(() => {
        inputParcelDescriptions = [
          parcelDescriptionToUpdate,
          parcelDescriptionToDelete,
        ];
      });

      it('does not call updateParcelDescriptionsForSite', async () => {
        await parcelDescriptionsService.saveParcelDescriptionsForSite(
          siteId,
          inputParcelDescriptions,
          userInfo,
          transactionalEntityManager,
        );

        expect(addParcelDescriptionsForSiteMock).not.toHaveBeenCalled();
      });
    });

    describe('when there is no parcel description to delete', () => {
      beforeEach(() => {
        inputParcelDescriptions = [
          parcelDescriptionToAdd,
          parcelDescriptionToUpdate,
        ];
      });

      it('does not call updateParcelDescriptionsForSite', async () => {
        await parcelDescriptionsService.saveParcelDescriptionsForSite(
          siteId,
          inputParcelDescriptions,
          userInfo,
          transactionalEntityManager,
        );

        expect(deleteParcelDescriptionsForSiteMock).not.toHaveBeenCalled();
      });
    });
  });

  describe('_addParcelDescriptionsForSite', () => {
    let today: Date;

    let siteId: string;
    let inputParcelDescriptions: ParcelDescriptionInputDTO[];
    let userInfo: any;

    let subdivId: string;
    let siteSubdivId: string;

    let addedSubdivision: any;
    let addedSiteSubdivision: any;

    let subdivisionInsertResult: InsertResult;
    let siteSubdivisionInsertResult: InsertResult;

    let createQueryBuilderMock: jest.Mock;
    let queryBuilderInsertMock: jest.Mock;
    let queryBuilderIntoMock: jest.Mock;
    let queryBuilderValuesMock: jest.Mock;
    let queryBuilderReturningMock: jest.Mock;
    let queryBuilderExecuteMock: jest.Mock;

    let insertMock: jest.Mock;

    let transactionalEntityManager: EntityManager;

    beforeEach(() => {
      today = new Date();

      siteId = '10';
      inputParcelDescriptions = [
        {
          id: '1',
          descriptionType: ParcelDescriptionType.CrownLandPIN,
          idPinNumber: '123456',
          dateNoted: today,
          landDescription: 'should be ignored',
          srAction: 'pending',
          userAction: 'pending',
          apiAction: 'added',
        },
      ];
      userInfo = { givenName: 'test' };

      subdivId = '1';
      siteSubdivId = '100';

      addedSubdivision = {
        srAction: 'pending',
        userAction: 'pending',
        dateNoted: today,
        pin: '123456',
        pid: null,
        whoCreated: 'test',
        whoUpdated: 'test',
        crownLandsFileNo: null,
        pidStatusCd: 'N',
      };
      addedSiteSubdivision = {
        srAction: 'pending',
        userAction: 'pending',
        siteId: siteId,
        subdivId: subdivId,
        dateNoted: today,
        initialIndicator: 'N',
        whoCreated: 'test',
        whoUpdated: 'test',
        sendToSr: 'Y',
      };

      // The main point of these returns is to get the properties from the
      // inserted objects.
      subdivisionInsertResult = {
        identifiers: [], // Value is disregarded.
        generatedMaps: [{ id: subdivId, ...addedSubdivision }],
        raw: {}, // Value is disregarded.
      };
      siteSubdivisionInsertResult = {
        identifiers: [], // Value is disregarded.
        generatedMaps: [
          { siteSubdivId: siteSubdivId, ...addedSiteSubdivision },
        ],
        raw: {}, // Value is disregarded.
      };

      queryBuilderInsertMock = jest.fn().mockReturnThis();
      queryBuilderIntoMock = jest.fn().mockReturnThis();
      queryBuilderValuesMock = jest.fn().mockReturnThis();
      queryBuilderReturningMock = jest.fn().mockReturnThis();
      queryBuilderExecuteMock = jest
        .fn()
        .mockResolvedValue(subdivisionInsertResult);
      createQueryBuilderMock = jest.fn().mockImplementation(() => {
        return {
          insert: queryBuilderInsertMock,
          into: queryBuilderIntoMock,
          values: queryBuilderValuesMock,
          returning: queryBuilderReturningMock,
          execute: queryBuilderExecuteMock,
        };
      });

      insertMock = jest.fn().mockResolvedValue(siteSubdivisionInsertResult);

      // Reusing the injected entity manager as the passed-in entity manager
      // isn't strictly accurate, but it makes the mocking process much easier.
      transactionalEntityManager = entityManager;
      transactionalEntityManager.createQueryBuilder = createQueryBuilderMock;
      transactionalEntityManager.insert = insertMock;
    });

    it('logs the call to addParcelDescriptionsForSite', async () => {
      await parcelDescriptionsService._addParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(logMock).toHaveBeenCalledWith(
        'parcelDescriptionService.addParcelDescriptionsForSite() start',
      );
      expect(debugMock).toHaveBeenCalledWith(
        'parcelDescriptionService.addParcelDescriptionsForSite() start',
      );
      expect(logMock).toHaveBeenCalledWith(
        'parcelDescriptionService.addParcelDescriptionsForSite() end',
      );
      expect(debugMock).toHaveBeenCalledWith(
        'parcelDescriptionService.addParcelDescriptionsForSite() end',
      );
    });

    it('inserts the expected subdivision into the database', async () => {
      await parcelDescriptionsService._addParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );
      expect(createQueryBuilderMock).toHaveBeenCalled();
      expect(queryBuilderInsertMock).toHaveBeenCalled();
      expect(queryBuilderIntoMock).toHaveBeenCalledWith(Subdivisions);
      expect(queryBuilderValuesMock).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining(addedSubdivision)]),
      );
      expect(queryBuilderReturningMock).toHaveBeenCalledWith('*');
      expect(queryBuilderExecuteMock).toHaveBeenCalled();
    });

    it('inserts the expected site subdivision into the database', async () => {
      await parcelDescriptionsService._addParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );
      expect(insertMock).toHaveBeenCalledWith(
        SiteSubdivisions,
        expect.arrayContaining([expect.objectContaining(addedSiteSubdivision)]),
      );
    });

    describe('when the subdivision fails to insert', () => {
      beforeEach(() => {
        queryBuilderExecuteMock = jest.fn().mockImplementation(() => {
          throw new Error('A bad thing happened!');
        });
        createQueryBuilderMock = jest.fn().mockImplementation(() => {
          return {
            insert: queryBuilderInsertMock,
            into: queryBuilderIntoMock,
            values: queryBuilderValuesMock,
            returning: queryBuilderReturningMock,
            execute: queryBuilderExecuteMock,
          };
        });
      });

      it('logs and throws the error', async () => {
        expect(async () => {
          await parcelDescriptionsService._addParcelDescriptionsForSite(
            siteId,
            inputParcelDescriptions,
            userInfo,
            transactionalEntityManager,
          );
        }).rejects.toThrow(BadRequestException);

        // Need to wait for the above block to reject before testing the logging
        // mock.
        await jest.runAllTimersAsync();
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(
          'Exception occured in parcelDescriptionService.addParcelDescriptionsForSite() end',
          expect.anything(),
        );
      });
    });

    describe('when the sitesubdivision fails to insert', () => {
      beforeEach(() => {
        insertMock = jest.fn().mockImplementation(() => {
          throw new Error('A bad thing happened!');
        });
        transactionalEntityManager.insert = insertMock;
      });

      it('logs and throws the error', async () => {
        expect(async () => {
          await parcelDescriptionsService._addParcelDescriptionsForSite(
            siteId,
            inputParcelDescriptions,
            userInfo,
            transactionalEntityManager,
          );
        }).rejects.toThrow(BadRequestException);

        // Need to wait for the above block to reject before testing the logging
        // mock.
        await jest.runAllTimersAsync();
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(
          'Exception occured in parcelDescriptionService.addParcelDescriptionsForSite() end',
          expect.anything(),
        );
      });
    });
  });

  describe('updateParcelDescriptionsForSite', () => {
    let today: Date;
    let yesterday: Date;

    let inputParcelDescriptions: ParcelDescriptionInputDTO[];
    let siteId: string;
    let userInfo: any;

    let subdivisionFindByResult: Subdivisions[];
    let subdivisionSaveResult: Subdivisions[];

    let siteSubdivisionFindByResult: SiteSubdivisions[];
    let siteSubdivisionSaveResult: SiteSubdivisions[];

    let databaseSubdivision: Subdivisions;
    let databaseSiteSubdivision: SiteSubdivisions;

    let updatedSubdivision: any;
    let updatedSiteSubdivision: any;

    let findByMock: jest.Mock;
    let saveMock: jest.Mock;

    let transactionalEntityManager: EntityManager;

    beforeEach(() => {
      today = new Date();
      yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      siteId = '10';
      inputParcelDescriptions = [
        {
          id: '1',
          descriptionType: ParcelDescriptionType.CrownLandPIN,
          idPinNumber: '654321',
          dateNoted: today,
          landDescription: 'should be ignored',
          srAction: 'approved',
          userAction: 'approved',
          apiAction: 'updated',
        },
      ];
      userInfo = { givenName: 'test' };
      databaseSubdivision = {
        srAction: 'pending',
        userAction: 'pending',
        id: '1',
        dateNoted: new Date(),
        pin: null,
        pid: '123456',
        bcaaFolioNumber: null,
        entityType: null,
        addrLine_1: 'test addr',
        addrLine_2: null,
        addrLine_3: null,
        addrLine_4: null,
        city: 'Anyton',
        postalCode: 'H0H0H0',
        legalDescription: 'Land Description',
        whoCreated: 'employee of the month',
        whoUpdated: 'employee of the month',
        whenCreated: yesterday,
        whenUpdated: yesterday,
        crownLandsFileNo: null,
        pidStatusCd: 'N',
        validPid: null,
        siteSubdivisions: [databaseSiteSubdivision],
      };
      databaseSiteSubdivision = {
        srAction: 'pending',
        userAction: 'pending',
        siteId: '10',
        subdivId: '1',
        dateNoted: new Date(),
        initialIndicator: 'N',
        whoCreated: 'employee of the month',
        whoUpdated: 'employee of the month',
        whenCreated: yesterday,
        whenUpdated: yesterday,
        sprofDateCompleted: null,
        siteSubdivId: '100',
        sendToSr: 'Y',
        site: null,
        subdivision: databaseSubdivision,
      };
      subdivisionSaveResult = []; // This is never checked or used.
      siteSubdivisionSaveResult = [];
      subdivisionFindByResult = [databaseSubdivision];
      siteSubdivisionFindByResult = [databaseSiteSubdivision];

      // The whenUpdated is tested separately because there isn't a good jest
      // matcher to test a date property.
      updatedSubdivision = {
        srAction: 'approved',
        userAction: 'approved',
        id: '1',
        dateNoted: today,
        pin: '654321',
        pid: null,
        bcaaFolioNumber: null,
        entityType: null,
        addrLine_1: 'test addr',
        addrLine_2: null,
        addrLine_3: null,
        addrLine_4: null,
        city: 'Anyton',
        postalCode: 'H0H0H0',
        legalDescription: 'Land Description',
        whoCreated: 'employee of the month',
        whoUpdated: 'test',
        whenCreated: yesterday,
        crownLandsFileNo: null,
        pidStatusCd: 'N',
        validPid: null,
      };
      updatedSiteSubdivision = {
        srAction: 'approved',
        userAction: 'approved',
        siteId: '10',
        subdivId: '1',
        dateNoted: today,
        initialIndicator: 'N',
        whoCreated: 'employee of the month',
        whoUpdated: 'test',
        whenCreated: yesterday,
        sprofDateCompleted: null,
        siteSubdivId: '100',
        sendToSr: 'Y',
        site: null,
        subdivision: databaseSubdivision,
      };

      findByMock = jest
        .fn()
        .mockResolvedValueOnce(subdivisionFindByResult)
        .mockResolvedValueOnce(siteSubdivisionFindByResult);
      saveMock = jest
        .fn()
        .mockResolvedValueOnce(subdivisionSaveResult)
        .mockResolvedValueOnce(siteSubdivisionSaveResult);

      // Reusing the injected entity manager as the passed-in entity manager
      // isn't strictly accurate, but it makes the mocking process much easier.
      transactionalEntityManager = entityManager;

      transactionalEntityManager.save = saveMock;
      transactionalEntityManager.findBy = findByMock;
    });

    it('logs the call to updateParcelDescriptionsForSite', async () => {
      await parcelDescriptionsService._updateParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(logMock).toHaveBeenCalledWith(
        'parcelDescriptionService.updateParcelDescriptionsForSite() start',
      );
      expect(debugMock).toHaveBeenCalledWith(
        'parcelDescriptionService.updateParcelDescriptionsForSite() start',
      );
      expect(logMock).toHaveBeenCalledWith(
        'parcelDescriptionService.updateParcelDescriptionsForSite() end',
      );
      expect(debugMock).toHaveBeenCalledWith(
        'parcelDescriptionService.updateParcelDescriptionsForSite() end',
      );
    });

    it('saves an updated subdivision to the database.', async () => {
      await parcelDescriptionsService._updateParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(saveMock).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining(updatedSubdivision)]),
      );
      let whenupdated: Date = saveMock.mock.calls[0][0][0].whenUpdated;
      expect(whenupdated.getTime()).toBeGreaterThan(yesterday.getTime());
    });

    it('saves the updated site subdivision to the database.', async () => {
      await parcelDescriptionsService._updateParcelDescriptionsForSite(
        siteId,
        inputParcelDescriptions,
        userInfo,
        transactionalEntityManager,
      );

      expect(saveMock).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining(updatedSiteSubdivision),
        ]),
      );
      let whenupdated: Date = saveMock.mock.calls[0][0][0].whenUpdated;
      expect(whenupdated.getTime()).toBeGreaterThan(yesterday.getTime());
    });

    describe('when the subdivision to update does not exist', () => {
      beforeEach(() => {
        findByMock = jest.fn().mockResolvedValue([]);
        transactionalEntityManager.findBy = findByMock;
      });

      it('throws an exception and logs the error', async () => {
        expect(async () => {
          await parcelDescriptionsService._updateParcelDescriptionsForSite(
            siteId,
            inputParcelDescriptions,
            userInfo,
            transactionalEntityManager,
          );
        }).rejects.toThrow(BadRequestException);

        // Need to wait for the above block to reject before testing the logging
        // mock.
        await jest.runAllTimersAsync();
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(
          'Exception occured in parcelDescriptionService.updateParcelDescriptionsForSite() end',
          expect.anything(),
        );
      });
    });

    describe('when the subdivision fails to save', () => {
      beforeEach(() => {
        saveMock = jest.fn().mockImplementation(() => {
          throw new Error('A bad thing happened!');
        });
        transactionalEntityManager.save = saveMock;
      });

      it('logs and throws the error', async () => {
        expect(async () => {
          await parcelDescriptionsService._updateParcelDescriptionsForSite(
            siteId,
            inputParcelDescriptions,
            userInfo,
            transactionalEntityManager,
          );
        }).rejects.toThrow(BadRequestException);

        // Need to wait for the above block to reject before testing the logging
        // mock.
        await jest.runAllTimersAsync();
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(
          'Exception occured in parcelDescriptionService.updateParcelDescriptionsForSite() end',
          expect.anything(),
        );
      });
    });

    describe('when the site subdivision fails to save', () => {
      beforeEach(() => {
        // This is a cheap and hacky way to make it throw an exception on the
        // second run.
        let siteSubdivisionRun = false;
        saveMock = jest.fn().mockImplementation(() => {
          if (siteSubdivisionRun === false) {
            // subdivision save is run first.
            siteSubdivisionRun = true;
          } else {
            // throw the error on the second run.
            throw new Error('A bad thing happened!');
          }
        });
        transactionalEntityManager.save = saveMock;
      });

      it('logs and throws the error', async () => {
        expect(async () => {
          await parcelDescriptionsService._updateParcelDescriptionsForSite(
            siteId,
            inputParcelDescriptions,
            userInfo,
            transactionalEntityManager,
          );
        }).rejects.toThrow(BadRequestException);

        // Need to wait for the above block to reject before testing the logging
        // mock.
        await jest.runAllTimersAsync();
        expect(errorMock).toHaveBeenCalledTimes(1);
        expect(errorMock).toHaveBeenCalledWith(
          'Exception occured in parcelDescriptionService.updateParcelDescriptionsForSite() end',
          expect.anything(),
        );
      });
    });
  });
});
