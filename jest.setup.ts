/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from '@src/env.validation';
import { PrismaService } from './src/common/database/prisma.service';

let appServiceFixture: CallableFunction;
let appModuleFixture: CallableFunction;
beforeAll(async () => {
  appServiceFixture = async (
    providers: Provider<any>[],
    env = 'test',
  ): Promise<TestingModule> => {
    return await Test.createTestingModule({
      providers: providers,
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          envFilePath: `.env.${env}`,
          validate,
        }),
      ],
    }).compile();
  };

  appModuleFixture = async (
    controllers: any[],
    providers: Provider<any>[],
    importers: any[] = [],
    env = 'test',
  ): Promise<TestingModule> => {
    return await Test.createTestingModule({
      controllers,
      providers,
      imports: [
        ...importers,
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          envFilePath: `.env.${env}`,
          validate,
        }),
      ],
    }).compile();
  };
});

async function truncateTables(prisma: PrismaService, tableNames: string[]) {
  for (const name of tableNames) {
    await prisma.$queryRawUnsafe(
      `TRUNCATE "${name}" RESTART IDENTITY CASCADE;`,
    );
  }
}

export { appServiceFixture, appModuleFixture, truncateTables };
