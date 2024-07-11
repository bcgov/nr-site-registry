import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandHistories } from 'src/app/entities/landHistories.entity';

export class LandHistoryService {
    constructor(
        @InjectRepository(LandHistories)
        private landHistoryRepository: Repository<LandHistories>,
    ) { }

    async getLandHistoriesForSite(siteId: string): Promise<LandHistories[]> {
        try {
            const result = await this.landHistoryRepository.find({ where: { siteId } });
            return result
        } catch (error) {
            throw error;
        }
    }
}
