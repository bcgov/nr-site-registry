import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { plainToInstance } from 'class-transformer';
import { Cart } from '../../entities/cart.entity';
import { CartDTO } from '../../dto/cart.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async getCartItemsForUser(userId: string): Promise<Cart[]> {
    try {
      const cartItems = await this.cartRepository.find({ where: { userId } });
      return cartItems;
    } catch (error) {
      throw error;
    }
  }

  async addCartItem(cartDTO: CartDTO) {
    const { userId, siteId } = cartDTO;

    try {
      // Check if the combination of userId and siteId exists in the table
      const recordExists = await this.cartRepository.findOne({
        where: { userId, siteId },
      });

      if (recordExists) {
        return 'Cart Item Already Exists';
      } else {
        // Convert the DTO to entity
        const cartItem = plainToInstance(Cart, cartDTO);
        const result = await this.cartRepository.save(cartItem);

        if (result) {
          return 'Cart Item Added.';
        }
      }
    } catch (error) {
      throw new Error('Failed to Add Cart Item.');
    }
  }

  async deleteCartItem(cartId: string): Promise<boolean> {
    try {
      if (cartId != '') {
        const result = await this.cartRepository.delete({ id: cartId });
        if (result.affected > 0) return true;
        else return false;
      }

      return false;
    } catch (e) {
      return false;
    }
  }
}
