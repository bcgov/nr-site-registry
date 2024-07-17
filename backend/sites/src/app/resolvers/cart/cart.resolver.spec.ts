import { Test, TestingModule } from '@nestjs/testing';
import { CartResolver } from './cart.resolver';
import { CartService } from '../../services/cart/cart.service';
import { CartDTO } from '../../dto/cart.dto';
import { GenericResponseProvider } from '../../dto/response/genericResponseProvider';
import { Cart } from '../../entities/cart.entity';
import { sampleSites } from '../../mockData/site.mockData';
import { GenericResponse } from 'src/app/dto/response/genericResponse';

describe('CartResolver', () => {
  let resolver: CartResolver;
  let service: CartService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartResolver,
        {
          provide: CartService,
          useValue: {
            getCartItemsForUser: jest.fn(),
            addCartItem: jest.fn(),
            deleteCartItem: jest.fn(),
          },
        },
        {
          provide: GenericResponseProvider,
          useValue: {
            createResponse: jest.fn(() => {
              const response: GenericResponse<Cart[]> = {
                httpStatusCode: 200,
                message: '',
                success: true,
                data: [
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
                ],
              };
              return response;
            }),
          },
        },
      ],
    }).compile();

    resolver = module.get<CartResolver>(CartResolver);
    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  describe('getCartItemsForUser', () => {
    const cartItems: Cart[] = [
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

    it('should return cart Items for valid userId', async () => {
      const userId = '1';
      const expectedResult = {
        httpStatusCode: 200,
        message: 'Success',
        data: cartItems,
      };

      jest
        .spyOn(service, 'getCartItemsForUser')
        .mockResolvedValueOnce(expectedResult.data);

      const result = await resolver.getCartItemsForUser(userId);

      expect(result.data.length).toEqual(1);
      expect(service.getCartItemsForUser).toHaveBeenCalledWith(userId);
    });
  });

  describe('addCartItem', () => {
    const cartItemDTO: CartDTO = {
      userId: '1',
      siteId: '1',
      price: 200,
      whoCreated: 'Midhun',
    };

    it('should add cart item for valid input', async () => {
      const cartItem: CartDTO = cartItemDTO;
      const expectedResult = 'Cart Item Added.';
      jest.spyOn(service, 'addCartItem').mockResolvedValueOnce(expectedResult);

      const result = await resolver.addCartItem(cartItem);

      expect(result.success).toEqual(true);
    });
  });

  describe('deleteCartItem', () => {
    it('should delete cart item for valid input', async () => {
      const cartItemId = '';
      const expectedResult = true;
      jest
        .spyOn(service, 'deleteCartItem')
        .mockResolvedValueOnce(expectedResult);

      const result = await resolver.deleteCartItem(cartItemId);

      expect(result.success).toEqual(true);
    });
  });
});
