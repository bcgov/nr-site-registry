import { LTSAService } from './ltsa.service';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { LtoDownload } from '../../entities/ltoDownload.entity';
import { LtoPrevDownload } from '../../entities/ltoPrevDownload.entity';
import { SiteSubdivisions } from '../../entities/siteSubdivisions.entity';
import { LoggerService } from '../../logger/logger.service';

// Define proper mock types for repositories
type MockRepository<T> = Partial<Repository<T>> & {
  createQueryBuilder: jest.MockedFunction<() => Partial<SelectQueryBuilder<T>>>;
  findOne: jest.MockedFunction<Repository<T>['findOne']>;
  create: jest.MockedFunction<Repository<T>['create']>;
  save: jest.MockedFunction<Repository<T>['save']>;
  update: jest.MockedFunction<Repository<T>['update']>;
  find: jest.MockedFunction<Repository<T>['find']>;
  clear: jest.MockedFunction<Repository<T>['clear']>;
  manager: {
    createQueryBuilder: jest.MockedFunction<
      () => Partial<SelectQueryBuilder<T>>
    >;
  };
};

describe('LTSAService', () => {
  let service: LTSAService;
  let subdivisionsRepository: MockRepository<Subdivisions>;
  let ltoDownloadRepository: MockRepository<LtoDownload>;
  let ltoPrevDownloadRepository: MockRepository<LtoPrevDownload>;
  let siteSubdivisionsRepository: MockRepository<SiteSubdivisions>;
  let loggerService: LoggerService;

  // Mock data
  const mockSubdivision: Subdivisions = {
    id: '1',
    dateNoted: new Date('2024-01-01'),
    pid: '000000001',
    pidStatusCd: 'A',
    legalDescription: 'Test Legal Description',
    validPid: 'Y',
    whoCreated: 'LTO-LOAD',
    whenCreated: new Date('2024-01-01'),
    pin: null,
    bcaaFolioNumber: null,
    entityType: null,
    addrLine_1: null,
    addrLine_2: null,
    addrLine_3: null,
    addrLine_4: null,
    city: null,
    postalCode: null,
    whoUpdated: null,
    whenUpdated: null,
    crownLandsFileNo: null,
    userAction: null,
    srAction: null,
    siteSubdivisions: [],
  };

  const mockLtoDownload: LtoDownload = {
    id: 1,
    pid: '000000001',
    pidStatusCd: 'A',
    legalDescription: 'Test Legal Description',
    childPid: '000000002',
    childPidStatusCd: 'A',
    childLegalDescription: 'Child Legal Description',
  };

  const mockLtoPrevDownload: LtoPrevDownload = {
    id: 1,
    pid: '000000001',
    pidStatusCd: 'A',
    legalDescription: 'Test Legal Description',
    childPid: '000000002',
    childPidStatusCd: 'A',
    childLegalDescription: 'Child Legal Description',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LTSAService,
        {
          provide: getRepositoryToken(Subdivisions),
          useValue: {
            createQueryBuilder: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            manager: {
              createQueryBuilder: jest.fn(),
            },
          },
        },
        {
          provide: getRepositoryToken(LtoDownload),
          useValue: {
            createQueryBuilder: jest.fn(),
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            clear: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(LtoPrevDownload),
          useValue: {
            createQueryBuilder: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            clear: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(SiteSubdivisions),
          useValue: {
            find: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
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
      ],
    }).compile();

    service = module.get<LTSAService>(LTSAService);
    subdivisionsRepository = module.get<MockRepository<Subdivisions>>(
      getRepositoryToken(Subdivisions),
    );
    ltoDownloadRepository = module.get<MockRepository<LtoDownload>>(
      getRepositoryToken(LtoDownload),
    );
    ltoPrevDownloadRepository = module.get<MockRepository<LtoPrevDownload>>(
      getRepositoryToken(LtoPrevDownload),
    );
    siteSubdivisionsRepository = module.get<MockRepository<SiteSubdivisions>>(
      getRepositoryToken(SiteSubdivisions),
    );
    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should have all required repositories injected', () => {
      expect(subdivisionsRepository).toBeDefined();
      expect(ltoDownloadRepository).toBeDefined();
      expect(ltoPrevDownloadRepository).toBeDefined();
      expect(siteSubdivisionsRepository).toBeDefined();
      expect(loggerService).toBeDefined();
    });
  });

  describe('getSubdivisionsPids', () => {
    beforeEach(() => {
      // Mock the createQueryBuilder chain
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getRawMany: jest
          .fn()
          .mockResolvedValue([{ pidno: '000000001' }, { pidno: '000000002' }]),
      };

      subdivisionsRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      subdivisionsRepository.manager.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
    });

    it('should return subdivisions PIDs for type 1', async () => {
      const result = await service.getSubdivisionsPids(1);

      expect(result).toEqual([{ pidno: '000000001' }, { pidno: '000000002' }]);
      expect(loggerService.log).toHaveBeenCalledWith(
        'LTSAService.getSubdivisionsPids() start - type: 1',
      );
    });

    it('should return subdivisions PIDs for type 2', async () => {
      const result = await service.getSubdivisionsPids(2);

      expect(result).toEqual([{ pidno: '000000001' }, { pidno: '000000002' }]);
      expect(loggerService.log).toHaveBeenCalledWith(
        'LTSAService.getSubdivisionsPids() start - type: 2',
      );
    });

    it('should throw error for invalid type', async () => {
      await expect(service.getSubdivisionsPids(3)).rejects.toThrow(
        'Invalid type parameter. Must be 1 or 2.',
      );
    });

    it('should handle database errors', async () => {
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        distinct: jest.fn().mockReturnThis(),
        from: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getRawMany: jest.fn().mockRejectedValue(new Error('Database error')),
      };

      subdivisionsRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      subdivisionsRepository.manager.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      await expect(service.getSubdivisionsPids(1)).rejects.toThrow(
        'Database error',
      );
      expect(loggerService.error).toHaveBeenCalledWith(
        'Exception occurred in LTSAService.getSubdivisionsPids()',
        expect.any(String),
      );
    });
  });

  describe('cleanLtoTables', () => {
    beforeEach(() => {
      ltoPrevDownloadRepository.clear?.mockResolvedValue(undefined);
      ltoDownloadRepository.clear?.mockResolvedValue(undefined);
      ltoDownloadRepository.find?.mockResolvedValue([mockLtoDownload]);
      ltoPrevDownloadRepository.create?.mockReturnValue(mockLtoPrevDownload);
      // Mock save for arrays (chunked operations)
      ltoPrevDownloadRepository.save?.mockImplementation((entities: any) => {
        if (Array.isArray(entities)) {
          return Promise.resolve(entities);
        }
        return Promise.resolve(entities);
      });
    });

    it('should successfully clean LTO tables with data to copy', async () => {
      await service.cleanLtoTables();

      expect(ltoPrevDownloadRepository.clear).toHaveBeenCalled();
      expect(ltoDownloadRepository.find).toHaveBeenCalled();
      expect(ltoPrevDownloadRepository.save).toHaveBeenCalled();
      expect(ltoDownloadRepository.clear).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith(
        'LTSAService.cleanLtoTables() start',
      );
      expect(loggerService.log).toHaveBeenCalledWith(
        'LTSAService.cleanLtoTables() completed successfully',
      );
    });

    it('should handle empty lto_download table', async () => {
      ltoDownloadRepository.find?.mockResolvedValue([]);

      await service.cleanLtoTables();

      expect(ltoPrevDownloadRepository.clear).toHaveBeenCalled();
      expect(ltoDownloadRepository.find).toHaveBeenCalled();
      expect(ltoPrevDownloadRepository.save).not.toHaveBeenCalled();
      expect(ltoDownloadRepository.clear).toHaveBeenCalled();
    });

    it('should handle database errors during cleaning', async () => {
      ltoPrevDownloadRepository.clear?.mockRejectedValue(
        new Error('Clear failed'),
      );

      await expect(service.cleanLtoTables()).rejects.toThrow('Clear failed');
      expect(loggerService.error).toHaveBeenCalledWith(
        'Exception occurred in LTSAService.cleanLtoTables()',
        expect.any(String),
      );
    });
  });

  describe('loadLtoData', () => {
    const validLtoFileContent = `000000001A${'Legal Description'.padEnd(255)} ${'000000002'.padEnd(9)}A${'Child Legal Description'.padEnd(255)}
000000003E${'Legal Description 2'.padEnd(255)}`;

    beforeEach(() => {
      ltoDownloadRepository.create?.mockReturnValue(mockLtoDownload);
      // Mock save for arrays (chunked operations)
      ltoDownloadRepository.save?.mockImplementation((entities: any) => {
        if (Array.isArray(entities)) {
          return Promise.resolve(entities);
        }
        return Promise.resolve(entities);
      });
    });

    it('should successfully load LTO data from valid file content', async () => {
      const result = await service.loadLtoData(validLtoFileContent);

      expect(result.recordsProcessed).toBe(2);
      expect(result.recordsLoaded).toBe(2);
      expect(ltoDownloadRepository.save).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith(
        'LTSAService.loadLtoData() start',
      );
    });

    it('should handle empty file content', async () => {
      const result = await service.loadLtoData('');

      expect(result.recordsProcessed).toBe(0);
      expect(result.recordsLoaded).toBe(0);
      expect(ltoDownloadRepository.save).not.toHaveBeenCalled();
    });

    it('should skip lines that are too short', async () => {
      const shortLineContent = 'short\nno'; // Both lines are less than 10 characters

      const result = await service.loadLtoData(shortLineContent);

      expect(result.recordsProcessed).toBe(2);
      expect(result.recordsLoaded).toBe(0);
      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining('Skipping line'),
      );
    });

    it('should clean invalid characters from file content', async () => {
      const contentWithInvalidChars = `000000001A${'Legal\x00Description'.padEnd(255)}`;

      ltoDownloadRepository.create?.mockImplementation((data: any) => {
        expect(data.legalDescription).not.toContain('\x00');
        return mockLtoDownload;
      });

      await service.loadLtoData(contentWithInvalidChars);

      expect(ltoDownloadRepository.create).toHaveBeenCalled();
    });

    it('should handle database errors during loading', async () => {
      ltoDownloadRepository.save?.mockRejectedValue(new Error('Save failed'));

      await expect(service.loadLtoData(validLtoFileContent)).rejects.toThrow(
        'Save failed',
      );
      expect(loggerService.error).toHaveBeenCalledWith(
        'Exception occurred in LTSAService.loadLtoData()',
        expect.any(String),
      );
    });
  });

  describe('mergeLtoDescriptions', () => {
    beforeEach(() => {
      // Mock getChangedLtoRecords
      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([mockLtoDownload]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      // Mock subdivision operations
      subdivisionsRepository.create?.mockReturnValue(mockSubdivision);
      subdivisionsRepository.save?.mockResolvedValue(mockSubdivision);
      siteSubdivisionsRepository.find?.mockResolvedValue([]);
    });

    it('should successfully merge LTO descriptions', async () => {
      // Create a simple LTO record without child data for this test
      const simpleLtoDownload = {
        id: 1,
        pid: '000000001',
        pidStatusCd: 'A',
        legalDescription: 'Test Legal Description',
        childPid: null,
        childPidStatusCd: null,
        childLegalDescription: null,
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([simpleLtoDownload]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      // Mock findOne to always return null (subdivision doesn't exist)
      subdivisionsRepository.findOne?.mockResolvedValue(null);

      const result = await service.mergeLtoDescriptions();

      expect(result.recordsProcessed).toBe(1);
      expect(result.subdivisionInserts).toBe(1);
      expect(result.subdivisionUpdates).toBe(0);
      expect(result.siteSubdivisionInserts).toBe(0);
      expect(loggerService.log).toHaveBeenCalledWith(
        'LTSAService.mergeLtoDescriptions() start',
      );
    });

    it('should handle existing subdivision updates', async () => {
      // Create a simple LTO record without child data for this test
      const simpleLtoDownload = {
        id: 1,
        pid: '000000001',
        pidStatusCd: 'A',
        legalDescription: 'Test Legal Description',
        childPid: null,
        childPidStatusCd: null,
        childLegalDescription: null,
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([simpleLtoDownload]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      subdivisionsRepository.findOne?.mockResolvedValue(mockSubdivision);
      subdivisionsRepository.update?.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const result = await service.mergeLtoDescriptions();

      expect(result.subdivisionUpdates).toBe(1);
      expect(result.subdivisionInserts).toBe(0);
    });

    it('should process child subdivisions when conditions are met', async () => {
      const mockLtoWithChild = {
        ...mockLtoDownload,
        pidStatusCd: 'I', // Not 'X' or 'E'
        childPid: '000000002',
        childPidStatusCd: 'I',
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([mockLtoWithChild]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      // Mock findOne to handle parent-child creation flow
      let findOneCalls = 0;
      subdivisionsRepository.findOne?.mockImplementation((criteria: any) => {
        findOneCalls++;
        const pid = criteria.where.pid;

        if (pid === '000000001') {
          // Parent PID calls
          if (findOneCalls === 1) {
            return Promise.resolve(null); // Parent doesn't exist initially (for update/insert check)
          } else {
            return Promise.resolve(mockSubdivision); // Parent exists (for child cloning)
          }
        } else if (pid === '000000002') {
          // Child PID calls
          return Promise.resolve(null); // Child doesn't exist
        }

        return Promise.resolve(null);
      });

      const result = await service.mergeLtoDescriptions();

      expect(result.subdivisionInserts).toBe(2); // Parent + child
    });

    it('should handle processing errors gracefully', async () => {
      subdivisionsRepository.findOne?.mockResolvedValue(null);
      subdivisionsRepository.save?.mockRejectedValue(new Error('Save failed'));

      await expect(service.mergeLtoDescriptions()).rejects.toThrow(
        'Save failed',
      );
      expect(loggerService.error).toHaveBeenCalledWith(
        expect.stringContaining('Error processing record'),
        expect.any(String),
      );
    });

    it('should skip child processing for excluded statuses', async () => {
      const mockLtoWithExcludedStatus = {
        ...mockLtoDownload,
        pidStatusCd: 'X', // Excluded status
        childPid: '000000002',
      };

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([mockLtoWithExcludedStatus]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      subdivisionsRepository.findOne?.mockResolvedValue(null);

      const result = await service.mergeLtoDescriptions();

      expect(result.subdivisionInserts).toBe(1); // Only parent, no child
    });
  });

  describe('Private Methods (via mergeLtoDescriptions)', () => {
    describe('calculateValidPid', () => {
      it('should return null for status X', async () => {
        // We can't directly test private methods, but we can verify behavior through public methods
        subdivisionsRepository.findOne?.mockResolvedValue(null);
        subdivisionsRepository.create?.mockImplementation((data: any) => {
          expect(data.validPid).toBeNull();
          return mockSubdivision;
        });
        subdivisionsRepository.save?.mockResolvedValue(mockSubdivision);

        const mockLtoWithXStatus = {
          ...mockLtoDownload,
          pidStatusCd: 'X',
          childPid: null, // Remove child data to avoid child processing
          childPidStatusCd: null,
          childLegalDescription: null,
        };

        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          setParameters: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
          getParameters: jest.fn().mockReturnValue({}),
          getMany: jest.fn().mockResolvedValue([mockLtoWithXStatus]),
        };

        ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
          mockQueryBuilder,
        );
        ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
          mockQueryBuilder,
        );

        await service.mergeLtoDescriptions();

        expect(subdivisionsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ validPid: null }),
        );
      });

      it('should return Y for valid status', async () => {
        subdivisionsRepository.findOne?.mockResolvedValue(null);
        subdivisionsRepository.create?.mockImplementation((data: any) => {
          expect(data.validPid).toBe('Y');
          return mockSubdivision;
        });
        subdivisionsRepository.save?.mockResolvedValue(mockSubdivision);

        const mockLtoWithValidStatus = {
          ...mockLtoDownload,
          pidStatusCd: 'A',
          childPid: null, // Remove child data to avoid child processing
          childPidStatusCd: null,
          childLegalDescription: null,
        };

        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          setParameters: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
          getParameters: jest.fn().mockReturnValue({}),
          getMany: jest.fn().mockResolvedValue([mockLtoWithValidStatus]),
        };

        ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
          mockQueryBuilder,
        );
        ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
          mockQueryBuilder,
        );

        await service.mergeLtoDescriptions();

        expect(subdivisionsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ validPid: 'Y' }),
        );
      });
    });

    describe('PID padding', () => {
      it('should pad PIDs to 9 characters with leading zeros', async () => {
        subdivisionsRepository.findOne?.mockResolvedValue(null);
        subdivisionsRepository.create?.mockImplementation((data: any) => {
          expect(data.pid).toBe('000000001'); // Padded from '1'
          return mockSubdivision;
        });
        subdivisionsRepository.save?.mockResolvedValue(mockSubdivision);

        const mockLtoWithShortPid = {
          ...mockLtoDownload,
          pid: '1',
          childPid: null, // Remove child data to avoid child processing
          childPidStatusCd: null,
          childLegalDescription: null,
        };

        const mockQueryBuilder = {
          select: jest.fn().mockReturnThis(),
          where: jest.fn().mockReturnThis(),
          andWhere: jest.fn().mockReturnThis(),
          setParameters: jest.fn().mockReturnThis(),
          getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
          getParameters: jest.fn().mockReturnValue({}),
          getMany: jest.fn().mockResolvedValue([mockLtoWithShortPid]),
        };

        ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
          mockQueryBuilder,
        );
        ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
          mockQueryBuilder,
        );

        await service.mergeLtoDescriptions();

        expect(subdivisionsRepository.create).toHaveBeenCalledWith(
          expect.objectContaining({ pid: '000000001' }),
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle duplicate key errors in subdivision creation', async () => {
      const duplicateKeyError = new Error('Duplicate key') as any;
      duplicateKeyError.code = '23505';

      // Create a simple LTO record without child data for this test
      const simpleLtoDownload = {
        id: 1,
        pid: '000000001',
        pidStatusCd: 'A',
        legalDescription: 'Test Legal Description',
        childPid: null,
        childPidStatusCd: null,
        childLegalDescription: null,
      };

      subdivisionsRepository.findOne?.mockResolvedValue(null);
      subdivisionsRepository.save?.mockRejectedValue(duplicateKeyError);
      subdivisionsRepository.update?.mockResolvedValue({
        affected: 1,
        raw: {},
        generatedMaps: [],
      });

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([simpleLtoDownload]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.mergeLtoDescriptions();

      expect(result.subdivisionUpdates).toBe(1);
      expect(subdivisionsRepository.update).toHaveBeenCalled();
      expect(loggerService.log).toHaveBeenCalledWith(
        expect.stringContaining('already exists, updating instead'),
      );
    });
  });

  describe('Data Validation', () => {
    it('should handle null and undefined values gracefully', async () => {
      const mockLtoWithNulls = {
        ...mockLtoDownload,
        legalDescription: null,
        childPid: null,
        childPidStatusCd: null,
        childLegalDescription: null,
      };

      subdivisionsRepository.findOne?.mockResolvedValue(null);
      subdivisionsRepository.create?.mockReturnValue(mockSubdivision);
      subdivisionsRepository.save?.mockResolvedValue(mockSubdivision);

      const mockQueryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        setParameters: jest.fn().mockReturnThis(),
        getQuery: jest.fn().mockReturnValue('SELECT * FROM test'),
        getParameters: jest.fn().mockReturnValue({}),
        getMany: jest.fn().mockResolvedValue([mockLtoWithNulls]),
      };

      ltoPrevDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );
      ltoDownloadRepository.createQueryBuilder?.mockReturnValue(
        mockQueryBuilder,
      );

      const result = await service.mergeLtoDescriptions();

      expect(result.recordsProcessed).toBe(1);
      expect(result.subdivisionInserts).toBe(1);
      // Should not process child because childPid is null
      expect(result.siteSubdivisionInserts).toBe(0);
    });
  });
});
