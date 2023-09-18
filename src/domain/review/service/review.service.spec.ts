import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { UserModule } from '@domain/user/user.module';
import { AccountModule } from '@domain/account/account.module';

describe('review service', () => {
  let prisma: PrismaService;
  let module: TestingModule;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [UserModule, AccountModule],
    )) as TestingModule;
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users', 'accounts']);
  });

  it('should create user and account and agreement and location', async () => {});
});
