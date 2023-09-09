import { AccountDTO } from '@domain/user/dto/user.dto';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { UserTokenRepository } from '@domain/user/repository/user-token.repository';
import { JwtService } from '@nestjs/jwt';
import { add } from 'date-fns';
import { Account } from '@domain/user/core/account';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AccountService {
  constructor(
    private readonly accountRepo: AccountRepository,
    private readonly jwtService: JwtService,
    private readonly tokenRepo: UserTokenRepository,
  ) {}

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
    const accessToken = this.jwtService.sign(payload, {
      secret: 'my-secret-access',
      expiresIn: 24 * 3600,
    });
    const refreshToken = this.jwtService.sign(payload, {
      secret: 'my-secret-access',
      expiresIn: 24 * 3600,
    });
    const data = {
      accessToken: accessToken,
      refreshToken: refreshToken,
      accessTokenExpiredAt: add(new Date(), { seconds: 24 * 3600 }),
      refreshTokenExpiredAt: add(new Date(), { seconds: 24 * 3600 }),
    };
    return data;
  }

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
}
