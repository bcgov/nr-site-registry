import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class AssociatedSiteService {
  constructor(
    @InjectRepository(SiteAssocs)
    private assocSiteRepository: Repository<SiteAssocs>,
  ) {}

  async getAssociatedSitesBySiteId(siteId: string) {
    try {
      sitesLogger.info(
        'AssociatedSiteService.getAssociatedSitesBySiteId() start',
      );
      sitesLogger.debug(
        'AssociatedSiteService.getAssociatedSitesBySiteId() start',
      );
      const result = await this.assocSiteRepository.find({
        where: { siteId },
      });
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
        sitesLogger.info(
          'AssociatedSiteService.getAssociatedSitesBySiteId() end',
        );
        sitesLogger.debug(
          'AssociatedSiteService.getAssociatedSitesBySiteId() end',
        );
        return siteAssocs;
      } else {
        return [];
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in AssociatedSiteService.getAssociatedSitesBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve associated site by siteId.');
    }
  }
}
