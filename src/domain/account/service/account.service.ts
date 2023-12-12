import { AccountDTO } from '@domain/account/dto/account.dto';
import { add } from 'date-fns';
import { Account } from '@domain/account/core/account';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import {
  getIdentification,
  saveAccount,
} from '@domain/account/repository/account.repository';
import {
  deleteToken,
  getTokenByUserId,
  saveToken,
} from '@domain/account/repository/user-token.repository';
import * as jwt from 'jsonwebtoken';
import { AccountCategory } from '@domain/account/account.enum';

export type AccountEntity = Awaited<ReturnType<typeof getAuth>>;
export async function getAuth(
  identification: string,
  paramCategory: AccountCategory,
) {
  const data = await getIdentification(identification, paramCategory);
  if (!data) {
    throw new CallerWrongUsageException(ErrorNameEnum.INVALID_INPUT, 'no data');
  }
  const { category, ...rest } = data;
  return {
    category: paramCategory,
    ...rest,
  };
}

export async function findAuth(
  identification: string,
  paramCategory: AccountCategory,
) {
  try {
    const auth = await getAuth(identification, paramCategory);
    return auth;
  } catch (error) {
    return null;
  }
}

export async function createAuth(userId: number, dto: AccountDTO) {
  const accountRecord = await getIdentification(
    dto.identification,
    dto.category,
  );

  const account = new Account(accountRecord);
  account.checkDuplicatedIdentification(dto.category, dto.identification);
  const password = await account.encryptValue(dto.password);

  await saveAccount({
    userId,
    category: dto.category,
    identification: dto.identification,
    password,
  });
}

export async function createToken(dto: AccountDTO) {
  const accountRecord = await getIdentification(
    dto.identification,
    dto.category,
  );

  if (!accountRecord) {
    throw new CallerWrongUsageException(
      ErrorNameEnum.NO_DATA,
      'no account',
      'check identification',
      { category: dto.category, identification: dto.identification },
    );
  }

  const account = new Account(accountRecord);
  await account.checkPassword(dto.password);

  const tokens = makeTokens({ userId: accountRecord.userId });
  await saveToken({
    userId: accountRecord.userId,
    ...tokens,
  });

  return tokens;
}

function makeTokens(payload: { userId: number }) {
  const cfgService = new ConfigurationService(new ConfigService());
  const accessTokenExpiredAt = cfgService.getTokenData().accessTokenExpiredAt;
  const refreshTokenExpiredAt = cfgService.getTokenData().refreshTokenExpiredAt;

  const accessToken = jwt.sign(
    payload,
    cfgService.getTokenData().accessTokenSecret,
    { expiresIn: accessTokenExpiredAt },
  );
  const refreshToken = jwt.sign(
    payload,
    cfgService.getTokenData().refreshTokenSecret,
    { expiresIn: refreshTokenExpiredAt },
  );

  return {
    accessToken,
    refreshToken,
    accessTokenExpiredAt: add(new Date(), { seconds: accessTokenExpiredAt }),
    refreshTokenExpiredAt: add(new Date(), {
      seconds: refreshTokenExpiredAt,
    }),
  };
}

export async function deleteTokens(userId: number) {
  const token = await getTokenByUserId(userId);
  if (!token) return;

  await deleteToken(token.id);
}
