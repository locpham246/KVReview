import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { KolModule } from './kol/kol.module';
import { RestaurantModule } from './restaurant/restaurant.module';
import { PrismaModule } from './prisma.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule, KolModule, RestaurantModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }

