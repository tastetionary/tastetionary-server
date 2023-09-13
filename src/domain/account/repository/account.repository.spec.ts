import { AccountRepository } from '@domain/account/repository/account.repository';
import { TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/database/prisma.service';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { AccountCategory } from '@domain/account/account.enum';

describe('account repository', () => {
  let repo: AccountRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, AccountRepository],
    )) as TestingModule;
    repo = module.get(AccountRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['accounts']);
  });

  it('should update account', async () => {
    const data = {
      userId: 1,
      category: AccountCategory.EMAIL,
      identification: 'some@email.com',
      password: 'one-way-decoded-password',
    };
    await repo.saveAccount(data);
    const account = (await repo.getAccount({
      identification: data.identification,
      password: data.password,
    })) as { id: number };

    const updateData = {
      identification: 'new-identification',
      password: 'new-password',
    };

    const updatedAccount = await repo.updateAccountById(account.id, updateData);
    expect(updatedAccount.identification).toBe(updateData.identification);
    expect(updatedAccount.password).toBe(updateData.password);
  });

  it('should save account', async () => {
    const data = {
      userId: 1,
      category: AccountCategory.EMAIL,
      identification: 'some@email.com',
      password: 'one-way-decoded-password',
    };
    await repo.saveAccount(data);
    const account = await repo.getAccount({
      identification: data.identification,
      password: data.password,
    });
    expect(account).not.toBeNull();
  });

  it('should save accounts', async () => {
    const data = [
      {
        userId: 1,
        category: AccountCategory.EMAIL,
        identification: 'some@email.com',
        password: 'one-way-decoded-password',
      },
    ];
    await repo.saveAccounts(data);
    const account = await repo.getAccount({
      identification: data[0].identification,
      password: data[0].password,
    });
    expect(account).not.toBeNull();
  });
});
