import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { ParticRoleCd } from "../../entities/particRoleCd.entity";
import { PeopleOrgs } from "../../entities/peopleOrgs.entity";
import { Repository } from "typeorm";
import { EventClassCd } from "../../entities/eventClassCd.entity";
import { EventTypeCd } from "../../entities/eventTypeCd.entity";
import { EventParticRoleCd } from "../../entities/eventParticRoleCd.entity";

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
    ){}


    async getParticipantRoleCd() {
        try
        {
            const result = await this.particRoleRepository.find()
            if(result)
            {
                return result.map((obj: any) => ({key: obj.code, value: obj.description}));
            }

        }
        catch (error)
        {
            throw new Error('Failed to retrieve participants role code.');
        }
    }

    async getPeopleOrgsCd() {
        try
        {
            const result = await this.peopleOrgsRepository.find()
            if(result)
                {
                    return result.reduce((acc, item) => {
                        const existingMetaData = acc.find(meta => meta.metaData === item.entityType);
                        const dropdownItem = {
                            key: item.id,
                            value: item.displayName
                          };
                          if (existingMetaData) {
                            existingMetaData.dropdownDto.push(dropdownItem);
                          } else {
                            acc.push({
                              metaData: item.entityType,
                              dropdownDto: [dropdownItem]
                            });
                          }
                      
                        return acc;
                }, []);
                }
    
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

           

        }
        catch (error)
        {
            throw new Error('Failed to retrieve people orgs.');
        }
    }

    async getNotationTypeCd() {
        try
        {
            const result = await this.eventTypeCdRepository.find()
            if(result)
            {
                return result.reduce((acc, item) => {
                    const existingMetaData = acc.find(meta => meta.metaData === item.eclsCode);
                    const dropdownItem = {
                        key: item.code,
                        value: item.description
                      };
                      if (existingMetaData) {
                        existingMetaData.dropdownDto.push(dropdownItem);
                      } else {
                        acc.push({
                          metaData: item.eclsCode,
                          dropdownDto: [dropdownItem]
                        });
                      }
                  
                    return acc;
            }, []);
            }

        }
        catch (error)
        {
            throw new Error('Failed to retrieve notation type code.');
        }
    }

    async getNotationClassCd() {
        try
        {
            const result = await this.eventClassCdRepository.find()
            if(result)
            {
                return result.map((obj: any) => ({key: obj.code, value: obj.description}));
            }

        }
        catch (error)
        {
            throw new Error('Failed to retrieve notation class code.');
        }
    }

    async getNotationParticipantRoleCd() {
        try
        {
            const result = await this.eventParticRoleCdRepository.find()
            if(result)
            {
                return result.map((obj: any) => ({key: obj.code, value: obj.description}));
            }

        }
        catch (error)
        {
            throw new Error('Failed to retrieve notation participant role code.');
        }
    }
      
}