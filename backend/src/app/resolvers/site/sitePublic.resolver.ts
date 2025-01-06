import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Unprotected } from 'nest-keycloak-connect';
import {
  FetchSiteDetail,
  SaveSiteDetailsResponse,
  SearchSiteResponse,
} from '../../dto/response/genericResponse';
import { Sites } from '../../entities/sites.entity';
import { SiteService } from '../../services/site/site.service';
import { DropdownDto } from '../../dto/dropdown.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LoggerService } from '../../logger/logger.service';
import { QueryResultForPendingSites } from '../../dto/sitesPendingReview.dto';

/**
 * Resolver for Region
 */
@Resolver(() => Sites)
@Unprotected()
export class SitePublicResolver {
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
   * Find sites where search parameter matches a site id or address
   * @param searchParam search parameter
   * @param page page number
   * @param pageSize size of the page
   * @returns sites where id or address matches the search param along with pagination params
   */
  @Query(() => SearchSiteResponse, { name: 'searchSites' })
  async searchSites(
    @Args('searchParam', { type: () => String }) searchParam: string,
    @Args('page', { type: () => Int }) page: number,
    @Args('pageSize', { type: () => Int }) pageSize: number,
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
    @Args('siteIds', {
      type: () => [String],
      nullable: true,
      description:
        'If provided, only applies the filters to the specified sites',
    })
    siteIds?: string[],
  ) {
    this.sitesLogger.log('SiteResolver.searchSites() start ');
    return await this.siteService.searchSites(
      null,
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
      siteIds,
    );
  }

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

    return this.siteService.findSiteBySiteId(siteId, showPending, null);
  }
}
