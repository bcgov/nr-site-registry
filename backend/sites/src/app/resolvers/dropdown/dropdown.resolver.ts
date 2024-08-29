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
    const result = await this.dropdownService.getParticipantRoleCd();
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Participants role code fetched successfully',
        200,
        true,
        result,
      );
    } else {
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
  @Query(() => DropdownResponseWithMetaData, { name: 'getPeopleOrgsCd' })
  async getPeopleOrgsCd() {
    const result = await this.dropdownService.getPeopleOrgsCd();
    if (result.length > 0) {
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
    const result = await this.dropdownService.getNotationTypeCd();
    if (result.length > 0) {
      return this.genericResponseProviderNotation.createResponse(
        'Notation Type fetched successfully',
        200,
        true,
        result,
      );
    } else {
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
    const result = await this.dropdownService.getNotationClassCd();
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Notation Class fetched successfully',
        200,
        true,
        result,
      );
    } else {
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
    const result = await this.dropdownService.getNotationParticipantRoleCd();
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
        404,
        false,
      );
    }
  }
}
