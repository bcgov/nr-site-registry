import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Brackets } from 'typeorm';
import { LandHistories } from 'src/app/entities/landHistories.entity';

export class LandHistoryService {
  constructor(
    @InjectRepository(LandHistories)
    private landHistoryRepository: Repository<LandHistories>,
  ) {}

  async getLandHistoriesForSite(
    siteId: string,
    searchTerm: string,
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

      const result = await query.getMany();
      return result;
    } catch (error) {
      throw error;
    }
  }
}
