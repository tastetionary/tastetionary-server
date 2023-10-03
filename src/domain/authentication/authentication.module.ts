import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationController } from '@domain/authentication/controller/authentication.controller';

@Module({
  controllers: [AuthenticationController],
  providers: [JwtService, ConfigurationService, PrismaService],
  exports: [],
})
export class AuthenticationModule {}
