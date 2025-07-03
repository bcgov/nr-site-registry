import { Args, Field, InputType, Int, Query, Resolver } from '@nestjs/graphql';
import { AuthenticatedUser, Unprotected } from 'nest-keycloak-connect';
import {
  FetchSiteDetail,
  FetchSiteDetailsResponse,
  FetchSiteInsights,
  SaveSiteDetailsResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteService } from '../../services/site/site.service';
import { DropdownDto } from '../../dto/dropdown.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LoggerService } from '../../logger/logger.service';
import { QueryResultForPendingSites } from '../../dto/sitesPendingReview.dto';
import { SiteSortBy } from '../../utils/enums/sortByFields.enum';
import { SortByDirection } from '../../utils/enums/sortByDirection.enum';
import { SiteInsightsDto } from 'src/app/dto/siteInsights.dto';

@InputType()
export class SiteFilters {
  @Field({ nullable: true })
  id?: string;

  @Field({ nullable: true })
  srStatus?: string;

  @Field({ nullable: true })
  siteRiskCode?: string;

  @Field({ nullable: true })
  commonName?: string;

  @Field({ nullable: true })
  addrLine_1?: string;

  @Field({ nullable: true })
  city?: string;

  @Field({ nullable: true })
  whoCreated?: string;

  @Field({ nullable: true })
  latlongReliabilityFlag?: string;

  @Field({ nullable: true })
  latdeg?: number;

  @Field({ nullable: true })
  latDegrees?: number;

  @Field({ nullable: true })
  latMinutes?: number;

  @Field({ nullable: true })
  latSeconds?: string;

  @Field({ nullable: true })
  longdeg?: number;

  @Field({ nullable: true })
  longDegrees?: number;

  @Field({ nullable: true })
  longMinutes?: number;

  @Field({ nullable: true })
  longSeconds?: string;

  @Field(() => [Date, Date], { nullable: true })
  whenCreated?: [Date, Date];

  @Field(() => [Date, Date], { nullable: true })
  whenUpdated?: [Date, Date];

  @Field(() => [String], {
    nullable: true,
    description: 'If provided, only applies the filters to the specified sites',
  })
  siteIds?: string[];
}

/**
 * Resolver for Region
 */
@Resolver(() => Sites)
@Unprotected(false)
export class SitePublicResolver {
  constructor(
    private readonly siteService: SiteService,
    private readonly genericResponseProvider: GenericResponseProvider<
      DropdownDto[]
    >,
    private readonly genericResponseProviderForSave: GenericResponseProvider<SaveSiteDetailsResponse>,
    private readonly sitesLogger: LoggerService,
    private readonly siteApprovalResponseProvider: GenericResponseProvider<QueryResultForPendingSites>,
    private readonly genericResponseProviderForInsights: GenericResponseProvider<SiteInsightsDto>,
  ) {}

  /**
   * Find sites where search parameter matches a site id or address
   * @param searchParam search parameter
   * @param page page number
   * @param pageSize size of the page
   * @returns sites where id or address matches the search param along with pagination params
   */
  @Query(() => SearchSiteResponse, { name: 'searchSites' })
  async searchSites(
    @AuthenticatedUser() userInfo,
    @Args('searchParam', { type: () => String }) searchParam: string,
    @Args('page', { type: () => Int }) page: number,
    @Args('pageSize', { type: () => Int }) pageSize: number,
    @Args({ name: 'sortBy', type: () => SiteSortBy, nullable: true })
    sortBy: SiteSortBy = SiteSortBy.ID,
    @Args({ name: 'sortByDir', type: () => SortByDirection, nullable: true })
    sortByDir: SortByDirection = SortByDirection.ASC,
    @Args('filters', { type: () => SiteFilters })
    filters: SiteFilters,
  ) {
    this.sitesLogger.log('SiteResolver.searchSites() start ');

    return await this.siteService.searchSites(
      userInfo,
      searchParam,
      page,
      pageSize,
      sortBy,
      sortByDir,
      filters,
    );
  }

  @Query(() => FetchSiteDetailsResponse, { name: 'findSiteBySiteId' })
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

    return this.siteService.findSiteBySiteId(siteId, showPending, null);
  }

  @Query(() => FetchSiteInsights, { name: 'getSiteInsights' })
  async getSiteInsights(
    @Args('siteId', { type: () => String }) siteId: string,
  ) {
    this.sitesLogger.log(
      'SiteResolver.getSiteInsights() start siteId:' + ' ' + siteId,
    );
    const result = await this.siteService.getSiteInsights(siteId);
    return this.genericResponseProviderForInsights.createResponse(
      'Success',
      200,
      true,
      result,
    );
  }
}
