import { Controller, Get } from '@nestjs/common';
import { CsvService } from '../services/csv/csv.service';
import { Resource } from 'nest-keycloak-connect';

@Resource('csv')
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get('generate')
  async generateCsv() {
    await this.csvService.generateCSVFiles();
    return { message: 'CSV generated successfully' };
  }
}
