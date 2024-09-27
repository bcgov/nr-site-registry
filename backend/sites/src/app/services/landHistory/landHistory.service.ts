import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');
import { UserActionEnum } from 'src/app/common/userActionEnum';

export class LandHistoryService {
  constructor(
    @InjectRepository(LandHistories)
    private landHistoryRepository: Repository<LandHistories>,
  ) {}

  async getLandHistoriesForSite(
    siteId: string,
    searchTerm: string,
    sortDirection: 'ASC' | 'DESC',
    showPending: boolean
  ): Promise<LandHistories[]> {
    sitesLogger.info('LandHistoryService.getLandHistoriesForSite() start');
    sitesLogger.debug('LandHistoryService.getLandHistoriesForSite() start');
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

      if(showPending)
      {
        query.andWhere(
          new Brackets((qb) => {
            qb.where('landHistory.user_action = :status', {
              status: `${UserActionEnum.UPDATED}`,
            })
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
      sitesLogger.info('LandHistoryService.getLandHistoriesForSite() end');
      sitesLogger.debug('LandHistoryService.getLandHistoriesForSite() end');
      return result;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in LandHistoryService.getLandHistoriesForSite() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}
