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
} from '@domain/authentication/service/authentication.service';
import { sendAuthenticationCodeToEmail } from '@domain/authentication/service/auth-code.executer';

export async function beginAuthProgress(param: {
  userId?: number;
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
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

  await resetNotRegisteredUserAuth(
    param.identification,
    param.category,
    param.type,
  );

  return createProgressAuthentication({ ...param, code: authCode });
}

export async function finishAuthProgress(historyId: number, code: string) {
  return changeAuthenticationAsDone(historyId, code);
}
