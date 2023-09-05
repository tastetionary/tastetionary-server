import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { EndUser } from '@domain/user/core/end-user';

describe('end user', () => {
  let prisma;
  let repo: UserRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, UserRepository],
    )) as TestingModule;
    repo = module.get<UserRepository>(UserRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users']);
  });

  it('should save user', async () => {
    const endUser = new EndUser(repo);
    const user = await endUser.register();
    expect(user.id).not.toBeNull();
  });
});
