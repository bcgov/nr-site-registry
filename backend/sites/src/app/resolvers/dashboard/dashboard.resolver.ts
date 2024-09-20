import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { RecentViews } from '../../entities/recentViews.entity';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { RecentViewDto, RecentViewResponse } from '../../dto/recentView.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => RecentViews)
export class DashboardResolver {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly genericResponseProvider: GenericResponseProvider<
      RecentViews[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => RecentViewResponse, { name: 'getRecentViewsByUserId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getRecentViewsByUserId(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    sitesLogger.info(
      'DashboardResolver.getRecentViewsByUserId() start userId:' + ' ' + userId,
    );
    const result = await this.dashboardService.getRecentViewsByUserId(userId);
    if (result.length > 0) {
      sitesLogger.info(
        'DashboardResolver.getRecentViewsByUserId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Recent views fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info(
        'DashboardResolver.getRecentViewsByUserId() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Recent views data not found for site id: ${userId}`,
        404,
        false,
        null,
      );
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => RecentViewResponse, { name: 'addRecentView' })
  async addRecentView(
    @Args('recentView', { type: () => RecentViewDto }, new ValidationPipe())
    recentView: RecentViewDto,
  ) {
    sitesLogger.info(
      'DashboardResolver.addRecentView() start recentViewDTO:' +
        ' ' +
        JSON.stringify(RecentViewDto),
    );
    const message = await this.dashboardService.addRecentView(recentView);

    if (message) {
      sitesLogger.info('DashboardResolver.addRecentView() RES:201 end');
      return this.genericResponseProvider.createResponse(message, 201, true);
    } else {
      sitesLogger.info('DashboardResolver.addRecentView() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Recent views failed to insert or update recent view. `,
        400,
        false,
        null,
      );
    }
  }
}
