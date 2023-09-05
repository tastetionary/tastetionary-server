import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { UserRepository } from '@domain/user/repository/user.repository';
import { EndUser } from '@domain/user/core/end-user';
import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { AgreementCategory } from '@domain/user/user.enum';

describe('end user', () => {
  let prisma;
  let userRep: UserRepository;
  let agreementRepo: AgreementRepository;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [
        ConfigurationService,
        PrismaService,
        UserRepository,
        AgreementRepository,
      ],
    )) as TestingModule;
    userRep = module.get<UserRepository>(UserRepository);
    agreementRepo = module.get(AgreementRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['users']);
  });

  it('should save user and agreement', async () => {
    const endUser = new EndUser(userRep, agreementRepo);
    const user = await endUser.register([
      {
        category: AgreementCategory.PERSONAL_INFORMATION,
        is_agree: true,
      },
    ]);
    expect(user.id).not.toBeNull();

    const agreement = await agreementRepo.getAgreementsByUserId(user.id);
    expect(agreement).not.toBeNull();
  });
});
