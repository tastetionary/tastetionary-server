import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserService } from '@domain/user/service/user.service';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { RegisterAccountDto } from '@domain/user/dto/user.dto';
import { AccountCategory } from '@domain/user/user.enum';

describe('user service', () => {
  let service: UserService;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [
        UserService,
        ConfigurationService,
        PrismaService,
        UserRepository,
        AccountRepository,
      ],
    )) as TestingModule;
    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users', 'accounts']);
  });

  it('should create user and account', async () => {
    const dto: RegisterAccountDto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
      agreement: [
        {
          category: 'PERSONAL',
          is_agree: true,
        },
      ],
    };
    const user = await service.registerEndUser(dto);
    expect(user).not.toBeNull();
  });
});
