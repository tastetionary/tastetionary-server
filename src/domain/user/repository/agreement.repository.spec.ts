import { AgreementRepository } from '@domain/user/repository/agreements.repository';
import { TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/database/prisma.service';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { AgreementCategory } from '@domain/user/user.enum';

describe('agreement repository', () => {
  let repo: AgreementRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, AgreementRepository],
    )) as TestingModule;
    repo = module.get(AgreementRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['agreements']);
  });

  it('should update agreement', async () => {
    const data = {
      userId: 1,
      category: AgreementCategory.PERSONAL_INFORMATION,
      is_agree: true,
    };
    await repo.saveAgreement(data);

    const agreements = await repo.getAgreementsByUserId(data.userId);

    const updateData = {
      is_agree: false,
    };

    const updatedAgreement = await repo.updateAgreementById(
      agreements[0].id,
      updateData,
    );
    expect(updatedAgreement.is_agree).toBe(updateData.is_agree);
  });

  it('should save agreement', async () => {
    const data = {
      userId: 1,
      category: AgreementCategory.PERSONAL_INFORMATION,
      is_agree: true,
    };
    await repo.saveAgreement(data);
    const agreement = await repo.getAgreementsByUserId(data.userId);
    const res = await repo.getAgreementById(agreement[0].id);
    expect(res).not.toBeNull();
  });

  it('should save agreements', async () => {
    const data = [
      {
        userId: 1,
        category: AgreementCategory.PERSONAL_INFORMATION,
        is_agree: true,
      },
    ];
    await repo.saveAgreements(data);
    const agreement = await repo.getAgreementsByUserId(data[0].userId);
    expect(agreement).not.toEqual([]);
  });
});
