import { Query, Resolver } from "@nestjs/graphql";
import { RoleMatchingMode, Roles } from "nest-keycloak-connect";
import { PeopleOrgsDto, PeopleOrgsResponse } from "src/app/dto/peopleOrgs.dto";
import { GenericResponseProvider } from "src/app/dto/response/genericResponseProvider";
import { PeopleOrgs } from "src/app/entities/peopleOrgs.entity";
import { PeopleOrgsService } from "src/app/services/peopleOrganization/peopleOrgs.service";

@Resolver(() => PeopleOrgs)
export class PeopleOrgsResolver {
    constructor (
        private readonly peopleOrgsService: PeopleOrgsService,
        private readonly genericResponseProvider: GenericResponseProvider<PeopleOrgsDto[]>,
    ){}

    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => PeopleOrgsResponse, { name: 'getPeopleOrgs' })
    async getPeopleOrgs()
    {
        const result = await this.peopleOrgsService.getPeopleOrgs();
        if (result.length > 0) {
          return this.genericResponseProvider.createResponse('People Organization fetched successfully', 200, true, result);
        }
        else
        {
          return this.genericResponseProvider.createResponse(`People Organization not found`, 404, false);
        }
    }
}