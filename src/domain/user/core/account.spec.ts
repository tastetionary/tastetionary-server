import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { Account } from '@domain/user/core/account';
import { AccountDTO } from '@domain/user/dto/user.dto';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { AccountCategory } from '@domain/user/user.enum';
import { UserTokenRepository } from '@domain/user/repository/user-token.repository';
import { JwtService } from '@nestjs/jwt';

describe('account', () => {
  let prisma;
  let accountRepo: AccountRepository;
  let tokenRepo: UserTokenRepository;
  let jwtService: JwtService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [
        ConfigurationService,
        PrismaService,
        AccountRepository,
        UserTokenRepository,
        JwtService,
      ],
    )) as TestingModule;
    accountRepo = module.get<AccountRepository>(AccountRepository);
    tokenRepo = module.get<UserTokenRepository>(UserTokenRepository);
    jwtService = module.get<JwtService>(JwtService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['accounts']);
  });

  it('should create token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    const account = new Account(dto, accountRepo, tokenRepo, jwtService);
    await account.register(userId);

    const token = await account.createToken(userId);
    expect(token).not.toBeNull();
  });

  it('duplicated email should raise error', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const account = new Account(dto, accountRepo, tokenRepo, jwtService);
    await account.register(1);
    await expect(account.register(1)).rejects.toThrowError();
  });

  it('should save account', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const account = new Account(dto, accountRepo, tokenRepo, jwtService);
    await account.register(1);

    const res = await accountRepo.getAccountByIdentification(
      dto.identification,
      dto.category,
    );
    expect(res).not.toBeNull();
  });
});
