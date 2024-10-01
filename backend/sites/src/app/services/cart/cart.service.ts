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
import { LoggerService } from 'src/app/logger/logger.service';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    private readonly sitesLogger: LoggerService,
  ) {}

  async getCartItemsForUser(userId: string): Promise<Cart[]> {
    this.sitesLogger.log('CartService.getCartItemsForUser() start');
    this.sitesLogger.debug('CartService.getCartItemsForUser() start');
    try {
      const cartItems = await this.cartRepository.find({
        relations: { site: true },
        where: { userId },
      });
      this.sitesLogger.log('CartService.getCartItemsForUser() end');
      this.sitesLogger.debug('CartService.getCartItemsForUser() end');
      return cartItems;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in CartService.getCartItemsForUser() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async addCartItem(list: CartDTO[], userId: string): Promise<boolean> {
    this.sitesLogger.log('CartService.addCartItem() start');
    this.sitesLogger.debug('CartService.addCartItem() start');
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
      } else if (cartItemsToInsert?.length === 0) {
        return true;
      }
      this.sitesLogger.log('CartService.addCartItem() end');
      this.sitesLogger.debug('CartService.addCartItem() end');
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in CartService.addCartItem() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async deleteCartItem(
    cartDeleteList: CartDeleteDTO[],
    userId: string,
  ): Promise<boolean> {
    this.sitesLogger.log('CartService.deleteCartItem() start');
    this.sitesLogger.debug('CartService.deleteCartItem() start');
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
      this.sitesLogger.log('CartService.deleteCartItem() end');
      this.sitesLogger.debug('CartService.deleteCartItem() end');
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in CartService.deleteCartItem() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }

  async deleteCartWithSiteId(
    cartDeleteList: CartDeleteDTOWithSiteID[],
    userId: string,
  ): Promise<boolean> {
    this.sitesLogger.log('CartService.deleteCartWithSiteId() start');
    this.sitesLogger.debug('CartService.deleteCartWithSiteId() start');
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

        this.sitesLogger.log('CartService.deleteCartWithSiteId() end');
        this.sitesLogger.debug('CartService.deleteCartWithSiteId() end');

        if (deleteResult.affected > 0) return true;

        return false;
      }
      return false;
    } catch (error) {
      this.sitesLogger.error(
        'Exception occured in CartService.deleteCartWithSiteId() end',
        JSON.stringify(error),
      );
      throw error;
    }
  }
}
