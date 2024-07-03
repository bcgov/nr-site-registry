import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { PeopleOrgs } from "src/app/entities/peopleOrgs.entity";
import { Repository } from "typeorm";

@Injectable()
export class PeopleOrgsService {
    
    constructor(
        @InjectRepository(PeopleOrgs)
        private peopleOrgsRepository: Repository<PeopleOrgs>,
    ){}


    async getPeopleOrgs() {
        try
        {
            const result = await this.peopleOrgsRepository.find()
            if(result)
            {
                return result.map((obj: any) => ({key: obj.id, value: obj.displayName}));
            }

        }
        catch (error)
        {
            throw new Error('Failed to retrieve people orgs.');
        }
    }
}