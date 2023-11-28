import { Module } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationController } from '@domain/authentication/controller/authentication.controller';
import { AuthenticationService } from '@domain/authentication/service/authentication.service';

@Module({
  controllers: [AuthenticationController],
  providers: [JwtService, ConfigurationService, AuthenticationService],
  exports: [AuthenticationService],
})
export class AuthenticationModule {}
