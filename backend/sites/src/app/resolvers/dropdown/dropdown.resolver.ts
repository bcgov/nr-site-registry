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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => DropdownResponseWithMetaData, { name: 'getPeopleOrgsCd' })
  async getPeopleOrgsCd() {
    sitesLogger.info('DropdownResolver.getPeopleOrgsCd() start');
    const result = await this.dropdownService.getPeopleOrgsCd();
    if (result.length > 0) {
      sitesLogger.info('DropdownResolver.getPeopleOrgsCd() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'People Organization fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('DropdownResolver.getPeopleOrgsCd() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `People Organization not found`,
        404,
        false,
      );
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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
