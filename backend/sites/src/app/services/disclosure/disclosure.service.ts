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
    private readonly disclosureRepository: Repository<SiteProfiles>,
  ) {}

  /**
   * Retrieves site profiles for a given site ID.
   *
   * @param siteId - The ID of the site whose profiles are to be fetched.
   * @returns A promise that resolves to an array of SiteProfiles entities.
   * @throws Error if there is an issue retrieving the data.
   */
  async getSiteDisclosureBySiteId(siteId: string): Promise<SiteProfiles[]> {
    sitesLogger.info('DisclosureService.getSiteDisclosureBySiteId() start');
    sitesLogger.debug('DisclosureService.getSiteDisclosureBySiteId() start');
    try {
      // Fetch site profiles based on the provided siteId
      const result = await this.disclosureRepository.find({
        where: { siteId },
      });
      sitesLogger.info('DisclosureService.getSiteDisclosureBySiteId() end');
      sitesLogger.debug('DisclosureService.getSiteDisclosureBySiteId() end');
      return result; // Return the fetched site profiles
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DisclosureService.getSiteDisclosureBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      // Log or handle the error as necessary
      throw new Error(
        `Failed to retrieve site disclosures for siteId ${siteId}`,
      );
    }
  }
}
