import { Module } from '@nestjs/common';
import { ReviewController } from '@root/src/domain/restaurant/controller/review.controller';
import { AuthGuard } from '@common/auth/auth.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [],
  controllers: [ReviewController],
  providers: [AuthGuard, ConfigurationService, JwtService],
})
export class ReviewModule {}
