import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { Folio } from 'src/app/entities/folio.entity';
import { FolioService } from '../../services/folio/folio.service';
import { FolioDTO, FolioMinDTO, FolioResponse } from 'src/app/dto/Folio';
import { FolioContentDTO, FolioContentResponse } from 'src/app/dto/folioContent';
import { FolioContents } from 'src/app/entities/folioContents.entity';


@Resolver(() => Folio)
export class FolioResolver {
  constructor(
    private readonly FolioService: FolioService, 
    private readonly genericResponseProvider: GenericResponseProvider<Folio[]>,
    private readonly genericResponseProviderForFolioContent: GenericResponseProvider<FolioContents[]>,
  ) { }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => FolioResponse, { name: 'getFolioItemsForUser' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getFolioItemsForUser(
    @Args('userId', { type: () => String }) userId: string,
  ) {

    const result = await this.FolioService.getFoliosForUser(userId);

    if (result.length > 0) {
      return this.genericResponseProvider.createResponse('Folio fetched successfully', 200, true, result);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Folio not found for user id: ${userId}`, 200, true, []);
    }
  }


  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => FolioContentResponse, { name: 'getSitesForFolio' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getSitesForFolio(
    @Args('folioDTO', { type: () => FolioMinDTO }, new ValidationPipe())
    folioDTO: FolioMinDTO,
  ) {

    const result = await this.FolioService.getSitesForFolio(folioDTO);

    if (result.length > 0) {
      return this.genericResponseProviderForFolioContent.createResponse('Folio fetched successfully', 200, true, result);
    }
    else
    {
      return this.genericResponseProviderForFolioContent.createResponse(`Folio not found for user id: ${folioDTO.userId}`, 200, true, []);
    }
  }


  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'addFolioItem' })
  async addFolioItem(
    @Args('folioDTO', { type: () => FolioDTO }, new ValidationPipe())
    folioDTO: FolioDTO,
  ){
    const message = await this.FolioService.addFolio(folioDTO);

    if (message) {
      return this.genericResponseProvider.createResponse("Success", 201, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed to add Folio. `, 400, false);
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'addSiteToFolio' })
  async addSiteToFolio(
    @Args('folioDTO', { type: () => [FolioContentDTO] }, new ValidationPipe())
    folioContentDTO: [FolioContentDTO],
  ){
    const message = await this.FolioService.addSiteToFolio(folioContentDTO);

    if (message) {
      return this.genericResponseProvider.createResponse("Success", 201, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed to add Folio. `, 400, false);
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'updateFolioItem' })
  async updateFolioItem(
    @Args('folioDTO', { type: () => [FolioDTO] }, new ValidationPipe())
    folioDTO: [FolioDTO],
  ){
    const message = await this.FolioService.updateFolio(folioDTO);

    if (message) {
      return this.genericResponseProvider.createResponse("Success", 201, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed to add Folio. `, 400, false);
    }
  }



  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'deleteFolioItem' })
  async deleteFolio(
    @Args('FolioId', new ValidationPipe())
    folioId: number,
  ){
    const message = await this.FolioService.deleteFolio(folioId);

    if (message) {
      return this.genericResponseProvider.createResponse("Deleted", 200, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed delete item. `, 400, false);
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => FolioResponse, { name: 'deleteSitesInFolio' })
  async deleteSitesInFolio(
    @Args('folioDTO', { type: () => [FolioContentDTO] }, new ValidationPipe())
    folioContentDTO: [FolioContentDTO]
  ){
    const message = await this.FolioService.deleteSitesInFolio(folioContentDTO);

    if (message) {
      return this.genericResponseProvider.createResponse("Deleted", 200, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed delete item. `, 400, false);
    }
  }


}
