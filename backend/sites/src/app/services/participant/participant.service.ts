import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { SiteParticsDto } from '../../dto/sitePartics.dto';
import { SitePartics } from '../../entities/sitePartics.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // Import uuid function for generating unique IDs

// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(SitePartics)
    private readonly siteParticsRepository: Repository<SitePartics>,
  ) {}

  /**
   * Retrieves site participants for a given site ID and transforms the data into DTOs.
   *
   * @param siteId - The ID of the site for which participants are to be fetched.
   * @returns An array of SiteParticsDto objects containing participant details.
   * @throws Error if there is an issue retrieving the data.
   */
  async getSiteParticipantsBySiteId(siteId: string): Promise<SiteParticsDto[]> {
    sitesLogger.info('ParticipantService.getSiteParticipantsBySiteId() start');
    sitesLogger.debug('ParticipantService.getSiteParticipantsBySiteId() start');
    try {
      // Fetch site participants based on the given siteId
      const result = await this.siteParticsRepository.find({
        where: { siteId },
        relations: ['psnorg', 'siteParticRoles', 'siteParticRoles.prCode2'], // Ensure related entities are loaded
      });

      if (!result.length) {
        return [];
      }

      // Transform the fetched site participants into the desired format
      const transformedObjects = result.flatMap((item) =>
        item.siteParticRoles.map((role) => ({
          guid: uuidv4(), // Generate a unique GUID for each participant-role mapping
          id: item.id,
          psnorgId: item.psnorgId,
          effectiveDate: new Date(item.effectiveDate).toISOString(),
          endDate: item.endDate ? new Date(item.endDate).toISOString() : null,
          note: item.note?.trim() || '', // Ensure note is trimmed and defaults to an empty string if null
          displayName: item.psnorg?.displayName?.trim() || '', // Safely access displayName with default value
          prCode: role.prCode.trim(),
          description: role.prCode2?.description?.trim() || '', // Safely access description with default value
        })),
      );

      // Convert the transformed objects into DTOs
      const sitePartics = plainToInstance(SiteParticsDto, transformedObjects);

      sitesLogger.info('ParticipantService.getSiteParticipantsBySiteId() end');
      sitesLogger.debug('ParticipantService.getSiteParticipantsBySiteId() end');
      return sitePartics;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in ParticipantService.getSiteParticipantsBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      // Log or handle the error as necessary
      throw new Error(
        `Failed to retrieve site participants by siteId: ${error.message}`,
      );
    }
  }
}
