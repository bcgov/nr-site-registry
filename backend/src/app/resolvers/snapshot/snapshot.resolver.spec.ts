import { SnapshotsService } from '../../services/snapshot/snapshot.service';
import { SnapshotsResolver } from './snapshot.resolver';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateSnapshotDto, SnapshotResponse } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { sampleSites } from '../../mockData/site.mockData';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { BannerTypeResponse } from '../../dto/response/bannerTypeResponse';
import { LoggerService } from '../../logger/logger.service';

describe('SnapshotResolver', () => {
  let resolver: SnapshotsResolver;
  let service: SnapshotsService;
  let genericResponseProvider: GenericResponseProvider<Snapshots[]>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsResolver,
        {
          provide: SnapshotsService,
          useValue: {
            getSnapshots: jest.fn(),
            getSnapshotsByUserId: jest.fn(),
            getSnapshotsBySiteId: jest.fn(),
            getSnapshotsById: jest.fn(),
            createSnapshotForSites: jest.fn(),
            getBannerType: jest.fn(),
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
                data: Snapshots[],
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
    resolver = module.get<SnapshotsResolver>(SnapshotsResolver);
    loggerService = module.get<LoggerService>(LoggerService);
    service = module.get<SnapshotsService>(SnapshotsService);
    genericResponseProvider = module.get<GenericResponseProvider<Snapshots[]>>(
      GenericResponseProvider,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be define', () => {
    expect(resolver).toBeDefined();
  });

  describe('getSnapshots', () => {
    const res: Snapshots[] = [
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '1',
        whenCreated: new Date(),
        whoCreated: 'ABC',
        whenUpdated: new Date(),
        whoUpdated: 'ABC',
        site: sampleSites[0],
        snapshotData: {
          sitesSummary: sampleSites[0],
          documents: null,
          events: null,
          eventsParticipants: null,
          landHistories: null,
          profiles: null,
          siteAssociations: null,
          subDivisions: null,
          siteParticipants: [
            {
              id: '1',
              siteId: 'site123',
              psnorgId: 'org1',
              effectiveDate: new Date('2023-01-01'),
              endDate: null,
              note: 'Note 1',
              whenCreated: new Date(),
              whoCreated: 'ABC',
              whenUpdated: new Date(),
              whoUpdated: 'ABC',
              rwmFlag: 1,
              rwmNoteFlag: 1,
              psnorg: null,
              site: sampleSites[0],
              siteProfileOwners: null,
              siteProfiles: null,
              siteProfiles2: null,
              siteProfiles3: null,
              siteProfiles4: null,
              siteParticRoles: [
                {
                  prCode: 'PR001',
                  spId: '1',
                  whenCreated: new Date(),
                  whoCreated: 'ABC',
                  whenUpdated: new Date(),
                  whoUpdated: 'ABC',
                  rwmFlag: 1,
                  sp: null,
                  id: 'hhh-jjj-lll',
                  userAction: 'pending',
                  srAction: 'pending',
                  prCode2: {
                    code: 'ABC',
                    description: 'Desc',
                    siteParticRoles: null,
                  },
                },
              ],
              userAction: '',
              srAction: '',
            },
          ],
        },
      },
    ];

    it('should return snapshots', async () => {
      const expectedResult: SnapshotResponse = {
        message: 'Snapshot fetched successfully.',
        httpStatusCode: 200,
        success: true,
        data: res,
      };

      jest.spyOn(service, 'getSnapshots').mockResolvedValueOnce(res);

      const result = await resolver.getSnapshots();
      expect(result).toEqual(expectedResult);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const mockResponse: SnapshotResponse = {
        message: 'Snapshot not found.',
        httpStatusCode: 404,
        success: false,
        data: null,
      };
      jest.spyOn(service, 'getSnapshots').mockResolvedValueOnce([]);

      const result = await resolver.getSnapshots();

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSnapshotsByUserId', () => {
    const res: Snapshots[] = [
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '1',
        whenCreated: new Date(),
        whoCreated: 'ABC',
        whenUpdated: new Date(),
        whoUpdated: 'ABC',
        site: sampleSites[0],
        snapshotData: {
          sitesSummary: sampleSites[0],
          documents: null,
          events: null,
          eventsParticipants: null,
          landHistories: null,
          profiles: null,
          siteAssociations: null,
          subDivisions: null,
          siteParticipants: [
            {
              id: '1',
              siteId: 'site123',
              psnorgId: 'org1',
              effectiveDate: new Date('2023-01-01'),
              endDate: null,
              note: 'Note 1',
              whenCreated: new Date(),
              whoCreated: 'ABC',
              whenUpdated: new Date(),
              whoUpdated: 'ABC',
              rwmFlag: 1,
              rwmNoteFlag: 1,
              psnorg: null,
              site: sampleSites[0],
              siteProfileOwners: null,
              siteProfiles: null,
              siteProfiles2: null,
              siteProfiles3: null,
              siteProfiles4: null,
              siteParticRoles: [
                {
                  prCode: 'PR001',
                  spId: '1',
                  whenCreated: new Date(),
                  whoCreated: 'ABC',
                  whenUpdated: new Date(),
                  whoUpdated: 'ABC',
                  rwmFlag: 1,
                  sp: null,
                  id: 'hhh-jjj-lll',
                  userAction: 'pending',
                  srAction: 'pending',
                  prCode2: {
                    code: 'ABC',
                    description: 'Desc',
                    siteParticRoles: null,
                  },
                },
              ],
              userAction: '',
              srAction: '',
            },
          ],
        },
      },
    ];

    it('should return a success response with HTTP status 200', async () => {
      const userId = '1';
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 200,
        success: true,
        message: 'Snapshot fetched successfully.',
        data: res,
      };
      jest
        .spyOn(service, 'getSnapshotsByUserId')
        .mockResolvedValueOnce(mockResponse.data);

      const result = await resolver.getSnapshotsByUserId(userId);

      expect(result).toEqual(mockResponse);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const userId = '1';
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 404,
        success: false,
        message: `Snapshot not found for user id: ${userId}`,
        data: null,
      };
      jest.spyOn(service, 'getSnapshotsByUserId').mockResolvedValueOnce(null);

      const result = await resolver.getSnapshotsByUserId(userId);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('getSnapshotsBySiteId', () => {
    const res: Snapshots[] = [
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '1',
        whenCreated: new Date(),
        whoCreated: 'ABC',
        whenUpdated: new Date(),
        whoUpdated: 'ABC',
        site: sampleSites[0],
        snapshotData: {
          sitesSummary: sampleSites[0],
          documents: null,
          events: null,
          eventsParticipants: null,
          landHistories: null,
          profiles: null,
          siteAssociations: null,
          subDivisions: null,
          siteParticipants: [
            {
              id: '1',
              siteId: 'site123',
              psnorgId: 'org1',
              effectiveDate: new Date('2023-01-01'),
              endDate: null,
              note: 'Note 1',
              whenCreated: new Date(),
              whoCreated: 'ABC',
              whenUpdated: new Date(),
              whoUpdated: 'ABC',
              rwmFlag: 1,
              rwmNoteFlag: 1,
              psnorg: null,
              site: sampleSites[0],
              siteProfileOwners: null,
              siteProfiles: null,
              siteProfiles2: null,
              siteProfiles3: null,
              siteProfiles4: null,
              siteParticRoles: [
                {
                  prCode: 'PR001',
                  spId: '1',
                  id: 'hhh-jjj-lll',
                  userAction: 'pending',
                  srAction: 'pending',
                  whenCreated: new Date(),
                  whoCreated: 'ABC',
                  whenUpdated: new Date(),
                  whoUpdated: 'ABC',
                  rwmFlag: 1,
                  sp: null,
                  prCode2: {
                    code: 'ABC',
                    description: 'Desc',
                    siteParticRoles: null,
                  },
                },
              ],
              userAction: '',
              srAction: '',
            },
          ],
        },
      },
    ];

    it('should return a success response with HTTP status 200', async () => {
      const userId = '1';
      const siteId = '1';
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 200,
        success: true,
        message: 'Snapshot fetched successfully.',
        data: res,
      };
      jest
        .spyOn(service, 'getSnapshotsBySiteId')
        .mockResolvedValueOnce(mockResponse.data);

      const result = await resolver.getSnapshotsBySiteId(siteId, userId);

      expect(result).toEqual(mockResponse);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const userId = '1';
      const siteId = '1';
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 404,
        success: false,
        message: `Snapshot not found for site id ${siteId}`,
        data: null,
      };
      jest.spyOn(service, 'getSnapshotsBySiteId').mockResolvedValueOnce(null);

      const result = await resolver.getSnapshotsBySiteId(siteId, userId);

      expect(result).toEqual(mockResponse);
    });
  });
  describe('getSnapshotsById', () => {
    const res: Snapshots[] = [
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '1',
        whenCreated: new Date(),
        whoCreated: 'ABC',
        whenUpdated: new Date(),
        whoUpdated: 'ABC',
        site: sampleSites[0],
        snapshotData: {
          sitesSummary: sampleSites[0],
          documents: null,
          events: null,
          eventsParticipants: null,
          landHistories: null,
          profiles: null,
          siteAssociations: null,
          subDivisions: null,
          siteParticipants: [
            {
              id: '1',
              siteId: 'site123',
              psnorgId: 'org1',
              effectiveDate: new Date('2023-01-01'),
              endDate: null,
              note: 'Note 1',
              whenCreated: new Date(),
              whoCreated: 'ABC',
              whenUpdated: new Date(),
              whoUpdated: 'ABC',
              rwmFlag: 1,
              rwmNoteFlag: 1,
              psnorg: null,
              site: sampleSites[0],
              siteProfileOwners: null,
              siteProfiles: null,
              siteProfiles2: null,
              siteProfiles3: null,
              siteProfiles4: null,
              siteParticRoles: [
                {
                  prCode: 'PR001',
                  spId: '1',
                  id: 'hhh-jjj-lll',
                  userAction: 'pending',
                  srAction: 'pending',
                  whenCreated: new Date(),
                  whoCreated: 'ABC',
                  whenUpdated: new Date(),
                  whoUpdated: 'ABC',
                  rwmFlag: 1,
                  sp: null,
                  prCode2: {
                    code: 'ABC',
                    description: 'Desc',
                    siteParticRoles: null,
                  },
                },
              ],
              userAction: '',
              srAction: '',
            },
          ],
        },
      },
    ];

    it('should return a success response with HTTP status 200', async () => {
      const id = 1;
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 200,
        success: true,
        message: 'Snapshot fetched successfully.',
        data: res,
      };
      jest
        .spyOn(service, 'getSnapshotsById')
        .mockResolvedValueOnce(mockResponse.data);

      const result = await resolver.getSnapshotsById(id);

      expect(result).toEqual(mockResponse);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const id = 0;
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 404,
        success: false,
        message: `Snapshot not found for snapshot id: ${id}`,
        data: null,
      };
      jest.spyOn(service, 'getSnapshotsById').mockResolvedValueOnce(null);

      const result = await resolver.getSnapshotsById(id);

      expect(result).toEqual(mockResponse);
    });
  });

  describe('createSnapshot', () => {
    it('should return a success response with HTTP status 201', async () => {
      const snapshotDto: CreateSnapshotDto = {
        siteId: '1',
      };
      const expectedResult = true;
      jest
        .spyOn(service, 'createSnapshotForSites')
        .mockResolvedValueOnce(expectedResult);

      const result = await resolver.createSnapshotForSites([snapshotDto], '');

      expect(result.message).toEqual('Successfully created snapshots.');
      expect(result.httpStatusCode).toEqual(201);
    });

    it('should return a bad request response with HTTP status 400', async () => {
      const snapshotDto: CreateSnapshotDto = {
        siteId: '1',
      };

      jest.spyOn(service, 'createSnapshotForSites').mockResolvedValueOnce(null);

      const result = await resolver.createSnapshotForSites([snapshotDto], '');

      expect(result.httpStatusCode).toEqual(201);
    });
  });

  describe('getBannerType', () => {
    const bannerType = {
      bannerType: 'banner type',
    };
    it('should return a success response with HTTP status 200', async () => {
      const userId = '1';
      const siteId = '1';
      const mockResponse: BannerTypeResponse = {
        httpStatusCode: 200,
        message: 'Banner type fetched successfully',
        data: bannerType,
      };
      jest
        .spyOn(service, 'getBannerType')
        .mockResolvedValueOnce(bannerType.bannerType);
      const result = await resolver.getBannerType(siteId, userId);
      expect(result).toEqual(mockResponse);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const userId = '1';
      const siteId = '1';
      const mockResponse: BannerTypeResponse = {
        httpStatusCode: 404,
        message: `Failed to determine banner type for site id ${siteId}`,
        data: null,
      };
      jest.spyOn(service, 'getSnapshotsBySiteId').mockResolvedValueOnce(null);

      const result = await resolver.getBannerType(siteId, userId);

      expect(result).toEqual(mockResponse);
    });
  });
});
