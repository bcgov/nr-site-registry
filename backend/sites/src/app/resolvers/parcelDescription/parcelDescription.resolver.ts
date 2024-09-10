import { Args, Int, Query, Resolver } from '@nestjs/graphql';
import { Resource, RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { Subdivisions } from '../../entities/subdivisions.entity';
import { ParcelDescriptionsService } from '../../services/parcelDescriptions/parcelDescriptions.service';
import { ParcelDescriptionsResponse } from '../../dto/response/parcelDescriptionsResponse';
import { CustomRoles } from '../../common/role';
import { ParcelDescriptionsServiceResult } from 'src/app/services/parcelDescriptions/parcelDescriptions.service.types';

/**
 * Resolver for Parcel Description
 */
@Resolver(() => Subdivisions)
@Resource('parcel-description-service')
export class ParcelDescriptionResolver {
  constructor(
    private readonly parcelDescriptionService: ParcelDescriptionsService,
  ) {}

  /**
   * Find all parcel descriptions (subdivision entities) for a given site id.
   * @param siteId site id
   * @param page page number
   * @param pageSize size of the page
   * @param searchParam filtering term
   * @param sortBy sorting term
   * @param sortByDir sorting direction. Either ASC or DESC.
   * @returns parcel descriptions (subdivisions) belonging to the given site.
   */
  @Roles({
    roles: [CustomRoles.Internal, CustomRoles.SiteRegistrar],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => ParcelDescriptionsResponse, {
    name: 'getParcelDescriptionsBySiteId',
  })
  async getParcelDescriptionsBySiteId(
    @Args('siteId', { type: () => Int }) siteId: number,
    @Args('page', { type: () => Int }) page: number,
    @Args('pageSize', { type: () => Int }) pageSize: number,
    @Args('searchParam', { type: () => String }) searchParam: string,
    @Args('sortBy', { type: () => String }) sortBy: string,
    @Args('sortByDir', { type: () => String }) sortByDir: string,
  ) {
    const result: ParcelDescriptionsServiceResult =
      await this.parcelDescriptionService.getParcelDescriptionsBySiteId(
        siteId,
        page,
        pageSize,
        searchParam,
        sortBy,
        sortByDir,
      );

    let response = new ParcelDescriptionsResponse();
    response.data = result.data;
    response.count = result.count;
    response.page = result.page;
    response.pageSize = result.pageSize;
    response.success = result.success;
    response.message = result.message;
    if (result.success) {
      response.httpStatusCode = 200;
    } else {
      response.httpStatusCode = 500;
    }
    return response;
  }
}
