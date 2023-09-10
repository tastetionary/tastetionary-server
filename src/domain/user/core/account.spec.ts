import { AccountCategory } from '@domain/user/user.enum';
import { Account } from '@domain/user/core/account';
describe('account core', () => {
  it('duplicated email should raise error', async () => {
    const entity = {
      id: 1,
      userId: 1,
      category: AccountCategory.EMAIL,
      identification: 'test',
      password: 'pwt',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const account = new Account(entity);
    try {
      account.checkDuplicatedIdentification(AccountCategory.EMAIL, 'test');
    } catch (e) {
      expect(e.cause).toBe('duplicated identification');
    }
  });
});
