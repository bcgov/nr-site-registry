import { UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { SiteAssocs } from '../../entities/siteAssocs.entity';
import { AssociatedSiteService } from '../../services/associatedSite/associatedSite.service';
import {
  AssociatedSiteDto,
  AssociatedSiteResponse,
} from '../../dto/associatedSite.dto';
import { CustomRoles } from '../../common/role';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => SiteAssocs)
export class AssociatedSiteResolver {
  constructor(
    private readonly associatedSiteService: AssociatedSiteService,
    private readonly genericResponseProvider: GenericResponseProvider<
      AssociatedSiteDto[]
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
  @Query(() => AssociatedSiteResponse, { name: 'getAssociatedSitesBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getAssociatedSitesBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
  ) {
    sitesLogger.info(
      'AssociatedSiteResolver.getAssociatedSitesBySiteId() start siteID:' +
        ' ' +
        siteId,
    );
    const result =
      await this.associatedSiteService.getAssociatedSitesBySiteId(siteId);
    if (result && result.length > 0) {
      sitesLogger.info(
        'AssociatedSiteResolver.getAssociatedSitesBySiteId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Associated sites fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info(
        'AssociatedSiteResolver.getAssociatedSitesBySiteId()  RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Associated sites data not found for site id: ${siteId}`,
        404,
        false,
        [],
      );
    }
  }
}
