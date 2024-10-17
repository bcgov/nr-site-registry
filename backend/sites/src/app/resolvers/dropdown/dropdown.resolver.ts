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
import { LoggerService } from '../../logger/logger.service';

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
  @Query(() => DropdownResponse, { name: 'getParticipantRoleCd' })
  async getParticipantRoleCd() {
    this.sitesLogger.log('DropdownResolver.getParticipantRoleCd() start');
    const result = await this.dropdownService.getParticipantRoleCd();
    if (result && result.length > 0) {
      this.sitesLogger.log(
        'DropdownResolver.getParticipantRoleCd() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Participants role code fetched successfully',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        'DropdownResolver.getParticipantRoleCd() RES:404 end',
      );
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
    this.sitesLogger.log('DropdownResolver.getPeopleOrgsCd() start');
    try {
      const result = await this.dropdownService.getPeopleOrgsCd(
        searchParam,
        entityType,
      );
      if (result && result.length > 0) {
        this.sitesLogger.log('DropdownResolver.getPeopleOrgsCd() RES:200 end');
        return this.genericResponseProvider.createResponse(
          'People Organization fetched successfully',
          200,
          true,
          result,
        );
      } else {
        this.sitesLogger.log('DropdownResolver.getPeopleOrgsCd() RES:404 end');
        return this.genericResponseProvider.createResponse(
          `People Organization not found`,
          404,
          false,
        );
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in DropdownResolver.getPeopleOrgsCd() end',
        JSON.stringify(error),
      );
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
    this.sitesLogger.log('DropdownResolver.getNotationTypeCd() start');
    const result = await this.dropdownService.getNotationTypeCd();
    if (result && result.length > 0) {
      this.sitesLogger.log('DropdownResolver.getNotationTypeCd() RES:200 end');
      return this.genericResponseProviderNotation.createResponse(
        'Notation Type fetched successfully',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getNotationTypeCd() RES:404 end');
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
    this.sitesLogger.log('DropdownResolver.getNotationClassCd() start');
    const result = await this.dropdownService.getNotationClassCd();
    if (result && result.length > 0) {
      this.sitesLogger.log('DropdownResolver.getNotationClassCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Notation Class fetched successfully',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getNotationClassCd() RES:404 end');
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
    this.sitesLogger.log(
      'DropdownResolver.getNotationParticipantRoleCd() start',
    );
    const result = await this.dropdownService.getNotationParticipantRoleCd();
    if (result && result.length > 0) {
      this.sitesLogger.log(
        'DropdownResolver.getNotationParticipantRoleCd() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        'DropdownResolver.getNotationParticipantRoleCd() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
        404,
        false,
      );
    }
  }

  @Roles({
    roles: [CustomRoles.Internal, CustomRoles.SiteRegistrar],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => DropdownResponse, { name: 'getIDIRUserListForDropDown' })
  async getIDIRUserListForDropDown() {
    try {
      const result =
        await this.dropdownService.getIDIRUserGivenNamesForDropDown();
      if (result.length > 0) {
        this.sitesLogger.log(
          'DropdownResolver.getIDIRUserListForDropDown() RES:200 end',
        );
        return this.genericResponseProvider.createResponse(
          'User Names fetched successfully',
          200,
          true,
          result,
        );
      } else {
        this.sitesLogger.log(
          'DropdownResolver.getIDIRUserListForDropDown() RES:200 end',
        );
        return this.genericResponseProvider.createResponse(
          `User Names not found`,
          200,
          false,
        );
      }
    } catch (error) {
      this.sitesLogger.log(
        'DropdownResolver.getIDIRUserListForDropDown() error' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}
