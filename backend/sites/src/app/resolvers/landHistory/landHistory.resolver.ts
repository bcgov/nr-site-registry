import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandHistories } from '../../entities/landHistories.entity';
import { LandHistoryResponse } from '../../dto/landHistory.dto';
import { LandHistoryService } from '../../services/landHistory/landHistory.service';
import { LoggerService } from '../../logger/logger.service';
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
    try {
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
      if (result.length > 0) {
        this.sitesLogger.log(
          'LandHistoryResolver.getLandHistoriesForSite() RES:200 end',
        );
        return this.genericResponseProvider.createResponse(
          'Land uses fetched successfully',
          200,
          true,
          result,
        );
      } else {
        this.sitesLogger.log(
          'LandHistoryResolver.getLandHistoriesForSite() RES:404 end',
        );
        return this.genericResponseProvider.createResponse(
          `Land uses data not found for site id: ${siteId}`,
          404,
          false,
          null,
        );
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in LandHistoryResolver.getLandHistoriesForSite() end',
        JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }
}
