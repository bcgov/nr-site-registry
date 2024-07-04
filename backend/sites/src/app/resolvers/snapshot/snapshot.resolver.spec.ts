import { SnapshotsService } from '../../services/snapshot/snapshot.service';
import { SnapshotsResolver } from './snapshot.resolver';
import { Test, TestingModule } from '@nestjs/testing';
import { SnapshotResponse } from '../../dto/response/genericResponse';
import { Snapshots } from '../../entities/snapshots.entity';
import { sampleSites } from '../../mockData/site.mockData';
import { SnapshotDto } from '../../dto/snapshot.dto';

describe('SnapshotResolver', () => {
  let resolver: SnapshotsResolver;
  let service: SnapshotsService;

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
      ],
    }).compile();
    resolver = module.get<SnapshotsResolver>(SnapshotsResolver);
    service = module.get<SnapshotsService>(SnapshotsService);
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
        httpStatusCode: 200,
        message: 'Success',
        data: res,
      };

      jest
        .spyOn(service, 'getSnapshots')
        .mockResolvedValueOnce(expectedResult.data);

      const result = await resolver.getSnapshots();

      expect(result).toEqual(expectedResult);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 404,
        message: 'Data not found.',
        data: null,
      };
      jest.spyOn(service, 'getSnapshots').mockResolvedValueOnce(null);

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
        message: 'Success',
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
        message: `Data not found for user id: ${userId}`,
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
        message: 'Success',
        data: res,
      };
      jest
        .spyOn(service, 'getSnapshotsById')
        .mockResolvedValueOnce(mockResponse.data);

      const result = await resolver.getSnapshotsById(id);

      expect(result).toEqual(mockResponse);
    });

    it('should return a not found response with HTTP status 404', async () => {
      const id = 1;
      const mockResponse: SnapshotResponse = {
        httpStatusCode: 404,
        message: `Data not found for snapshot id: ${id}`,
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
      const expectedResult = 'Snapshot created successfully';
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
      expect(result.message).toEqual('Bad Request.');
    });
  });
});
