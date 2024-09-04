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

  async getParticipantRoleCd() {
    try {
      const result = await this.particRoleRepository.find();
      if (result) {
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
    } catch (error) {
      throw new Error('Failed to retrieve participants role code.');
    }
  }

  async getPeopleOrgsCd(searchParam: string, entityType: string) {
    try {
      const queryBuilder =
        this.peopleOrgsRepository.createQueryBuilder('people_orgs');
      // Apply filters based on the provided parameters
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

      // Order the results by 'id' in ascending order
      queryBuilder.orderBy('people_orgs.displayName', 'ASC');

      // Execute the query and get the results
      const result = await queryBuilder.getMany();

      // Return formatted results
      if (result) {
        return result.map((obj: any) => ({
          key: obj.id,
          value: obj.displayName,
        }));
      } else {
        return []; // Return an empty array if no results
      }
    } catch (error) {
      throw new Error('Failed to retrieve people orgs.');
    }
  }

  async getNotationTypeCd() {
    try {
      const result = await this.eventTypeCdRepository.find();
      if (result) {
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
    } catch (error) {
      throw new Error('Failed to retrieve notation type code.');
    }
  }

  async getNotationClassCd() {
    try {
      const result = await this.eventClassCdRepository.find();
      if (result) {
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
    } catch (error) {
      throw new Error('Failed to retrieve notation class code.');
    }
  }

  async getNotationParticipantRoleCd() {
    try {
      const result = await this.eventParticRoleCdRepository.find();
      if (result) {
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      }
    } catch (error) {
      throw new Error('Failed to retrieve notation participant role code.');
    }
  }
}
