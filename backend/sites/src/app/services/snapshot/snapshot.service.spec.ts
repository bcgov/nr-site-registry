import { DeepPartial, Repository } from 'typeorm';
import { SnapshotsService } from './snapshot.service';
import { Snapshots } from '../../entities/snapshots.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { sampleSites } from '../../mockData/site.mockData';
import { CreateSnapshotDto } from '../../dto/snapshot.dto';
import { Sites } from '../../entities/sites.entity';
import { Events } from '../../entities/events.entity';
import { EventPartics } from '../../entities/eventPartics.entity';
import { SitePartics } from '../../entities/sitePartics.entity';
import { SiteDocs } from '../../entities/siteDocs.entity';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { LandHistories } from '../../entities/landHistories.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { SnapshotSiteContent } from '../../dto/snapshotSiteContent';

describe('SnapshotService', () => {
  let service: SnapshotsService;
  let snapshotRepository: Repository<Snapshots>;
  let sitesRepository: Repository<Sites>;
  let eventsRepository: Repository<Events>;
  let eventParticsRepository: Repository<EventPartics>;
  let siteParticsRepository: Repository<SitePartics>;
  let siteDocsRepository: Repository<SiteDocs>;
  let siteAssocsRepository: Repository<SiteAssocs>;
  let landHistoriesRepository: Repository<LandHistories>;
  let siteSubdivisionsRepository: Repository<SiteSubdivisions>;
  let siteProfilesRepository: Repository<SiteProfiles>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SnapshotsService,
        {
          provide: getRepositoryToken(Snapshots),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(Sites),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(Events),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(EventPartics),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SitePartics),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteDocs),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteAssocs),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(LandHistories),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteSubdivisions),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
        {
          provide: getRepositoryToken(SiteProfiles),
          useValue: {
            findOne: jest.fn(() => {
              return { id: '123', commonName: 'victoria' };
            }),
            find: jest.fn(() => {
              return [
                { id: '123', commonName: 'victoria' },
                { id: '121', commonName: 'duncan' },
                { id: '222', commonName: 'vancouver' },
              ];
            }),
            count: jest.fn(),
            save: jest.fn(),
            // Add other methods if necessary
          },
        },
      ],
    }).compile();

    service = module.get<SnapshotsService>(SnapshotsService);
    snapshotRepository = module.get<Repository<Snapshots>>(
      getRepositoryToken(Snapshots),
    );
    sitesRepository = module.get<Repository<Sites>>(getRepositoryToken(Sites));
    eventsRepository = module.get<Repository<Events>>(
      getRepositoryToken(Events),
    );
    eventParticsRepository = module.get<Repository<EventPartics>>(
      getRepositoryToken(EventPartics),
    );
    siteParticsRepository = module.get<Repository<SitePartics>>(
      getRepositoryToken(SitePartics),
    );
    siteDocsRepository = module.get<Repository<SiteDocs>>(
      getRepositoryToken(SiteDocs),
    );
    siteAssocsRepository = module.get<Repository<SiteAssocs>>(
      getRepositoryToken(SiteAssocs),
    );
    landHistoriesRepository = module.get<Repository<LandHistories>>(
      getRepositoryToken(LandHistories),
    );
    siteSubdivisionsRepository = module.get<Repository<SiteSubdivisions>>(
      getRepositoryToken(SiteSubdivisions),
    );
    siteProfilesRepository = module.get<Repository<SiteProfiles>>(
      getRepositoryToken(SiteProfiles),
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
                eventPartics: null,
                psnorg: null,
                site: sampleSites[0],
                siteDocPartics: null,
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
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
              },
            ],
          },
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
                eventPartics: null,
                psnorg: null,
                site: sampleSites[0],
                siteDocPartics: null,
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
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
              },
            ],
          },
        },
      ];
      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);
      const snapshot = await service.getSnapshotsByUserId(userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({
        where: { userId },
        order: { whenCreated: 'DESC' },
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
                eventPartics: null,
                psnorg: null,
                site: sampleSites[0],
                siteDocPartics: null,
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
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
              },
            ],
          },
        },
      ];
      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);
      const snapshot = await service.getSnapshotsBySiteId(siteId, userId);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({
        where: { siteId, userId },
        order: { whenCreated: 'DESC' },
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

      await expect(
        service.getSnapshotsBySiteId(siteId, userId),
      ).rejects.toThrow('Failed to retrieve snapshots by userId and siteId.');
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
                eventPartics: null,
                psnorg: null,
                site: sampleSites[0],
                siteDocPartics: null,
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
                    prCode2: {
                      code: 'ABC',
                      description: 'Desc',
                      siteParticRoles: null,
                    },
                  },
                ],
              },
            ],
          },
        },
      ];

      jest
        .spyOn(snapshotRepository, 'find')
        .mockResolvedValueOnce(res as Snapshots[]);

      const snapshot = await service.getSnapshotsById(id);

      expect(snapshot).toEqual(res);
      expect(snapshotRepository.find).toHaveBeenCalledTimes(1);
      expect(snapshotRepository.find).toHaveBeenCalledWith({ where: { id } });
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
      const snapshotDto: CreateSnapshotDto[] = [{ siteId: '1' }];
      const userInfo = { sub: 'userId', givenName: 'UserName' };
      const snapshotEntity = [
        {
          id: 1,
          userId: 'userId',
          siteId: '1',
          transactionId: '1',
          whenCreated: new Date(),
          whoCreated: 'UserName',
          whenUpdated: new Date(),
          whoUpdated: 'UserName',
          site: {},
          snapshotData: new SnapshotSiteContent(),
        },
      ];

      jest.spyOn(sitesRepository, 'findOne').mockResolvedValue({} as any);
      jest.spyOn(eventsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(eventParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(landHistoriesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteProfilesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteSubdivisionsRepository, 'find').mockResolvedValue([]);
      jest
        .spyOn(snapshotRepository, 'save')
        .mockResolvedValue(snapshotEntity as any);

      const result = await service.createSnapshotForSites(
        snapshotDto,
        userInfo,
      );
      expect(result).toBe(true);
    });

    it('should throw an error if repository throws an error', async () => {
      const snapshotDto: CreateSnapshotDto = {
        siteId: '1',
      };

      // Mock the repository methods
      jest
        .spyOn(snapshotRepository, 'save')
        .mockRejectedValueOnce(new Error('Failed to insert snapshot.'));
      jest.spyOn(sitesRepository, 'findOne').mockResolvedValue(null); // Mock the findOne method for Sites repository
      jest.spyOn(snapshotRepository, 'findOne').mockResolvedValue(null);
      jest.spyOn(sitesRepository, 'findOne').mockResolvedValue(sampleSites[0]);
      jest.spyOn(eventsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteAssocsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(eventParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteParticsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteDocsRepository, 'find').mockResolvedValue([]);
      jest.spyOn(landHistoriesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteProfilesRepository, 'find').mockResolvedValue([]);
      jest.spyOn(siteSubdivisionsRepository, 'find').mockResolvedValue([]);

      await expect(
        service.createSnapshotForSites([snapshotDto], ''),
      ).rejects.toThrow('Failed to insert snapshot.');
      expect(snapshotRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});
