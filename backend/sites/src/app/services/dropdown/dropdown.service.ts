import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticRoleCd } from '../../entities/particRoleCd.entity';
import { PeopleOrgs } from '../../entities/peopleOrgs.entity';
import { Repository } from 'typeorm';
import { EventClassCd } from '../../entities/eventClassCd.entity';
import { EventTypeCd } from '../../entities/eventTypeCd.entity';
import { EventParticRoleCd } from '../../entities/eventParticRoleCd.entity';

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

  /**
   * Retrieves participant role codes from the repository.
   *
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getParticipantRoleCd() {
    try {
      const result = await this.particRoleRepository.find();
      if (result) {
        return result.map((obj: ParticRoleCd) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
      return [];
    } catch (error) {
      throw new Error('Failed to retrieve participant role codes.');
    }
  }

  /**
   * Retrieves people organizations based on search parameters and entity type.
   *
   * @param searchParam - The search term to filter organizations by display name.
   * @param entityType - The type of entity to filter organizations by.
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getPeopleOrgsCd(searchParam: string, entityType: string) {
    try {
      const queryBuilder =
        this.peopleOrgsRepository.createQueryBuilder('people_orgs');

      if (searchParam) {
        queryBuilder.andWhere(
          'CAST(people_orgs.displayName AS TEXT) LIKE :searchParam',
          {
            searchParam: `%${searchParam.toUpperCase().trim()}%`,
          },
        );
      }

      if (entityType) {
        queryBuilder.andWhere('people_orgs.entityType = :entityType', {
          entityType,
        });
      }

      queryBuilder.orderBy('people_orgs.displayName', 'ASC');

      const result = await queryBuilder.getMany();

      return (
        result.map((obj: PeopleOrgs) => ({
          key: obj.id,
          value: obj.displayName,
        })) || []
      );
    } catch (error) {
      throw new Error('Failed to retrieve people organizations.');
    }
  }

  /**
   * Retrieves notation type codes and organizes them by metadata.
   *
   * @returns A promise that resolves to an array of objects with `metaData` and `dropdownDto` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getNotationTypeCd() {
    try {
      const result = await this.eventTypeCdRepository.find();
      if (result) {
        return result.reduce(
          (acc, item: EventTypeCd) => {
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
          },
          [] as {
            metaData: string;
            dropdownDto: { key: string; value: string }[];
          }[],
        );
      }
      return [];
    } catch (error) {
      throw new Error('Failed to retrieve notation type codes.');
    }
  }

  /**
   * Retrieves notation class codes from the repository.
   *
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getNotationClassCd() {
    try {
      const result = await this.eventClassCdRepository.find();
      if (result) {
        return result.map((obj: EventClassCd) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
      return [];
    } catch (error) {
      throw new Error('Failed to retrieve notation class codes.');
    }
  }

  /**
   * Retrieves notation participant role codes from the repository.
   *
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getNotationParticipantRoleCd() {
    try {
      const result = await this.eventParticRoleCdRepository.find();
      if (result) {
        return result.map((obj: EventParticRoleCd) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
      return [];
    } catch (error) {
      throw new Error('Failed to retrieve notation participant role codes.');
    }
  }
}
