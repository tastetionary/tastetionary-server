import { truncateTables } from '@root/jest.setup';
import {
  createAccount,
  createToken,
  removeAllToken,
  getAccount,
  removeAllAccount,
  findAccessToken,
} from '@domain/account/service/account.service';
import { AccountCategory } from '@domain/account/account.enum';
import { getIdentification } from '@domain/account/repository/account.repository';
import { getTokenByUserId } from '@domain/account/repository/user-token.repository';
import prismaClient from '@common/database/prisma';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import * as kakao from '@thirdParty/kakao/kakao';

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
      id: 123,
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
});
