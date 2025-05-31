import { Module } from '@nestjs/common';
import { AdminController } from './controller/admin.controller';
import { AuthGuard } from '@common/auth/auth.guard';
import { RolesGuard } from '@common/auth/roles.guard';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [AdminController],
  providers: [AuthGuard, RolesGuard, ConfigurationService, JwtService],
})
export class AdminModule {}
