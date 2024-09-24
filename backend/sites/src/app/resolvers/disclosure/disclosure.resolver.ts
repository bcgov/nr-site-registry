import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { DisclosureResponse } from '../../dto/disclosure.dto';
import { DisclosureService } from '../../services/disclosure/disclosure.service';
import { CustomRoles } from '../../common/role';

@Resolver(() => SiteProfiles)
export class DisclosureResolver {
  constructor(
    private readonly dsiclosureService: DisclosureService,
    private readonly genericResponseProvider: GenericResponseProvider<
      SiteProfiles[]
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
  @Query(() => DisclosureResponse, { name: 'getSiteDisclosureBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteDisclosureBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
  ) {
    const result =
      await this.dsiclosureService.getSiteDisclosureBySiteId(siteId, showPending);
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Site Disclosure fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Site Disclosure data not found for site id: ${siteId}`,
        404,
        false,
        null,
      );
    }
  }
}
