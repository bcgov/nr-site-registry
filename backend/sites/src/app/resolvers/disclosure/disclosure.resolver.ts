import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { RecentViews } from '../../entities/recentViews.entity';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { RecentViewDto, RecentViewResponse } from '../../dto/recentView.dto';
import { GenericResponseProvider } from 'src/app/dto/response/genericResponseProvider';
import { GenericValidationPipe } from 'src/app/utils/validations/genericValidationPipe';
import { SiteProfiles } from 'src/app/entities/siteProfiles.entity';
import { DisclosureResponse } from 'src/app/dto/disclosure.dto';
import { DisclosureService } from 'src/app/services/disclosure/disclosure.service';

@Resolver(() => SiteProfiles)
export class DisclosureResolver {
  constructor(
    private readonly dsiclosureService: DisclosureService, 
    private readonly genericResponseProvider: GenericResponseProvider<SiteProfiles[]>,
  ) { }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => DisclosureResponse, { name: 'getSiteDisclosureBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteDisclosureBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
  ) {
    const result = await this.dsiclosureService.getSiteDisclosureBySiteId(siteId);
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse('Site Disclosure fetched successfully', 200, true, result);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Site Disclosure data not found for site id: ${siteId}`, 404, false);
    }
  }
}
