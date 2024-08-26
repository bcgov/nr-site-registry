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
import { CustomRoles } from 'src/app/dto/roles/role';

@Resolver(() => Folio)
export class FolioResolver {
  constructor(
    private readonly folioService: FolioService,
    private readonly genericResponseProvider: GenericResponseProvider<Folio[]>,
    private readonly genericResponseProviderForFolioContent: GenericResponseProvider<
      FolioContents[]
    >,
  ) {}

 @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Query(() => FolioResponse, { name: 'getFolioItemsForUser' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getFolioItemsForUser(
    @Args('userId', { type: () => String }) userId: string,
    @AuthenticatedUser()
    user: any,
  ) {
    try {
      const result = await this.folioService.getFoliosForUser(user);

      if (result && result.length > 0) {
        return this.genericResponseProvider.createResponse(
          'Folio fetched successfully',
          200,
          true,
          result,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Folio not found for user id: ${userId}`,
          200,
          true,
          [],
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
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
    try {
      const result = await this.folioService.getSitesForFolio(folioDTO, user);

      if (result && result.length > 0) {
        return this.genericResponseProviderForFolioContent.createResponse(
          'Sites fetched successfully for folio',
          200,
          true,
          result,
        );
      } else {
        return this.genericResponseProviderForFolioContent.createResponse(
          `Unable to fetch sites for folio`,
          200,
          true,
          [],
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
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
    try {
      const message = await this.folioService.addFolio(folioDTO, user);

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Success',
          201,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Failed to add Folio. `,
          422,
          false,
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
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
    console.log("user",user)
    try {
      const message = await this.folioService.addSiteToFolio(
        folioContentDTO,
        user,
      );

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Success',
          201,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Failed to add Folio. `,
          422,
          false,
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
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
    try {
      const message = await this.folioService.updateFolio(folioDTO, user);

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Success',
          201,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Failed to add Folio. `,
          422,
          false,
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
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
    try {
      const message = await this.folioService.deleteFolio(folioId, user);

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Deleted',
          200,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Failed delete item. `,
          422,
          false,
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
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
    try {
      const message = await this.folioService.deleteSitesInFolio(
        folioContentDTO,
        user,
      );

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Deleted',
          200,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Failed delete item. `,
          422,
          false,
        );
      }
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
    }
  }
}
