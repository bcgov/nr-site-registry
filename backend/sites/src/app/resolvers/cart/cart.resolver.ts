import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import {} from '../../dto/recentView.dto';
import { CustomRoles } from 'src/app/dto/roles/role';

import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { GenericValidationPipe } from '../../utils/validations/genericValidationPipe';
import { Cart } from '../../entities/cart.entity';
import { CartService } from '../../services/cart/cart.service';
import {
  CartDeleteDTO,
  CartDeleteDTOWithSiteID,
  CartDTO,
  CartResponse,
} from '../../dto/cart.dto';

@Resolver(() => Cart)
export class CartResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly genericResponseProvider: GenericResponseProvider<Cart[]>,
  ) {}

 @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Query(() => CartResponse, { name: 'getCartItemsForUser' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getCartItemsForUser(
    @Args('userId', { type: () => String }) userId: string,
    @AuthenticatedUser() user: any,
  ) {
    try {
      const result = await this.cartService.getCartItemsForUser(user?.sub);
      if (result.length > 0) {
        return this.genericResponseProvider.createResponse(
          'Cart items fetched successfully',
          200,
          true,
          result,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Cart items not found for user id: ${userId}`,
          422,
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
  @Mutation(() => CartResponse, { name: 'addCartItem' })
  async addCartItem(
    @Args('cartDTO', { type: () => [CartDTO] }, new ValidationPipe())
    cartDTO: CartDTO[],
    @AuthenticatedUser() user: any,
  ) {
    try {
      const result = await this.cartService.addCartItem(cartDTO, user?.sub);
      if (result)
        return this.genericResponseProvider.createResponse(
          'Items added to cart',
          201,
          true,
        );
      else
        return this.genericResponseProvider.createResponse(
          'Unable to add items to cart',
          422,
          true,
        );
    } catch (error) {
      console.log('Error', error);
      throw new Error('System Error, Please try again.');
    }
  }

 @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => CartResponse, { name: 'deleteCartItem' })
  async deleteCartItem(
    @Args(
      'cartDeleteDTO',
      { type: () => [CartDeleteDTO] },
      new ValidationPipe(),
    )
    cartDeleteDTO: CartDeleteDTO[],
    @AuthenticatedUser() user: any,
  ) {
    try {
      const message = await this.cartService.deleteCartItem(
        cartDeleteDTO,
        user?.sub,
      );

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Successfully deleted cart items.',
          200,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Unable to delete cart items. `,
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
  @Mutation(() => CartResponse, { name: 'deleteCartItemWithSiteId' })
  async deleteCartItemWithSiteId(
    @Args(
      'cartDeleteDTO',
      { type: () => [CartDeleteDTOWithSiteID] },
      new ValidationPipe(),
    )
    cartDeleteDTO: CartDeleteDTOWithSiteID[],
    @AuthenticatedUser() user: any,
  ) {
    try {
      const message = await this.cartService.deleteCartWithSiteId(
        cartDeleteDTO,
        user?.sub,
      );

      if (message) {
        return this.genericResponseProvider.createResponse(
          'Deleted cart items.',
          200,
          true,
        );
      } else {
        return this.genericResponseProvider.createResponse(
          `Unable to delete cart item. `,
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
