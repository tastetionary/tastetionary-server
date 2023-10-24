import { Inject, Injectable } from '@nestjs/common';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { AuthenticationRepository } from '@domain/authentication/repository/authentication.repository';
import { ServiceException } from '@common/exception/custom.exception';
import { UserAuth } from '@domain/authentication/core/user-auth';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { sendEmail } from '@thirdParty/brevo/brevo';
import { Environment } from '@root/src/env.validation';
import * as fs from 'fs';

@Injectable()
export class AuthenticationService {
  constructor(private repo: AuthenticationRepository) {}

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
        throw new ServiceException(
          `only company email can be used, not general domain, given: ${param.identification}`,
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
      throw new ServiceException(
        'can not send authentication code, ask service center',
      );
    }

    await this.repo.saveAuthentication({
      userId: param.userId,
      identification: param.identification,
      category: param.category,
      type: param.type,
      state: AuthenticationState.INPROGRESS,
    });

    const history = await this.repo.saveAuthenticationHistory({
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
      throw new ServiceException(
        `not supported type ${type}`,
        'check AuthenticationType',
      );
    }

    let subject = '';
    let htmlContentFile = '';
    if (category == AuthenticationCategory.ACCOUNT) {
      subject = '계정인증';
      htmlContentFile =
        'src/domain/authentication/resource/verify-account/index.html';
    }

    if (category == AuthenticationCategory.COMPANY) {
      subject = '회사인증';
      htmlContentFile =
        'src/domain/authentication/resource/verify-company/index.html';
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
    const historyRecord = await this.repo.getHistoryById(historyId);
    if (!historyRecord) {
      throw new ServiceException(
        'not found history',
        `history: ${historyId} not found, check history id`,
      );
    }
    if (historyRecord.code != code) {
      throw new ServiceException(
        'not matched code',
        `given six digit code: ${code} not matched with database code: ${historyRecord.code}, check code`,
      );
    }

    const authRecord = await this.repo.getAuthenticationByIdentification(
      historyRecord.identification,
      historyRecord.category,
      historyRecord.type,
    );

    if (!authRecord) {
      throw new ServiceException(
        'not found authentication',
        `auth not found from given history id, ${historyId}, check authentication on history`,
      );
    }

    await this.repo.updateAuthentication({
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
    const record = await this.repo.getAuthenticationByIdentification(
      param.identification,
      param.category,
      param.type,
    );
    const data = record ? [record] : [];
    return new UserAuth(param.userId ?? null, data);
  }

  async resetAuthentication(
    identification: string,
    category: AuthenticationCategory,
    type: AuthenticationType,
    userId?: number,
  ) {
    const auth = await this.repo.getAuthenticationByIdentification(
      identification,
      category,
      type,
    );

    if (!auth) {
      return;
    }

    if (userId) {
      if (auth.userId != userId) {
        throw new ServiceException(
          'not differ user trying to delete other auth',
          `triedUser: ${userId}, targetAuthId: ${auth.id}`,
        );
      }
    }

    await this.repo.deleteAuthentications([auth.id]);
  }

  async syncAuthentication(param: {
    userId: number;
    authenticationId: number;
  }) {
    return this.repo.updateAuthentication({
      id: param.authenticationId,
      userId: param.userId,
    });
  }
}
