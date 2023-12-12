import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import {
  createAuth,
  createToken,
  deleteTokens,
} from '@domain/account/service/account.service';
import { AccountDTO } from '@domain/account/dto/account.dto';
import { AccountCategory } from '@domain/account/account.enum';
import { AccountModule } from '@domain/account/account.module';
import { getIdentification } from '@domain/account/repository/account.repository';
import { getTokenByUserId } from '@domain/account/repository/user-token.repository';
import prismaClient from '@root/src/common/database/prisma';

describe('account service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['accounts', 'user_tokens', 'users']);
  });

  it('should delete token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 666;
    await createAuth(userId, dto);

    await createToken(dto);
    await deleteTokens(userId);

    const tokens = await getTokenByUserId(userId);
    expect(tokens).toBeNull();
  });

  it('should create token', async () => {
    const dto: AccountDTO = {
      identification: 'test',
      password: 'pwd',
      category: AccountCategory.EMAIL,
    };
    const userId = 1;
    await createAuth(userId, dto);

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
    await createAuth(1, dto);

    const res = await getIdentification(dto.identification, dto.category);
    expect(res).not.toBeNull();
  });
});
