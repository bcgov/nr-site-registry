import { Args, Query, Resolver } from '@nestjs/graphql';
import { UsePipes } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { Events } from '../../entities/events.entity';
import { NotationService } from '../../services/notation/notation.service';
import { NotationDto, NotationResponse } from '../../dto/notation.dto';
import { CustomRoles } from '../../common/role';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => Events)
export class NotationResolver {
  constructor(
    private readonly notationService: NotationService,
    private readonly genericResponseProvider: GenericResponseProvider<
      NotationDto[]
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
  @Query(() => NotationResponse, { name: 'getSiteNotationBySiteId' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSiteNotationBySiteId(
    @Args('siteId', { type: () => String }) siteId: string,
    @Args('pending', { type: () => Boolean, nullable: true })
    showPending: boolean,
  ) {
    sitesLogger.info(
      'NotationResolver.getSiteNotationBySiteId() start siteId:' + ' ' + siteId,
    );
   
    const result = await this.notationService.getSiteNotationBySiteId(
      siteId,
      showPending,
    );
    if (result && result.length > 0) {
      sitesLogger.info(
        'NotationResolver.getSiteNotationBySiteId() RES:200 end',
      );
      return this.genericResponseProvider.createResponse(
        'Site Notation fetched successfully',
        200,
        true,
        result,
      );
    } else {
      sitesLogger.info(
        'NotationResolver.getSiteNotationBySiteId() RES:404 end',
      );
      return this.genericResponseProvider.createResponse(
        `Site Notation data not found for site id: ${siteId}`,
        404,
        false,
        null,
      );
    }
  }
}
