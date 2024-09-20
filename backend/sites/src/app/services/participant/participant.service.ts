import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { SiteParticsDto } from '../../dto/sitePartics.dto';
import { SitePartics } from '../../entities/sitePartics.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(SitePartics)
    private siteParticsRepository: Repository<SitePartics>,
  ) {}

  async getSiteParticipantsBySiteId(siteId: string) {
    sitesLogger.info('ParticipantService.getSiteParticipantsBySiteId() start');
    sitesLogger.debug('ParticipantService.getSiteParticipantsBySiteId() start');
    try {
      const result = await this.siteParticsRepository.find({
        where: { siteId },
      });
      if (result) {
        const transformedObjects = result
          .map((item) => {
            return item.siteParticRoles.map((role) => ({
              guid: v4(),
              id: item.id,
              psnorgId: item.psnorgId,
              effectiveDate: new Date(item.effectiveDate).toISOString(),
              endDate: new Date(item.endDate).toISOString() || null,
              note: item.note.trim(),
              displayName: item.psnorg.displayName.trim(),
              prCode: role.prCode.trim(),
              description: role.prCode2.description.trim(),
            }));
          })
          .flat();
        const sitePartics = plainToInstance(SiteParticsDto, transformedObjects);
        sitesLogger.info(
          'ParticipantService.getSiteParticipantsBySiteId() end',
        );
        sitesLogger.debug(
          'ParticipantService.getSiteParticipantsBySiteId() end',
        );
        return sitePartics;
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in ParticipantService.getSiteParticipantsBySiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve site participants by siteId.');
    }
  }
}
