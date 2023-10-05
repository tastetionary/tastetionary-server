import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { AccountService } from '@domain/account/service/account.service';
import { AccountDTO } from '@domain/account/dto/account.dto';
import { AccountCategory } from '@domain/account/account.enum';
import { AccountRepository } from '@domain/account/repository/account.repository';
import { UserTokenRepository } from '@domain/account/repository/user-token.repository';
import { AccountModule } from '@domain/account/account.module';

describe('account service', () => {
  let prisma;
  let accountService: AccountService;
  let accountRepo: AccountRepository;
  let tokenRepo: UserTokenRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AccountModule],
    )) as TestingModule;
    accountService = module.get<AccountService>(AccountService);
    accountRepo = module.get<AccountRepository>(AccountRepository);
    tokenRepo = module.get<UserTokenRepository>(UserTokenRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['accounts', 'user_tokens', 'users']);
  });

  it('should delete token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    await accountService.register(userId, dto);

    await accountService.createToken(dto);
    await accountService.deleteTokens(userId);

    const tokens = await tokenRepo.getTokenByUserId(userId);
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

    const res = await accountRepo.getIdentification(
      dto.identification,
      dto.category,
    );
    expect(res).not.toBeNull();
  });
});
