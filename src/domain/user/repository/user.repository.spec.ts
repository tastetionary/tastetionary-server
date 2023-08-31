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

  it('should update user', async () => {
    const data = { nickname: 'test', state: 'test', property: {} };
    await repo.saveUser(data);

    let user = (await repo.getUsers({}))[0];
    const updateData = { nickname: 'test2', state: 'test2' };
    await repo.updateUserById(user.id, updateData);

    user = (await repo.getUsers({}))[0];
    expect(user.nickname).toEqual(updateData.nickname);
    expect(user.state).toEqual(updateData.state);
  });

  it('should save user', async () => {
    const data = { nickname: 'test', state: 'test', property: {} };
    await repo.saveUser(data);
    const res = await repo.getUsers({});
    expect(res.length).toEqual(1);
  });

  it('should save users', async () => {
    const data = [{ nickname: 'test', state: 'test', property: {} }];
    await repo.saveUsers(data);
    const res = await repo.getUsers({});
    expect(res.length).toEqual(data.length);
  });
});
