import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { Folio } from 'src/app/entities/folio.entity';
import { FolioService } from '../../services/folio/folio.service';
import { FolioDTO, FolioMinDTO, FolioResponse } from 'src/app/dto/folio.dto';
import {
  FolioContentDTO,
  FolioContentResponse,
} from 'src/app/dto/folioContent.dto';
import { FolioContents } from 'src/app/entities/folioContents.entity';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Resolver(() => Folio)
export class FolioResolver {
  constructor(
    private readonly folioService: FolioService,
    private readonly genericResponseProvider: GenericResponseProvider<Folio[]>,
    private readonly genericResponseProviderForFolioContent: GenericResponseProvider<
      FolioContents[]
    >,
  ) {}

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => FolioResponse, { name: 'getFolioItemsForUser' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getFolioItemsForUser(
    @Args('userId', { type: () => String }) userId: string,
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.getFolioItemsForUser() start userId:' + ' ' + userId,
    );
    try {
      const result = await this.folioService.getFoliosForUser(user);

      if (result && result.length > 0) {
        sitesLogger.info('FolioResolver.getFolioItemsForUser() RES:200 end');
        return this.genericResponseProvider.createResponse(
          'Folio fetched successfully',
          200,
          true,
          result,
        );
      } else {
        sitesLogger.info('FolioResolver.getFolioItemsForUser() RES:404 end');
        return this.genericResponseProvider.createResponse(
          `Folio not found for user id: ${userId}`,
          404,
          true,
          [],
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.getFolioItemsForUser() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => FolioContentResponse, { name: 'getSitesForFolio' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSitesForFolio(
    @Args('folioDTO', { type: () => FolioMinDTO }, new ValidationPipe())
    folioDTO: FolioMinDTO,
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.getSitesForFolio() start folioDTO:' +
        ' ' +
        JSON.stringify(folioDTO),
    );
    try {
      const result = await this.folioService.getSitesForFolio(folioDTO, user);

      if (result && result.length > 0) {
        sitesLogger.info('FolioResolver.getSitesForFolio() RES:200 end');
        return this.genericResponseProviderForFolioContent.createResponse(
          'Sites fetched successfully for folio',
          200,
          true,
          result,
        );
      } else {
        sitesLogger.info('FolioResolver.getSitesForFolio() RES:400 end');
        return this.genericResponseProviderForFolioContent.createResponse(
          `Unable to fetch sites for folio`,
          400,
          true,
          [],
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.getSitesForFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'addFolioItem' })
  async addFolioItem(
    @Args('folioDTO', { type: () => FolioDTO }, new ValidationPipe())
    folioDTO: FolioDTO,
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.addFolioItem() start folioDTO:' +
        ' ' +
        JSON.stringify(folioDTO),
    );
    try {
      const message = await this.folioService.addFolio(folioDTO, user);

      if (message) {
        sitesLogger.info('FolioResolver.addFolioItem() RES:201 end');
        return this.genericResponseProvider.createResponse(
          'Success',
          201,
          true,
        );
      } else {
        sitesLogger.info('FolioResolver.addFolioItem() RES:422 end');
        return this.genericResponseProvider.createResponse(
          `Failed to add Folio. `,
          422,
          false,
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.addFolioItem() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'addSiteToFolio' })
  async addSiteToFolio(
    @Args('folioDTO', { type: () => [FolioContentDTO] }, new ValidationPipe())
    folioContentDTO: [FolioContentDTO],
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.addSiteToFolio() start folioContentDTO:' +
        ' ' +
        JSON.stringify(folioContentDTO),
    );
    try {
      const message = await this.folioService.addSiteToFolio(
        folioContentDTO,
        user,
      );

      if (message) {
        sitesLogger.info('FolioResolver.addSiteToFolio() RES:201 end');
        return this.genericResponseProvider.createResponse(
          'Success',
          201,
          true,
        );
      } else {
        sitesLogger.info('FolioResolver.addSiteToFolio() RES:422 end');
        return this.genericResponseProvider.createResponse(
          `Failed to add Folio. `,
          422,
          false,
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.addSiteToFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'updateFolioItem' })
  async updateFolioItem(
    @Args('folioDTO', { type: () => [FolioDTO] }, new ValidationPipe())
    folioDTO: [FolioDTO],
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.updateFolioItem() start folioDTO:' +
        ' ' +
        JSON.stringify(folioDTO),
    );
    try {
      const message = await this.folioService.updateFolio(folioDTO, user);

      if (message) {
        sitesLogger.info('FolioResolver.updateFolioItem() RES:201 end');
        return this.genericResponseProvider.createResponse(
          'Success',
          201,
          true,
        );
      } else {
        sitesLogger.info('FolioResolver.updateFolioItem() RES:422 end');
        return this.genericResponseProvider.createResponse(
          `Failed to add Folio. `,
          422,
          false,
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.updateFolioItem() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'deleteFolioItem' })
  async deleteFolio(
    @Args('folioId', new ValidationPipe())
    folioId: number,
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.deleteFolio() start folioId:' + ' ' + folioId,
    );
    try {
      const message = await this.folioService.deleteFolio(folioId, user);

      if (message) {
        sitesLogger.info('FolioResolver.deleteFolio() RES:200 end');
        return this.genericResponseProvider.createResponse(
          'Deleted',
          200,
          true,
        );
      } else {
        sitesLogger.info('FolioResolver.deleteFolio() RES:422 end');
        return this.genericResponseProvider.createResponse(
          `Failed delete item. `,
          422,
          false,
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.deleteFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'deleteSitesInFolio' })
  async deleteSitesInFolio(
    @Args('folioDTO', { type: () => [FolioContentDTO] }, new ValidationPipe())
    folioContentDTO: [FolioContentDTO],
    @AuthenticatedUser()
    user: any,
  ) {
    sitesLogger.info(
      'FolioResolver.deleteSitesInFolio() start folioContentDTO:' +
        ' ' +
        JSON.stringify(folioContentDTO),
    );
    try {
      const message = await this.folioService.deleteSitesInFolio(
        folioContentDTO,
        user,
      );

      if (message) {
        sitesLogger.info('FolioResolver.deleteSitesInFolio() RES:200 end');
        return this.genericResponseProvider.createResponse(
          'Deleted',
          200,
          true,
        );
      } else {
        sitesLogger.info('FolioResolver.deleteSitesInFolio() RES:422 end');
        return this.genericResponseProvider.createResponse(
          `Failed delete item. `,
          422,
          false,
        );
      }
    } catch (error) {
      sitesLogger.error(
        'Exception occured in FolioResolver.deleteSitesInFolio() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw new Error('System Error, Please try again.');
    }
  }
}
