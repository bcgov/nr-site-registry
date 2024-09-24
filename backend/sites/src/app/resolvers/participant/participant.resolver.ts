import { UsePipes } from '@nestjs/common';
import { Args, Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { SiteParticsDto, SiteParticsResponse } from '../../dto/sitePartics.dto';
import { ParticipantService } from '../../services/participant/participant.service';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { CustomRoles } from '../../common/role';

@Resolver(() => SiteParticsDto)
export class ParticipantResolver {
  constructor(
    private readonly participantService: ParticipantService,
    private readonly genericResponseProvider: GenericResponseProvider<
      SiteParticsDto[]
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
  @Query(() => SiteParticsResponse, { name: 'getSiteParticipantBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteParticipantsBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
  ) {
    const result =
      await this.participantService.getSiteParticipantsBySiteId(siteId,showPending);
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Participants fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Participants data not found for site id: ${siteId}`,
        404,
        false,
        result
      );
    }
  }
}
