import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { UserActionEnum } from 'src/app/common/userActionEnum';

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(SiteProfiles)
    private disclosureRepository: Repository<SiteProfiles>,
  ) {}

  async getSiteDisclosureBySiteId(
    siteId: string,
    showPending: boolean,
  ): Promise<SiteProfiles[]> {
    try {
      let result: SiteProfiles[] = [];

      if (showPending) {
        result = await this.disclosureRepository.find({
          where: { siteId, userAction: UserActionEnum.updated },
        });
      } else {
        result = await this.disclosureRepository.find({
          where: { siteId },
        });
      }
      return result;
    } catch (error) {
      throw error;
    }
  }
}
