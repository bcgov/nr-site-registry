import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { v4 } from 'uuid';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteDto } from '../../dto/associatedSite.dto';

@Injectable()
export class AssociatedSiteService {
  constructor(
    @InjectRepository(SiteAssocs)
    private readonly assocSiteRepository: Repository<SiteAssocs>,
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
      // Fetch associated sites based on the provided siteId
      const result = await this.assocSiteRepository.find({
        where: { siteId },
        // Optionally, specify relations if needed
      });

      // Transform the fetched data into the desired format
      const transformedObjects = result.map((assocs) => ({
        guid: v4(), // Generate a unique identifier for each entry
        siteId: assocs.siteId,
        effectiveDate: assocs.effectiveDate.toISOString(),
        siteIdAssociatedWith: assocs.siteIdAssociatedWith,
        note: assocs.note ? assocs.note.trim() : null, // Ensure note is trimmed
      }));

      // Convert the transformed objects into DTOs
      return plainToInstance(AssociatedSiteDto, transformedObjects);
    } catch (error) {
      // Log or handle the error as necessary
      throw new Error(
        `Failed to retrieve associated sites by site ID: ${siteId}`,
      );
    }
  }
}
