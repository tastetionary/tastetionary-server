import { AccountDTO } from '@domain/account/dto/account.dto';
import { add } from 'date-fns';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import {
  getIdentification,
  saveAccount,
  updateAccountById,
} from '@domain/account/repository/account.repository';
import {
  deleteToken,
  getTokenByUserId,
  saveToken,
} from '@domain/account/repository/user-token.repository';
import * as jwt from 'jsonwebtoken';
import { AccountCategory } from '@domain/account/account.enum';
import bcrypt from 'bcrypt';

export type AccountEntity = Awaited<ReturnType<typeof getAccount>>;
export async function getAccount(
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

export async function findAccount(
  identification: string,
  paramCategory: AccountCategory,
) {
  try {
    const auth = await getAccount(identification, paramCategory);
    return auth;
  } catch (error) {
    return null;
  }
}

export async function createAccount(userId: number, dto: AccountDTO) {
  const accountEntity = await findAccount(dto.identification, dto.category);
  if (accountEntity) {
    throw new CallerWrongUsageException(
      ErrorNameEnum.INVALID_INPUT,
      'duplicated identification',
      'already registered identification, change other identification',
    );
  }

  const password = await encryptValue(dto.password);
  await saveAccount({
    userId,
    category: dto.category,
    identification: dto.identification,
    password,
  });
}

export async function updatePassword(param: {
  accountId: number;
  identification: string;
  password: string;
}) {
  const password = await encryptValue(param.password);
  await updateAccountById(param.accountId, {
    identification: param.identification,
    password,
  });
}

async function encryptValue(value: string) {
  return bcrypt.hash(value, 10);
}

export async function createToken(dto: AccountDTO) {
  const entity = await getAccount(dto.identification, dto.category);

  await checkPassword(entity, dto.password);

  const tokens = makeTokens({ userId: entity.userId });
  await saveToken({
    userId: entity.userId,
    ...tokens,
  });

  return tokens;
}

async function checkPassword(entity: AccountEntity, password: string) {
  const isMatched = await bcrypt.compare(password, entity.password);
  if (isMatched) {
    return;
  }

  throw new CallerWrongUsageException(
    ErrorNameEnum.INVALID_INPUT,
    'identification or password is not matched',
  );
}

function makeTokens(payload: { userId: number }) {
  const cfgService = new ConfigurationService(new ConfigService());
  const accessTokenExpiredAt = cfgService.getTokenData().accessTokenExpiredAt;
  const refreshTokenExpiredAt = cfgService.getTokenData().refreshTokenExpiredAt;

  const accessToken = jwt.sign(
    payload,
    cfgService.getTokenData().accessTokenSecret,
    { expiresIn: `${accessTokenExpiredAt}s` },
  );

  const refreshToken = jwt.sign(
    payload,
    cfgService.getTokenData().refreshTokenSecret,
    { expiresIn: `${refreshTokenExpiredAt}` },
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
