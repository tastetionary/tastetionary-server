import { AccountDTO } from '@domain/account/dto/account.dto';
import { UserTokenRepository } from '@domain/account/repository/user-token.repository';
import { JwtService } from '@nestjs/jwt';
import { add } from 'date-fns';
import { Account } from '@domain/account/core/account';
import { Injectable } from '@nestjs/common';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { CallerWrongUsageException } from '@root/src/common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import {
  getIdentification,
  saveAccount,
} from '@domain/account/repository/account.repository';

@Injectable()
export class AccountService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigurationService,
    private readonly tokenRepo: UserTokenRepository,
  ) {}
  async register(userId: number, dto: AccountDTO) {
    const accountRecord = await getIdentification(
      dto.identification,
      dto.category,
    );

    const account = new Account(accountRecord);
    account.checkDuplicatedIdentification(dto.category, dto.identification);
    const password = await account.encryptValue(dto.password);

    await saveAccount({
      userId,
      category: dto.category,
      identification: dto.identification,
      password,
    });
  }

  async createToken(dto: AccountDTO) {
    const accountRecord = await getIdentification(
      dto.identification,
      dto.category,
    );

    if (!accountRecord) {
      throw new CallerWrongUsageException(
        ErrorNameEnum.NO_DATA,
        'no account',
        'check identification',
        { category: dto.category, identification: dto.identification },
      );
    }

    const account = new Account(accountRecord);
    await account.checkPassword(dto.password);

    const tokens = this.makeTokens({ userId: accountRecord.userId });
    this.tokenRepo.saveToken({
      userId: accountRecord.userId,
      ...tokens,
    });

    return tokens;
  }

  private makeTokens(payload: { userId: number }) {
    // NOTE delete after arranging token
    const tempSeconds = 1000000;
    const accessTokenExpiredAt =
      parseInt(this.configService.getTokenData().accessTokenExpiredAt) +
      tempSeconds;
    const refreshTokenExpiredAt =
      parseInt(this.configService.getTokenData().refreshTokenExpiredAt) +
      tempSeconds;

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getTokenData().accessTokenSecret,
      expiresIn: accessTokenExpiredAt,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.getTokenData().refreshTokenSecret,
      expiresIn: refreshTokenExpiredAt,
    });
    const data = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      accessTokenExpiredAt: add(new Date(), { seconds: accessTokenExpiredAt }),
      refreshTokenExpiredAt: add(new Date(), {
        seconds: refreshTokenExpiredAt,
      }),
    };
    return data;
  }

  async deleteTokens(userId: number) {
    const token = await this.tokenRepo.getTokenByUserId(userId);
    if (!token) return;

    await this.tokenRepo.deleteToken(token.id);
  }
}
