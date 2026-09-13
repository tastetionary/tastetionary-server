import { add } from 'date-fns';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { ConfigService } from '@nestjs/config';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorCodeEnum, ErrorSubCategoryEnum } from '@common/exception/enum';
import {
  deleteAccountByUserId,
  getAccountByUserId,
  getIdentification,
  getToken,
  saveAccount,
  updateAccountById,
  updateAccountIdentity,
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
import { sendEmail } from '@thirdParty/brevo/brevo';
import * as fs from 'fs';
import path from 'path';
import { logUserEvent, UserEvent } from '@common/logging/user-event.logger';

type AccountRecord = NonNullable<Awaited<ReturnType<typeof getIdentification>>>;

function toAccountEntity(
  record: AccountRecord,
  paramCategory: AccountCategory,
) {
  const { category: _category, ...rest } = record;
  return {
    category: paramCategory,
    ...rest,
  };
}

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
      ErrorCodeEnum.ACCOUNT_NOT_FOUND,
    );
  }
  return toAccountEntity(data, paramCategory);
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

export async function searchAccount(userId: number) {
  const data = await getAccountByUserId(userId);
  if (!data) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'no data',
      ErrorCodeEnum.ACCOUNT_NOT_FOUND,
    );
  }

  const { category, ...rest } = data;
  return {
    category: category as AccountCategory,
    ...rest,
  };
}

export async function createAccount(param: {
  userId: number;
  identification: string;
  password: string;
  category: AccountCategory;
  email?: string | null;
}) {
  const accountEntity = await findAccount(param.identification, param.category);
  if (accountEntity) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'duplicate identification',
      ErrorCodeEnum.DUPLICATE_IDENTIFICATION,
    );
  }

  const password = await encryptValue(param.password);
  await saveAccount({
    userId: param.userId,
    category: param.category,
    identification: param.identification,
    email: param.email ?? resolveDefaultEmail(param),
    password,
  });
}

function resolveDefaultEmail(param: {
  identification: string;
  category: AccountCategory;
}) {
  return param.category === AccountCategory.EMAIL ? param.identification : null;
}

export async function changePassword(
  userId: number,
  newPassword: string,
  requirePassChange: boolean,
) {
  const account = await searchAccount(userId);
  if (account.category != AccountCategory.EMAIL) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      `account not found with email`,
      ErrorCodeEnum.ACCOUNT_NOT_FOUND,
    );
  }

  await updatePassword({
    accountId: account.id,
    identification: account.identification,
    password: newPassword,
    requirePassChange,
  });
  logUserEvent(UserEvent.PASSWORD_CHANGED, { userId });
}

export async function updatePassword(param: {
  accountId: number;
  identification: string;
  password: string;
  requirePassChange: boolean;
}) {
  const password = await encryptValue(param.password);
  await updateAccountById(param.accountId, {
    identification: param.identification,
    password,
    requirePassChange: param.requirePassChange,
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
  redirectUri?: string;
}) {
  const entity =
    param.category === AccountCategory.EMAIL
      ? await resolveEmailAccount(param.identification, param.password)
      : await resolveSocialAccount(
          param.category,
          param.code,
          param.redirectUri,
        );

  const tokens = makeTokens({ userId: entity.userId });
  await saveToken({
    userId: entity.userId,
    ...tokens,
  });
  logUserEvent(UserEvent.LOGIN, {
    userId: entity.userId,
    provider: param.category,
  });

  return {
    ...tokens,
    requirePassChange: entity.requirePassChange,
  };
}

async function resolveEmailAccount(identification?: string, password?: string) {
  if (!identification || !password) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'Identification and password are required for EMAIL login.',
      ErrorCodeEnum.MISSING_REQUIRED_FIELD,
    );
  }

  const entity = await getAccount(identification, AccountCategory.EMAIL);
  await checkPassword(entity, password);

  return entity;
}

async function resolveSocialAccount(
  category: AccountCategory,
  code?: string,
  redirectUri?: string,
) {
  if (!code) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'Authorization code is required for social login.',
      ErrorCodeEnum.MISSING_REQUIRED_FIELD,
    );
  }

  assertAllowedRedirectUri(redirectUri);

  const userInfo = await getUserInfo(category, code, redirectUri);
  const providerId = userInfo?.id;
  if (!providerId) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'social provider did not return a user id',
      ErrorCodeEnum.MISSING_REQUIRED_FIELD,
    );
  }

  const email = userInfo.email ?? null;

  const matched = await getIdentification(providerId, category);
  if (matched) {
    if (email && matched.email !== email) {
      const updated = await updateAccountIdentity(matched.id, {
        identification: providerId,
        email,
      });
      return toAccountEntity(updated, category);
    }
    return toAccountEntity(matched, category);
  }

  const legacy =
    email && userInfo.emailVerified
      ? await getIdentification(email, category)
      : null;
  if (legacy) {
    const migrated = await updateAccountIdentity(legacy.id, {
      identification: providerId,
      email,
    });
    return toAccountEntity(migrated, category);
  }

  const user = await createUser();
  await createAccount({
    userId: user.id,
    identification: providerId,
    category,
    email,
    password: '',
  });
  logUserEvent(UserEvent.SIGNUP, { userId: user.id, provider: category });

  return getAccount(providerId, category);
}

function assertAllowedRedirectUri(redirectUri?: string) {
  if (!redirectUri) {
    return;
  }

  const origin = toOrigin(redirectUri);
  const allowedOrigins = new ConfigurationService(
    new ConfigService(),
  ).getCorsOrigins();
  if (origin && allowedOrigins.includes(origin)) {
    return;
  }

  throw new CallerWrongUsageException(
    ErrorSubCategoryEnum.INVALID_INPUT,
    'redirect uri is not allowed',
    ErrorCodeEnum.INVALID_VALUE,
  );
}

function toOrigin(url: string) {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

async function checkPassword(entity: AccountEntity, password: string) {
  const isMatched = await bcrypt.compare(password, entity.password);
  if (isMatched) {
    return;
  }

  logUserEvent(UserEvent.LOGIN_FAILED, {
    userId: entity.userId,
    provider: entity.category,
    reason: ErrorCodeEnum.INVALID_CREDENTIALS,
  });
  throw new CallerWrongUsageException(
    ErrorSubCategoryEnum.INVALID_INPUT,
    'identification or password is not matched',
    ErrorCodeEnum.INVALID_CREDENTIALS,
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
    { expiresIn: `${refreshTokenExpiredAt}s` },
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

async function getUserInfo(
  category: AccountCategory,
  code: string,
  redirectUri?: string,
) {
  switch (category) {
    case AccountCategory.KAKAO:
      return await getKakaoUserInfo(code, redirectUri);
    case AccountCategory.GOOGLE:
      return await getGoogleUserInfo(code, redirectUri);
    case AccountCategory.NAVER:
      return await getNaverUserInfo(code);
    default:
      throw new CallerWrongUsageException(
        ErrorSubCategoryEnum.INVALID_INPUT,
        'Unsupported account category',
        ErrorCodeEnum.INVALID_SOCIAL_AUTH_TYPE,
      );
  }
}

export async function sendPasswordToEmail(
  identification: string,
  password: string,
) {
  const accountEntity = await findAccount(
    identification,
    AccountCategory.EMAIL,
  );
  if (!accountEntity) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'not supported type, only support email type',
      ErrorCodeEnum.DUPLICATE_IDENTIFICATION,
    );
  }
  const contents = getEmailContentsForm(password, identification);

  const config = new ConfigurationService(new ConfigService()).getBrevoConfig();
  const res = await sendEmail(contents, config);

  return { isSendingSuccess: res };
}

function getEmailContentsForm(password: string, identification: string) {
  const htmlContentFile = path.resolve(
    __dirname,
    process.cwd() + '/src/domain/account/resource/password/index.html',
  );
  let htmlContent = fs.readFileSync(htmlContentFile, 'utf8');
  htmlContent = htmlContent.replace('{{verificationCode}}', password);

  const contents = {
    subject: '임시 비밀번호',
    htmlContent: htmlContent,
    to: [{ email: identification }],
  };
  return contents;
}
