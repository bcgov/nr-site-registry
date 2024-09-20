import { Args, Query, Resolver } from '@nestjs/graphql';
import { Resource, RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import {
  FetchSiteDetail,
  FetchSiteResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteService } from '../../services/site/site.service';
import { DropdownDto, DropdownResponse } from 'src/app/dto/dropdown.dto';
import { GenericResponseProvider } from 'src/app/dto/response/genericResponseProvider';
import { UsePipes } from '@nestjs/common';
import { GenericValidationPipe } from 'src/app/utils/validations/genericValidationPipe';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');
/**
 * Resolver for Region
 */
@Resolver(() => Sites)
@Resource('site-service')
export class SiteResolver {
  constructor(
    private readonly siteService: SiteService,
    private readonly genericResponseProvider: GenericResponseProvider<
      DropdownDto[]
    >,
  ) {}

  /**
   * Find All Sites
   */
  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => FetchSiteResponse, { name: 'sites' })
  findAll() {
    return this.siteService.findAll();
  }

  /**
   * Find sites where search parameter matches a site id or address
   * @param searchParam search parameter
   * @param page page number
   * @param pageSize size of the page
   * @returns sites where id or address matches the search param along with pagination params
   */
  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => SearchSiteResponse, { name: 'searchSites' })
  async searchSites(
    @Args('searchParam', { type: () => String }) searchParam: string,
    @Args('page', { type: () => String }) page: number,
    @Args('pageSize', { type: () => String }) pageSize: number,
    @Args('id', { type: () => String, nullable: true }) id?: string,
    @Args('srStatus', { type: () => String, nullable: true }) srStatus?: string,
    @Args('siteRiskCode', { type: () => String, nullable: true })
    siteRiskCode?: string,
    @Args('commonName', { type: () => String, nullable: true })
    commonName?: string,
    @Args('addrLine_1', { type: () => String, nullable: true })
    addrLine_1?: string,
    @Args('city', { type: () => String, nullable: true }) city?: string,
    @Args('whoCreated', { type: () => String, nullable: true })
    whoCreated?: string,
    @Args('latlongReliabilityFlag', { type: () => String, nullable: true })
    latlongReliabilityFlag?: string,
    @Args('latdeg', { type: () => String, nullable: true }) latdeg?: number,
    @Args('latDegrees', { type: () => String, nullable: true })
    latDegrees?: number,
    @Args('latMinutes', { type: () => String, nullable: true })
    latMinutes?: number,
    @Args('latSeconds', { type: () => String, nullable: true })
    latSeconds?: string,
    @Args('longdeg', { type: () => String, nullable: true }) longdeg?: number,
    @Args('longDegrees', { type: () => String, nullable: true })
    longDegrees?: number,
    @Args('longMinutes', { type: () => String, nullable: true })
    longMinutes?: number,
    @Args('longSeconds', { type: () => String, nullable: true })
    longSeconds?: string,
    @Args('whenCreated', { type: () => String, nullable: true })
    whenCreated?: Date,
    @Args('whenUpdated', { type: () => String, nullable: true })
    whenUpdated?: Date,
  ) {
    sitesLogger.info('SiteResolver.searchSites() start ');
    return await this.siteService.searchSites(
      searchParam,
      page,
      pageSize,
      id,
      srStatus,
      siteRiskCode,
      commonName,
      addrLine_1,
      city,
      whoCreated,
      latlongReliabilityFlag,
      latdeg,
      latDegrees,
      latMinutes,
      latSeconds,
      longdeg,
      longDegrees,
      longMinutes,
      longSeconds,
      whenCreated,
      whenUpdated,
    );
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => FetchSiteDetail, { name: 'findSiteBySiteId' })
  findSiteBySiteId(@Args('siteId', { type: () => String }) siteId: string) {
    sitesLogger.info(
      'SiteResolver.findSiteBySiteId() start siteId:' + ' ' + siteId,
    );
    return this.siteService.findSiteBySiteId(siteId);
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => DropdownResponse, { name: 'searchSiteIds' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async searchSiteIds(
    @Args('searchParam', { type: () => String }) searchParam: string,
  ) {
    sitesLogger.info(
      'SiteResolver.searchSiteIds() start searchParam:' + ' ' + searchParam,
    );
    const result = await this.siteService.searchSiteIds(searchParam);
    if (result && result.length > 0) {
      sitesLogger.info('SiteResolver.searchSiteIds() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('SiteResolver.searchSiteIds() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
        404,
        false,
      );
    }
  }
}
