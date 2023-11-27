import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserController } from '@domain/user/controller/user.controller';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserService } from '@domain/user/service/user.service';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { JwtService } from '@nestjs/jwt';
import { AccountModule } from '@domain/account/account.module';
import { AuthenticationModule } from '@domain/authentication/authentication.module';

@Module({
  imports: [AccountModule, AuthenticationModule],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    ConfigurationService,
    PrismaService,
    AgreementRepository,
  ],
  exports: [UserService],
})
export class UserModule {}
