import {
  Controller,
  Get,
  Post,
  Query,
  BadRequestException,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { LTSAService } from '../services/ltsa/ltsa.service';
import { LoggerService } from '../logger/logger.service';

@Controller('ltsa')
export class LTSAController {
  constructor(
    private readonly configService: ConfigService,
    private readonly ltsaService: LTSAService,
    private readonly logger: LoggerService,
  ) {}

  @Get('dump')
  async getDump(@AuthenticatedUser() user: any, @Query('type') type: string) {
    // Validate type parameter
    if (!type || (type !== '1' && type !== '2')) {
      throw new BadRequestException(
        'Type parameter is required and must be either 1 or 2',
      );
    }

    const typeNumber = parseInt(type, 10);

    try {
      const data = await this.ltsaService.getSubdivisionsPids(typeNumber);

      // Convert array of objects to array of strings
      const pidNumbers = data.map((item) => item.pidno);

      return {
        status: 'success',
        message: `Retrieved subdivisions data for type ${type}`,
        timestamp: new Date().toISOString(),
        type: typeNumber,
        count: pidNumbers.length,
        data: pidNumbers,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to retrieve data: ${error.message}`,
      );
    }
  }

  @Post('load')
  @UseInterceptors(FileInterceptor('file'))
  async loadLtoData(@AuthenticatedUser() user: any, @UploadedFile() file: any) {
    try {
      if (!file) {
        throw new BadRequestException('No file uploaded');
      }

      if (!file.originalname.toLowerCase().endsWith('.txt')) {
        throw new BadRequestException('Only .txt files are allowed');
      }

      // Convert buffer to string and output to console
      const fileContent = file.buffer.toString('utf-8');
      const lines = fileContent.split('\n');
      const first50Lines = lines.slice(0, 50).join('\n');

      this.logger.log('=== LTO Data File Content (First 50 lines) ===');
      this.logger.log(first50Lines);
      this.logger.log(
        `=== End of LTO Data File Content (Showing 50 of ${lines.length - 1} lines) ===`,
      );

      // Stage 1: Perform lto_clean.sql operations
      this.logger.log('=== Starting LTO table cleaning operations ===');
      await this.ltsaService.cleanLtoTables();
      this.logger.log('=== LTO table cleaning completed ===');

      // Stage 2: Load LTO data according to lto_load.ctl logic
      this.logger.log('=== Starting LTO table loading operations ===');
      const loadResult = await this.ltsaService.loadLtoData(fileContent);
      this.logger.log('=== LTO table loading completed ===');

      // Stage 3: Merge LTO descriptions (process changed records)
      this.logger.log('=== Starting LTO merge operations ===');
      const mergeResult = await this.ltsaService.mergeLtoDescriptions();
      this.logger.log(
        `=== LTO merge completed: ${mergeResult.recordsProcessed} records processed, ` +
          `${mergeResult.subdivisionUpdates} subdivision updates, ${mergeResult.subdivisionInserts} subdivision inserts, ` +
          `${mergeResult.siteSubdivisionInserts} site subdivision inserts ===`,
      );

      return {
        status: 'success',
        message:
          'File processed, LTO tables cleaned, data loaded, and merge operations completed successfully',
        timestamp: new Date().toISOString(),
        filename: file.originalname,
        size: file.size,
        lines: fileContent.split('\n').length - 1, // Subtract 1 for the last empty line
        recordsProcessed: loadResult.recordsProcessed,
        recordsLoaded: loadResult.recordsLoaded,
        mergeResults: mergeResult,
      };
    } catch (error) {
      throw new BadRequestException(`Failed to process file: ${error.message}`);
    }
  }
}
