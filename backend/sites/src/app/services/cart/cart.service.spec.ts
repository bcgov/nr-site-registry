import { Repository } from 'typeorm';
import { CartService } from './cart.service';
import { Cart } from '../../entities/cart.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';

describe('CartSerive', () => {
  let cartService: CartService;
  let cartRepository: Repository<Cart>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useClass: Cart,
        },
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);

    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });
});
