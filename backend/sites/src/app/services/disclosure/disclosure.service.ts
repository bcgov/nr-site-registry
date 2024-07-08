import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { RecentViews } from '../../entities/recentViews.entity';
import { RecentViewDto } from '../../dto/recentView.dto';
import { SiteProfiles } from 'src/app/entities/siteProfiles.entity';

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(SiteProfiles)
    private disclosureRepository: Repository<SiteProfiles>,
  ) {}

  async getSiteDisclosureBySiteId(siteId: string): Promise<SiteProfiles[]> {
    try {
      const result =  await this.disclosureRepository.find({ where: { siteId } });
      return result;
    } 
    catch (error) 
    {
      throw error;
    }
  }
}
