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

  const DTO: RegisterUserDTO = {
    userProperty: { companyName: 'test' },
    areas: [
      {
        latitude: 1,
        longitude: 1,
        category: AreaCategory.ACTIVITY_AREA,
        address: 'test',
      },
      {
        latitude: 1,
        longitude: 1,
        category: AreaCategory.DINING_AREA,
        address: 'test',
      },
    ],
    account: {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    },
    agreements: [
      {
        category: AgreementCategory.PERSONAL_INFORMATION,
        is_agree: true,
      },
    ],
  };

  it('should return end-user', async () => {
    const user = await service.register(DTO);
    const endUser = await service.getEndUser(user.id);
    expect(endUser).not.toBeNull();
    expect(endUser.activityArea).not.toBeNull();
  });

  it('should create user and account and agreement and location', async () => {
    const user = await service.register(DTO);
    expect(user).not.toBeNull();
  });
});
