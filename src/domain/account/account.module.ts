import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';
import { AccountService } from '@domain/account/service/account.service';
import { AccountRepository } from '@domain/account/repository/account.repository';
import { UserTokenRepository } from '@domain/account/repository/user-token.repository';
import { AccountController } from './controller/account.controller';

@Module({
  controllers: [AccountController],
  providers: [
    AccountService,
    AccountRepository,
    JwtService,
    UserTokenRepository,
    ConfigurationService,
    PrismaService,
  ],
  exports: [AccountService],
})
export class AccountModule {}
