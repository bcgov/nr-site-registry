import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { v4 } from 'uuid';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';
import { LoggerService } from '../../logger/logger.service';

@Injectable()
export class AssociatedSiteService {
  constructor(
    @InjectRepository(SiteAssocs)
    private readonly assocSiteRepository: Repository<SiteAssocs>,
    private readonly sitesLogger: LoggerService,
  ) {}

  /**
   * Retrieves associated sites for a given site ID and transforms the data into DTOs.
   *
   * @param siteId - The ID of the site for which associated sites are to be fetched.
   * @returns An array of AssociatedSiteDto objects containing details of associated sites.
   * @throws Error if there is an issue retrieving the data.
   */
  async getAssociatedSitesBySiteId(
    siteId: string,
  ): Promise<AssociatedSiteDto[]> {
    try {
      this.sitesLogger.log(
        'AssociatedSiteService.getAssociatedSitesBySiteId() start',
      );
      this.sitesLogger.debug(
        'AssociatedSiteService.getAssociatedSitesBySiteId() start',
      );
      // Fetch associated sites based on the provided siteId
      const result = await this.assocSiteRepository.find({
        where: { siteId },
        // Optionally, specify relations if needed
      });

      // Transform the fetched data into the desired format
      const transformedObjects = result.map((assocs) => ({
        id: assocs.id,
        siteId: assocs.siteId,
        siteIdAssociatedWith: assocs.siteIdAssociatedWith,
        effectiveDate: assocs.effectiveDate.toISOString(),
        note: assocs.note ? assocs.note.trim() : null, // Ensure note is trimmed
        srAction: assocs.srAction,
      }));

      // Convert the transformed objects into DTOs
      const siteAssocs = plainToInstance(AssociatedSiteDto, transformedObjects);
      this.sitesLogger.log(
        'AssociatedSiteService.getAssociatedSitesBySiteId() end',
      );
      this.sitesLogger.debug(
        'AssociatedSiteService.getAssociatedSitesBySiteId() end',
      );
      return siteAssocs;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in AssociatedSiteService.getAssociatedSitesBySiteId() end',
        JSON.stringify(error),
      );
      // Log or handle the error as necessary
      throw new Error(
        `Failed to retrieve associated sites by site ID: ${siteId}`,
      );
    }
  }
}
