import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { UserAuth } from '@domain/authentication/core/user-auth';
import { EnvironmentEnum } from '@root/src/env.validation';
import {
  CallerWrongDomainRuleException,
  InternalDomainException,
} from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import {
  deleteAuthentications,
  getAuthenticationByIdentification,
  getHistoryById,
  saveAuthentication,
  saveAuthenticationHistory,
  updateAuthentication,
} from '@domain/authentication/repository/authentication.repository';
import { isExpired } from '@root/src/common/util';

export async function changeAuthenticationAsDone(
  historyId: number,
  code: string,
) {
  const auth = await findValidAuth(historyId, code);

  await updateAuthentication({
    id: auth.id,
    state: AuthenticationState.DONE,
  });

  return {
    id: auth.id,
  };
}

export async function findValidAuth(historyId: number, code: string) {
  const historyRecord = await getHistoryById(historyId);
  if (!historyRecord) {
    throw new InternalDomainException(
      ErrorNameEnum.NO_DATA,
      `history: ${historyId} not found, check history id`,
    );
  }

  if (historyRecord.code != code) {
    throw new CallerWrongDomainRuleException(
      ErrorNameEnum.INVALID_INPUT,
      `given digit code: ${code} not matched with database code, check code`,
    );
  }

  if (isExpired(historyRecord.expiredAt)) {
    throw new CallerWrongDomainRuleException(
      ErrorNameEnum.INVALID_INPUT,
      'expired auth, start new process',
    );
  }

  const authRecord = await getAuthentication(
    historyRecord.identification,
    historyRecord.category,
    historyRecord.type,
  );

  if (!authRecord) {
    throw new InternalDomainException(
      ErrorNameEnum.NO_DATA,
      `auth not found from given history id, ${historyId}, check authentication on history`,
    );
  }
  return authRecord;
}

export async function getAuthentication(
  identification: string,
  category: AuthenticationCategory,
  type: AuthenticationType,
) {
  return getAuthenticationByIdentification(identification, category, type);
}

async function getUserAuth(param: {
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
  userId?: number;
}) {
  const record = await getAuthenticationByIdentification(
    param.identification,
    param.category,
    param.type,
  );
  const data = record ? [record] : [];
  return new UserAuth(param.userId ?? null, data);
}

export async function resetAuthentication(
  identification: string,
  category: AuthenticationCategory,
  type: AuthenticationType,
  userId?: number,
) {
  const auth = await getAuthentication(identification, category, type);

  if (!auth) {
    return;
  }

  if (!userId) {
    await deleteAuthentications([auth.id]);
    return;
  }

  if (auth.userId != userId) {
    throw new InternalDomainException(
      ErrorNameEnum.INVALID_INPUT,
      'user and auth user is not matched',
      'check identification or someone steal others auth',
      { userId, targetAuthId: auth.id },
    );
  }
  await deleteAuthentications([auth.id]);
}

export async function syncAuthentication(
  userId: number,
  authenticationId: number,
) {
  return updateAuthentication({
    id: authenticationId,
    userId: userId,
  });
}

export async function createProgressAuthentication(param: {
  userId?: number;
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
  code: string;
  env?: EnvironmentEnum;
}) {
  await saveAuthentication({
    userId: param.userId,
    identification: param.identification,
    category: param.category,
    type: param.type,
    state: AuthenticationState.INPROGRESS,
  });

  const history = await saveAuthenticationHistory({
    identification: param.identification,
    category: param.category,
    type: param.type,
    code: param.code,
    expiredAt: createExpiredAt(),
  });

  return {
    id: history.id,
    expiredAt: history.expiredAt,
  };
}

function createExpiredAt(seconds = 180) {
  const currentDate = new Date();
  currentDate.setSeconds(currentDate.getSeconds() + seconds);
  return currentDate;
}

export function validateDomainWhenCompanyCase(param: {
  userId?: number | undefined;
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
  env?: EnvironmentEnum | undefined;
}) {
  if (param.category !== AuthenticationCategory.COMPANY) {
    return;
  }

  if (isGeneralEmailDomain(param.identification, param.env)) {
    throw new CallerWrongDomainRuleException(
      ErrorNameEnum.INVALID_INPUT,
      'only company email can be used',
      'change email domain',
      { identification: param.identification },
    );
  }
}

function isGeneralEmailDomain(identification: string, env?: EnvironmentEnum) {
  if (env != EnvironmentEnum.PRODUCTION) {
    return false;
  }

  if (!identification.includes('@')) {
    return false;
  }

  const generalDomainList = ['test', 'gmail', 'naver', 'daum', 'hanmail'];
  const domain = identification.split('@')[1].split('.')[0];
  return generalDomainList.includes(domain);
}

export const _private = {
  getUserAuth,
};
