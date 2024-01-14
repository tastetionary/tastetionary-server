import { truncateTables } from '@root/jest.setup';
import {
  createAccount,
  createToken,
  removeAllToken,
  getAccount,
  removeAllAccount,
} from '@domain/account/service/account.service';
import { AccountCategory } from '@domain/account/account.enum';
import { getIdentification } from '@domain/account/repository/account.repository';
import { getTokenByUserId } from '@domain/account/repository/user-token.repository';
import prismaClient from '@common/database/prisma';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import {
  changeAuthenticationAsDone,
  createProgressAuthentication,
} from '@domain/authentication/service/authentication.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

describe('account service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['accounts', 'user_tokens', 'users']);
  });

  const createAuthAsDone = async (identification: string) => {
    const res = await createProgressAuthentication({
      identification: `${identification}_${new Date().getMilliseconds()}`,
      category: AuthenticationCategory.ACCOUNT,
      type: AuthenticationType.EMAIL,
      code: '1234',
    });
    return await changeAuthenticationAsDone(res.id, '1234');
  };

  it('should remove account', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const auth = await createAuthAsDone(dto.identification);
    const userId = 99;
    await createAccount({ userId, ...dto, authenticationId: auth.id });

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
    const auth = await createAuthAsDone(dto.identification);
    await createAccount({ userId, ...dto, authenticationId: auth.id });

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
    const auth = await createAuthAsDone(dto.identification);
    await createAccount({ userId, ...dto, authenticationId: auth.id });

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
    const auth = await createAuthAsDone(dto.identification);
    await createAccount({ userId, ...dto, authenticationId: auth.id });

    await expect(
      createAccount({ userId, ...dto, authenticationId: auth.id }),
    ).rejects.toThrowError(CallerWrongUsageException);
  });

  it('should create token', async () => {
    const dto = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    const auth = await createAuthAsDone(dto.identification);
    await createAccount({ userId, ...dto, authenticationId: auth.id });

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
    const auth = await createAuthAsDone(dto.identification);
    await createAccount({ userId, ...dto, authenticationId: auth.id });

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).not.toBeNull();
  });
});
