import { AccountDTO } from '@domain/account/dto/account.dto';
import { AccountRepository } from '@domain/account/repository/account.repository';
import { UserTokenRepository } from '@domain/account/repository/user-token.repository';
import { JwtService } from '@nestjs/jwt';
import { add } from 'date-fns';
import { Account } from '@domain/account/core/account';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly jwtService: JwtService,
    private readonly tokenRepo: UserTokenRepository,
  ) {}
  async register(userId: number, dto: AccountDTO) {
    const accountRecord = await this.accountRepo.getIdentification(
      dto.identification,
      dto.category,
    );

    const account = new Account(accountRecord);
    account.checkDuplicatedIdentification(dto.category, dto.identification);
    const password = await account.encryptValue(dto.password);

    await this.accountRepo.saveAccount({
      userId,
      category: dto.category,
      identification: dto.identification,
      password,
    });
  }

  async createToken(userId: number, dto: AccountDTO) {
    const accountRecord = await this.accountRepo.getIdentification(
      dto.identification,
      dto.category,
    );

    const account = new Account(accountRecord);
    account.checkPassword(dto.password);

    const tokens = this.makeTokens({ userId });
    this.tokenRepo.saveToken({
      userId,
      ...tokens,
    });

    return tokens;
  }

  private makeTokens(payload: { userId: number }) {
    const accessTokenExpiredAt = 60 * 60 * 24;
    const refreshTokenExpiredAt = 60 * 60 * 24;
    const accessToken = this.jwtService.sign(payload, {
      secret: 'my-secret-access',
      expiresIn: accessTokenExpiredAt,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: 'my-secret-access',
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
