import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { plainToInstance } from "class-transformer";
import { ParticRoleCd } from "src/app/entities/particRoleCd.entity";
import { Repository } from "typeorm";

@Injectable()
export class ParticipantRoleCdService {
    
    constructor(
        @InjectRepository(ParticRoleCd)
        private particRoleRepository: Repository<ParticRoleCd>,
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
}