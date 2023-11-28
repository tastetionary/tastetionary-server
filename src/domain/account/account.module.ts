import { Module } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '@domain/account/service/account.service';
import { AccountController } from './controller/account.controller';

@Module({
  controllers: [AccountController],
  providers: [AccountService, JwtService, ConfigurationService],
  exports: [AccountService],
})
export class AccountModule {}
