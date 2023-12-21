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
import { ErrorNameEnum } from '@common/exception/enum';
import { ConfigService } from '@nestjs/config';

function createSixDigitCode(env?: EnvironmentEnum) {
  if (env == EnvironmentEnum.TEST || env == EnvironmentEnum.LOCAL) {
    return '000000';
  }

  const min = 100000;
  const max = 999999;
  const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
  return randomNumber.toString().padStart(6, '0');
}

async function sendAuthenticationCode(
  category: AuthenticationCategory,
  type: AuthenticationType,
  code: string,
  identification: string,
) {
  if (type != AuthenticationType.EMAIL) {
    throw new CallerWrongDomainRuleException(
      ErrorNameEnum.INVALID_INPUT,
      'not supported type check AuthenticationType',
    );
  }

  const contents = getContents(category, code, identification);

  const config = new ConfigurationService(new ConfigService()).getBrevoConfig();
  return sendEmail(contents, config);
}
function getContents(
  category: AuthenticationCategory,
  code: string,
  identification: string,
) {
  let subject = '';
  let htmlContentFile = '';
  if (category == AuthenticationCategory.ACCOUNT) {
    subject = '계정인증';
    htmlContentFile = path.resolve(
      __dirname,
      process.cwd() +
        '/src/domain/authentication/resource/verify-register/index.html',
    );
  }

  if (category == AuthenticationCategory.COMPANY) {
    subject = '회사인증';
    htmlContentFile = path.resolve(
      __dirname,
      process.cwd() +
        '/src/domain/authentication/resource/verify-company/index.html',
    );
  }

  let htmlContent = fs.readFileSync(htmlContentFile, 'utf8');
  htmlContent = htmlContent.replace('{{verificationCode}}', code);

  const contents = {
    subject: subject,
    htmlContent: htmlContent,
    to: [{ email: identification }],
  };
  return contents;
}

export const _private = {
  getContents,
};
