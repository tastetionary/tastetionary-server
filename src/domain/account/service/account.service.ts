import { AccountDTO } from '@domain/account/dto/account.dto';
import { add } from 'date-fns';
import { Account } from '@domain/account/core/account';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';
import { CallerWrongUsageException } from '@root/src/common/exception/internal.exception';
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
  // NOTE delete after arranging token

  const cfgService = new ConfigurationService(new ConfigService());
  const tempSeconds = 1000000;
  const accessTokenExpiredAt =
    parseInt(cfgService.getTokenData().accessTokenExpiredAt) + tempSeconds;
  const refreshTokenExpiredAt =
    parseInt(cfgService.getTokenData().refreshTokenExpiredAt) + tempSeconds;

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

  const data = {
    accessToken: accessToken,
    refreshToken: refreshToken,
    accessTokenExpiredAt: add(new Date(), { seconds: accessTokenExpiredAt }),
    refreshTokenExpiredAt: add(new Date(), {
      seconds: refreshTokenExpiredAt,
    }),
  };
  return data;
}

export async function deleteTokens(userId: number) {
  const token = await getTokenByUserId(userId);
  if (!token) return;

  await deleteToken(token.id);
}
