/* eslint-disable @typescript-eslint/no-explicit-any */
import { Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { validate } from '@src/env.validation';
import * as jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

let appServiceFixture: CallableFunction;
let appModuleFixture: CallableFunction;
beforeAll(async () => {
  appServiceFixture = async (
    providers: Provider<any>[],
  ): Promise<TestingModule> => {
    return await Test.createTestingModule({
      providers: providers,
      imports: [
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          validate,
        }),
      ],
    }).compile();
  };

  appModuleFixture = async (
    controllers: any[],
    providers: Provider<any>[],
    importers: any[] = [],
  ): Promise<TestingModule> => {
    return await Test.createTestingModule({
      controllers,
      providers,
      imports: [
        ...importers,
        ConfigModule.forRoot({
          cache: true,
          isGlobal: true,
          validate,
        }),
      ],
    }).compile();
  };
});

type tableNames =
  | 'users'
  | 'accounts'
  | 'agreements'
  | 'user_areas'
  | 'user_tokens'
  | 'restaurant_reviews'
  | 'authentications'
  | 'authentication_histories'
  | 'external_restaurant_informations';
async function truncateTables(prisma: PrismaClient, tableNames: tableNames[]) {
  for (const name of tableNames) {
    await prisma.$queryRawUnsafe(
      `TRUNCATE "${name}" RESTART IDENTITY CASCADE;`,
    );
  }
}

function createUserToken(
  userId: number,
  secretKey: string,
  options: jwt.SignOptions,
) {
  return jwt.sign({ userId }, secretKey, options);
}

function userEntityFactory(userId: number) {
  return {
    id: userId,
    nickname: 'nickname',
    state: 'state',
  };
}

export {
  appServiceFixture,
  appModuleFixture,
  truncateTables,
  createUserToken,
  userEntityFactory,
};
