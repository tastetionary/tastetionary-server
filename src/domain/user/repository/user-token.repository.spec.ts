import { UserTokenRepository } from '@domain/user/repository/user-token.repository';
import { TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/database/prisma.service';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';

describe('user-token repository', () => {
  let repo: UserTokenRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, UserTokenRepository],
    )) as TestingModule;
    repo = module.get(UserTokenRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['user_tokens']);
  });

  it('should return token', async () => {
    const data = {
      userId: 1,
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      accessTokenExpiredAt: new Date(),
      refreshTokenExpiredAt: new Date(),
    };
    await repo.saveToken(data);

    const res = await repo.getTokenByUserId(data.userId);
    expect(res).not.toBeNull();
  });

  it('should save token', async () => {
    const data = {
      userId: 1,
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      accessTokenExpiredAt: new Date(),
      refreshTokenExpiredAt: new Date(),
    };
    const res = await repo.saveToken(data);

    expect(res).not.toBeNull();
  });
});
