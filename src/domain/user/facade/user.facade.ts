import {
  changeCompany,
  changeUserState,
  createProfile,
  createUserOpinion,
  searchProfile,
} from '@domain/user/service/user.service';
import { RegisterProfileRequest } from '@domain/user/dto/user.dto';
import {
  removeAllAccount,
  removeAllToken,
} from '@domain/account/service/account.service';
import { WithdrawalTypeEnum, UserState } from '@domain/user/user.enum';
import {
  removeAllAuth,
  syncAuthentication,
  validateDoneIdentification,
} from '@domain/authentication/service/authentication.service';
import { createAccount } from '@domain/account/service/account.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

export async function getProfile(userId: number) {
  return searchProfile(userId);
}

export async function registerProfile(dto: RegisterProfileRequest) {
  await validateDoneIdentification({
    identification: dto.account.identification,
    authenticationId: dto.account.authenticationId,
    category: AuthenticationCategory.ACCOUNT,
    type: AuthenticationType.EMAIL,
  });

  const user = await createProfile(dto);
  await createAccount({ userId: user.id, ...dto.account });

  await syncAuthentication(user.id, dto.account.authenticationId);

  if (dto.userProperty.companyData) {
    await validateDoneIdentification({
      identification: dto.userProperty.companyData.identification,
      authenticationId: dto.userProperty.companyData.authenticationId,
      category: AuthenticationCategory.COMPANY,
      type: AuthenticationType.EMAIL,
    });

    await syncAuthentication(
      user.id,
      dto.userProperty.companyData.authenticationId,
    );

    await changeCompany(user.id, dto.userProperty.companyData);
  }
  return user;
}

export async function withdrawProfile(
  userId: number,
  type: WithdrawalTypeEnum,
) {
  await createUserOpinion({ userId, category: 'withdrawal', type });
  await changeUserState(userId, UserState.WITHDRAWAL);
  await removeAllAccount(userId);
  await removeAllToken(userId);
  await removeAllAuth(userId);
}
