import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { UserService } from '@domain/user/service/user.service';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { UserModule } from '@domain/user/user.module';
import { AccountModule } from '@domain/account/account.module';
import { AccountCategory } from '@domain/account/account.enum';

describe('user service', () => {
  let service: UserService;
  let prisma: PrismaService;
  let module: TestingModule;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [UserModule, AccountModule],
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
