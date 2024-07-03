import { Resolver,Query } from "@nestjs/graphql";
import { RoleMatchingMode, Roles } from "nest-keycloak-connect";
import { ParticipantRoleCdDto, ParticipantRoleCdResponse } from "src/app/dto/participantRoleCd.dto";
import { GenericResponseProvider } from "src/app/dto/response/genericResponseProvider";
import { ParticRoleCd } from "src/app/entities/particRoleCd.entity";
import { ParticipantRoleCdService } from "src/app/services/dropdown/participantRoleCd.service";


@Resolver(() => ParticRoleCd)
export class ParticipantRoleCdResolver {
    constructor (
        private readonly participantRoleCdService: ParticipantRoleCdService,
        private readonly genericResponseProvider: GenericResponseProvider<ParticipantRoleCdDto[]>,
    ){}

    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => ParticipantRoleCdResponse, { name: 'getParticipantRoleCd' })
    async getParticipantRoleCd()
    {
        const result = await this.participantRoleCdService.getParticipantRoleCd();
        if (result.length > 0) {
          return this.genericResponseProvider.createResponse('Participants role code fetched successfully', 200, true, result);
        }
        else
        {
          return this.genericResponseProvider.createResponse(`Participants role code not found`, 404, false);
        }
    }
}