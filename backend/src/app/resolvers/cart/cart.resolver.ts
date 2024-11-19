import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  AuthenticatedUser,
  RoleMatchingMode,
  Roles,
} from 'nest-keycloak-connect';
import {} from '../../dto/recentView.dto';
import { CustomRoles } from '../../common/role';
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
import { LoggerService } from '../../logger/logger.service';

@Resolver(() => Cart)
export class CartResolver {
  constructor(
    private readonly cartService: CartService,
    private readonly genericResponseProvider: GenericResponseProvider<Cart[]>,
    private readonly sitesLogger: LoggerService,
  ) {}

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Query(() => CartResponse, { name: 'getCartItemsForUser' })
  async getCartItemsForUser(@AuthenticatedUser() user: any) {
    this.sitesLogger.log(
      'CartResolver.getCartItemsForUser() start userId:' + ' ' + user?.sub,
    );
    const result = await this.cartService.getCartItemsForUser(user?.sub);
    if (result?.length > 0) {
      this.sitesLogger.log('CartResolver.getCartItemsForUser() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Cart items fetched successfully',
        HttpStatus.OK,
        true,
        result,
      );
    } else {
      this.sitesLogger.log('CartResolver.getCartItemsForUser() RES:200 end');
      return this.genericResponseProvider.createResponse(
        `Cart items not found for user id: ${user?.sub}`,
        HttpStatus.NOT_FOUND,
        true,
        [],
      );
    }
  }

  @Roles({ roles: [CustomRoles.External], mode: RoleMatchingMode.ANY })
  @Mutation(() => CartResponse, { name: 'addCartItem' })
  async addCartItem(
    @Args('cartDTO', { type: () => [CartDTO] }, new ValidationPipe())
    cartDTO: CartDTO[],
    @AuthenticatedUser() user: any,
  ) {
    this.sitesLogger.log(
      'CartResolver.addCartItem() start cartDTO:' +
        ' ' +
        JSON.stringify(cartDTO),
    );
    const result = await this.cartService.addCartItem(cartDTO, user?.sub);
    if (result) {
      this.sitesLogger.log('CartResolver.addCartItem() RES:201 end');
      return this.genericResponseProvider.createResponse(
        'Items added to cart',
        HttpStatus.CREATED,
        true,
      );
    } else {
      this.sitesLogger.log('CartResolver.addCartItem() RES:422 end');
      return this.genericResponseProvider.createResponse(
        'Unable to add items to cart',
        HttpStatus.UNPROCESSABLE_ENTITY,
        true,
      );
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
    this.sitesLogger.log(
      'CartResolver.deleteCartItem() start cartDTO:' +
        ' ' +
        JSON.stringify(cartDeleteDTO),
    );
    const message = await this.cartService.deleteCartItem(
      cartDeleteDTO,
      user?.sub,
    );

    if (message) {
      this.sitesLogger.log('CartResolver.deleteCartItem() RES:200 end');
      return this.genericResponseProvider.createResponse(
        'Successfully deleted cart items.',
        HttpStatus.OK,
        true,
      );
    } else {
      this.sitesLogger.log('CartResolver.deleteCartItem() RES:422 end');
      return this.genericResponseProvider.createResponse(
        `Unable to delete cart items. `,
        HttpStatus.UNPROCESSABLE_ENTITY,
        false,
      );
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
    const message = await this.cartService.deleteCartWithSiteId(
      cartDeleteDTO,
      user?.sub,
    );

    if (message) {
      return this.genericResponseProvider.createResponse(
        'Deleted cart items.',
        HttpStatus.OK,
        true,
      );
    } else {
      return this.genericResponseProvider.createResponse(
        `Unable to delete cart item. `,
        HttpStatus.UNPROCESSABLE_ENTITY,
        false,
      );
    }
  }
}
