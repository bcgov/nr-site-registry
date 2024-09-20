import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(SiteProfiles)
    private disclosureRepository: Repository<SiteProfiles>,
  ) {}

  async getSiteDisclosureBySiteId(siteId: string): Promise<SiteProfiles[]> {
    sitesLogger.info('DisclosureService.getSiteDisclosureBySiteId() start');
    sitesLogger.debug('DisclosureService.getSiteDisclosureBySiteId() start');
    try {
      const result = await this.disclosureRepository.find({
        where: { siteId },
      });
      sitesLogger.info('DisclosureService.getSiteDisclosureBySiteId() end');
      sitesLogger.debug('DisclosureService.getSiteDisclosureBySiteId() end');
      return result;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DisclosureService.getSiteDisclosureBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}
