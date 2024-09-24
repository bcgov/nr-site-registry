import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LandUseCd } from '../../entities/landUseCd.entity';

export class LandUseCodeService {
  constructor(
    @InjectRepository(LandUseCd)
    private landUseCodeRepository: Repository<LandUseCd>,
  ) {}

  async getLandUseCodes(): Promise<LandUseCd[]> {
    try {
      const result = await this.landUseCodeRepository.find({
        order: { code: 'ASC' },
      });
      return result;
    } catch (error) {
      throw error;
    }
  }
}
