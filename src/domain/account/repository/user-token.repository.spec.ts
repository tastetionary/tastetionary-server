import { truncateTables } from '@root/jest.setup';
import newPrisma from '@common/database/new.prisma';
import {
  getTokenByUserId,
  saveToken,
} from '@domain/account/repository/user-token.repository';

describe('user-token repository', () => {
  beforeEach(async () => {
    await truncateTables(newPrisma, ['user_tokens']);
  });

  it('should return token', async () => {
    const data = {
      userId: 1,
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      accessTokenExpiredAt: new Date(),
      refreshTokenExpiredAt: new Date(),
    };
    await saveToken(data);

    const res = await getTokenByUserId(data.userId);
    expect(res).not.toBeNull();
  });

  it('should save token', async () => {
    const data = {
      userId: 1,
      accessToken: 'accessToken',
      refreshToken: 'refreshToken',
      accessTokenExpiredAt: new Date(),
      refreshTokenExpiredAt: new Date(),
    };
    const res = await saveToken(data);

    expect(res).not.toBeNull();
  });
});
