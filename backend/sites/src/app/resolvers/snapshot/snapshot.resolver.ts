import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import { CreateSnapshotDto, SnapshotResponse } from '../../dto/snapshot.dto';
import { BannerTypeResponse } from '../../dto/response/bannerTypeResponse';
import { Snapshots } from '../../entities/snapshots.entity';
import { SnapshotsService } from '../../services/snapshot/snapshot.service';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { CustomRoles } from '../../common/role';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => Snapshots)
export class SnapshotsResolver {
  constructor(
    private readonly snapshotsService: SnapshotsService,
    private readonly genericResponseProvider: GenericResponseProvider<
      Snapshots[]
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
  @Query(() => SnapshotResponse, { name: 'getSnapshots' })
  async getSnapshots() {
    sitesLogger.info('SnapshotsResolver.getSnapshots() start');
    const result = await this.snapshotsService.getSnapshots();
    if (result && result.length > 0) {
      sitesLogger.info('SnapshotsResolver.getSnapshots() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('SnapshotsResolver.getSnapshots() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Snapshot not found.`,
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
  @Query(() => SnapshotResponse, { name: 'getSnapshotsByUserId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSnapshotsByUserId(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    sitesLogger.info(
      'SnapshotsResolver.getSnapshotsByUserId() start userId:' + ' ' + userId,
    );
    const result = await this.snapshotsService.getSnapshotsByUserId(userId);
    if (result && result.length > 0) {
      sitesLogger.info('SnapshotsResolver.getSnapshotsByUserId() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('SnapshotsResolver.getSnapshotsByUserId() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Snapshot not found for user id: ${userId}`,
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
  @Query(() => SnapshotResponse, { name: 'getSnapshotsBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSnapshotsBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'SnapshotsResolver.getSnapshotsBySiteId() start siteId:' + ' ' + siteId,
    );
    const result = await this.snapshotsService.getSnapshotsBySiteId(
      siteId,
      user.sub,
    );
    if (result && result.length > 0) {
      sitesLogger.info('SnapshotsResolver.getSnapshotsBySiteId() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('SnapshotsResolver.getSnapshotsBySiteId() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Snapshot not found for site id ${siteId}`,
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
  @Query(() => SnapshotResponse, { name: 'getSnapshotsById' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSnapshotsById(@Args('id', { type: () => Int }) id: number) {
    sitesLogger.info(
      'SnapshotsResolver.getSnapshotsById() start snapshotId:' + ' ' + id,
    );
    const result = await this.snapshotsService.getSnapshotsById(id);
    if (result && result.length > 0) {
      sitesLogger.info('SnapshotsResolver.getSnapshotsById() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info('SnapshotsResolver.getSnapshotsById() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Snapshot not found for snapshot id: ${id}`,
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
  @Mutation(() => SnapshotResponse, { name: 'createSnapshotForSites' })
  async createSnapshotForSites(
    @Args('inputDto', { type: () => [CreateSnapshotDto] }, new ValidationPipe())
    inputDto: CreateSnapshotDto[],
    @AuthenticatedUser() user: any,
  ) {
    sitesLogger.info(
      'SnapshotsResolver.createSnapshotForSites() start inputDto:' +
        ' ' +
        JSON.stringify(inputDto),
    );
    try {
      if (inputDto) {
        const isSaved = this.snapshotsService.createSnapshotForSites(
          inputDto,
          user,
        );
        if (isSaved) {
          sitesLogger.info(
            'SnapshotsResolver.createSnapshotForSites() RES:201 end',
          );
          return this.genericResponseProvider.createResponse(
            'Successfully created snapshots.',
            201,
            true,
          );
        } else {
          sitesLogger.info(
            'SnapshotsResolver.createSnapshotForSites() RES:422 end',
          );
          return this.genericResponseProvider.createResponse(
            `Failed to create snapshots. `,
            422,
            false,
          );
        }
      } else {
        sitesLogger.info(
          'SnapshotsResolver.createSnapshotForSites() RES:422 end',
        );
        return this.genericResponseProvider.createResponse(
          `Please provide valid input to create snapshots`,
          422,
          false,
        );
      }
    } catch (error) {
      console.log('Error at createSnapshotForSites', error);
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({
    roles: [CustomRoles.External],
    mode: RoleMatchingMode.ANY,
  })
  @Query(() => BannerTypeResponse, { name: 'getBannerType' })
  async getBannerType(
    @Args('siteId', { type: () => String }) siteId: string,
    @AuthenticatedUser() user: any,
  ): Promise<BannerTypeResponse> {
    try {
      const bannerType = await this.snapshotsService.getBannerType(
        siteId,
        user.sub,
      );

      if (bannerType && bannerType.length > 0) {
        return {
          httpStatusCode: 200,
          message: 'Banner type fetched successfully',
          data: {
            bannerType: bannerType,
          },
        };
      } else {
        return {
          httpStatusCode: 404,
          message: `Failed to determine banner type for site id ${siteId}`,
          data: null,
        };
      }
    } catch (error) {
      throw new Error('System Error, Please try again.');
    }
  }
}
