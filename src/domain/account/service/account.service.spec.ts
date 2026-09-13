import { truncateTables } from '@root/jest.setup';
import {
  createAccount,
  createToken,
  removeAllToken,
  getAccount,
  removeAllAccount,
  findAccessToken,
  searchAccount,
} from '@domain/account/service/account.service';
import { AccountCategory } from '@domain/account/account.enum';
import { getIdentification } from '@domain/account/repository/account.repository';
import { getTokenByUserId } from '@domain/account/repository/user-token.repository';
import prismaClient from '@common/database/prisma';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import * as kakao from '@thirdParty/kakao/kakao';
import * as jwt from 'jsonwebtoken';

describe('account service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['accounts', 'user_tokens', 'users']);
  });
  it('should return value', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    const token = await createToken(dto);
    const res = await findAccessToken(token.accessToken)();
    expect(res).toBeRight();
  });

  it('should return value', async () => {
    const dto = {
      code: '123',
      category: AccountCategory.KAKAO,
    };
    const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');
    mockKakao.mockResolvedValue({
      id: '123',
      email: 'test@email.com',
    });
    const token = await createToken(dto);
    const res = await findAccessToken(token.accessToken)();
    expect(res).toBeRight();
  });

  it('should remove account', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 99;
    await createAccount({ userId, ...dto });

    await removeAllAccount(userId);

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).toBeNull();
  });

  it('should return auth entity', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    const entity = await getAccount(dto.identification, dto.category);
    expect(entity).not.toBeNull();
  });

  it('should delete token', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    await createToken(dto);
    await removeAllToken(userId);

    const tokens = await getTokenByUserId(userId);
    expect(tokens).toBeNull();
  });

  it('with duplicated, should return error', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    await expect(createAccount({ userId, ...dto })).rejects.toThrowError(
      CallerWrongUsageException,
    );
  });

  it('should create token', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    const token = await createToken(dto);
    expect(token).not.toBeNull();
    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('refreshToken');
  });

  it('should save account', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).not.toBeNull();
  });

  it('should save account', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount({ userId, ...dto });

    const res = await searchAccount(userId);
    expect(res).not.toBeNull();
  });

  it('social login without email should not reuse another account', async () => {
    const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');

    mockKakao.mockResolvedValueOnce({ id: '111' });
    await createToken({ code: 'first', category: AccountCategory.KAKAO });

    mockKakao.mockResolvedValueOnce({ id: '222' });
    await createToken({ code: 'second', category: AccountCategory.KAKAO });

    const first = await getIdentification('111', AccountCategory.KAKAO);
    const second = await getIdentification('222', AccountCategory.KAKAO);

    expect(first).not.toBeNull();
    expect(second).not.toBeNull();
    expect(first?.userId).not.toEqual(second?.userId);
  });

  it('social login without provider id should throw', async () => {
    const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');
    mockKakao.mockResolvedValueOnce({ id: '' });

    await expect(
      createToken({ code: 'no-id', category: AccountCategory.KAKAO }),
    ).rejects.toThrowError(CallerWrongUsageException);
  });

  it('social account keyed by email should migrate to provider id', async () => {
    const userId = 777;
    const email = 'legacy@kakao.com';
    await createAccount({
      userId,
      identification: email,
      email,
      password: '',
      category: AccountCategory.KAKAO,
    });

    const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');
    mockKakao.mockResolvedValueOnce({ id: '999', email, emailVerified: true });
    await createToken({ code: 'legacy', category: AccountCategory.KAKAO });

    const migrated = await getIdentification('999', AccountCategory.KAKAO);
    expect(migrated?.userId).toEqual(userId);
    expect(migrated?.email).toEqual(email);

    const stale = await getIdentification(email, AccountCategory.KAKAO);
    expect(stale).toBeNull();
  });

  it('social account keyed by email should not migrate with unverified email', async () => {
    const userId = 778;
    const email = 'unverified@kakao.com';
    await createAccount({
      userId,
      identification: email,
      email,
      password: '',
      category: AccountCategory.KAKAO,
    });

    const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');
    mockKakao.mockResolvedValueOnce({ id: '998', email, emailVerified: false });
    await createToken({ code: 'unverified', category: AccountCategory.KAKAO });

    const created = await getIdentification('998', AccountCategory.KAKAO);
    expect(created?.userId).not.toEqual(userId);

    const legacy = await getIdentification(email, AccountCategory.KAKAO);
    expect(legacy?.userId).toEqual(userId);
  });

  describe('redirect uri', () => {
    const originalCorsOrigins = process.env.CORS_ORIGINS;

    beforeEach(() => {
      process.env.CORS_ORIGINS =
        'http://localhost:3000, https://tastetionary.com';
    });

    afterEach(() => {
      process.env.CORS_ORIGINS = originalCorsOrigins;
    });

    it('should pass allowed redirect uri to provider', async () => {
      const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');
      mockKakao.mockResolvedValueOnce({ id: '555' });

      const redirectUri = 'https://tastetionary.com/login/callback';
      await createToken({
        code: 'allowed',
        category: AccountCategory.KAKAO,
        redirectUri,
      });

      expect(mockKakao).toHaveBeenLastCalledWith('allowed', redirectUri);
    });

    it.each([
      'https://evil.com/login/callback',
      'https://tastetionary.com.evil.com/login/callback',
      'not-a-url',
    ])('should reject redirect uri %s', async (redirectUri) => {
      const mockKakao = jest.spyOn(kakao, 'getKakaoUserInfo');
      mockKakao.mockClear();

      await expect(
        createToken({
          code: 'rejected',
          category: AccountCategory.KAKAO,
          redirectUri,
        }),
      ).rejects.toThrowError(CallerWrongUsageException);
      expect(mockKakao).not.toHaveBeenCalled();
    });
  });

  it('refresh token should expire after configured seconds', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    await createAccount({ userId: 666, ...dto });

    const token = await createToken(dto);
    const payload = jwt.decode(token.refreshToken) as jwt.JwtPayload;

    expect(payload.exp! - payload.iat!).toEqual(
      Number(process.env.REFRESH_TOKEN_EXPIRED_AT),
    );
  });
});
