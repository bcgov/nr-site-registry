import { Controller, Get, Req } from '@nestjs/common';
import { CsvService } from '../services/csv/csv.service';
import { Public, Resource, Roles } from 'nest-keycloak-connect';

@Resource('csv')
@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvService) {}

  @Get('generate')
  async generateCsv(@Req() req: Request) {
    await this.csvService.generateCSVFiles();
    return { message: 'CSV generated successfully' };
  }
}
