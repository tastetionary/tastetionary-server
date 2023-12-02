import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { AccountService } from '@domain/account/service/account.service';
import { AccountDTO } from '@domain/account/dto/account.dto';
import { AccountCategory } from '@domain/account/account.enum';
import { AccountModule } from '@domain/account/account.module';
import { getIdentification } from '@domain/account/repository/account.repository';
import { getTokenByUserId } from '@domain/account/repository/user-token.repository';
import prismaClient from '@common/database/new.prisma';

describe('account service', () => {
  let accountService: AccountService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AccountModule],
    )) as TestingModule;
    accountService = module.get<AccountService>(AccountService);
  });

  beforeEach(async () => {
    await truncateTables(prismaClient, ['accounts', 'user_tokens', 'users']);
  });

  it('should delete token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await accountService.register(userId, dto);

    await accountService.createToken(dto);
    await accountService.deleteTokens(userId);

    const tokens = await getTokenByUserId(userId);
    expect(tokens).toBeNull();
  });

  it('should create token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    await accountService.register(userId, dto);

    const token = await accountService.createToken(dto);
    expect(token).not.toBeNull();
    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('refreshToken');
  });

  it('should save account', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    await accountService.register(1, dto);

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).not.toBeNull();
  });
});
