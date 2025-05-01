import { Test, TestingModule } from '@nestjs/testing';
import { CsvController } from './csv.controller';
import { CsvService } from '../services/csv/csv.service';

describe('CsvController', () => {
  let csvController: CsvController;
  let csvService: CsvService;

  const mockCsvService = {
    generateCSVFiles: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvController],
      providers: [
        {
          provide: CsvService,
          useValue: mockCsvService,
        },
      ],
    }).compile();

    csvController = module.get<CsvController>(CsvController);
    csvService = module.get<CsvService>(CsvService);
  });

  it('should call csvService.generateCSVFiles and return success message', async () => {
    mockCsvService.generateCSVFiles.mockResolvedValueOnce(undefined); // Simulate successful execution

    const req = {} as any; // mock request if needed
    const result = await csvController.generateCsv(req);

    expect(mockCsvService.generateCSVFiles).toHaveBeenCalled();
    expect(result).toEqual({ message: 'CSV generated successfully' });
  });
});
