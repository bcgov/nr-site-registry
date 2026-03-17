import { Resolver, Query, Args } from '@nestjs/graphql';
import { RoleMatchingMode, Roles, Unprotected } from 'nest-keycloak-connect';
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
import { HttpStatus } from '@nestjs/common';

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
    if (result?.length > 0) {
      this.sitesLogger.log(
        'DropdownResolver.getParticipantRoleCd() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Participants role code fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        'DropdownResolver.getParticipantRoleCd() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Participants role code not found`,
        HttpStatus.NOT_FOUND,
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
    const result = await this.dropdownService.getPeopleOrgsCd(
      searchParam,
      entityType,
    );
    if (result?.length > 0) {
      this.sitesLogger.log('DropdownResolver.getPeopleOrgsCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'People Organization fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getPeopleOrgsCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `People Organization not found`,
        HttpStatus.NOT_FOUND,
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
    if (result?.length > 0) {
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
    if (result?.length > 0) {
      this.sitesLogger.log('DropdownResolver.getNotationClassCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Notation Class fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getNotationClassCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Notation Class not found`,
        HttpStatus.NOT_FOUND,
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
    if (result?.length > 0) {
      this.sitesLogger.log(
        'DropdownResolver.getNotationParticipantRoleCd() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        'DropdownResolver.getNotationParticipantRoleCd() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
        HttpStatus.NOT_FOUND,
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
    const result =
      await this.dropdownService.getIDIRUserGivenNamesForDropDown();
    if (result?.length > 0) {
      this.sitesLogger.log(
        'DropdownResolver.getIDIRUserListForDropDown() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'User Names fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log(
        'DropdownResolver.getIDIRUserListForDropDown() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `User Names not found`,
        HttpStatus.NOT_FOUND,
        false,
      );
    }
  }

  @Query(() => DropdownResponse, { name: 'getSiteRiskCd' })
  @Unprotected()
  async getSiteRiskCd() {
    this.sitesLogger.log('DropdownResolver.getSiteRiskCd() start');
    const result = await this.dropdownService.getSiteRiskCd();
    if (result?.length > 0) {
      this.sitesLogger.log('DropdownResolver.getSiteRiskCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Site Risk Code fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getSiteRiskCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Site Risk Code not found`,
        HttpStatus.NOT_FOUND,
        false,
      );
    }
  }

  @Query(() => DropdownResponse, { name: 'getBCeRegionCd' })
  async getBCeRegionCd() {
    this.sitesLogger.log('DropdownResolver.getBCeRegionCd() start');
    const result = await this.dropdownService.getBCeRegionCd();
    if (result?.length > 0) {
      this.sitesLogger.log('DropdownResolver.getBCeRegionCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'BCe Region Code fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getBCeRegionCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `BCe Region Code not found`,
        HttpStatus.NOT_FOUND,
        false,
      );
    }
  }

  @Query(() => DropdownResponse, { name: 'getSiteStatusCd' })
  async getSiteStatusCd() {
    this.sitesLogger.log('DropdownResolver.getSiteStatusCd() start');
    const result = await this.dropdownService.getSiteStatusCd();
    if (result?.length > 0) {
      this.sitesLogger.log('DropdownResolver.getSiteStatusCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Site Status Code fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getSiteStatusCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Site Status Code not found`,
        HttpStatus.NOT_FOUND,
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
  @Query(() => DropdownResponse, { name: 'getSchedule2Ref' })
  async getSchedule2Ref() {
    this.sitesLogger.log('DropdownResolver.getSchedule2Ref() start');
    const result = await this.dropdownService.getSchedule2Ref();
    if (result?.length > 0) {
      this.sitesLogger.log('DropdownResolver.getSchedule2Ref() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Schedule 2 Ref code fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('DropdownResolver.getSchedule2Ref() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Schedule 2 Ref code not found`,
        HttpStatus.NOT_FOUND,
        false,
        null,
      );
    }
  }
}
