import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { ValidationPipe } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { RecentViews } from 'src/app/entities/recentViews.entity';
import { DashboardService } from 'src/app/services/dashboard/dashboard.service';
import { RecentViewDto } from 'src/app/dto/recentView.dto';
import { DashboardResponse } from 'src/app/dto/response/fetchSiteResponse';

@Resolver(() => RecentViews)
export class DashboardResolver {
  constructor(private readonly dashboardService: DashboardService) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => DashboardResponse, { name: 'getRecentViewsByUserId' })
  async getRecentViewsByUserId(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    const result = await this.dashboardService.getRecentViewsByUserId(userId);
    if (result) {
      return { httpStatusCode: 200, message: 'Success', data: result };
    }

    return {
      httpStatusCode: 404,
      message: `Data not found for user id: ${userId}`,
      data: result,
    };
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => DashboardResponse, { name: 'addRecentView' })
  async addRecentView(
    @Args('recentView', { type: () => RecentViewDto }, new ValidationPipe())
    recentView: RecentViewDto,
  ) {
    const result = await this.dashboardService.addRecentView(recentView);

    if (result) {
      return { httpStatusCode: 201, message: result };
    }

    return { httpStatusCode: 400, message: 'Bad Request.' };
  }
}
