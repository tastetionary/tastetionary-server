import { Module } from '@nestjs/common';
import { FoodService } from '@domain/food/service/food.service';
import { FoodRepository } from '@domain/food/repository/food.repository';
import { FoodController } from '@domain/food/controller/food.controller';
import { AuthGuard } from '@root/src/common/auth/auth.guard';
import { JwtService } from '@nestjs/jwt';
import { ConfigurationService } from '@domain/configuration/configuration.service';

@Module({
  controllers: [FoodController],
  providers: [
    AuthGuard,
    ConfigurationService,
    JwtService,
    FoodService,
    FoodRepository,
  ],
})
export class FoodModule {}
