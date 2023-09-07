import { AccountDTO } from '@domain/user/dto/user.dto';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { CoreException } from '@common/exception/custom.exception';
import bcrypt from 'bcrypt';

export class Account {
  constructor(
    private readonly repo: AccountRepository,
    private readonly dto: AccountDTO,
  ) {}
  async register(userId: number) {
    await this.validateAccountCategory();

    const password = await bcrypt.hash(this.dto.password, 10);
    await this.repo.saveAccount({
      userId,
      category: this.dto.category,
      identification: this.dto.identification,
      password,
    });
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
