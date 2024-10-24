import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandUseCd } from '../../entities/landUseCd.entity';
import { LoggerService } from '../../logger/logger.service';
import { HttpException, HttpStatus } from '@nestjs/common';

export class LandUseCodeService {
  constructor(
    @InjectRepository(LandUseCd)
    private landUseCodeRepository: Repository<LandUseCd>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getLandUseCodes(): Promise<LandUseCd[]> {
    this.sitesLogger.log('LandUseCodeService.getLandUseCodes() start');
    this.sitesLogger.debug('LandUseCodeService.getLandUseCodes() start');
    try {
      const result = await this.landUseCodeRepository.find({
        order: { code: 'ASC' },
      });
      this.sitesLogger.log('LandUseCodeService.getLandUseCodes() end');
      this.sitesLogger.debug('LandUseCodeService.getLandUseCodes() end');
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in LandUseCodeService.getLandUseCodes() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve land use code`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
