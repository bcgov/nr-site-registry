import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RoleMatchingMode, Roles } from 'nest-keycloak-connect';
import { RecentViews } from '../../entities/recentViews.entity';
import { DashboardService } from '../../services/dashboard/dashboard.service';
import { RecentViewDto, RecentViewResponse } from '../../dto/recentView.dto';
import { GenericResponseProvider } from 'src/app/dto/response/genericResponseProvider';
import { GenericValidationPipe } from 'src/app/utils/validations/genericValidationPipe';
import { Cart } from 'src/app/entities/cart.entity';
import { CartService } from 'src/app/services/cart/cart.service';
import { CartDTO, CartResponse } from 'src/app/dto/cart.dto';

@Resolver(() => Cart)
export class CartResolver {
  constructor(
    private readonly cartService: CartService, 
    private readonly genericResponseProvider: GenericResponseProvider<Cart[]>,
  ) { }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Query(() => CartResponse, { name: 'getCartItemsForUser' })
  @UsePipes(new GenericValidationPipe()) // Apply generic validation pipe
  async getCartItemsForUser(
    @Args('userId', { type: () => String }) userId: string,
  ) {
    const result = await this.cartService.getCartItemsForUser(userId);
    if (result.length > 0) {
      return this.genericResponseProvider.createResponse('Cart items fetched successfully', 200, true, result);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Cart items not found for user id: ${userId}`, 200, true, []);
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => RecentViewResponse, { name: 'addCartItem' })
  async addCartItem(
    @Args('cartDTO', { type: () => CartDTO }, new ValidationPipe())
    cartDTO: CartDTO,
  ){
    const message = await this.cartService.addCartItem(cartDTO);

    if (message) {
      return this.genericResponseProvider.createResponse(message, 201, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed to add cart item. `, 400, false);
    }
  }

  @Roles({ roles: ['site-admin'], mode: RoleMatchingMode.ANY })
  @Mutation(() => RecentViewResponse, { name: 'deleteCartItem' })
  async deleteCartItem(
    @Args('cartId', new ValidationPipe())
    cartId: string,
  ){
    const message = await this.cartService.deleteCartItem(cartId);

    if (message) {
      return this.genericResponseProvider.createResponse("Deleted", 200, true);
    }
    else
    {
      return this.genericResponseProvider.createResponse(`Failed delete item. `, 400, false);
    }
  }


}
