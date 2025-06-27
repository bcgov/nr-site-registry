import { Test, TestingModule } from '@nestjs/testing';
import { CsvService } from './csv.service';
import { Sites } from '../../entities/sites.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { S3Client } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import { LoggerService } from '../../logger/logger.service';

jest.mock('@aws-sdk/client-s3');

describe('CsvService', () => {
  let service: CsvService;
  let mockSiteRepository: any;
  let mockConfigService: any;
  let mockLoggerService: any;
  const mockData = [
    { id: 1, name: 'Test' },
    { id: 1, name: 'Test' },
  ];
  beforeEach(async () => {
    mockSiteRepository = {
      manager: {
        query: jest.fn(() => mockData),
      },
    };

    const mockS3Client = {
      send: jest.fn(),
    };

    mockConfigService = {
      get: jest.fn(() => {
        return 'test-value';
      }),
    };

    mockLoggerService = {
      log: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CsvService,
        {
          provide: getRepositoryToken(Sites),
          useValue: mockSiteRepository,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: LoggerService,
          useValue: mockLoggerService,
        },
        {
          provide: S3Client,
          useValue: mockS3Client,
        },
      ],
    }).compile();

    service = module.get<CsvService>(CsvService);
    mockLoggerService = module.get<LoggerService>(LoggerService);
    mockConfigService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('generateCSVFiles', () => {
    it('should generate CSV files for all queries', async () => {
      const generateCsvSpy = jest
        .spyOn(service, 'generateCsv')
        .mockResolvedValue('test-url');
      await service.generateCSVFiles();
      expect(generateCsvSpy).toHaveBeenCalledTimes(16);
    });
  });

  describe('generateCsv', () => {
    it('should generate a CSV file and upload it', async () => {
      const mockData = [{ id: 1, name: 'Test' }];
      const fileName = 'test-file.csv';
      const uploadFileSpy = jest
        .spyOn(service, 'uploadFile')
        .mockResolvedValue('test-url');
      await service.generateCsv(mockData, fileName);
      expect(uploadFileSpy).toHaveBeenCalledWith(expect.any(String), fileName);
    });
  });

  describe('uploadFile', () => {
    it('should upload a file to S3', async () => {
      const filePath = '/test/path';
      const fileName = 'test-file.csv';
      mockConfigService.get.mockReturnValue('test-value');
      jest.spyOn(fs, 'readFileSync').mockReturnValue('');
      (S3Client as jest.Mock).mockImplementation(() => ({
        send: jest.fn().mockResolvedValue({}),
      }));
      const result = await service.uploadFile(filePath, fileName);
      expect(result).toMatch(/^https:\/\//);
    });
  });
});
