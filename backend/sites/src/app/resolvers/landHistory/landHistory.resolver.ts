import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandHistories } from 'src/app/entities/landHistories.entity';
import { LandHistoryResponse } from 'src/app/dto/landHistory.dto';
import { LandHistoryService } from 'src/app/services/landHistory/landHistory.service';

@Resolver(() => LandHistories)
export class LandHistoryResolver {
  constructor(
    private readonly landHistoryService: LandHistoryService,
    private readonly genericResponseProvider: GenericResponseProvider<
      LandHistories[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => LandHistoryResponse, { name: 'getLandHistoriesForSite' })
  // TODO: figure out how this works and if we need GenericValidationPipe here
  // Passing an empty string to a nullable field throws a validation error
  // @UsePipes(new GenericValidationPipe())
  async getLandHistoriesForSite(
    @Args('siteId', { type: () => String })
    siteId: string,

    @Args('searchTerm', { type: () => String, nullable: true })
    searchTerm: string,
  ) {
    const result = await this.landHistoryService.getLandHistoriesForSite(
      siteId,
      searchTerm,
    );
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Land uses fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Land uses data not found for site id: ${siteId}`,
        404,
        false,
      );
    }
  }
}
