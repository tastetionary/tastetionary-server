import { add } from 'date-fns';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorSubCategoryEnum } from '@common/exception/enum';
import {
  deleteAccountByUserId,
  getIdentification,
  getToken,
  saveAccount,
  updateAccountById,
} from '@domain/account/repository/account.repository';
import {
  deleteTokensByUserId,
  saveToken,
} from '@domain/account/repository/user-token.repository';
import * as jwt from 'jsonwebtoken';
import { AccountCategory } from '@domain/account/account.enum';
import bcrypt from 'bcrypt';
import { pipe } from 'fp-ts/lib/function';
import { getKakaoUserInfo } from '@src/third-party/kakao/kakao';
import { getGoogleUserInfo } from '@src/third-party/google/google';
import { getNaverUserInfo } from '@src/third-party/naver/naver';
import { createUser } from '@domain/user/service/user.service';

export type AccountEntity = Awaited<ReturnType<typeof getAccount>>;
export async function getAccount(
  identification: string,
  paramCategory: AccountCategory,
) {
  const data = await getIdentification(identification, paramCategory);
  if (!data) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'no data',
    );
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

export async function createAccount(param: {
  userId: number;
  identification: string;
  password: string;
  category: AccountCategory;
}) {
  const accountEntity = await findAccount(param.identification, param.category);
  if (accountEntity) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'duplicated identification',
      'already registered identification, change other identification',
    );
  }

  const password = await encryptValue(param.password);
  await saveAccount({
    userId: param.userId,
    category: param.category,
    identification: param.identification,
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

  return password;
}

async function encryptValue(value: string) {
  return bcrypt.hash(value, 10);
}

export async function createToken(param: {
  identification?: string;
  category: AccountCategory;
  password?: string;
  code?: string;
}) {
  let userInfo;
  if (param.category === AccountCategory.EMAIL) {
    if (!param.identification || !param.password) {
      throw new CallerWrongUsageException(
        ErrorSubCategoryEnum.INVALID_INPUT,
        'Identification and password are required for EMAIL login.',
      );
    }
  } else {
    if (!param.code) {
      throw new CallerWrongUsageException(
        ErrorSubCategoryEnum.INVALID_INPUT,
        'Authorization code is required for social login.',
      );
    }
    userInfo = await getUserInfo(param.category, param.code);
  }

  const identification =
    param.category === AccountCategory.EMAIL
      ? param.identification
      : userInfo.id.toString();
  const identificationRecord = await getIdentification(
    identification,
    param.category,
  );
  if (param.category !== AccountCategory.EMAIL && !identificationRecord) {
    const user = await createUser();
    await createAccount({
      userId: user.id,
      identification: identification,
      category: param.category,
      password: '',
    });
  }

  const entity = await getAccount(identification, param.category);
  if (param.category === AccountCategory.EMAIL) {
    await checkPassword(entity, param.password!);
  }
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
    ErrorSubCategoryEnum.INVALID_INPUT,
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

export async function removeAllToken(userId: number) {
  await deleteTokensByUserId(userId);
}

export async function removeAllAccount(userId: number) {
  return await deleteAccountByUserId(userId);
}

export function findAccessToken(accessToken: string) {
  return pipe(accessToken, getToken);
}

async function getUserInfo(category: AccountCategory, code: string) {
  switch (category) {
    case AccountCategory.KAKAO:
      return await getKakaoUserInfo(code);
    case AccountCategory.GOOGLE:
      return await getGoogleUserInfo(code);
    case AccountCategory.NAVER:
      return await getNaverUserInfo(code);
    default:
      throw new Error('Unsupported account category');
  }
}
