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
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteService } from '../../services/site/site.service';
import { DropdownDto, DropdownResponse } from '../../dto/dropdown.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { HttpStatus, UsePipes } from '@nestjs/common';
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
} from '../../dto/sitesPendingReview.dto';
import { MapSearchResponse } from '../../dto/mapSearch.dto';

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
    private readonly mapSearchGenericResponseProvider: GenericResponseProvider<
      Sites[]
    >,
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
    if (result?.length > 0) {
      this.sitesLogger.log('SiteResolver.searchSiteIds() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Notation Paticipant Role fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('SiteResolver.searchSiteIds() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Notation Paticipant Role not found`,
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
    roles: [CustomRoles.SiteRegistrar],
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
  }

  @Roles({ roles: [CustomRoles.SiteRegistrar], mode: RoleMatchingMode.ANY })
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
    let message = false;

    message = await this.siteService.bulkUpdateForSR(approveRejectDTO, user);

    if (message) {
      this.sitesLogger.log(
        'SiteResolver.bulkAproveRejectChanges()  RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Successfully updated sites.',
        HttpStatus.OK,
        true,
      );
    } else {
      this.sitesLogger.log(
        'SiteResolver.bulkAproveRejectChanges()  RES:422 end',
      );
      return this.genericResponseProvider.createResponse(
        `Unable to update sites. `,
        HttpStatus.UNPROCESSABLE_ENTITY,
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
  @Query(() => MapSearchResponse, { name: 'mapSearch' })
  async mapSearch(
    @Args('searchParam', { type: () => String, nullable: true })
    searchParam: string,
  ) {
    this.sitesLogger.log('SiteResolver.mapSearch() start ');
    try {
      const data = await this.siteService.mapSearch(searchParam);
      return this.mapSearchGenericResponseProvider.createResponse(
        'Successfully fetched sites for map',
        HttpStatus.OK,
        true,
        data,
      );
    } catch (e) {
      this.sitesLogger.log('SiteResolver.mapSearch() failed');
      return this.mapSearchGenericResponseProvider.createResponse(
        'Error fetching sites for map',
        HttpStatus.INTERNAL_SERVER_ERROR,
        false,
        [],
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
  @Query(() => FetchSiteDetail, { name: 'findSiteBySiteIdLoggedInUser' })
  findSiteBySiteIdLoggedInUser(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
    @AuthenticatedUser() userInfo,
  ) {
    this.sitesLogger.log(
      'SiteResolver.findSiteBySiteId() start siteId:' +
        ' ' +
        siteId +
        ' showPending = ' +
        showPending,
    );

    return this.siteService.findSiteBySiteId(siteId, showPending, userInfo);
  }
}
