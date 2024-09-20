import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Cart } from '../../entities/cart.entity';
import {
  CartDeleteDTO,
  CartDeleteDTOWithSiteID,
  CartDTO,
} from '../../dto/cart.dto';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sitesLogger = require('../../logger/logging');

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async getCartItemsForUser(userId: string): Promise<Cart[]> {
    sitesLogger.info('CartService.getCartItemsForUser() start');
    sitesLogger.debug('CartService.getCartItemsForUser() start');
    try {
      const cartItems = await this.cartRepository.find({
        relations: { site: true },
        where: { userId },
      });
      sitesLogger.info('CartService.getCartItemsForUser() end');
      sitesLogger.debug('CartService.getCartItemsForUser() end');
      return cartItems;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in CartService.getCartItemsForUser() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async addCartItem(list: CartDTO[], userId: string): Promise<boolean> {
    sitesLogger.info('CartService.addCartItem() start');
    sitesLogger.debug('CartService.addCartItem() start');
    try {
      const cartItemsToInsert = [];
      const existingRecords = await this.cartRepository.find({
        where: list.map((cartDTO) => ({
          userId: userId,
          siteId: cartDTO.siteId,
        })),
      });

      const existingRecordSet = new Set(
        existingRecords.map((record) => `${record.userId}-${record.siteId}`),
      );

      for (const cartDTO of list) {
        const { userId, siteId } = cartDTO;

        const recordKey = `${userId}-${siteId}`;
        if (!existingRecordSet.has(recordKey)) {
          const cartItem = plainToInstance(Cart, cartDTO);
          cartItemsToInsert.push(cartItem);
        }
      }

      let insertedRecords: Cart[] = [];
      if (cartItemsToInsert && cartItemsToInsert.length > 0) {
        insertedRecords = await this.cartRepository.save(cartItemsToInsert);

        if (insertedRecords.length > 0) return true;
        else return false;
      }
      sitesLogger.info('CartService.addCartItem() end');
      sitesLogger.debug('CartService.addCartItem() end');
      return false;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in CartService.addCartItem() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async deleteCartItem(
    cartDeleteList: CartDeleteDTO[],
    userId: string,
  ): Promise<boolean> {
    sitesLogger.info('CartService.deleteCartItem() start');
    sitesLogger.debug('CartService.deleteCartItem() start');
    try {
      const cartIds = cartDeleteList
        .filter((item) => item.cartId !== '')
        .map((item) => item.cartId);

      let deleteResult: DeleteResult = null;
      if (cartIds.length > 0) {
        deleteResult = await this.cartRepository
          .createQueryBuilder()
          .delete()
          .from(Cart)
          .where('id IN (:...cartIds)', { cartIds })
          .andWhere('userId = :userId', { userId: userId })
          .execute();

        if (deleteResult.affected > 0) return true;
        else return false;
      }
      sitesLogger.info('CartService.deleteCartItem() end');
      sitesLogger.debug('CartService.deleteCartItem() end');
      return false;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in CartService.deleteCartItem() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }

  async deleteCartWithSiteId(
    cartDeleteList: CartDeleteDTOWithSiteID[],
    userId: string,
  ): Promise<boolean> {
    sitesLogger.info('CartService.deleteCartWithSiteId() start');
    sitesLogger.debug('CartService.deleteCartWithSiteId() start');
    try {
      const siteIds = cartDeleteList
        .filter((item) => item.siteId !== '')
        .map((item) => item.siteId);

      let deleteResult: DeleteResult = null;
      if (siteIds.length > 0) {
        deleteResult = await this.cartRepository
          .createQueryBuilder()
          .delete()
          .from(Cart)
          .where('siteId IN (:...cartIds)', { siteIds })
          .andWhere('userId = :userId', { userId: userId })
          .execute();

        sitesLogger.info('CartService.deleteCartWithSiteId() end');
        sitesLogger.debug('CartService.deleteCartWithSiteId() end');

        if (deleteResult.affected > 0) return true;

        return false;
      }
      return false;
    } catch (error) {
      sitesLogger.error(
        'Exception occured in CartService.deleteCartWithSiteId() end' +
          ' ' +
          JSON.stringify(error),
      );
      throw error;
    }
  }
}
