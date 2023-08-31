import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserService } from '@domain/user/service/user.service';

describe('user service', () => {
  let service: UserService;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [UserService, ConfigurationService, PrismaService, UserRepository],
    )) as TestingModule;
    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users']);
  });

  it('should create user', async () => {
    await service.createUsers({
      nickname: 'test',
      state: 'test',
      property: {},
    });
  });
});
