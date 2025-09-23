import { Args, Query, Resolver } from '@nestjs/graphql';
import { HttpStatus, UsePipes } from '@nestjs/common';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { SiteProfiles } from '../../entities/siteProfiles.entity';
import { DisclosureResponse, SiteProfilesDTO } from '../../dto/disclosure.dto';
import { DisclosureService } from '../../services/disclosure/disclosure.service';
import { CustomRoles } from '../../common/role';
import { LoggerService } from '../../logger/logger.service';

@Resolver(() => SiteProfiles)
export class DisclosureResolver {
  constructor(
    private readonly dsiclosureService: DisclosureService,
    private readonly genericResponseProvider: GenericResponseProvider<
      SiteProfilesDTO[]
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
  @Query(() => DisclosureResponse, { name: 'getSiteDisclosureBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteDisclosureBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
    @AuthenticatedUser() user: any,
  ) {
    this.sitesLogger.log(
      'DisclosureResolver.getSiteDisclosureBySiteId() start siteId:' +
        ' ' +
        siteId +
        ' showPending = ' +
        showPending,
    );

    const result = await this.dsiclosureService.getSiteDisclosureBySiteId(
      siteId,
      showPending,
      user,
    );
    if (result?.length > 0) {
      this.sitesLogger.log(
        'DisclosureResolver.getSiteDisclosureBySiteId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Site Disclosure fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        'DisclosureResolver.getSiteDisclosureBySiteId() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Site Disclosure data not found for site id: ${siteId}`,
        HttpStatus.NOT_FOUND,
        false,
        null,
      );
    }
  }
}
