import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserService } from '@domain/user/service/user.service';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import {
  AccountCategory,
  AgreementCategory,
  AreaCategory,
} from '@domain/user/user.enum';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AreaRepository } from '@domain/user/repository/area.repository';

describe('user service', () => {
  let service: UserService;
  let prisma: PrismaService;
  let module: TestingModule;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [
        UserService,
        ConfigurationService,
        PrismaService,
        UserRepository,
        AccountRepository,
        AgreementRepository,
        AreaRepository,
      ],
    )) as TestingModule;
    service = module.get(UserService);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users', 'accounts']);
  });

  it('should create user and account and agreement and location', async () => {
    const dto: RegisterUserDTO = {
      userProperty: { companyName: 'test' },
      area: [
        {
          latitude: 1,
          longitude: 1,
          category: AreaCategory.ACTIVITY_AREA,
        },
        {
          latitude: 1,
          longitude: 1,
          category: AreaCategory.DINING_AREA,
        },
      ],
      account: {
        identification: 'test',
        password: 'pwd',
        category: AccountCategory.EMAIL,
      },
      agreement: [
        {
          category: AgreementCategory.PERSONAL_INFORMATION,
          is_agree: true,
        },
      ],
    };
    const user = await service.register(dto);
    expect(user).not.toBeNull();
  });
});
