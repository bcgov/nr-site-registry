import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Events } from '../../entities/events.entity';
import { NotationDto } from '../../dto/notation.dto';
import { plainToInstance } from 'class-transformer';
import { v4 } from 'uuid';
import { UserActionEnum } from 'src/app/common/userActionEnum';

@Injectable()
export class NotationService {
  constructor(
    @InjectRepository(Events)
    private notationRepository: Repository<Events>,
  ) {}

  async getSiteNotationBySiteId(siteId: string,showPending: boolean) {
    try {
      
      let result:Events[] = [];
      
      if(showPending)
      {
        result =  await this.notationRepository.find({ where: { siteId , userAction: UserActionEnum.updated } });
      }
      else
      {
        result =  await this.notationRepository.find({ where: { siteId } });
      }
     
      if (result) {
        const transformedObjects = result.map((item) => {
          const obj = {
            id: item.id,
            siteId: item.siteId,
            psnorgId: item.psnorgId,
            completionDate: new Date(item.completionDate).toISOString(),
            requirementDueDate: new Date(item.requirementDueDate).toISOString(),
            requirementReceivedDate: new Date(
              item.requirementReceivedDate,
            ).toISOString(),
            requiredAction: item.requiredAction?.trim(),
            note: item.note?.trim(),
            etypCode: item.etypCode,
            eclsCode: item.eclsCode,
          };
          let notationParticipant = [];
          if (item.eventPartics.length > 0) {
            notationParticipant = item.eventPartics.map((role) => ({
              guid: v4(),
              eprCode: role.eprCode,
              psnorgId: role.psnorgId,
              displayName: role.psnorg.displayName,
            }));
          } else {
            notationParticipant = [];
          }
          return {
            ...obj,
            notationParticipant: notationParticipant,
          };
        });
        const notations = plainToInstance(NotationDto, transformedObjects);
        return notations;
      }
    } catch (error) {
      throw error;
    }
  }
}
