import bcrypt from 'bcrypt';
import { AccountCategory } from '@domain/user/user.enum';
import { CoreException } from '@common/exception/custom.exception';
type AccountEntity = {
  id: number;
  userId: number;
  category: string;
  identification: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
};

export class Account {
  constructor(private readonly entity: AccountEntity) {}
  checkDuplicatedIdentification(
    category: AccountCategory,
    identification: string,
  ) {
    if (
      this.entity.category === category &&
      this.entity.identification === identification
    ) {
      throw new CoreException('duplicated identification');
    }
  }
  private async encryptValue(value: string) {
    return bcrypt.hash(value, 10);
  }
}
