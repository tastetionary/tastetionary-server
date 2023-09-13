import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserRepository } from '@src/domain/user/repository/user.repository';
import { UserController } from './controller/user.controller';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [UserController],
  providers: [JwtService, ConfigurationService, UserRepository, PrismaService],
})
export class UserModule {}
