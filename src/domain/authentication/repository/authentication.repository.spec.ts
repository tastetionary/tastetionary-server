import { truncateTables } from '@root/jest.setup';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import prismaClient from '@root/src/common/database/prisma';
import {
  getAuthenticationsByUserId,
  getHistoryById,
  saveAuthentication,
  saveAuthenticationHistory,
  updateAuthentication,
} from '@domain/authentication/repository/authentication.repository';

describe('authentication', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'authentications',
      'authentication_histories',
    ]);
  });

  it('should update authentication', async () => {
    const data = {
      identification: 'identification',
      category: AuthenticationCategory.COMPANY,
      type: AuthenticationType.EMAIL,
      state: AuthenticationState.INPROGRESS,
    };
    const res = await saveAuthentication(data);
    const userId = 1244;
    await updateAuthentication({
      id: res.id,
      userId,
    });

    const records = await getAuthenticationsByUserId(userId);
    expect(records[0].id).toEqual(res.id);
  });

  it('should create authentication history ', async () => {
    const expiredAt = new Date();
    expiredAt.setSeconds(expiredAt.getSeconds() + 180);
    const data = {
      userId: 1,
      identification: 'identification',
      category: AuthenticationCategory.ACCOUNT,
      type: AuthenticationType.EMAIL,
      code: '123',
      expiredAt: expiredAt,
    };
    const history = await saveAuthenticationHistory(data);
    const res = await getHistoryById(history.id);
    expect(res).not.toBeNull();
    expect(res?.type).toEqual(data.type);
  });

  it('should create authentication ', async () => {
    const data = {
      userId: 1,
      identification: 'identification',
      category: AuthenticationCategory.COMPANY,
      type: AuthenticationType.EMAIL,
      state: AuthenticationState.INPROGRESS,
    };
    await saveAuthentication(data);
    const res = await getAuthenticationsByUserId(data.userId);
    expect(res.length).toEqual(1);
  });
});
