import { Module } from '@nestjs/common';
import { RestaurantController } from '@domain/restaurant/controller/restaurant.controller';
import { AuthGuard } from '@common/auth/auth.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@common/database/prisma.service';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { RestaurantRepository } from '@domain/restaurant/repository/restaurant.repository';

@Module({
  imports: [],
  controllers: [RestaurantController],
  providers: [
    AuthGuard,
    ConfigurationService,
    JwtService,
    PrismaService,
    RestaurantRepository,
    RestaurantService,
  ],
})
export class RestaurantModule {}
