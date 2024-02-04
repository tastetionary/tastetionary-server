import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { EnvironmentEnum } from '@root/src/env.validation';
import {
  createProgressAuthentication,
  changeAuthenticationAsDone,
  resetNotRegisteredUserAuth,
  validateDomainWhenCompanyCase,
  resetRegisteredUserAuth,
  syncAuthentication,
} from '@domain/authentication/service/authentication.service';
import { sendAuthenticationCodeToEmail } from '@domain/authentication/service/auth-code.executer';

export async function beginAuthProgress(param: {
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
  userId?: number;
  env?: EnvironmentEnum;
}) {
  validateDomainWhenCompanyCase(param);

  const { authCode, isSendingSuccess } = await sendAuthenticationCodeToEmail(
    param.category,
    param.type,
    param.identification,
    param.env,
  );

  /**
   * @TODO  공통 response 추가
   */
  if (!isSendingSuccess) {
    return { id: 0, expiredAt: new Date() };
  }

  if (param.userId) {
    await resetRegisteredUserAuth(param.userId, param.category, param.type);
  } else {
    await resetNotRegisteredUserAuth(
      param.identification,
      param.category,
      param.type,
    );
  }

  return createProgressAuthentication({ ...param, code: authCode });
}

export async function finishAuthProgress(param: {
  historyId: number;
  code: string;
  userId?: number;
}) {
  const auth = await changeAuthenticationAsDone(param.historyId, param.code);
  if (param.userId) {
    await syncAuthentication(param.userId, auth.id);
  }

  return auth;
}
