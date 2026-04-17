import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ProductsService } from '../products/products.service';

@Injectable()
export class OrdersService {
  private orders: any[] = [];

  constructor(
    private readonly httpService: HttpService,
    private readonly productsService: ProductsService,
  ) {}

  async createOrder(userId: number, productId: number) {
    // 1. Check user exists
    try {
      await firstValueFrom(
        this.httpService.get(`http://localhost:3001/users/${userId}`)
      );
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('User not found');
      }
      if (!error.response || error.response.status >= 500) {
        throw new InternalServerErrorException('User-service is unreachable');
      }
      throw new BadRequestException('Error communicating with user-service');
    }

    // 2. Check product exists
    const product = this.productsService.findById(productId);

    // 3. Create order
    const order = {
      id: Date.now(),
      userId,
      productId,
      createdAt: new Date(),
    };
    
    this.orders.push(order);
    return order;
  }
}
