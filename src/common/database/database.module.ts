import { Module, OnApplicationShutdown } from '@nestjs/common';
import prismaClient from '@common/database/prisma';

@Module({})
export class DatabaseModule implements OnApplicationShutdown {
  async onApplicationShutdown(): Promise<void> {
    await prismaClient.$disconnect();
  }
}
