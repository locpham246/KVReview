import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';

@Injectable()
export class RestaurantService {
  constructor(private prisma: PrismaService) { }

  create(createRestaurantDto: CreateRestaurantDto) {
    return this.prisma.restaurant.create({ data: createRestaurantDto as any });
  }

  findAll() {
    return this.prisma.restaurant.findMany({
      orderBy: { rating: 'desc' }
    });
  }

  findOne(id: string) {
    return this.prisma.restaurant.findUnique({ where: { id } });
  }

  update(id: string, updateRestaurantDto: UpdateRestaurantDto) {
    return this.prisma.restaurant.update({
      where: { id },
      data: updateRestaurantDto as any,
    });
  }

  remove(id: string) {
    return this.prisma.restaurant.delete({ where: { id } });
  }
}
