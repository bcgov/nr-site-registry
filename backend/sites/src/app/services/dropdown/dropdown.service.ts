import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { ParticRoleCd } from 'src/app/entities/particRoleCd.entity';
import { PeopleOrgs } from 'src/app/entities/peopleOrgs.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DropdownService {
  constructor(
    @InjectRepository(ParticRoleCd)
    private particRoleRepository: Repository<ParticRoleCd>,

    @InjectRepository(PeopleOrgs)
    private peopleOrgsRepository: Repository<PeopleOrgs>,
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

  async getPeopleOrgsCd() {
    try {
      const result = await this.peopleOrgsRepository.find();
      if (result) {
        return result.map((obj: any) => ({
          key: obj.id,
          value: obj.displayName,
        }));
      }
    } catch (error) {
      throw new Error('Failed to retrieve people orgs.');
    }
  }
}
