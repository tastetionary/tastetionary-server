import {
  findValidAuth,
  resetNotRegisteredUserAuth,
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

export async function resetPassword(historyId: number, code: string) {
  const auth = await findValidAuth(historyId, code);
  const account = await getAccount(auth.identification, AccountCategory.EMAIL);

  const newPassword = Math.random().toString(36).substring(2, 8);
  await updatePassword({
    accountId: account.id,
    identification: account.identification,
    password: newPassword,
  });

  // for clear history
  await resetNotRegisteredUserAuth(
    account.identification,
    AuthenticationCategory.PASSWORD,
    AuthenticationType.EMAIL,
  );

  return newPassword;
}
