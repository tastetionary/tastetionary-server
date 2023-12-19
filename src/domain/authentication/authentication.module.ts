import { Module } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AuthenticationController } from '@domain/authentication/controller/authentication.controller';

@Module({
  controllers: [AuthenticationController],
  providers: [JwtService, ConfigurationService],
})
export class AuthenticationModule {}
