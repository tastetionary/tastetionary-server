import { findValidAuth } from '@domain/authentication/service/authentication.service';
import { AccountCategory } from '@domain/account/account.enum';
import {
  getAccount,
  updatePassword,
} from '@domain/account/service/account.service';

export async function resetEmailPassword(
  historyId: number,
  code: string,
  identification: string,
  password: string,
) {
  await findValidAuth(historyId, code);

  const account = await getAccount(identification, AccountCategory.EMAIL);
  await updatePassword({
    accountId: account.id,
    identification: account.identification,
    password,
  });

  return account.id;
}
