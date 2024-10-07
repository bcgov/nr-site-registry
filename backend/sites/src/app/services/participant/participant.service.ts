import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { SiteParticsDto } from '../../dto/sitePartics.dto';
import { SitePartics } from '../../entities/sitePartics.entity';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid'; // Import uuid function for generating unique IDs
import { LoggerService } from '../../logger/logger.service';
import { UserActionEnum } from '../../common/userActionEnum';
// eslint-disable-next-line @typescript-eslint/no-var-requires

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(SitePartics)
    private readonly siteParticsRepository: Repository<SitePartics>,
    private readonly sitesLogger: LoggerService,
  ) {}

  /**
   * Retrieves site participants for a given site ID and transforms the data into DTOs.
   *
   * @param siteId - The ID of the site for which participants are to be fetched.
   * @returns An array of SiteParticsDto objects containing participant details.
   * @throws Error if there is an issue retrieving the data.
   */
  async getSiteParticipantsBySiteId(
    siteId: string,
    showPending: boolean,
  ): Promise<SiteParticsDto[]> {
    try {
      this.sitesLogger.log(
        'ParticipantService.getSiteParticipantsBySiteId() start',
      );
      this.sitesLogger.debug(
        'ParticipantService.getSiteParticipantsBySiteId() start',
      );

      // Fetch site participants based on the given siteId
      let result = [];

      if (showPending)
        result = await this.siteParticsRepository.find({
          where: { siteId, userAction: UserActionEnum.UPDATED },
          relations: ['psnorg', 'siteParticRoles', 'siteParticRoles.prCode2'],
        });
      else
        result = await this.siteParticsRepository.find({
          where: { siteId },
          relations: ['psnorg', 'siteParticRoles', 'siteParticRoles.prCode2'],
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

      this.sitesLogger.log(
        'ParticipantService.getSiteParticipantsBySiteId() end',
      );
      this.sitesLogger.debug(
        'ParticipantService.getSiteParticipantsBySiteId() end',
      );
      return sitePartics;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in ParticipantService.getSiteParticipantsBySiteId() end',
        JSON.stringify(error),
      );
      // Log or handle the error as necessary
      throw new Error(
        `Failed to retrieve site participants by siteId: ${error.message}`,
      );
    }
  }
}
