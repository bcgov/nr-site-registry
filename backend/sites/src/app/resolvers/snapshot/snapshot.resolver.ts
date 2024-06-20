import { ValidationPipe } from "@nestjs/common";
import { Resolver, Query, Args, Int, Mutation } from "@nestjs/graphql";
import { RoleMatchingMode, Roles } from "nest-keycloak-connect";
import { SnapshotResponse } from "../../dto/response/fetchSiteResponse";
import { SnapshotDto } from "../../dto/snapshot.dto";
import { Snapshots } from "../../entities/snapshots.entity";
import { SnapshotsService } from "../../services/snapshot/snapshot.service";

@Resolver(() => Snapshots)
export class SnapshotsResolver {
    constructor(private readonly snapshotsService: SnapshotsService){}

    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => SnapshotResponse, { name: 'getSnapshots' })
    async getSnapshots() {
        const res =  await this.snapshotsService.getSnapshots();
        if (res)
        {
            return { httpStatusCode: 200, message: 'Success', data: res };
        }

        return {
            httpStatusCode: 404,
            message: `Data not found.`,
            data: res,
          };
    }

    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => SnapshotResponse, { name: 'getSnapshotsByUserId' })
    async getSnapshotsByUserId (@Args('userId', { type: () => String }) userId: string,) {
        const result = await this.snapshotsService.getSnapshotsByUserId(userId);
        if (result) {
          return { httpStatusCode: 200, message: 'Success', data: result };
        }
    
        return {
          httpStatusCode: 404,
          message: `Data not found for user id: ${userId}`,
          data: result,
        };
    }

    @Roles({roles: ['site-admin'], mode: RoleMatchingMode.ANY})
    @Query(() => SnapshotResponse, { name: 'getSnapshotsById' })
    async getSnapshotsById(@Args('id', { type: () => Int }) id: number) {
        const result = await this.snapshotsService.getSnapshotsById(id);
        if (result) {
          return { httpStatusCode: 200, message: 'Success', data: result };
        }
    
        return {
          httpStatusCode: 404,
          message: `Data not found for snapshot id: ${id}`,
          data: result,
        };
    }

    @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
    @Mutation(() => SnapshotResponse, { name: 'createSnapshot' })
    async createSnapshot(
      @Args('snapshot', { type: () => SnapshotDto }, new ValidationPipe())
      snapshot: SnapshotDto,
    ) {
      const result = await this.snapshotsService.createSnapshot(snapshot);
  
      if (result) {
        return { httpStatusCode: 201, message: result };
      }
  
      return { httpStatusCode: 400, message: 'Bad Request.' };
    }
}