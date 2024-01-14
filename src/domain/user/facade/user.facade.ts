import {
  changeUserState,
  createProfile,
  createUserOpinion,
  searchProfile,
} from '@domain/user/service/user.service';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';
import {
  removeAllAccount,
  removeAllToken,
} from '@domain/account/service/account.service';
import { WithdrawalTypeEnum, UserState } from '@domain/user/user.enum';
import {
  removeAllAuth,
  syncAuthentication,
} from '@domain/authentication/service/authentication.service';
import { createAccount } from '@domain/account/service/account.service';

export async function getProfile(userId: number) {
  return searchProfile(userId);
}

export async function registerProfile(dto: RegisterUserDTO) {
  const user = await createProfile(dto);
  await createAccount(user.id, dto.account);

  if (dto.userProperty.company) {
    await syncAuthentication(
      user.id,
      dto.userProperty.company.authenticationId,
    );
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
