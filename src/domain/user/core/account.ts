import { AccountDTO } from '@domain/user/dto/user.dto';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { CoreException } from '@common/exception/custom.exception';
import bcrypt from 'bcrypt';
import { UserTokenRepository } from '@domain/user/repository/user-token.repository';

export class Account {
  constructor(
    private readonly dto: AccountDTO,
    private readonly repo: AccountRepository,
    private readonly tokenRepo: UserTokenRepository,
  ) {}
  async createToken(userId: number) {
    const account = await this.repo.getAccountByIdentification(
      this.dto.identification,
      this.dto.category,
    );

    const password = await this.encryptValue(this.dto.password);
    if (account?.password === password) {
      throw new CoreException(
        'invalid account',
        'identification or password is wrong',
      );
    }

    this.tokenRepo.saveToken({
      userId,
      accessToken: password,
      refreshToken: password,
      accessTokenExpiredAt: new Date(),
      refreshTokenExpiredAt: new Date(),
    });

    return account;
  }

  async register(userId: number) {
    await this.validateAccountCategory();

    const password = await this.encryptValue(this.dto.password);
    await this.repo.saveAccount({
      userId,
      category: this.dto.category,
      identification: this.dto.identification,
      password,
    });
  }

  private async encryptValue(value: string) {
    return bcrypt.hash(value, 10);
  }

  private async validateAccountCategory() {
    const accountRes = await this.repo.getAccountByIdentification(
      this.dto.identification,
      this.dto.category,
    );

    if (accountRes) {
      throw new CoreException(
        'already has email',
        `duplicated email ${this.dto.identification}`,
      );
    }
  }
}
