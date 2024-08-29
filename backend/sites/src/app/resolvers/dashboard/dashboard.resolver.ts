import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { RecentViews } from '../../entities/recentViews.entity';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { RecentViewDto, RecentViewResponse } from '../../dto/recentView.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { CustomRoles } from '../../common/role';

@Resolver(() => RecentViews)
export class DashboardResolver {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly genericResponseProvider: GenericResponseProvider<
      RecentViews[]
    >,
  ) {}

  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => RecentViewResponse, { name: 'getRecentViewsByUserId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getRecentViewsByUserId(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    const result = await this.dashboardService.getRecentViewsByUserId(userId);
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Recent views fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Recent views data not found for site id: ${userId}`,
        404,
        false,
        null,
      );
    }
  }

  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
  @Mutation(() => RecentViewResponse, { name: 'addRecentView' })
  async addRecentView(
    @Args('recentView', { type: () => RecentViewDto }, new ValidationPipe())
    recentView: RecentViewDto,
  ) {
    const message = await this.dashboardService.addRecentView(recentView);

    if (message) {
      return this.genericResponseProvider.createResponse(message, 201, true);
    } else {
      return this.genericResponseProvider.createResponse(
        `Recent views failed to insert or update recent view. `,
        400,
        false,
        null,
      );
    }
  }
}
