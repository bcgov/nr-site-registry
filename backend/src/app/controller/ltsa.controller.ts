import {
  BadRequestException,
  Controller,
  Get,
  HttpException,
  InternalServerErrorException,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { randomUUID } from 'crypto';
import { unlink } from 'fs/promises';
import { diskStorage } from 'multer';
import { tmpdir } from 'os';
import { LoggerService } from '../logger/logger.service';
import { LTSAService, LtsaUpload } from '../services/ltsa/ltsa.service';

const MAX_UPLOAD_BYTES =
  Number(process.env.LTSA_MAX_UPLOAD_BYTES) || 100 * 1024 * 1024;

@Controller('ltsa')
export class LTSAController {
  constructor(
    private readonly ltsaService: LTSAService,
    private readonly logger: LoggerService,
  ) {}

  @Get('dump')
  async getDump(@Query('type') type: string) {
    if (type !== '1' && type !== '2') {
      throw new BadRequestException(
        'Type parameter is required and must be either 1 or 2',
      );
    }
    const typeNumber = Number(type);
    const data = await this.ltsaService.processDump(typeNumber as 1 | 2);
    const pidNumbers = data.map((item) => item.pidno);
    return {
      status: 'success',
      message: `Retrieved subdivisions data for type ${type}`,
      timestamp: new Date().toISOString(),
      type: typeNumber,
      count: pidNumbers.length,
      data: pidNumbers,
    };
  }

  @Get('status')
  getStatus() {
    return this.ltsaService.getStatus();
  }

  @Post('load')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: tmpdir(),
        filename: (_request, _file, callback) =>
          callback(null, `ltsa-${randomUUID()}.txt`),
      }),
      limits: { fileSize: MAX_UPLOAD_BYTES, files: 1 },
    }),
  )
  async loadLtoData(@UploadedFile() file?: LtsaUpload) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!file.originalname.toLowerCase().endsWith('.txt')) {
      await this.removeUpload(file.path);
      throw new BadRequestException('Only .txt files are allowed');
    }

    try {
      return await this.ltsaService.processFile(file);
    } catch (error) {
      if (error instanceof HttpException) throw error;
      this.logger.error(
        'LTSA load failed',
        error instanceof Error ? error.name : 'Unknown internal error',
      );
      throw new InternalServerErrorException('Failed to process LTSA file');
    } finally {
      await this.removeUpload(file.path);
    }
  }

  private async removeUpload(path?: string): Promise<void> {
    if (!path) return;
    try {
      await unlink(path);
    } catch (error) {
      this.logger.warn(
        `Unable to remove temporary LTSA upload: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
}
