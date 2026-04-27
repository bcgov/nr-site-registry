import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandHistories } from '../../entities/landHistories.entity';
import { LandHistoryResponse } from '../../dto/landHistory.dto';
import { LandHistoryService } from '../../services/landHistory/landHistory.service';
import { LoggerService } from '../../logger/logger.service';
import { HttpStatus } from '@nestjs/common';
import { CustomRoles } from '../../common/role';
type SortDirection = 'ASC' | 'DESC';

@Resolver(() => LandHistories)
export class LandHistoryResolver {
  constructor(
    private readonly landHistoryService: LandHistoryService,
    private readonly genericResponseProvider: GenericResponseProvider<
      LandHistories[]
    >,
    private readonly sitesLogger: LoggerService,
  ) {}

  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
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
    this.sitesLogger.log(
      'LandHistoryResolver.getLandHistoriesForSite() start siteId:' +
        ' ' +
        siteId +
        ' searchTerm: ' +
        ' ' +
        searchTerm +
        ' sortDirection: ' +
        ' ' +
        sortDirection,
    );

    const result = await this.landHistoryService.getLandHistoriesForSite(
      siteId,
      searchTerm,
      sortDirection,
      showPending,
    );
    this.sitesLogger.log(
      `LandHistoryResolver.getLandHistoriesForSite() result: ${JSON.stringify(result)}`,
    );
    if (result?.length > 0) {
      this.sitesLogger.log(
        'LandHistoryResolver.getLandHistoriesForSite() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Land uses fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        `Land uses not found for site id ${siteId} with search term ${searchTerm} and sort direction ${sortDirection}`,
      );

      const response = this.genericResponseProvider.createResponse(
        `Land uses data not found for site id: ${siteId}`,
        HttpStatus.NOT_FOUND,
        false,
        [],
      );

      this.sitesLogger.log(
        'LandHistoryResolver.getLandHistoriesForSite() response: ' +
          JSON.stringify(response),
      );
      this.sitesLogger.log(
        'LandHistoryResolver.getLandHistoriesForSite() RES:404 end',
      );
      return response;
    }
  }
}
