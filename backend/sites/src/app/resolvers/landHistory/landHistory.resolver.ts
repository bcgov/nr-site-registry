import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { LandHistories } from 'src/app/entities/landHistories.entity';
import { LandHistoryResponse } from 'src/app/dto/landHistory.dto';
import { LandHistoryService } from 'src/app/services/landHistory/landHistory.service';

@Resolver(() => LandHistories)
export class LandHistoryResolver {
    constructor(
        private readonly landHistoryService: LandHistoryService,
        private readonly genericResponseProvider: GenericResponseProvider<LandHistories[]>,
    ) { }

    @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
    @Query(() => LandHistoryResponse, { name: 'getLandHistoriesForSite' })
    @UsePipes(new GenericValidationPipe())
    async getLandHistoriesForSite(
        @Args('siteId', { type: () => String }) siteId: string,
    ) {
        const result = await this.landHistoryService.getLandHistoriesForSite(siteId);
        if (result.length > 0) {
            return this.genericResponseProvider.createResponse('Land uses fetched successfully', 200, true, result);
        }
        else {
            return this.genericResponseProvider.createResponse(`Land uses data not found for site id: ${siteId}`, 404, false);
        }
    }
}
