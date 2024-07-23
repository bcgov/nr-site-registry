import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Cart } from '../../entities/cart.entity';
import { CartDeleteDTO, CartDeleteDTOWithSiteID, CartDTO } from '../../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async getCartItemsForUser(userId: string): Promise<Cart[]> {
    try {
      const cartItems = await this.cartRepository.find({
        relations: { site: true },
        where: { userId },
      });
      return cartItems;
    } catch (error) {
      throw error;
    }
  }

  async addCartItem(list: CartDTO[]) {
    try {
      for (const cartDTO of list) {
        const { userId, siteId } = cartDTO;

        // Check if the combination of userId and siteId exists in the table
        const existingRecord = await this.cartRepository.findOne({
          where: { userId, siteId },
        });

        if (!existingRecord) {       
          // Convert the DTO to entity
          const cartItem = plainToInstance(Cart, cartDTO);
          const result = await this.cartRepository.save(cartItem);
        }
      }
    } catch (error) {
      throw new Error('Failed to Add Cart Item.');
    }
  }

  async deleteCartItem(cartDeleteList: CartDeleteDTO[]): Promise<boolean> {
    try {
      for (const item of cartDeleteList) {
        const { cartId, userId } = item;
        if (cartId != '') {
          const result = await this.cartRepository.delete({
            id: cartId,
            userId: userId,
          });        
        }
      }
    } catch (e) {
      return false;
    }
  }


  async deleteCartWithSiteId(cartDeleteList: CartDeleteDTOWithSiteID[]): Promise<boolean> {
    try {
      for (const item of cartDeleteList) {
        const { siteId, userId } = item;

        const existingCart = await this.cartRepository.findOne({
          where: { userId, siteId },
        });

        if (existingCart) {
          const result = await this.cartRepository.delete({
            id: existingCart.id,
            userId: existingCart.userId,
          });        
        }
      }
    } catch (e) {
      return false;
    }
  }

}
