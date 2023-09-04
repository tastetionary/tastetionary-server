import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { Account } from '@domain/user/core/account';
import { RegisterAccountDto } from '@domain/user/dto/user.dto';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { AccountCategory } from '@domain/user/user.enum';

describe('account', () => {
  let prisma;
  let accountRepo: AccountRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, AccountRepository],
    )) as TestingModule;
    accountRepo = module.get<AccountRepository>(AccountRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['accounts']);
  });

  it('duplicated email should raise error', async () => {
    const dto: RegisterAccountDto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
      agreement: [
        {
          category: 'PERSONAL',
          is_agree: true,
        },
      ],
    };
    const account = new Account(accountRepo, dto);
    await account.register(1);
    await expect(account.register(1)).rejects.toThrowError();
  });

  it('should save account', async () => {
    const dto: RegisterAccountDto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
      agreement: [
        {
          category: 'PERSONAL',
          is_agree: true,
        },
      ],
    };
    const account = new Account(accountRepo, dto);
    await account.register(1);

    const res = await accountRepo.getAccountByIdentification(
      dto.identification,
      dto.category,
    );
    expect(res).not.toBeNull();
  });
});
