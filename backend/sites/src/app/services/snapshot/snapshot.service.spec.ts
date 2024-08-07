import { Repository } from 'typeorm';
import { SnapshotsService } from './snapshot.service';
import { Snapshots } from '../../entities/snapshots.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { sampleSites } from '../../mockData/site.mockData';
import { SnapshotDto } from '../../dto/snapshot.dto';
import { plainToClass } from 'class-transformer';

describe('SnapshotService', () => {
  let service: SnapshotsService;
  let snapshotRepository: Repository<Snapshots>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsService,
        {
          provide: getRepositoryToken(Snapshots),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<SnapshotsService>(SnapshotsService);
    snapshotRepository = module.get<Repository<Snapshots>>(
      getRepositoryToken(Snapshots),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSnapshots', () => {
    it('should return an array of snapshots', async () => {
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

      jest.spyOn(snapshotRepository, 'find').mockResolvedValueOnce(res);

      const result = await service.getSnapshots();
      expect(result).toEqual(res);
    });

    it('should throw an error if repository throws an error', async () => {
      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(new Error('Failed to retrieve snapshots.'));
      await expect(service.getSnapshots()).rejects.toThrow(
        'Failed to retrieve snapshots.',
      );
    });
  });

  describe('getSnapshotsByUserId', () => {
    it('should return an array of snapshots for a given userId', async () => {
      const userId = '1';
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
      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);
      const snapshot = await service.getSnapshotsByUserId(userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({
        where: { userId },  order: { created: 'DESC' },
      });
    });

    it('should throw an error if repository throws an error', async () => {
      const userId = '1';

      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(
          new Error('Failed to retrieve snapshots by userId.'),
        );

      await expect(service.getSnapshotsByUserId(userId)).rejects.toThrow(
        'Failed to retrieve snapshots by userId.',
      );
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSnapshotsByUserIdAndSiteId', () => {
    it('should return an array of snapshots for a given userId and siteId', async () => {
      const userId = '1';
      const siteId = '1';
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
      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);
      const snapshot = await service.getSnapshotsByUserIdAndSiteId(siteId, userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({
        where: { siteId, userId },
        order: { created: 'DESC' },
      });
    });

    it('should throw an error if repository throws an error', async () => {
      const userId = '1';
      const siteId = '1';
      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(
          new Error('Failed to retrieve snapshots by userId and siteId.'),
        );

      await expect(service.getSnapshotsByUserIdAndSiteId(siteId, userId)).rejects.toThrow(
        'Failed to retrieve snapshots by userId and siteId.',
      );
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSnapshotsById', () => {
    it('should return an array of snapshots for a given id', async () => {
      const id = 1;
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

      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);

      const snapshot = await service.getSnapshotsById(id);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({ where: { id }});
    });

    it('should throw an error if repository throws an error', async () => {
      const id = 1;
      jest
        .spyOn(snapshotRepository, 'find')
        .mockRejectedValueOnce(new Error('Database connection error'));

      await expect(service.getSnapshotsById(id)).rejects.toThrow(
        'Database connection error',
      );
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
    });
  });

  describe('createSnapshot', () => {
    it('should create a snapshot successfully', async () => {
      const snapshotDto: SnapshotDto = {
        userId: '1',
        siteId: '1',
        transactionId: '3',
        created: new Date(),
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
      // Mock recentViewsRepository methods
      jest.spyOn(snapshotRepository, 'find').mockResolvedValue(null);
      jest.spyOn(snapshotRepository, 'count').mockResolvedValue(0);
      jest
        .spyOn(snapshotRepository, 'save')
        .mockResolvedValueOnce({} as Snapshots); // Mock save method

      // Execute the method
      const result = await service.createSnapshot(snapshotDto);

      // Assert the result
      expect(result).toBe('Record is inserted successfully.');
      expect(snapshotRepository.save).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(snapshotDto),
      );
    });

    it('should throw an error if repository throws an error', async () => {
      const snapshotDto: SnapshotDto = {
        userId: '1',
        siteId: '1',
        transactionId: '3',
        created: new Date(),
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
      const snapshotEntity = plainToClass(Snapshots, snapshotDto);
      jest
        .spyOn(snapshotRepository, 'save')
        .mockRejectedValueOnce(new Error('Failed to insert snapshot.'));

      await expect(service.createSnapshot(snapshotDto)).rejects.toThrow(
        'Failed to insert snapshot.',
      );
      expect(snapshotRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
