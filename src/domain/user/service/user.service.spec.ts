import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserService } from '@domain/user/service/user.service';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AccountCategory, AgreementCategory } from '@domain/user/user.enum';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';

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
        AgreementRepository,
      ],
    )) as TestingModule;
    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users', 'accounts']);
  });

  it('should create user and account and agreement', async () => {
    const dto: RegisterUserDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
      agreement: [
        {
          category: AgreementCategory.PERSONAL_INFORMATION,
          is_agree: true,
        },
      ],
    };
    const user = await service.registerEndUser(dto);
    expect(user).not.toBeNull();
  });
});
