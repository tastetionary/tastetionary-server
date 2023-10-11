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
import { sendEmail } from '@thirdParty/mail-gun/mail-gun';

@Injectable()
export class AuthenticationService {
  constructor(private repo: AuthenticationRepository) {}

  @Inject(ConfigurationService)
  private readonly cfgService: ConfigurationService;

  async createProgressAuthentication(param: {
    userId: number;
    identification: string;
    category: AuthenticationCategory;
    type: AuthenticationType;
  }) {
    const userAuth = await this.getUserAuth(param.userId);
    if (userAuth.isDone(param.category, param.type)) {
      throw new ServiceException(
        'already authenticated, cannot create progress authentication',
        `already authenticated ${param.type}`,
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
      userId: param.userId,
      identification: param.identification,
      type: param.type,
      code: this.createSixDigitCode(),
      expiredAt: this.createExpiredAt(),
    });

    this.sendAuthenticationCode(param.type, history.code, param.identification);
    return {
      id: history.id,
      expiredAt: history.expiredAt,
    };
  }

  private sendAuthenticationCode(
    type: AuthenticationType,
    code: string,
    identification: string,
  ) {
    if (type == AuthenticationType.EMAIL) {
      const contents = {
        toEmail: identification,
        subject: '',
        content: '',
      };
      sendEmail(contents);
    }
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

  async getUserAuth(userId: number) {
    const records = await this.repo.getAuthenticationByUserId(userId);
    return new UserAuth(userId, records);
  }
}
