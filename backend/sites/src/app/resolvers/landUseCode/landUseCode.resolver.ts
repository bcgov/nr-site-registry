import { Query, Resolver } from '@nestjs/graphql';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { LandUseCd } from '../../entities/landUseCd.entity';
import { LandUseCodeService } from '../../services/landUseCode/landUseCode.service';
import { LandUseCodeResponse } from '../../dto/landUseCodeResponse.dto';
import { LoggerService } from '../../logger/logger.service';

@Resolver(() => LandUseCd)
export class LandUseCodeResolver {
  constructor(
    private readonly landUseCodeService: LandUseCodeService,
    private readonly genericResponseProvider: GenericResponseProvider<
      LandUseCd[]
    >,
    private readonly sitesLogger: LoggerService,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => LandUseCodeResponse, { name: 'getLandUseCodes' })
  async getLandUseCodes() {
    try {
      this.sitesLogger.log('LandUseCodeResolver.getLandUseCodes() start ');
      const result = await this.landUseCodeService.getLandUseCodes();
      if (result.length > 0) {
        this.sitesLogger.log(
          'LandUseCodeResolver.getLandUseCodes() RES:200 end',
        );
        return this.genericResponseProvider.createResponse(
          'Land use codes fetched successfully',
          200,
          true,
          result,
        );
      } else {
        this.sitesLogger.log(
          'LandUseCodeResolver.getLandUseCodes() RES:404 end',
        );
        return this.genericResponseProvider.createResponse(
          `Land use codes data not found`,
          404,
          false,
          null,
        );
      }
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in LandUseCodeResolver.getLandUseCodes() end',
        JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }
}
