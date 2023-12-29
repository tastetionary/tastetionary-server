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
import {
  AccountCancellationTypeEnum as WithdrawalTypeEnum,
  UserState,
} from '@domain/user/user.enum';

export async function getProfile(userId: number) {
  return searchProfile(userId);
}

export async function registerProfile(dto: RegisterUserDTO) {
  return createProfile(dto);
}

export async function withdrawFrom(
  userId: number,
  type: WithdrawalTypeEnum,
  opinion?: string,
) {
  await createUserOpinion({ userId, category: 'withdrawal', type, opinion });
  await changeUserState(userId, UserState.WITHDRAWAL);
  await removeAllAccount(userId);
  await removeAllToken(userId);
}
