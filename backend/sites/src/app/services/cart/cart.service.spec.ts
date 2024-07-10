import { DeleteResult, Repository } from 'typeorm';
import { CartService } from './cart.service';
import { Cart } from '../../entities/cart.entity';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { sampleSites } from '../../mockData/site.mockData';
import { CartDTO } from 'src/app/dto/cart.dto';

describe('CartSerive', () => {
  let cartService: CartService;
  let cartRepository: Repository<Cart>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: getRepositoryToken(Cart),
          useClass: Repository,
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
    // Mock recentViewsRepository methods
    jest.spyOn(cartRepository, 'findOne').mockResolvedValue(null);
    jest.spyOn(cartRepository, 'save').mockResolvedValueOnce({} as Cart); // Mock save method

    // Prepare test data
    const cartItemDTO: CartDTO = {
      userId: '1',
      siteId: '1',
      price: 200,
      whoCreated: 'Midhun',
    };

    // Execute the method
    const result = await cartService.addCartItem(cartItemDTO);

    // Assert the result
    expect(result).toBe('Cart Item Added.');
  });

  it('should delete cart item', async () => {
    const deleteResult: DeleteResult = {
      affected: 1,
      raw: null,
    };

    // Mock recentViewsRepository methods
    jest.spyOn(cartRepository, 'delete').mockResolvedValue(deleteResult);

    // Execute the method
    const result = await cartService.deleteCartItem('1');

    // Assert the result
    expect(result).toBe(true);
  });
});
