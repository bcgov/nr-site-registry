import { v4 } from 'uuid';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
import { LandHistoriesInputDTO } from 'src/app/dto/landHistoriesInput.dto';
import { TransactionManagerService } from '../transactionManager/transactionManager.service';
import { LoggerService } from 'src/app/logger/logger.service';

export class LandHistoryService {
  constructor(
    @InjectRepository(LandHistories)
    private landHistoryRepository: Repository<LandHistories>,
    private transactionManagerService: TransactionManagerService,
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

  async updateLandHistoriesForSite(
    siteId: string,
    landHistoriesInput: LandHistoriesInputDTO[],
    curentUser: Record<string, any>,
  ): Promise<LandHistories[]> {
    const deletes = landHistoriesInput
      .filter((arg) => !!arg.shouldDelete)
      .map((arg) => arg.originalLandUseCode);

    const additions = landHistoriesInput
      .filter((arg) => !arg.shouldDelete && !arg.originalLandUseCode)
      .map((arg) => {
        return {
          siteId,
          lutCode: arg.landUseCode,
          note: arg.note,
          whoCreated: curentUser.name,
          whenCreated: new Date(),
          rwmFlag: 0,
          rwmNoteFlag: 0,
        };
      });

    const updates = landHistoriesInput
      .filter((arg) => !arg.shouldDelete && !!arg.originalLandUseCode)
      .map((arg) => {
        const whereClause = { lutCode: arg.originalLandUseCode, siteId };
        const data = {
          lutCode: arg.landUseCode || arg.originalLandUseCode,
          note: arg.note ?? undefined,
          whoUpdated: curentUser.name,
          whenUpdated: new Date(),
        };

        return [whereClause, data];
      });

    try {
      const entityManager = this.transactionManagerService.getEntityManager();

      const updatedRecords = await entityManager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager.save(LandHistories, additions);

          for (const [whereClause, data] of updates) {
            await transactionalEntityManager.update(
              LandHistories,
              whereClause,
              data,
            );
          }

          await transactionalEntityManager.delete(LandHistories, {
            siteId,
            lutCode: In(deletes),
          });
          return null;
        },
      );

      return updatedRecords;
    } catch (e) {
      console.log('Error updating land histories', e);
      throw e;
    }
  }
}
