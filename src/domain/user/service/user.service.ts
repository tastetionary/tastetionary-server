import {
  AgreementDTO,
  AreaDto,
  RegisterProfileRequest,
} from '@domain/user/dto/user.dto';
import {
  WithdrawalTypeEnum,
  OpinionCategory,
  UserState,
  PreferenceCategory,
  PreferenceCategoryToColumnMapping,
} from '@domain/user/user.enum';
import { getRandomItem } from '@common/util';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorSubCategoryEnum } from '@common/exception/enum';
import {
  AreaRecord,
  deleteAreas,
  getAreasByUserId,
  saveArea,
} from '@domain/user/repository/area.repository';
import {
  checkNickNameValidity,
  getNicknamePartRecord,
  getUserById,
  getUserByNickname,
  saveOpinion,
  saveUser,
  updateUserById,
} from '@domain/user/repository/user.repository';
import { saveAgreements } from '@domain/user/repository/agreements.repository';
import {
  AuthenticationRecord,
  getAuthenticationsByUserId,
} from '@domain/authentication/repository/authentication.repository';
import {
  AuthenticationCategory,
  AuthenticationState,
} from '@domain/authentication/authentication.enum';
import {
  deletePreferenceRestaurant,
  getPreferencesByUserId,
  savePreferenceRestaurant,
} from '@domain/user/repository/preference.repository';
import { findExternalRestaurantById } from '@domain/restaurant/service/restaurant.service';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { searchAccount } from '@domain/account/service/account.service';

export async function searchProfile(userId: number) {
  const user = await searchUser(userId);
  if (!user) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.NO_DATA,
      `user not found: ${userId}`,
    );
  }
  const area = await searchAreas(userId);
  const account = await searchAccount(userId);
  return {
    user,
    area,
    account,
  };
}

export type UserEntity = Awaited<ReturnType<typeof searchUser>>;
async function searchUser(userId: number) {
  const user = await getUserById(userId);
  return {
    ...user,
  };
}

const transformRecordToEntity = <T extends AuthenticationRecord>(
  records: T[],
  target: AuthenticationCategory,
) => {
  const record = records.find((r) => r.category === target);

  if (!record) {
    return null;
  }
  const { category, ...data } = record;
  return {
    ...data,
  };
};

export type AreaEntity = Awaited<ReturnType<typeof searchAreas>>;
export async function searchAreas(userId: number) {
  const area = await getAreasByUserId(userId);
  if (!area) {
    return null;
  }

  return area;
}

export type AuthEntity = Awaited<ReturnType<typeof searchAuthList>>;
async function searchAuthList(userId: number) {
  const authList = await getAuthenticationsByUserId(
    userId,
    AuthenticationState.DONE,
  );
  const data = {
    account: transformRecordToEntity(authList, AuthenticationCategory.ACCOUNT),
  };

  return {
    ...data,
    account: data.account as NonNullable<typeof data.account>,
  };
}

export async function createProfile(dto: RegisterProfileRequest) {
  const user = await createUser(dto.nickname);

  await createAgreements(user.id, dto.agreements);
  await createAreas(user.id, dto.area);

  return user;
}

async function createAreas(userId: number, dto: AreaDto) {
  const area = {
    userId,
    order: 0,
    address: dto.address,
    location: { latitude: dto.latitude, longitude: dto.longitude },
  };

  await saveArea(area);
}

async function createAgreements(userId: number, dtoList: AgreementDTO[]) {
  const params = dtoList.map((dto) => {
    return { userId, ...dto };
  });
  await saveAgreements(params);
}

export async function createUser(nickname?: string) {
  const user = await saveUser({
    state: UserState.ACTIVE,
    nickname: nickname || (await createUniqueNickName()),
    property: {},
  });

  return user;
}

export async function changeArea(userId: number, dto: AreaDto) {
  await deleteAreas({ userId });
  await createAreas(userId, dto);
}

export async function getPreferenceRestaurant(
  userId: number,
  category: PreferenceCategory,
) {
  const preference = await getPreferencesByUserId(userId);
  if (!preference) {
    return [];
  }

  const restaurntIds = preference[PreferenceCategoryToColumnMapping[category]];
  const res = await Promise.all(
    restaurntIds.map(async (id) => {
      return await findExternalRestaurantById(id);
    }),
  );

  return res;
}

export async function createPreferenceRestaurant(
  userId: number,
  restaurantId: number,
  category: PreferenceCategory,
) {
  const preference = await getPreferencesByUserId(userId);
  if (preference) {
    const column = PreferenceCategoryToColumnMapping[category];
    const exist = preference[column].includes(restaurantId);

    if (exist) {
      const categoryMsg =
        category === PreferenceCategory.BOOKMARK ? '북마크에 추가된' : '제외된';
      throw new CallerWrongUsageException(
        ErrorSubCategoryEnum.INVALID_INPUT,
        `이미 ${categoryMsg} 식당입니다.`,
      );
    }
  }

  await savePreferenceRestaurant({ userId, restaurantId, category });
}

export async function deleteUserPreferenceRestaurant(
  userId: number,
  restaurantId: number,
  category: PreferenceCategory,
) {
  const preference = await getPreferencesByUserId(userId);
  if (!preference) {
    return;
  }

  await deletePreferenceRestaurant({
    userId,
    restaurantId,
    category,
    preference,
  });
}

export async function validateNickName(nickname: string) {
  await pipe(
    nickname,
    checkNickNameValidity,
    TE.chain((isValid) => {
      if (!isValid) {
        throw new CallerWrongUsageException(
          ErrorSubCategoryEnum.INVALID_INPUT,
          'invalid nickname',
        );
      }
      return TE.right(true);
    }),
    TE.mapError(() => {
      throw new CallerWrongUsageException(
        ErrorSubCategoryEnum.INVALID_INPUT,
        'invalid nickname',
      );
    }),
  )();

  const duplicate = await validateNickNameDuplication(nickname);
  if (duplicate) {
    throw new CallerWrongUsageException(
      ErrorSubCategoryEnum.INVALID_INPUT,
      'duplicated nickname',
    );
  }
}

export async function validateNickNameDuplication(nickname: string) {
  const res = await getUserByNickname(nickname);
  return res !== undefined;
}

async function createUniqueNickName() {
  const nickname = createRandomNickname();
  const exist = await getUserByNickname(nickname);

  return exist ? createUniqueNickName() : nickname;
}

function createRandomNickname() {
  const nicknameList = getNicknamePartRecord();
  const randomAdj = getRandomItem(nicknameList.adj);
  const randomNameKey = getRandomItem(Object.keys(nicknameList.name));
  const randomName = getRandomItem(
    nicknameList.name[randomNameKey] as string[],
  ).replace(' ', '');

  return `${randomAdj} ${randomName}`;
}

export async function changeUserState(userId: number, state: UserState) {
  await updateUserById(userId, { state });
}

export async function createUserOpinion(params: {
  userId: number;
  category: OpinionCategory;
  type: WithdrawalTypeEnum;
  opinion?: string;
}) {
  await saveOpinion(params);
}

export const _private = {
  createRandomNickname,
  createUser,
};
