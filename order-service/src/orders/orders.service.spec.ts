import { Test, TestingModule } from '@nestjs/testing';
import { OrdersService } from './orders.service';
import { HttpService } from '@nestjs/axios';
import { ProductsService } from '../products/products.service';
import { NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { of, throwError } from 'rxjs';

describe('OrdersService', () => {
  let service: OrdersService;
  let httpService: HttpService;
  let productsService: ProductsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: HttpService,
          useValue: {
            get: jest.fn(),
          },
        },
        {
          provide: ProductsService,
          useValue: {
            findById: jest.fn().mockReturnValue({ id: 1, name: 'Test Product', price: 100 }),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    httpService = module.get<HttpService>(HttpService);
    productsService = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createOrder', () => {
    it('should throw NotFoundException if user-service returns 404', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() =>
        throwError(() => ({
          response: { status: 404 },
        })),
      );

      await expect(service.createOrder(1, 1)).rejects.toThrow(NotFoundException);
      await expect(service.createOrder(1, 1)).rejects.toThrow('User not found');
    });

    it('should throw InternalServerErrorException if user-service returns 500', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() =>
        throwError(() => ({
          response: { status: 500 },
        })),
      );

      await expect(service.createOrder(1, 1)).rejects.toThrow(InternalServerErrorException);
      await expect(service.createOrder(1, 1)).rejects.toThrow('User-service is unreachable');
    });

    it('should throw InternalServerErrorException if user-service is unreachable (no response)', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() =>
        throwError(() => new Error('Connection refused')),
      );

      await expect(service.createOrder(1, 1)).rejects.toThrow(InternalServerErrorException);
      await expect(service.createOrder(1, 1)).rejects.toThrow('User-service is unreachable');
    });

    it('should throw BadRequestException for other user-service errors', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() =>
        throwError(() => ({
          response: { status: 400 },
        })),
      );

      await expect(service.createOrder(1, 1)).rejects.toThrow(BadRequestException);
      await expect(service.createOrder(1, 1)).rejects.toThrow('Error communicating with user-service');
    });

    it('should create an order successfully if user and product exist', async () => {
      jest.spyOn(httpService, 'get').mockImplementation(() =>
        of({ data: { id: 1, name: 'Test User' } } as any),
      );

      const result = await service.createOrder(1, 1);

      expect(result).toBeDefined();
      expect(result.userId).toBe(1);
      expect(result.productId).toBe(1);
      expect(httpService.get).toHaveBeenCalledWith('http://localhost:3001/users/1');
      expect(productsService.findById).toHaveBeenCalledWith(1);
    });
  });
});
