import bcrypt from 'bcrypt';
import { AccountCategory } from '@domain/account/account.enum';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
type AccountEntity = {
  id: number;
  userId: number;
  category: AccountCategory | string;
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
      throw new CallerWrongUsageException(
        ErrorNameEnum.INVALID_INPUT,
        'duplicated identification',
        'already registered identification, change other identification',
        { category, identification },
      );
    }
  }

  async checkPassword(password: string) {
    const isMatched = await bcrypt.compare(
      password,
      this.entity?.password ?? '',
    );
    if (isMatched) {
      return;
    }
    throw new CallerWrongUsageException(
      ErrorNameEnum.INVALID_INPUT,
      'identification or password is wrong',
    );
  }

  async encryptValue(value: string) {
    return bcrypt.hash(value, 10);
  }
}
