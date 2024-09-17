import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Events } from '../../entities/events.entity';
import { NotationDto } from '../../dto/notation.dto';
import { plainToInstance } from 'class-transformer';
import { UserActionEnum } from 'src/app/common/userActionEnum';
import { SRApprovalStatusEnum } from 'src/app/common/srApprovalStatusEnum';
import { EventPartics } from 'src/app/entities/eventPartics.entity';
import { PeopleOrgs } from 'src/app/entities/peopleOrgs.entity';

@Injectable()
export class NotationService {
  constructor(
    @InjectRepository(Events)
    private notationRepository: Repository<Events>,
    @InjectRepository(EventPartics)
    private notationParticRepository: Repository<EventPartics>,
  ) {}

  /**
   * Fetches notations for a given site ID, including related participants.
   *
   * @param siteId - The ID of the site for which notations are to be fetched.
   * @returns An array of NotationDto objects, each containing event and participant details.
   * @throws Error if there's an issue retrieving the data.
   */
  async getSiteNotationBySiteId(siteId: string) {
    try {
      // Retrieve events associated with the given siteId
      const events = await this.notationRepository.find({ where: { siteId } });

      // If no events are found, return an empty array
      if (!events.length) {
        return [];
      }

      // Extract event IDs to fetch related participants in a single query
      const eventIds = events.map((event) => event.id);

      // Fetch event participants related to the retrieved events
      const eventPartics = await this.notationParticRepository.find({
        where: { eventId: In(eventIds) },
        relations: ['psnorg'], // Load related 'psnorg' data to include displayName
      });

      // Create a mapping from event ID to its participants for quick lookup
      const eventParticsMap = eventPartics.reduce(
        (map, partic) => {
          if (!map[partic.eventId]) {
            map[partic.eventId] = [];
          }
          map[partic.eventId].push(partic);
          return map;
        },
        {} as { [key: string]: EventPartics[] },
      );

      // Transform events and their participants
      const transformedObjects = events.map((event) => {
        // Get participants for the current event
        const eventParticsForEvent = eventParticsMap[event.id] || [];

        return {
          id: event.id,
          siteId: event.siteId,
          psnorgId: event.psnorgId,
          completionDate: new Date(event.completionDate).toISOString(),
          requirementDueDate: new Date(event.requirementDueDate).toISOString(),
          requirementReceivedDate: new Date(
            event.requirementReceivedDate,
          ).toISOString(),
          requiredAction: event.requiredAction?.trim(),
          note: event.note?.trim(),
          etypCode: event.etypCode,
          eclsCode: event.eclsCode,
          userAction: event.userAction ?? UserActionEnum.DEFAULT,
          srAction: event.srAction ?? SRApprovalStatusEnum.DEFAULT,
          notationParticipant: eventParticsForEvent.map((partic) => ({
            guid: partic.id,
            eventId: partic.eventId,
            spId: partic.spId,
            eprCode: partic.eprCode,
            psnorgId: partic.psnorgId,
            displayName: partic.psnorg.displayName,
            userAction: partic.userAction ?? UserActionEnum.DEFAULT,
            srAction: partic.srAction ?? SRApprovalStatusEnum.DEFAULT,
          })),
        };
      });

      // Transform plain objects into NotationDto instances
      return plainToInstance(NotationDto, transformedObjects);
    } catch (error) {
      // Handle or log the error as needed
      throw new Error(`Failed to get site notation: ${error.message}`);
    }
  }
}
