import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserRepository } from '@src/domain/user/repository/user.repository';
import { UserController } from './controller/user.controller';

@Module({
  controllers: [UserController],
  providers: [UserRepository, PrismaService],
})
export class UserModule {}
