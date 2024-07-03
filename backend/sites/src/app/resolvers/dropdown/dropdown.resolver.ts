import { Resolver,Query } from "@nestjs/graphql";
import { RoleMatchingMode, Roles } from "nest-keycloak-connect";
import { DropdownDto, DropdownResponse } from "src/app/dto/dropdown.dto";
import { GenericResponseProvider } from "src/app/dto/response/genericResponseProvider";
import { DropdownService } from "src/app/services/dropdown/dropdown.service";


@Resolver(() => DropdownDto)
export class DropdownResolver {
    constructor (
        private readonly dropdownService: DropdownService,
        private readonly genericResponseProvider: GenericResponseProvider<DropdownDto[]>,
    ){}

    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => DropdownResponse, { name: 'getParticipantRoleCd' })
    async getParticipantRoleCd()
    {
        const result = await this.dropdownService.getParticipantRoleCd();
        if (result.length > 0) {
          return this.genericResponseProvider.createResponse('Participants role code fetched successfully', 200, true, result);
        }
        else
        {
          return this.genericResponseProvider.createResponse(`Participants role code not found`, 404, false);
        }
    }


    
    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => DropdownResponse, { name: 'getPeopleOrgsCd' })
    async getPeopleOrgsCd()
    {
        const result = await this.dropdownService.getPeopleOrgsCd();
        if (result.length > 0) {
          return this.genericResponseProvider.createResponse('People Organization fetched successfully', 200, true, result);
        }
        else
        {
          return this.genericResponseProvider.createResponse(`People Organization not found`, 404, false);
        }
    }
}