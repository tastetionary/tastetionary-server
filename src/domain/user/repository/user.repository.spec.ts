import { UserRepository } from '@domain/user/repository/user.repository';
import { TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/database/prisma.service';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';

describe('user repository', () => {
  let repo: UserRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, UserRepository],
    )) as TestingModule;
    repo = module.get(UserRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users']);
  });

  it('should create users', async () => {
    const data = [{ nickname: 'test', state: 'test' }];
    await repo.saveUsers(data);
    const res = await repo.getUsers();
    expect(res.length).toEqual(data.length);
  });
});
