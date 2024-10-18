import { DeepPartial, DeleteResult, Repository } from 'typeorm';
import { CartService } from './cart.service';
import { Cart } from '../../entities/cart.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { sampleSites } from '../../mockData/site.mockData';
import { CartDeleteDTO, CartDTO } from '../../dto/cart.dto';
import { LoggerService } from '../../logger/logger.service';

describe('CartSerive', () => {
  let cartService: CartService;
  let cartRepository: Repository<Cart>;
  let loggerService: LoggerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useValue: {
            find: jest.fn(),
            save: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(() => ({
              delete: jest.fn(() => ({
                from: jest.fn(() => ({
                  where: jest.fn(() => ({
                    andWhere: jest.fn(() => ({
                      execute: jest
                        .fn()
                        .mockResolvedValue({ affected: 1 } as DeleteResult),
                    })),
                  })),
                })),
              })),
            })),
          },
        },
        LoggerService
      ],
    }).compile();

    cartService = module.get<CartService>(CartService);

    cartRepository = module.get<Repository<Cart>>(getRepositoryToken(Cart));

    loggerService = module.get<LoggerService>(LoggerService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(cartService).toBeDefined();
  });

  it('should return an array of cart Items for a given user id', async () => {
    const userId = '1';
    const expectedCartItems = [
      {
        userId: '1',
        siteId: '1',
        whoCreated: 'M',
        whenUpdated: new Date(),
        price: 200,
        id: '1',
        whoUpdated: '',
        whenCreated: new Date(),
        site: sampleSites[0],
      },
    ];

    jest
      .spyOn(cartRepository, 'find')
      .mockResolvedValueOnce(expectedCartItems as Cart[]);

    const cartItems = await cartService.getCartItemsForUser(userId);

    expect(cartItems).toEqual(expectedCartItems);
  });

  it('should insert a new cart Item', async () => {
    // Prepare test data
    const cartItemDTO: CartDTO = {
      userId: '1',
      siteId: '1',
      price: 200,
      whoCreated: 'Midhun',
    };

    const cartItem: DeepPartial<Cart[]> = [
      {
        userId: '2',
        siteId: '2',
        price: 200,
        whoCreated: 'Midhun',
        site: null,
      },
    ];

    // Mock recentViewsRepository methods
    jest.spyOn(cartRepository, 'find').mockResolvedValue(cartItem as any);
    jest
      .spyOn(cartRepository, 'save')
      .mockResolvedValueOnce([cartItemDTO] as any); // Mock save method
    // Execute the method
    const result = await cartService.addCartItem([cartItemDTO], '');

    // Assert the result
    expect(result).toBe(true);
  });

  it('should delete cart item', async () => {
    const deleteResult: DeleteResult = {
      affected: 1,
      raw: null,
    };

    // Mock recentViewsRepository methods
    jest.spyOn(cartRepository, 'delete').mockResolvedValue(deleteResult);
    const cartItems: CartDeleteDTO = {
      userId: '1',
      cartId: '1',
    };
    // Execute the method
    const result = await cartService.deleteCartItem([cartItems], '');

    // Assert the result
    expect(result).toBe(true);
  });
});
