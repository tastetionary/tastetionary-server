import { truncateTables } from '@root/jest.setup';
import { AccountCategory } from '@domain/account/account.enum';
import prismaClient from '@common/database/prisma';
import {
  deleteAccountByUserId,
  getAccount,
  saveAccount,
  saveAccounts,
  updateAccountById,
} from '@domain/account/repository/account.repository';

describe('account repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['accounts']);
  });
  it('should return token', () => {});

  it('should delete account', async () => {
    const userId = 1;
    const data = {
      userId,
      category: AccountCategory.EMAIL,
      identification: 'some@email.com',
      password: 'one-way-decoded-password',
    };
    await saveAccount(data);

    await deleteAccountByUserId(userId);

    const account = await getAccount({
      identification: data.identification,
      password: data.password,
    });
    expect(account).toBeNull();
  });

  it('should update account', async () => {
    const data = {
      userId: 1,
      category: AccountCategory.EMAIL,
      identification: 'some@email.com',
      password: 'one-way-decoded-password',
    };
    await saveAccount(data);
    const account = (await getAccount({
      identification: data.identification,
      password: data.password,
    })) as { id: number };

    const updateData = {
      identification: 'new-identification',
      password: 'new-password',
    };

    const updatedAccount = await updateAccountById(account.id, updateData);
    expect(updatedAccount.identification).toBe(updateData.identification);
    expect(updatedAccount.password).toBe(updateData.password);
  });

  it('should save account', async () => {
    const data = {
      userId: 1,
      category: AccountCategory.EMAIL,
      identification: 'some@email.com',
      password: 'one-way-decoded-password',
    };
    await saveAccount(data);
    const account = await getAccount({
      identification: data.identification,
      password: data.password,
    });
    expect(account).not.toBeNull();
  });

  it('should save accounts', async () => {
    const data = [
      {
        userId: 1,
        category: AccountCategory.EMAIL,
        identification: 'some@email.com',
        password: 'one-way-decoded-password',
      },
    ];
    await saveAccounts(data);
    const account = await getAccount({
      identification: data[0].identification,
      password: data[0].password,
    });
    expect(account).not.toBeNull();
  });
});
