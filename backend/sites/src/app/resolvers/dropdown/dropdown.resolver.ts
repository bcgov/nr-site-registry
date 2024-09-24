import { Resolver, Query, Args } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import {
  DropdownDto,
  DropdownResponse,
  DropdownResponseWithMetaData,
  NotationDropdownDto,
} from '../../dto/dropdown.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { DropdownService } from '../../services/dropdown/dropdown.service';
import { CustomRoles } from '../../common/role';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => DropdownDto)
export class DropdownResolver {
  constructor(
    private readonly dropdownService: DropdownService,
    private readonly genericResponseProvider: GenericResponseProvider<
      DropdownDto[]
    >,
    private readonly genericResponseProviderNotation: GenericResponseProvider<
      NotationDropdownDto[]
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
  @Query(() => DropdownResponse, { name: 'getParticipantRoleCd' })
  async getParticipantRoleCd() {
    sitesLogger.info('DropdownResolver.getParticipantRoleCd() start');
    const result = await this.dropdownService.getParticipantRoleCd();
    if (result.length > 0) {
      sitesLogger.info('DropdownResolver.getParticipantRoleCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Participants role code fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('DropdownResolver.getParticipantRoleCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Participants role code not found`,
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
  @Query(() => DropdownResponse, { name: 'getPeopleOrgsCd' })
  async getPeopleOrgsCd(
    @Args('searchParam', { type: () => String, nullable: true })
    searchParam?: string,
    @Args('entityType', { type: () => String, nullable: true })
    entityType?: string,
  ) {
    try {
      const result = await this.dropdownService.getPeopleOrgsCd(
        searchParam,
        entityType,
      );
      if (result && result.length > 0) {
        return this.genericResponseProvider.createResponse(
          'People Organization fetched successfully',
          200,
          true,
          result,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `People Organization not found`,
          404,
          false,
        );
      }
    } catch (error) {
      return this.genericResponseProvider.createResponse(
        'Failed to fetch People Organization',
        500,
        false,
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
  @Query(() => DropdownResponseWithMetaData, { name: 'getNotationTypeCd' })
  async getNotationTypeCd() {
    sitesLogger.info('DropdownResolver.getNotationTypeCd() start');
    const result = await this.dropdownService.getNotationTypeCd();
    if (result.length > 0) {
      sitesLogger.info('DropdownResolver.getNotationTypeCd() RES:200 end');
      return this.genericResponseProviderNotation.createResponse(
        'Notation Type fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('DropdownResolver.getNotationTypeCd() RES:404 end');
      return this.genericResponseProviderNotation.createResponse(
        `Notation Type not found`,
        404,
        false,
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
  @Query(() => DropdownResponse, { name: 'getNotationClassCd' })
  async getNotationClassCd() {
    sitesLogger.info('DropdownResolver.getNotationClassCd() start');
    const result = await this.dropdownService.getNotationClassCd();
    if (result.length > 0) {
      sitesLogger.info('DropdownResolver.getNotationClassCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Notation Class fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('DropdownResolver.getNotationClassCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Notation Class not found`,
        404,
        false,
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
  @Query(() => DropdownResponse, { name: 'getNotationParticipantRoleCd' })
  async getNotationParticipantRoleCd() {
    sitesLogger.info('DropdownResolver.getNotationParticipantRoleCd() start');
    const result = await this.dropdownService.getNotationParticipantRoleCd();
    if (result.length > 0) {
      sitesLogger.info(
        'DropdownResolver.getNotationParticipantRoleCd() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info(
        'DropdownResolver.getNotationParticipantRoleCd() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
        404,
        false,
      );
    }
  }
}
