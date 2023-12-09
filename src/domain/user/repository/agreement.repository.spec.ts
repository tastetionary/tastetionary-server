import { truncateTables } from '@root/jest.setup';
import { AgreementCategory } from '@domain/user/user.enum';
import prismaClient from '@root/src/common/database/prisma';
import {
  getAgreementById,
  getAgreementsByUserId,
  saveAgreement,
  saveAgreements,
  updateAgreementById,
} from '@domain/user/repository/agreements.repository';

describe('agreement repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['agreements']);
  });

  it('should update agreement', async () => {
    const data = {
      userId: 1,
      category: AgreementCategory.PERSONAL_INFORMATION,
      is_agree: true,
    };
    await saveAgreement(data);

    const agreements = await getAgreementsByUserId(data.userId);

    const updateData = {
      is_agree: false,
    };

    const updatedAgreement = await updateAgreementById(
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
    await saveAgreement(data);
    const agreement = await getAgreementsByUserId(data.userId);
    const res = await getAgreementById(agreement[0].id);
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
    await saveAgreements(data);
    const agreement = await getAgreementsByUserId(data[0].userId);
    expect(agreement).not.toEqual([]);
  });
});
