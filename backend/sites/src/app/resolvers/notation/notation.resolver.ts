import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { Events } from '../../entities/events.entity';
import { NotationService } from '../../services/notation/notation.service';
import { NotationDto, NotationResponse } from '../../dto/notation.dto';

@Resolver(() => Events)
export class NotationResolver {
  constructor(
    private readonly notationService: NotationService,
    private readonly genericResponseProvider: GenericResponseProvider<
      NotationDto[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => NotationResponse, { name: 'getSiteNotationBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteNotationBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
  ) {
    const result = await this.notationService.getSiteNotationBySiteId(siteId);
    if (result && result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Site Notation fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Site Notation data not found for site id: ${siteId}`,
        404,
        false,
        null,
      );
    }
  }
}
