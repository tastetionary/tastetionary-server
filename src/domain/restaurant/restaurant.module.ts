import { Module } from '@nestjs/common';
import { RestaurantController } from '@domain/restaurant/controller/restaurant.controller';
import { AuthGuard } from '@common/auth/auth.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@domain/user/user.module';
import { RedisModule } from '@common/redis/redis.module';

@Module({
  imports: [UserModule, RedisModule],
  controllers: [RestaurantController],
  providers: [AuthGuard, ConfigurationService, JwtService],
})
export class RestaurantModule {}
