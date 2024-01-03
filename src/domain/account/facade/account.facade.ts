import {
  findValidAuth,
  resetAuthentication,
} from '@domain/authentication/service/authentication.service';
import { AccountCategory } from '@domain/account/account.enum';
import {
  getAccount,
  updatePassword,
} from '@domain/account/service/account.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

export async function resetEmailPassword(
  historyId: number,
  code: string,
  newPassword: string,
) {
  const auth = await findValidAuth(historyId, code);
  const account = await getAccount(auth.identification, AccountCategory.EMAIL);

  await updatePassword({
    accountId: account.id,
    identification: account.identification,
    password: newPassword,
  });

  await resetAuthentication(
    account.identification,
    AuthenticationCategory.PASSWORD,
    AuthenticationType.EMAIL,
  );

  return account.id;
}
