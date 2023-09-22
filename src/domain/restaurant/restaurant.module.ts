import { Module } from '@nestjs/common';
import { RestaurantController } from '@root/src/domain/restaurant/controller/restaurant.controller';
import { AuthGuard } from '@common/auth/auth.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [RestaurantController],
  providers: [AuthGuard, ConfigurationService, JwtService],
})
export class RestaurantModule {}
