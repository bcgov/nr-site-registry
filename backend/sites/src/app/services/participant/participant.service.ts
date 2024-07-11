import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { SiteParticsDto } from '../../dto/sitePartics.dto';
import { SitePartics } from '../../entities/sitePartics.entity';
import { Repository } from 'typeorm';
import { v4 } from 'uuid';
@Injectable()
export class ParticipantService {
  constructor(
    @InjectRepository(SitePartics)
    private siteParticsRepository: Repository<SitePartics>,
  ) {}

  async getSiteParticipantsBySiteId(siteId: string) {
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
        return sitePartics;
      }
    } catch (error) {
      throw new Error('Failed to retrieve site participants by siteId.');
    }
  }
}
