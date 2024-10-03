import { Module } from '@nestjs/common';
import { RestaurantController } from '@domain/restaurant/controller/restaurant.controller';
import { JwtAuthGuard } from '@common/auth/auth.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { UserModule } from '@domain/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [RestaurantController],
  providers: [JwtAuthGuard, ConfigurationService, JwtService],
})
export class RestaurantModule {}
