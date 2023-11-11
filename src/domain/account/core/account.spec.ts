import { AccountCategory } from '@domain/account/account.enum';
import { Account } from '@domain/account/core/account';
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
      account.checkDuplicatedIdentification(
        entity.category,
        entity.identification,
      );
    } catch (e) {
      expect(e.response.message).toBe('duplicated identification');
    }
  });
});
