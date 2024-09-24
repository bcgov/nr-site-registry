import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';
import { UserActionEnum } from 'src/app/common/userActionEnum';

@Injectable()
export class AssociatedSiteService {
  constructor(
    @InjectRepository(SiteAssocs)
    private assocSiteRepository: Repository<SiteAssocs>,
  ) {}

  async getAssociatedSitesBySiteId(siteId: string, showPending: boolean) {
    try {
      let result: SiteAssocs[] = [];

      if (showPending) {
        result = await this.assocSiteRepository.find({
          where: { siteId , userAction: UserActionEnum.updated  },
        });
      } else {
        result = await this.assocSiteRepository.find({
          where: { siteId },
        });
      }

      if (result) {
        const transformedObjects = result.map((assocs) => {
          return {
            guid: v4(),
            siteId: assocs.siteId,
            effectiveDate: assocs.effectiveDate,
            siteIdAssociatedWith: assocs.siteIdAssociatedWith,
            note: assocs.note,
          };
        });
        const siteAssocs = plainToInstance(
          AssociatedSiteDto,
          transformedObjects,
        );
        return siteAssocs;
      } else {
        return [];
      }
    } catch (error) {
      throw new Error('Failed to retrieve associated site by siteId.');
    }
  }
}
