import {
  findValidAuth,
  resetNotRegisteredUserAuth,
} from '@domain/authentication/service/authentication.service';
import { AccountCategory } from '@domain/account/account.enum';
import {
  changePassword,
  findAccount,
  getAccount,
  sendPasswordToEmail,
  updatePassword,
} from '@domain/account/service/account.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { SupplierSystemException } from '@root/src/common/exception/internal.exception';
import {
  ErrorCodeEnum,
  ErrorSubCategoryEnum,
} from '@root/src/common/exception/enum';
import { SHA256 } from 'crypto-js';

export async function resetPassword(historyId: number, code: string) {
  const auth = await findValidAuth(historyId, code);
  const account = await getAccount(auth.identification, AccountCategory.EMAIL);

  if (!account) {
    return;
  }

  const newPassword = generatePassword(10);
  await updatePassword({
    accountId: account.id,
    identification: account.identification,
    password: SHA256(newPassword).toString(),
  });

  const { isSendingSuccess } = await sendPasswordToEmail(
    account.identification,
    newPassword,
  );

  if (!isSendingSuccess) {
    throw new SupplierSystemException(
      ErrorSubCategoryEnum.UNEXPECTED_STATUS,
      'failed to send new password',
      ErrorCodeEnum.EXTERNAL_SERVICE_ERROR,
    );
  }

  await resetNotRegisteredUserAuth(
    account.identification,
    AuthenticationCategory.PASSWORD,
    AuthenticationType.EMAIL,
  );
}

function generatePassword(length: number): string {
  const letters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const digits = '0123456789';
  const specialChars = '!@#$%^&+?';
  const allChars = letters + digits + specialChars;

  const getRandomChar = (chars: string) =>
    chars.charAt(Math.floor(Math.random() * chars.length));

  const requiredChars = [
    getRandomChar(letters),
    getRandomChar(digits),
    getRandomChar(specialChars),
  ];

  const remainingChars = Array.from({ length: length - 3 }, () =>
    getRandomChar(allChars),
  );

  const passwordArray = [...requiredChars, ...remainingChars];
  return passwordArray.sort(() => Math.random() - 0.5).join('');
}

export const _private = {
  generatePassword,
};
