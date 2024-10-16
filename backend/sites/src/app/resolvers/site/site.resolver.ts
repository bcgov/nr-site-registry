import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import {
  AuthenticatedUser,
  Resource,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import {
  FetchSiteDetail,
  FetchSiteResponse,
  SaveSiteDetailsResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteService } from '../../services/site/site.service';
import { DropdownDto, DropdownResponse } from '../../dto/dropdown.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { UsePipes } from '@nestjs/common';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { SaveSiteDetailsDTO } from '../../dto/saveSiteDetails.dto';
import { CustomRoles } from '../../common/role';
import { LoggerService } from '../../logger/logger.service';
import {
  BulkApproveRejectChangesDTO,
  QueryResultForPendingSites,
  QueryResultForPendingSitesResponse,
  SearchParams,
  SRApproveRejectResponse,
} from 'src/app/dto/sitesPendingReview.dto';

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
    private readonly genericResponseProviderForSave: GenericResponseProvider<SaveSiteDetailsResponse>,
    private readonly sitesLogger: LoggerService,
    private readonly siteApprovalResponseProvider: GenericResponseProvider<QueryResultForPendingSites>,
  ) {}

  /**
   * Find All Sites
   */
  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
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
  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
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
    this.sitesLogger.log('SiteResolver.searchSites() start ');
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

  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => FetchSiteDetail, { name: 'findSiteBySiteId' })
  findSiteBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
  ) {
    this.sitesLogger.log(
      'SiteResolver.findSiteBySiteId() start siteId:' +
        ' ' +
        siteId +
        ' showPending = ' +
        showPending,
    );

    return this.siteService.findSiteBySiteId(siteId, showPending);
  }

  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => DropdownResponse, { name: 'searchSiteIds' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async searchSiteIds(
    @Args('searchParam', { type: () => String }) searchParam: string,
  ) {
    this.sitesLogger.log(
      'SiteResolver.searchSiteIds() start searchParam:' + ' ' + searchParam,
    );
    const result = await this.siteService.searchSiteIds(searchParam);
    if (result && result.length > 0) {
      this.sitesLogger.log('SiteResolver.searchSiteIds() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('SiteResolver.searchSiteIds() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
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
  @Mutation(() => SaveSiteDetailsResponse, { name: 'updateSiteDetails' })
  async updateSiteDetails(
    @Args('siteDetailsDTO', { type: () => SaveSiteDetailsDTO })
    siteDetailsDTO: SaveSiteDetailsDTO,
    @AuthenticatedUser()
    user: any,
  ) {
    const saveResult = await this.siteService.saveSiteDetails(
      siteDetailsDTO,
      user,
    );

    if (saveResult) {
      return this.genericResponseProviderForSave.createResponse(
        `Successfully saved site details.`,
        200,
        true,
      );
    } else {
      return this.genericResponseProviderForSave.createResponse(
        `Failed to save site details.`,
        422,
        false,
      );
    }
  }

  /**
   * Find sites where search parameter matches a site id or address
   * @param searchParam search parameter
   * @param page page number
   * @param pageSize size of the page
   * @returns sites where id or address matches the search param along with pagination params
   */
  @Roles({
    roles: [
      CustomRoles.External,
      CustomRoles.Internal,
      CustomRoles.SiteRegistrar,
    ],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => QueryResultForPendingSitesResponse, {
    name: 'getPendingSiteForSRApproval',
  })
  async getPendingSiteForSRApproval(
    @Args('searchParam', { type: () => SearchParams, nullable: true })
    searchParam: SearchParams,
    @Args('page', { type: () => String }) page: number,
    @Args('pageSize', { type: () => String }) pageSize: number,
  ) {
    try {
      this.sitesLogger.log(
        'SiteResolver.getPendingSiteForSRApproval() start dto:' +
          ' ' +
          JSON.stringify(searchParam) +
          ' page ' +
          page +
          ' pageSize ' +
          pageSize,
      );

      const result = await this.siteService.getSiteDetailsPendingSRApproval(
        searchParam,
        page,
        pageSize,
      );

      return this.siteApprovalResponseProvider.createResponse(
        'getPendingSiteForSRApproval response',
        200,
        true,
        result,
      );
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SiteResolver.getPendingSiteForSRApproval()  end',
        JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: [CustomRoles.Internal], mode: RoleMatchingMode.ANY })
  @Mutation(() => SRApproveRejectResponse, { name: 'bulkAproveRejectChanges' })
  async bulkAproveRejectChanges(
    @Args('approveRejectDTO', { type: () => BulkApproveRejectChangesDTO })
    approveRejectDTO: BulkApproveRejectChangesDTO,
    @AuthenticatedUser() user: any,
  ) {
    this.sitesLogger.log(
      'SiteResolver.bulkAproveRejectChanges() start dto:' +
        ' ' +
        JSON.stringify(approveRejectDTO),
    );
    try {
      let message = false;

      message = await this.siteService.bulkUpdateForSR(approveRejectDTO, user);

      if (message) {
        this.sitesLogger.log(
          'SiteResolver.bulkAproveRejectChanges()  RES:200 end',
        );
        return this.genericResponseProvider.createResponse(
          'Successfully updated sites.',
          200,
          true,
        );
      } else {
        this.sitesLogger.log(
          'SiteResolver.bulkAproveRejectChanges()  RES:500 end',
        );
        return this.genericResponseProvider.createResponse(
          `Unable to update sites. `,
          500,
          false,
        );
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in SiteResolver.bulkAproveRejectChanges()  end',
        JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }
}
