import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { AccountService } from '@domain/user/service/account.service';
import { AccountDTO } from '@domain/user/dto/user.dto';
import { AccountCategory } from '@domain/user/user.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { UserTokenRepository } from '@domain/user/repository/user-token.repository';
import { JwtService } from '@nestjs/jwt';

describe('account service', () => {
  let prisma;
  let accountService: AccountService;
  let accountRepo: AccountRepository;
  let tokenRepo: UserTokenRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [
        AccountService,
        AccountRepository,
        JwtService,
        UserTokenRepository,
        ConfigurationService,
        PrismaService,
      ],
    )) as TestingModule;
    accountService = module.get<AccountService>(AccountService);
    accountRepo = module.get<AccountRepository>(AccountRepository);
    tokenRepo = module.get<UserTokenRepository>(UserTokenRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['accounts', 'user_tokens']);
  });

  it('should delete token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    await accountService.register(userId, dto);

    await accountService.createToken(userId, dto);
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

    const token = await accountService.createToken(userId, dto);
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
