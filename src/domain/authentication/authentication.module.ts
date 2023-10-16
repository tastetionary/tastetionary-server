import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationController } from '@domain/authentication/controller/authentication.controller';
import { AuthenticationService } from '@domain/authentication/service/authentication.service';
import { AuthenticationRepository } from './repository/authentication.repository';

@Module({
  controllers: [AuthenticationController],
  providers: [
    JwtService,
    ConfigurationService,
    PrismaService,
    AuthenticationService,
    AuthenticationRepository,
  ],
  exports: [],
})
export class AuthenticationModule {}
