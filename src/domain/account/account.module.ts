import { Module } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AccountController } from './controller/account.controller';

@Module({
  controllers: [AccountController],
  providers: [ConfigurationService, JwtService],
})
export class AccountModule {}
