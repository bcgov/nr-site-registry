import { SnapshotsService } from '../../services/snapshot/snapshot.service';
import { SnapshotsResolver } from './snapshot.resolver';
import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotResponse } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { sampleSites } from '../../mockData/site.mockData';
import { SnapshotDto } from '../../dto/snapshot.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';

describe('SnapshotResolver', () => {
  let resolver: SnapshotsResolver;
  let service: SnapshotsService;
  let genericResponseProvider: GenericResponseProvider<Snapshots[]>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsResolver,
        {
          provide: SnapshotsService,
          useValue: {
            getSnapshots: jest.fn(),
            getSnapshotsByUserId: jest.fn(),
            getSnapshotsById: jest.fn(),
            createSnapshot: jest.fn(),
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
        created: new Date(),
        updated: new Date(),
        snapshotData: {
          city: 'Surrey',
          siteId: '5',
          userId: '1',
          address: '123 ABC',
          participants: [
            {
              name: 'Brandon',
              department: 'EPD',
            },
            {
              name: 'Jackie',
              department: 'EPD',
            },
          ],
          generalDescription: 'Testing new api',
        },
        site: sampleSites[0],
      },
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '2',
        created: new Date(),
        updated: new Date(),
        snapshotData: {
          city: 'Surrey',
          siteId: '5',
          userId: '1',
          address: '123 ABC',
          participants: [
            {
              name: 'Brandon',
              department: 'EPD',
            },
            {
              name: 'Jackie',
              department: 'EPD',
            },
          ],
          generalDescription: 'Testing new api',
        },
        site: sampleSites[0],
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
        created: new Date(),
        updated: new Date(),
        snapshotData: {
          city: 'Surrey',
          siteId: '5',
          userId: '1',
          address: '123 ABC',
          participants: [
            {
              name: 'Brandon',
              department: 'EPD',
            },
            {
              name: 'Jackie',
              department: 'EPD',
            },
          ],
          generalDescription: 'Testing new api',
        },
        site: sampleSites[0],
      },
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '2',
        created: new Date(),
        updated: new Date(),
        snapshotData: {
          city: 'Surrey',
          siteId: '5',
          userId: '1',
          address: '123 ABC',
          participants: [
            {
              name: 'Brandon',
              department: 'EPD',
            },
            {
              name: 'Jackie',
              department: 'EPD',
            },
          ],
          generalDescription: 'Testing new api',
        },
        site: sampleSites[0],
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

  describe('getSnapshotsById', () => {
    const res: Snapshots[] = [
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '1',
        created: new Date(),
        updated: new Date(),
        snapshotData: {
          city: 'Surrey',
          siteId: '5',
          userId: '1',
          address: '123 ABC',
          participants: [
            {
              name: 'Brandon',
              department: 'EPD',
            },
            {
              name: 'Jackie',
              department: 'EPD',
            },
          ],
          generalDescription: 'Testing new api',
        },
        site: sampleSites[0],
      },
      {
        id: 1,
        userId: '1',
        siteId: '1',
        transactionId: '2',
        created: new Date(),
        updated: new Date(),
        snapshotData: {
          city: 'Surrey',
          siteId: '5',
          userId: '1',
          address: '123 ABC',
          participants: [
            {
              name: 'Brandon',
              department: 'EPD',
            },
            {
              name: 'Jackie',
              department: 'EPD',
            },
          ],
          generalDescription: 'Testing new api',
        },
        site: sampleSites[0],
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
      const snapshotDto: SnapshotDto = {
        userId: '1',
        siteId: '1',
        transactionId: '3',
        snapshotData: {
          userId: '1',
          siteId: '5',
          address: '123 ABC',
          city: 'Surrey',
          generalDescription: 'Testing new api',
          participants: [
            { name: 'Brandon', department: 'EPD' },
            { name: 'Jackie', department: 'EPD' },
          ],
        },
      };
      const expectedResult = 'Record is inserted successfully.';
      jest
        .spyOn(service, 'createSnapshot')
        .mockResolvedValueOnce(expectedResult);

      const result = await resolver.createSnapshot(snapshotDto);

      expect(result.message).toEqual(expectedResult);
      expect(result.httpStatusCode).toEqual(201);
    });

    it('should return a bad request response with HTTP status 400', async () => {
      const snapshotDto: SnapshotDto = {
        userId: '1',
        siteId: '1',
        transactionId: '3',
        snapshotData: {
          userId: '1',
          siteId: '5',
          address: '123 ABC',
          city: 'Surrey',
          generalDescription: 'Testing new api',
          participants: [
            { name: 'Brandon', department: 'EPD' },
            { name: 'Jackie', department: 'EPD' },
          ],
        },
      };

      jest.spyOn(service, 'createSnapshot').mockResolvedValueOnce(null);

      const result = await resolver.createSnapshot(snapshotDto);
      expect(result.httpStatusCode).toEqual(400);
      expect(result.message).toEqual('Snapshot failed to insert.');
    });
  });
});
