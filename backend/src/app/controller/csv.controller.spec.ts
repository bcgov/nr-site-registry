import { Test, TestingModule } from '@nestjs/testing';
import { CsvController } from './csv.controller';
import { CsvService } from '../services/csv/csv.service';
import { ConfigService } from '@nestjs/config';
import { HttpStatus } from '@nestjs/common';

describe('CsvController', () => {
  let csvController: CsvController;
  let csvService: CsvService;
  let configService: ConfigService;

  const mockCsvService = {
    generateCSVFiles: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockResponse = () => {
    const res: any = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res;
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvController],
      providers: [
        {
          provide: CsvService,
          useValue: mockCsvService,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    csvController = module.get<CsvController>(CsvController);
    csvService = module.get<CsvService>(CsvService);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should return 401 if secret is invalid', async () => {
    const res = mockResponse();
    mockConfigService.get.mockReturnValue('expected-secret');

    await csvController.generateCsv('wrong-secret', res);

    expect(res.status).toHaveBeenCalledWith(HttpStatus.UNAUTHORIZED);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid API secret',
    });
  });

  it('should call generateCSVFiles and return success message', async () => {
    const res = mockResponse();
    mockConfigService.get.mockReturnValue('expected-secret');
    mockCsvService.generateCSVFiles.mockResolvedValueOnce(undefined);

    const result = await csvController.generateCsv('expected-secret', res);

    expect(mockCsvService.generateCSVFiles).toHaveBeenCalled();
    expect(result).toEqual(
      res.status(HttpStatus.OK).json({
        message: 'CSV files generated successfully',
      }),
    );
  });

  it('should propagate errors from generateCSVFiles', async () => {
    const res = mockResponse();
    mockConfigService.get.mockReturnValue('expected-secret');
    mockCsvService.generateCSVFiles.mockRejectedValueOnce(
      new Error('Something went wrong'),
    );

    await expect(
      csvController.generateCsv('expected-secret', res),
    ).rejects.toThrow('Something went wrong');
  });
});
