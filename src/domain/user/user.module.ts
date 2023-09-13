import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserRepository } from '@src/domain/user/repository/user.repository';
import { UserController } from './controller/user.controller';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserService } from '@domain/user/service/user.service';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AreaRepository } from '@domain/user/repository/area.repository';
import { JwtService } from '@nestjs/jwt';
import { AccountModule } from '@domain/account/account.module';

@Module({
  imports: [AccountModule],
  controllers: [UserController],
  providers: [
    UserService,
    JwtService,
    ConfigurationService,
    PrismaService,
    UserRepository,
    AgreementRepository,
    AreaRepository,
  ],
})
export class UserModule {}
