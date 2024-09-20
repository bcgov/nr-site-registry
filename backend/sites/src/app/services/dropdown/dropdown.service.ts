import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticRoleCd } from '../../entities/particRoleCd.entity';
import { PeopleOrgs } from '../../entities/peopleOrgs.entity';
import { Repository } from 'typeorm';
import { EventClassCd } from '../../entities/eventClassCd.entity';
import { EventTypeCd } from '../../entities/eventTypeCd.entity';
import { EventParticRoleCd } from '../../entities/eventParticRoleCd.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class DropdownService {
  constructor(
    @InjectRepository(ParticRoleCd)
    private particRoleRepository: Repository<ParticRoleCd>,

    @InjectRepository(PeopleOrgs)
    private peopleOrgsRepository: Repository<PeopleOrgs>,

    @InjectRepository(EventClassCd)
    private eventClassCdRepository: Repository<EventClassCd>,

    @InjectRepository(EventTypeCd)
    private eventTypeCdRepository: Repository<EventTypeCd>,

    @InjectRepository(EventParticRoleCd)
    private eventParticRoleCdRepository: Repository<EventParticRoleCd>,
  ) {}

  async getParticipantRoleCd() {
    sitesLogger.info('DropdownService.getParticipantRoleCd() start');
    sitesLogger.debug('DropdownService.getParticipantRoleCd() start');
    try {
      const result = await this.particRoleRepository.find();
      if (result) {
        sitesLogger.info('DropdownService.getParticipantRoleCd() end');
        sitesLogger.debug('DropdownService.getParticipantRoleCd() end');
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
      sitesLogger.info('DropdownService.getParticipantRoleCd() end');
      sitesLogger.debug('DropdownService.getParticipantRoleCd() end');
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DropdownService.getParticipantRoleCd() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve participants role code.');
    }
  }

  async getPeopleOrgsCd() {
    sitesLogger.info('DropdownService.getPeopleOrgsCd() start');
    sitesLogger.debug('DropdownService.getPeopleOrgsCd() start');
    try {
      const result = await this.peopleOrgsRepository.find();
      if (result) {
        sitesLogger.info('DropdownService.getPeopleOrgsCd() end');
        sitesLogger.debug('DropdownService.getPeopleOrgsCd() end');
        return result.reduce((acc, item) => {
          const existingMetaData = acc.find(
            (meta) => meta.metaData === item.entityType,
          );
          const dropdownItem = {
            key: item.id,
            value: item.displayName,
          };
          if (existingMetaData) {
            existingMetaData.dropdownDto.push(dropdownItem);
          } else {
            acc.push({
              metaData: item.entityType,
              dropdownDto: [dropdownItem],
            });
          }

          return acc;
        }, []);
      }
      sitesLogger.info('DropdownService.getPeopleOrgsCd() end');
      sitesLogger.debug('DropdownService.getPeopleOrgsCd() end');

      // let result = [];
      // if (entityTypes && entityTypes.length > 0)
      // {
      //     result = await this.peopleOrgsRepository
      //     .createQueryBuilder('people_orgs') // Alias for the main entity
      //     .where('people_orgs.entity_Type IN (:...entityTypes)', { entityTypes }) // Filtering by entityType
      //     .getMany();
      //     if(result)
      //     {
      //         return result.map((obj: any) => ({key: obj.id, value: obj.displayName}));
      //     }
      // }
      // else
      // {
      //     result = await this.peopleOrgsRepository.find();
      // }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DropdownService.getPeopleOrgsCd() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve people orgs.');
    }
  }

  async getNotationTypeCd() {
    sitesLogger.info('DropdownService.getNotationTypeCd() start');
    sitesLogger.debug('DropdownService.getNotationTypeCd() start');
    try {
      const result = await this.eventTypeCdRepository.find();
      if (result) {
        sitesLogger.info('DropdownService.getNotationTypeCd() end');
        sitesLogger.debug('DropdownService.getNotationTypeCd() end');
        return result.reduce((acc, item) => {
          const existingMetaData = acc.find(
            (meta) => meta.metaData === item.eclsCode,
          );
          const dropdownItem = {
            key: item.code,
            value: item.description,
          };
          if (existingMetaData) {
            existingMetaData.dropdownDto.push(dropdownItem);
          } else {
            acc.push({
              metaData: item.eclsCode,
              dropdownDto: [dropdownItem],
            });
          }

          return acc;
        }, []);
      }
      sitesLogger.info('DropdownService.getNotationTypeCd() end');
      sitesLogger.debug('DropdownService.getNotationTypeCd() end');
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DropdownService.getNotationTypeCd() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve notation type code.');
    }
  }

  async getNotationClassCd() {
    sitesLogger.info('DropdownService.getNotationClassCd() start');
    sitesLogger.debug('DropdownService.getNotationClassCd() start');
    try {
      const result = await this.eventClassCdRepository.find();
      if (result) {
        sitesLogger.info('DropdownService.getNotationClassCd() end');
        sitesLogger.debug('DropdownService.getNotationClassCd() end');
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
      sitesLogger.info('DropdownService.getNotationClassCd() end');
      sitesLogger.debug('DropdownService.getNotationClassCd() end');
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DropdownService.getNotationClassCd() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve notation class code.');
    }
  }

  async getNotationParticipantRoleCd() {
    sitesLogger.info('DropdownService.getNotationParticipantRoleCd() start');
    sitesLogger.debug('DropdownService.getNotationParticipantRoleCd() start');
    try {
      const result = await this.eventParticRoleCdRepository.find();
      if (result) {
        sitesLogger.info('DropdownService.getNotationParticipantRoleCd() end');
        sitesLogger.debug('DropdownService.getNotationParticipantRoleCd() end');
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
      sitesLogger.info('DropdownService.getNotationParticipantRoleCd() end');
      sitesLogger.debug('DropdownService.getNotationParticipantRoleCd() end');
    } catch (error) {
      sitesLogger.error(
        'Exception occured in DropdownService.getNotationParticipantRoleCd() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('Failed to retrieve notation participant role code.');
    }
  }
}
