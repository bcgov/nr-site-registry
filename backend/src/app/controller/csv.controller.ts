import {
  Controller,
  Get,
  Res,
  HttpException,
  UnauthorizedException,
  HttpStatus,
} from '@nestjs/common';
import { Headers as NestHeaders } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CsvService } from '../services/csv/csv.service';
import { Public } from 'nest-keycloak-connect';
import { Http } from 'winston/lib/winston/transports';

@Public()
@Controller('csv')
export class CsvController {
  constructor(
    private readonly csvService: CsvService,
    private readonly configService: ConfigService,
  ) {}

  @Get('generate')
  async generateCsv(
    @NestHeaders('x-api-secret') clientSecret: string,
    @Res() Res,
  ) {
    const serverSecret = this.configService.get<string>('CSV_SECRET');

    if (clientSecret !== serverSecret) {
      return Res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Invalid API secret',
      });
    }

    await this.csvService.generateCSVFiles();
    return Res.status(HttpStatus.OK).json({
      message: 'CSV files generated successfully',
    });
  }
}
