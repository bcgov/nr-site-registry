import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandHistories } from '../../entities/landHistories.entity';
import { LandHistoryResponse } from '../../dto/landHistory.dto';
import { LandHistoryService } from '../../services/landHistory/landHistory.service';

type SortDirection = 'ASC' | 'DESC';

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
  async getLandHistoriesForSite(
    @Args('siteId', { type: () => String })
    siteId: string,

    @Args('searchTerm', { type: () => String, nullable: true })
    searchTerm: string,

    @Args('sortDirection', { nullable: true })
    sortDirection: SortDirection,

    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
  ) {
    const result = await this.landHistoryService.getLandHistoriesForSite(
      siteId,
      searchTerm,
      sortDirection,
      showPending
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
        null,
      );
    }
  }
}
