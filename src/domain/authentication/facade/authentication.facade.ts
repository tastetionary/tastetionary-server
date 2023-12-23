import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { EnvironmentEnum } from '@root/src/env.validation';
import {
  createProgressAuthentication,
  resetAuthentication,
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

  // TODO fail 관련 공통 response 모양 만들어야함
  if (!isSendingSuccess) {
    return { id: 0, expiredAt: new Date() };
  }

  await resetAuthentication(
    param.identification,
    param.category,
    param.type,
    param.userId,
  );

  return createProgressAuthentication({ ...param, code: authCode });
}
