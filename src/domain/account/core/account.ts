import bcrypt from 'bcrypt';
import { AccountCategory } from '@domain/account/account.enum';
import { CoreException } from '@common/exception/custom.exception';
type AccountEntity = {
  id: number;
  userId: number;
  category: AccountCategory;
  identification: string;
  password: string; // encrypted
  createdAt: Date;
  updatedAt: Date;
};

export class Account {
  constructor(private readonly entity: AccountEntity | null) {}

  checkDuplicatedIdentification(
    category: AccountCategory,
    identification: string,
  ) {
    if (
      this.entity?.category === category &&
      this.entity?.identification === identification
    ) {
      throw new CoreException('duplicated identification');
    }
  }

  async checkPassword(password: string) {
    const isMatched = await bcrypt.compare(
      password,
      this.entity?.password || '',
    );
    if (isMatched) {
      return;
    }
    throw new CoreException(
      'invalid account',
      'identification or password is wrong',
    );
  }

  async encryptValue(value: string) {
    return bcrypt.hash(value, 10);
  }
}
