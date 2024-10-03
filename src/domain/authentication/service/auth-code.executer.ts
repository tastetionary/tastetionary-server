import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { sendEmail } from '@thirdParty/brevo/brevo';
import { EnvironmentEnum } from '@root/src/env.validation';
import * as fs from 'fs';
import path from 'path';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import { ErrorSubCategoryEnum } from '@common/exception/enum';
import { ConfigService } from '@nestjs/config';

export async function sendAuthenticationCodeToEmail(
  category: AuthenticationCategory,
  type: AuthenticationType,
  identification: string,
  env?: EnvironmentEnum,
) {
  if (type != AuthenticationType.EMAIL) {
    throw new CallerWrongDomainRuleException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'not supported type, only support email type',
    );
  }

  const authCode = createDigitCode(6, env);
  const contents = getEmailContentsForm(category, authCode, identification);

  const config = new ConfigurationService(new ConfigService()).getBrevoConfig();
  const res = await sendEmail(contents, config);

  return { authCode, isSendingSuccess: res };
}

function createDigitCode(size: number, env?: EnvironmentEnum) {
  const min = Number('0'.repeat(size));
  if (env == EnvironmentEnum.TEST || env == EnvironmentEnum.LOCAL) {
    return min.toString();
  }

  const max = Number('9'.repeat(size));
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

  return randomNumber.toString().padStart(size, '0');
}

function getEmailContentsForm(
  category: AuthenticationCategory,
  code: string,
  identification: string,
) {
  const subjects: Record<AuthenticationCategory, string> = {
    [AuthenticationCategory.ACCOUNT]: '계정인증',
    [AuthenticationCategory.PASSWORD]: '비밀번호변경',
  };

  const htmlContentFile = path.resolve(
    __dirname,
    process.cwd() +
      `/src/domain/authentication/resource/${category}/index.html`,
  );
  let htmlContent = fs.readFileSync(htmlContentFile, 'utf8');
  htmlContent = htmlContent.replace('{{verificationCode}}', code);

  const contents = {
    subject: subjects[category],
    htmlContent: htmlContent,
    to: [{ email: identification }],
  };
  return contents;
}

export const _private = {
  getEmailContentsForm,
  createDigitCode,
};
