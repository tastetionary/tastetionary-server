import { AccountDTO } from '@domain/user/dto/user.dto';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { CoreException } from '@common/exception/custom.exception';

export class Account {
  constructor(
    private readonly repo: AccountRepository,
    private readonly dto: AccountDTO,
  ) {}
  async register(userId: number) {
    await this.validateEmail();

    await this.repo.saveAccount({
      userId,
      category: this.dto.category,
      identification: this.dto.identification,
      password: this.dto.password,
    });
  }

  private async validateEmail() {
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
