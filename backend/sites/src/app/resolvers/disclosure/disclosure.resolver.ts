import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { DisclosureResponse } from '../../dto/disclosure.dto';
import { DisclosureService } from '../../services/disclosure/disclosure.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => SiteProfiles)
export class DisclosureResolver {
  constructor(
    private readonly dsiclosureService: DisclosureService,
    private readonly genericResponseProvider: GenericResponseProvider<
      SiteProfiles[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => DisclosureResponse, { name: 'getSiteDisclosureBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteDisclosureBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
  ) {
    sitesLogger.info(
      'DisclosureResolver.getSiteDisclosureBySiteId() start siteId:' +
        ' ' +
        siteId,
    );
    const result =
      await this.dsiclosureService.getSiteDisclosureBySiteId(siteId);
    if (result.length > 0) {
      sitesLogger.info(
        'DisclosureResolver.getSiteDisclosureBySiteId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Site Disclosure fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info(
        'DisclosureResolver.getSiteDisclosureBySiteId() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Site Disclosure data not found for site id: ${siteId}`,
        404,
        false,
        null,
      );
    }
  }
}
