import { truncateTables } from '@root/jest.setup';
import {
  createAccount,
  createToken,
  removeAllToken,
  getAccount,
  removeAllAccount,
} from '@domain/account/service/account.service';
import { AccountDTO } from '@domain/account/dto/account.dto';
import { AccountCategory } from '@domain/account/account.enum';
import { getIdentification } from '@domain/account/repository/account.repository';
import { getTokenByUserId } from '@domain/account/repository/user-token.repository';
import prismaClient from '@common/database/prisma';
import { CallerWrongUsageException } from '@common/exception/internal.exception';

describe('account service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['accounts', 'user_tokens', 'users']);
  });

  it('should remove account', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 99;
    await createAccount(userId, dto);

    await removeAllAccount(userId);

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).toBeNull();
  });

  it('should return auth entity', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount(userId, dto);

    const entity = await getAccount(dto.identification, dto.category);
    expect(entity).not.toBeNull();
  });

  it('should delete token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAccount(userId, dto);

    await createToken(dto);
    await removeAllToken(userId);

    const tokens = await getTokenByUserId(userId);
    expect(tokens).toBeNull();
  });

  it('with duplicated, should return error', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    await createAccount(userId, dto);

    await expect(createAccount(userId, dto)).rejects.toThrowError(
      CallerWrongUsageException,
    );
  });

  it('should create token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    await createAccount(userId, dto);

    const token = await createToken(dto);
    expect(token).not.toBeNull();
    expect(token).toHaveProperty('accessToken');
    expect(token).toHaveProperty('refreshToken');
  });

  it('should save account', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    await createAccount(1, dto);

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).not.toBeNull();
  });
});
