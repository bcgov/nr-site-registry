import { v4 } from 'uuid';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';
import { Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets, In } from 'typeorm';
import { LandHistories } from '../../entities/landHistories.entity';
import { LandHistoriesInputDTO } from 'src/app/dto/landHistoriesInput.dto';
import { TransactionManagerService } from '../transactionManager/transactionManager.service';

export class LandHistoryService {
  constructor(
    @InjectRepository(LandHistories)
    private landHistoryRepository: Repository<LandHistories>,
    private transactionManagerService: TransactionManagerService,
    @Inject(REQUEST) private readonly request: Request, // Inject the request object
  ) {}

  async getLandHistoriesForSite(
    siteId: string,
    searchTerm: string,
    sortDirection: 'ASC' | 'DESC',
  ): Promise<LandHistories[]> {
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
      return result;
    } catch (error) {
      throw error;
    }
  }

  async updateLandHistoriesForSite(
    siteId: string,
    landHistoriesInput: LandHistoriesInputDTO[],
  ): Promise<LandHistories[]> {
    const user = this.request['req']['user'] || {};
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
          whoCreated: user.name,
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
          note: arg.note || undefined,
          whoUpdated: user.name,
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
      return [];
    }
  }
}
