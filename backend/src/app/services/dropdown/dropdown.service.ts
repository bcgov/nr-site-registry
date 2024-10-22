import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ParticRoleCd } from '../../entities/particRoleCd.entity';
import { PeopleOrgs } from '../../entities/peopleOrgs.entity';
import { Repository } from 'typeorm';
import { EventClassCd } from '../../entities/eventClassCd.entity';
import { EventTypeCd } from '../../entities/eventTypeCd.entity';
import { EventParticRoleCd } from '../../entities/eventParticRoleCd.entity';
import { LoggerService } from '../../logger/logger.service';
import { User } from '../../entities/user.entity';
import { DropdownDto } from '../../dto/dropdown.dto';

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

    @InjectRepository(User)
    private userRepository: Repository<User>,

    private readonly sitesLogger: LoggerService,
  ) {}

  /**
   * Retrieves participant role codes from the repository.
   *
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getParticipantRoleCd() {
    this.sitesLogger.log('DropdownService.getParticipantRoleCd() start');
    this.sitesLogger.debug('DropdownService.getParticipantRoleCd() start');
    try {
      const result = await this.particRoleRepository.find();
      if (result && result.length > 0) {
        this.sitesLogger.log('DropdownService.getParticipantRoleCd() end');
        this.sitesLogger.debug('DropdownService.getParticipantRoleCd() end');
        return result.map((obj: any) => ({
          key: obj.code,
          value: obj.description,
        }));
      } else {
        this.sitesLogger.log('DropdownService.getParticipantRoleCd() end');
        this.sitesLogger.debug('DropdownService.getParticipantRoleCd() end');
        return [];
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DropdownService.getParticipantRoleCd() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve participants role code.`,
        HttpStatus.NOT_FOUND,
      );
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
    this.sitesLogger.log('DropdownService.getPeopleOrgsCd() start');
    this.sitesLogger.debug('DropdownService.getPeopleOrgsCd() start');
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

      this.sitesLogger.log('DropdownService.getPeopleOrgsCd() end');
      this.sitesLogger.debug('DropdownService.getPeopleOrgsCd() end');
      return (
        result.map((obj: PeopleOrgs) => ({
          key: obj.id,
          value: obj.displayName,
        })) || []
      );
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DropdownService.getPeopleOrgsCd() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve people orgs.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Retrieves notation type codes and organizes them by metadata.
   *
   * @returns A promise that resolves to an array of objects with `metaData` and `dropdownDto` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getNotationTypeCd() {
    this.sitesLogger.log('DropdownService.getNotationTypeCd() start');
    this.sitesLogger.debug('DropdownService.getNotationTypeCd() start');
    try {
      const result = await this.eventTypeCdRepository.find();
      if (result && result.length > 0) {
        this.sitesLogger.log('DropdownService.getNotationTypeCd() end');
        this.sitesLogger.debug('DropdownService.getNotationTypeCd() end');
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
      } else {
        this.sitesLogger.log('DropdownService.getNotationTypeCd() end');
        this.sitesLogger.debug('DropdownService.getNotationTypeCd() end');
        return [];
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DropdownService.getNotationTypeCd() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve notation type codes.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Retrieves notation class codes from the repository.
   *
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getNotationClassCd() {
    this.sitesLogger.log('DropdownService.getNotationClassCd() start');
    this.sitesLogger.debug('DropdownService.getNotationClassCd() start');
    try {
      const result = await this.eventClassCdRepository.find();
      if (result && result.length > 0) {
        this.sitesLogger.log('DropdownService.getNotationClassCd() end');
        this.sitesLogger.debug('DropdownService.getNotationClassCd() end');
        return result.map((obj: EventClassCd) => ({
          key: obj.code,
          value: obj.description,
        }));
      } else {
        this.sitesLogger.log('DropdownService.getNotationClassCd() end');
        this.sitesLogger.debug('DropdownService.getNotationClassCd() end');
        return [];
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DropdownService.getNotationClassCd() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve notation class codes.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  /**
   * Retrieves notation participant role codes from the repository.
   *
   * @returns A promise that resolves to an array of objects with `key` and `value` properties.
   * @throws Error if there is an issue retrieving the data.
   */
  async getNotationParticipantRoleCd() {
    this.sitesLogger.log(
      'DropdownService.getNotationParticipantRoleCd() start',
    );
    this.sitesLogger.debug(
      'DropdownService.getNotationParticipantRoleCd() start',
    );
    try {
      const result = await this.eventParticRoleCdRepository.find();
      if (result && result.length > 0) {
        this.sitesLogger.log(
          'DropdownService.getNotationParticipantRoleCd() end',
        );
        this.sitesLogger.debug(
          'DropdownService.getNotationParticipantRoleCd() end',
        );
        return result.map((obj: EventParticRoleCd) => ({
          key: obj.code,
          value: obj.description,
        }));
      } else {
        this.sitesLogger.log(
          'DropdownService.getNotationParticipantRoleCd() end',
        );
        this.sitesLogger.debug(
          'DropdownService.getNotationParticipantRoleCd() end',
        );
        return [];
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DropdownService.getNotationParticipantRoleCd() end',
        JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to retrieve notation participant role codes.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }

  // Get IDIR User List
  async getIDIRUserGivenNamesForDropDown(): Promise<DropdownDto[]> {
    try {
      const IDP = 'idir';

      this.sitesLogger.log('DropdownService.getIDIRUserNamesForDropDown start');

      const idirUserList = await this.userRepository.find({
        where: { idp: IDP },
      });

      if (idirUserList.length > 0) {
        this.sitesLogger.log(
          'DropdownService.getIDIRUserNamesForDropDown returning user list',
        );
        return idirUserList.map((user) => {
          return {
            key: user.firstName,
            value: user.firstName,
          };
        });
      } else {
        this.sitesLogger.log(
          'DropdownService.getIDIRUserNamesForDropDown no users found',
        );
        return [];
      }
    } catch (error) {
      this.sitesLogger.log(
        'DropdownService.getIDIRUserNamesForDropDown error' +
          JSON.stringify(error),
      );
      throw new HttpException(
        `Failed to get users name.`,
        HttpStatus.NOT_FOUND,
      );
    }
  }
}
