import { Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandUseCd } from 'src/app/entities/landUseCd.entity';
import { LandUseCodeService } from 'src/app/services/landUseCode/landUseCode.service';
import { LandUseCodeResponse } from 'src/app/dto/landUseCodeResponse.dto';

@Resolver(() => LandUseCd)
export class LandUseCodeResolver {
  constructor(
    private readonly landUseCodeService: LandUseCodeService,
    private readonly genericResponseProvider: GenericResponseProvider<
      LandUseCd[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => LandUseCodeResponse, { name: 'getLandUseCodes' })
  async getLandUseCodes() {
    const result = await this.landUseCodeService.getLandUseCodes();
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse(
        'Land use codes fetched successfully',
        200,
        true,
        result,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Land use codes data not found`,
        404,
        false,
        null,
      );
    }
  }
}
