import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { EndUser } from '@domain/user/core/end-user';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { AreaRepository } from '@domain/user/repository/area.repository';

describe('end user', () => {
  let prisma;
  let userRep: UserRepository;
  let agreementRepo: AgreementRepository;
  let areaRepo: AreaRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [
        ConfigurationService,
        PrismaService,
        UserRepository,
        AgreementRepository,
        AreaRepository,
      ],
    )) as TestingModule;
    userRep = module.get<UserRepository>(UserRepository);
    agreementRepo = module.get(AgreementRepository);
    areaRepo = module.get(AreaRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users', 'user_areas']);
  });

  class FakeUser extends EndUser {
    public getNickname() {
      return super.getNickname();
    }
  }

  it('should return random nickname', () => {
    const endUser = new FakeUser(userRep, agreementRepo, areaRepo);
    const first = endUser.getNickname();
    const second = endUser.getNickname();
    expect(first).not.toEqual(second);
  });

  it('should save user, agreement, area', async () => {
    const endUser = new EndUser(userRep, agreementRepo, areaRepo);
    const user = await endUser.register(
      [
        {
          category: AgreementCategory.PERSONAL_INFORMATION,
          is_agree: true,
        },
      ],
      [
        {
          latitude: 1,
          longitude: 1,
          category: AreaCategory.ACTIVITY_AREA,
        },
      ],
      { companyName: 'company' },
    );
    expect(user.id).not.toBeNull();

    const agreement = await agreementRepo.getAgreementsByUserId(user.id);
    expect(agreement).not.toBeNull();

    const areaList = await areaRepo.getAreasByUserId(user.id);
    expect(areaList.length).toEqual(1);
  });
});
