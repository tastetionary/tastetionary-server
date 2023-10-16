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
    if (param.category == AuthenticationCategory.COMPANY) {
      if (this.isGeneralEmailDomain(param.type, param.identification)) {
        throw new ServiceException(
          `only company email can be used, not general domain, given: ${param.identification}`,
        );
      }
    }

    const userAuth = await this.getUserAuth(param);
    if (userAuth.isDone(param.category, param.type)) {
      throw new ServiceException(
        `already authenticated, cannot create progress authentication, ${param.category}, ${param.type}`,
      );
    }

    const code = this.createSixDigitCode();

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
  ) {
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
    const contents = {
      subject: '',
      htmlContent: `<h1> 인증코드 ${code} 입니다. </h1>`,
      to: [{ email: identification }],
    };

    if (category == AuthenticationCategory.ACCOUNT) {
      contents.subject = '계정인증';
    }

    if (category == AuthenticationCategory.COMPANY) {
      contents.subject = '회사인증';
    }
    const config = this.cfgService.getBrevoConfig();
    return sendEmail(contents, config);
  }

  private createExpiredAt(seconds = 180) {
    const currentDate = new Date();
    currentDate.setSeconds(currentDate.getSeconds() + seconds);
    return currentDate;
  }

  private createSixDigitCode() {
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
    userId: number,
    identification: string,
    category: AuthenticationCategory,
    type: AuthenticationType,
  ) {
    const auth = await this.repo.getAuthenticationByIdentification(
      identification,
      category,
      type,
    );

    if (!auth) {
      return;
    }

    if (auth.userId != userId) {
      throw new ServiceException(
        'not differ user trying to delete other auth',
        `triedUser: ${userId}, targetAuthId: ${auth.id}`,
      );
    }

    await this.repo.deleteAuthentications([auth.id]);
  }
}
