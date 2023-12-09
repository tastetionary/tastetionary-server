import { Inject, Injectable } from '@nestjs/common';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { UserAuth } from '@domain/authentication/core/user-auth';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { sendEmail } from '@thirdParty/brevo/brevo';
import { Environment } from '@root/src/env.validation';
import * as fs from 'fs';
import path from 'path';
import {
  CallerWrongDomainRuleException,
  InternalDomainException,
} from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import {
  AuthenticationRecord,
  deleteAuthentications,
  getAuthenticationByIdentification,
  getAuthentications,
  getHistoryById,
  saveAuthentication,
  saveAuthenticationHistory,
  updateAuthentication,
} from '@domain/authentication/repository/authentication.repository';

export async function syncAuthentication(
  userId: number,
  authenticationId: number,
) {
  return updateAuthentication({
    id: authenticationId,
    userId: userId,
  });
}

@Injectable()
export class AuthenticationService {
  @Inject(ConfigurationService)
  private readonly cfgService: ConfigurationService;

  async createProgressAuthentication(param: {
    userId?: number;
    identification: string;
    category: AuthenticationCategory;
    type: AuthenticationType;
  }) {
    const { env } = this.cfgService.getServerConfig();
    if (param.category == AuthenticationCategory.COMPANY) {
      if (this.isGeneralEmailDomain(param.type, param.identification, env)) {
        throw new CallerWrongDomainRuleException(
          ErrorNameEnum.INVALID_INPUT,
          'only company email can be used',
          'change email domain',
          { identification: param.identification },
        );
      }
    }

    await this.resetAuthentication(
      param.identification,
      param.category,
      param.type,
      param.userId,
    );

    const code = this.createSixDigitCode(env);

    const res = await this.sendAuthenticationCode(
      param.category,
      param.type,
      code,
      param.identification,
    );
    if (!res) {
      throw new InternalDomainException(
        ErrorNameEnum.UNEXPECTED_STATUS,
        'can not send authentication code',
        'check brevo status and log',
      );
    }

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
      code,
      expiredAt: this.createExpiredAt(),
    });

    return {
      id: history.id,
      expiredAt: history.expiredAt,
    };
  }

  private isGeneralEmailDomain(
    type: AuthenticationType,
    identification: string,
    env: Environment,
  ) {
    if (env != Environment.PRODUCTION) {
      return false;
    }

    if (type != AuthenticationType.EMAIL) {
      return false;
    }

    if (!identification.includes('@')) {
      return false;
    }

    const generalDomainList = ['test', 'gmail', 'naver', 'daum', 'hanmail'];
    const domain = identification.split('@')[1].split('.')[0];
    return generalDomainList.includes(domain);
  }

  private async sendAuthenticationCode(
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
    const config = this.cfgService.getBrevoConfig();
    return sendEmail(contents, config);
  }

  private createExpiredAt(seconds = 180) {
    const currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + seconds);
    return currentDate;
  }

  private createSixDigitCode(env?: Environment) {
    if (env == Environment.TEST || env == Environment.LOCAL) {
      return '000000';
    }
    const min = 100000;
    const max = 999999;
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    return randomNumber.toString().padStart(6, '0');
  }

  async doneProgressAuthentication(historyId: number, code: string) {
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
        `given six digit code: ${code} not matched with database code: ${historyRecord.code}, check code`,
      );
    }

    const authRecord = await getAuthenticationByIdentification(
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

    await updateAuthentication({
      id: authRecord.id,
      state: AuthenticationState.DONE,
    });

    return {
      id: authRecord.id,
    };
  }

  async getUserAuth(param: {
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

  async getUserDoneEmailList(userId: number): Promise<AuthenticationRecord[]> {
    const record = await getAuthentications({
      userId: userId,
      type: AuthenticationType.EMAIL,
    });
    return record;
  }

  async resetAuthentication(
    identification: string,
    category: AuthenticationCategory,
    type: AuthenticationType,
    userId?: number,
  ) {
    const auth = await getAuthenticationByIdentification(
      identification,
      category,
      type,
    );

    if (!auth) {
      return;
    }

    if (userId) {
      if (auth.userId != userId) {
        throw new InternalDomainException(
          ErrorNameEnum.INVALID_INPUT,
          'user and auth user is not matched',
          'check identification or someone steel others auth',
          { userId, targetAuthId: auth.id },
        );
      }
    }

    await deleteAuthentications([auth.id]);
  }

  async syncAuthentication(param: {
    userId: number;
    authenticationId: number;
  }) {
    return updateAuthentication({
      id: param.authenticationId,
      userId: param.userId,
    });
  }
}
