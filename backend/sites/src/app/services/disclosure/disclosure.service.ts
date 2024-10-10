import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { LoggerService } from '../../logger/logger.service';
import { UserActionEnum } from '../../common/userActionEnum';

@Injectable()
export class DisclosureService {
  constructor(
    @InjectRepository(SiteProfiles)
    private readonly disclosureRepository: Repository<SiteProfiles>,
    private readonly sitesLogger: LoggerService,
  ) {}

  /**
   * Retrieves site profiles for a given site ID.
   *
   * @param siteId - The ID of the site whose profiles are to be fetched.
   * @returns A promise that resolves to an array of SiteProfiles entities.
   * @throws Error if there is an issue retrieving the data.
   */
  async getSiteDisclosureBySiteId(
    siteId: string,
    showPending: boolean,
  ): Promise<SiteProfiles[]> {
    try {
      this.sitesLogger.log(
        'DisclosureService.getSiteDisclosureBySiteId() start',
      );
      this.sitesLogger.debug(
        'DisclosureService.getSiteDisclosureBySiteId() start',
      );

      // Fetch site profiles based on the provided siteId
      let result: SiteProfiles[] = [];

      if (showPending) {
        result = await this.disclosureRepository.find({
          where: { siteId, userAction: UserActionEnum.UPDATED },
        });
      } else {
        result = await this.disclosureRepository.find({
          where: { siteId },
        });
      }

      this.sitesLogger.log('DisclosureService.getSiteDisclosureBySiteId() end');
      this.sitesLogger.debug(
        'DisclosureService.getSiteDisclosureBySiteId() end',
      );
      return result; // Return the fetched site profiles
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DisclosureService.getSiteDisclosureBySiteId() end',
        JSON.stringify(error),
      );
      // Log or handle the error as necessary
      throw new Error(
        `Failed to retrieve site disclosures for siteId ${siteId}`,
      );
    }
  }
}
