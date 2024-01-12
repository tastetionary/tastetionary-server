import {
  AgreementDTO,
  AreaDto,
  CompanyDto,
  RegisterUserDTO,
  UserPropertyDto,
} from '@domain/user/dto/user.dto';
import {
  WithdrawalTypeEnum,
  AreaCategory,
  OpinionCategory,
  UserState,
} from '@domain/user/user.enum';
import { getRandomItem } from '@common/util';
import { syncAuthentication } from '@domain/authentication/service/authentication.service';
import { CallerWrongUsageException } from '@common/exception/internal.exception';
import { ErrorNameEnum } from '@common/exception/enum';
import {
  AreaRecord,
  deleteAreas,
  getAreasByUserId,
  saveAreas,
} from '@domain/user/repository/area.repository';
import {
  getNicknamePartRecord,
  getUserById,
  saveOpinion,
  saveUser,
  updateUserById,
} from '@domain/user/repository/user.repository';
import { saveAgreements } from '@domain/user/repository/agreements.repository';
import {
  AuthenticationRecord,
  getAuthenticationsByUserId,
} from '@domain/authentication/repository/authentication.repository';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';

export async function searchProfile(userId: number) {
  const user = await searchUser(userId);
  if (!user) {
    throw new CallerWrongUsageException(
      ErrorNameEnum.NO_DATA,
      `user not found: ${userId}`,
    );
  }
  const areas = await searchAreas(userId);
  const authList = await searchAuthList(userId);
  return {
    user,
    areas,
    authList,
  };
}

export type UserEntity = Awaited<ReturnType<typeof searchUser>>;
async function searchUser(userId: number) {
  const user = await getUserById(userId);
  return {
    ...user,
  };
}

export type AreaEntity = Awaited<ReturnType<typeof searchAreas>>;
export async function searchAreas(userId: number) {
  const transformer = (areas: AreaRecord[], target: AreaCategory) => {
    const area = areas.find((area) => area.category == target);
    if (!area) {
      return undefined;
    }
    const { category, ...data } = area;
    return {
      ...data,
      category: target,
    };
  };

  const areas = await getAreasByUserId(userId);
  const data = {
    diningArea: transformer(areas, AreaCategory.DINING_AREA),
    activityArea: transformer(areas, AreaCategory.ACTIVITY_AREA),
  };
  return {
    ...data,
    diningArea: data.diningArea as NonNullable<typeof data.diningArea>,
  };
}

export type AuthEntity = Awaited<ReturnType<typeof searchAuthList>>;
async function searchAuthList(userId: number) {
  const transformer = (
    authList: AuthenticationRecord[],
    target: AuthenticationCategory,
  ) => {
    const area = authList.find((auth) => auth.category == target);
    if (!area) {
      return undefined;
    }
    const { category, ...data } = area;
    return {
      ...data,
      category: target,
    };
  };

  const authList = await getAuthenticationsByUserId(userId);
  const data = {
    company: transformer(authList, AuthenticationCategory.COMPANY),
    account: transformer(authList, AuthenticationCategory.ACCOUNT),
  };
  return {
    ...data,
    account: data.account as NonNullable<typeof data.account>,
  };
}

export async function createProfile(dto: RegisterUserDTO) {
  const user = await createUser(dto.userProperty);
  await createAgreements(user.id, dto.agreements);
  await createAreas(user.id, dto.areas);

  return user;
}

async function createAreas(userId: number, dtoList: AreaDto[]) {
  const areas = dtoList.map((dto) => {
    return {
      userId,
      order: 0,
      category: dto.category,
      address: dto.address,
      location: { latitude: dto.latitude, longitude: dto.longitude },
    };
  });
  await saveAreas(areas);
}

async function createAgreements(userId: number, dtoList: AgreementDTO[]) {
  const params = dtoList.map((dto) => {
    return { userId, ...dto };
  });
  await saveAgreements(params);
}

export async function createUser(dto: UserPropertyDto) {
  const user = await saveUser({
    state: UserState.ACTIVE,
    nickname: createRandomNickname(),
    property: {},
  });

  if (dto.companyData) {
    await changeCompany(user.id, dto.companyData);
  }

  return user;
}

async function changeCompany(userId: number, dto: CompanyDto) {
  await syncAuthentication(userId, dto.authenticationId);
  return await updateUserById(userId, {
    property: { companyName: dto.companyName },
  });
}

export async function changeArea(userId: number, dto: AreaDto) {
  await deleteAreas({ userId, category: dto.category });
  await createAreas(userId, [dto]);
}

function createRandomNickname() {
  const nicknameList = getNicknamePartRecord();
  const randomAdj = getRandomItem(nicknameList.adj);
  const randomNameKey = getRandomItem(Object.keys(nicknameList.name));
  const randomName = getRandomItem(nicknameList.name[randomNameKey]);

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
  changeCompany,
};
