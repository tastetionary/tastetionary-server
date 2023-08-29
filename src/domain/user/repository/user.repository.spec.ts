import { UserRepository } from '@src/domain/user/repository/user.repository';
import { TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/database/prisma.service';
import { appModuleFixture } from '@root/jest.setup';

describe('user repository', () => {
  let repo: UserRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [PrismaService, UserRepository],
    )) as TestingModule;
    repo = module.get(UserRepository);
  });

  it('should create users', async () => {
    const data = [{ nickname: 'test', state: 'test' }];
    await repo.saveUsers(data);
    const res = await repo.getUsers();
    expect(res.length).toEqual(data.length);
  });
});
