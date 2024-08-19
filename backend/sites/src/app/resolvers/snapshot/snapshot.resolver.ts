import { UsePipes, ValidationPipe } from '@nestjs/common';
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import { SnapshotDto, SnapshotResponse } from '../../dto/snapshot.dto';
import { Snapshots } from '../../entities/snapshots.entity';
import { SnapshotsService } from '../../services/snapshot/snapshot.service';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';

@Resolver(() => Snapshots)
export class SnapshotsResolver {
  constructor(
    private readonly snapshotsService: SnapshotsService,
    private readonly genericResponseProvider: GenericResponseProvider<
      Snapshots[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
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

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => SnapshotResponse, { name: 'createSnapshot' })
  async createSnapshot(
    @Args('snapshot', { type: () => SnapshotDto }, new ValidationPipe())
    snapshot: SnapshotDto,
  ) {
    const message = await this.snapshotsService.createSnapshot(snapshot);

    if (message) {
      return this.genericResponseProvider.createResponse(message, 201, true);
    } else {
      return this.genericResponseProvider.createResponse(
        `Snapshot failed to insert.`,
        400,
        false,
        null,
      );
    }
  }
}
