import { Module } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserRepository } from '@src/domain/user/repository/user.repository';

@Module({
  providers: [UserRepository, PrismaService],
})
export class UserModule {}
