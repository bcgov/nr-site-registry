import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import { CreateSnapshotDto, SnapshotResponse } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { SnapshotsService } from '../../services/snapshot/snapshot.service';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { CustomRoles } from '../../common/role';

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
    const result = await this.snapshotsService.getSnapshots();
    if (result && result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
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
    const result = await this.snapshotsService.getSnapshotsByUserId(userId);
    if (result && result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
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
    const result = await this.snapshotsService.getSnapshotsBySiteId(
      siteId,
      user.sub,
    );
    if (result && result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
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
    const result = await this.snapshotsService.getSnapshotsById(id);
    if (result && result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Snapshot fetched successfully.',
        200,
        true,
        result,
      );
    } else {
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
    try {
      if (inputDto) {
        const isSaved = this.snapshotsService.createSnapshotForSites(
          inputDto,
          user,
        );
        if (isSaved) {
          return this.genericResponseProvider.createResponse(
            'Successfully created snapshots.',
            201,
            true,
          );
        } else {
          return this.genericResponseProvider.createResponse(
            `Failed to create snapshots. `,
            422,
            false,
          );
        }
      } else {
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
}
