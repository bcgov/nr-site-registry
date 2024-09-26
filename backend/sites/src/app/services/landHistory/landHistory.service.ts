import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
import { LoggerService } from 'src/app/logger/logger.service';

export class LandHistoryService {
  constructor(
    @InjectRepository(LandHistories)
    private landHistoryRepository: Repository<LandHistories>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getLandHistoriesForSite(
    siteId: string,
    searchTerm: string,
    sortDirection: 'ASC' | 'DESC',
  ): Promise<LandHistories[]> {
    this.sitesLogger.log('LandHistoryService.getLandHistoriesForSite() start');
    this.sitesLogger.debug(
      'LandHistoryService.getLandHistoriesForSite() start',
    );
    try {
      const query = this.landHistoryRepository
        .createQueryBuilder('landHistory')
        .innerJoinAndSelect(
          'landHistory.landUse',
          'land_use_cd',
          'land_use_cd.code = landHistory.lut_code',
        )
        .where('site_id = :siteId', { siteId });

      if (searchTerm) {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('note ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            }).orWhere('land_use_cd.description ILIKE :searchTerm', {
              searchTerm: `%${searchTerm}%`,
            });
          }),
        );
      }

      if (sortDirection) {
        query.orderBy('when_created', sortDirection);
      }

      const result = (await query.getMany()).map((landHistory) => ({
        ...landHistory,
        guid: v4(),
      }));
      this.sitesLogger.log('LandHistoryService.getLandHistoriesForSite() end');
      this.sitesLogger.debug(
        'LandHistoryService.getLandHistoriesForSite() end',
      );
      return result;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in LandHistoryService.getLandHistoriesForSite() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }
}
