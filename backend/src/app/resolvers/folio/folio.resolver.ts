import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { Folio } from '../../entities/folio.entity';
import { FolioService } from '../../services/folio/folio.service';
import { FolioDTO, FolioMinDTO, FolioResponse } from '../../dto/folio.dto';
import {
  FolioContentDTO,
  FolioContentResponse,
} from '../../dto/folioContent.dto';
import { FolioContents } from '../../entities/folioContents.entity';
import { CustomRoles } from '../../common/role';
import { LoggerService } from '../../logger/logger.service';

@Resolver(() => Folio)
export class FolioResolver {
  constructor(
    private readonly folioService: FolioService,
    private readonly genericResponseProvider: GenericResponseProvider<Folio[]>,
    private readonly genericResponseProviderForFolioContent: GenericResponseProvider<
      FolioContents[]
    >,
    private readonly sitesLogger: LoggerService,
  ) {}

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Query(() => FolioResponse, { name: 'getFolioItemsForUser' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getFolioItemsForUser(
    @Args('userId', { type: () => String }) userId: string,
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.getFolioItemsForUser() start userId:' + ' ' + userId,
    );
    const result = await this.folioService.getFoliosForUser(user);

    if (result && result.length > 0) {
      this.sitesLogger.log('FolioResolver.getFolioItemsForUser() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Folio fetched successfully',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('FolioResolver.getFolioItemsForUser() RES:404 end');
      return this.genericResponseProvider.createResponse(
        `Folio not found for user id: ${userId}`,
        404,
        true,
        [],
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Query(() => FolioContentResponse, { name: 'getSitesForFolio' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSitesForFolio(
    @Args('folioDTO', { type: () => FolioMinDTO }, new ValidationPipe())
    folioDTO: FolioMinDTO,
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.getSitesForFolio() start folioDTO:' +
        ' ' +
        JSON.stringify(folioDTO),
    );
    const result = await this.folioService.getSitesForFolio(folioDTO, user);

    if (result && result.length > 0) {
      this.sitesLogger.log('FolioResolver.getSitesForFolio() RES:200 end');
      return this.genericResponseProviderForFolioContent.createResponse(
        'Sites fetched successfully for folio',
        200,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('FolioResolver.getSitesForFolio() RES:400 end');
      return this.genericResponseProviderForFolioContent.createResponse(
        `Unable to fetch sites for folio`,
        400,
        true,
        [],
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'addFolioItem' })
  async addFolioItem(
    @Args('folioDTO', { type: () => FolioDTO }, new ValidationPipe())
    folioDTO: FolioDTO,
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.addFolioItem() start folioDTO:' +
        ' ' +
        JSON.stringify(folioDTO),
    );
    const message = await this.folioService.addFolio(folioDTO, user);

    if (message) {
      this.sitesLogger.log('FolioResolver.addFolioItem() RES:201 end');
      return this.genericResponseProvider.createResponse('Success', 201, true);
    } else {
      this.sitesLogger.log('FolioResolver.addFolioItem() RES:422 end');
      return this.genericResponseProvider.createResponse(
        `Failed to add Folio. `,
        422,
        false,
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'addSiteToFolio' })
  async addSiteToFolio(
    @Args('folioDTO', { type: () => [FolioContentDTO] }, new ValidationPipe())
    folioContentDTO: [FolioContentDTO],
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.addSiteToFolio() start folioContentDTO:' +
        ' ' +
        JSON.stringify(folioContentDTO),
    );
    const message = await this.folioService.addSiteToFolio(
      folioContentDTO,
      user,
    );

    if (message) {
      this.sitesLogger.log('FolioResolver.addSiteToFolio() RES:201 end');
      return this.genericResponseProvider.createResponse('Success', 201, true);
    } else {
      this.sitesLogger.log('FolioResolver.addSiteToFolio() RES:422 end');
      return this.genericResponseProvider.createResponse(
        `Failed to add Folio. `,
        422,
        false,
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'updateFolioItem' })
  async updateFolioItem(
    @Args('folioDTO', { type: () => [FolioDTO] }, new ValidationPipe())
    folioDTO: [FolioDTO],
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.updateFolioItem() start folioDTO:' +
        ' ' +
        JSON.stringify(folioDTO),
    );
    const message = await this.folioService.updateFolio(folioDTO, user);

    if (message) {
      this.sitesLogger.log('FolioResolver.updateFolioItem() RES:201 end');
      return this.genericResponseProvider.createResponse('Success', 201, true);
    } else {
      this.sitesLogger.log('FolioResolver.updateFolioItem() RES:422 end');
      return this.genericResponseProvider.createResponse(
        `Failed to add Folio. `,
        422,
        false,
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'deleteFolioItem' })
  async deleteFolio(
    @Args('folioId', new ValidationPipe())
    folioId: number,
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.deleteFolio() start folioId:' + ' ' + folioId,
    );
    const message = await this.folioService.deleteFolio(folioId, user);

    if (message) {
      this.sitesLogger.log('FolioResolver.deleteFolio() RES:200 end');
      return this.genericResponseProvider.createResponse('Deleted', 200, true);
    } else {
      this.sitesLogger.log('FolioResolver.deleteFolio() RES:422 end');
      return this.genericResponseProvider.createResponse(
        `Failed delete item. `,
        422,
        false,
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'deleteSitesInFolio' })
  async deleteSitesInFolio(
    @Args('folioDTO', { type: () => [FolioContentDTO] }, new ValidationPipe())
    folioContentDTO: [FolioContentDTO],
    @AuthenticatedUser()
    user: any,
  ) {
    this.sitesLogger.log(
      'FolioResolver.deleteSitesInFolio() start folioContentDTO:' +
        ' ' +
        JSON.stringify(folioContentDTO),
    );
    const message = await this.folioService.deleteSitesInFolio(
      folioContentDTO,
      user,
    );

    if (message) {
      this.sitesLogger.log('FolioResolver.deleteSitesInFolio() RES:200 end');
      return this.genericResponseProvider.createResponse('Deleted', 200, true);
    } else {
      this.sitesLogger.log('FolioResolver.deleteSitesInFolio() RES:422 end');
      return this.genericResponseProvider.createResponse(
        `Failed delete item. `,
        422,
        false,
      );
    }
  }
}
