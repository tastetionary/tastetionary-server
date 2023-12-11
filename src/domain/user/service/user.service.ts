import {
  AgreementDTO,
  AreaDto,
  CompanyDto,
  RegisterUserDTO,
  UserPropertyDto,
} from '@domain/user/dto/user.dto';
import { AreaCategory, UserState } from '@domain/user/user.enum';
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
  saveUser,
  updateUserById,
} from '@domain/user/repository/user.repository';
import { saveAgreements } from '@domain/user/repository/agreements.repository';
import {
  AuthenticationRecord,
  getAuthenticationsByUserId,
} from '@domain/authentication/repository/authentication.repository';
import { AuthenticationCategory } from '@domain/authentication/authentication.enum';
import { createAuth } from '@domain/account/service/account.service';

export type areaEntity = AreaRecord;
export type authEntity = AuthenticationRecord;
export type userEntity = {
  readonly id: number;
  readonly nickname: string;
  readonly state: string;
  readonly dinningArea: areaEntity;
  readonly activityArea?: areaEntity;

  readonly accountEmail: authEntity;
  readonly companyEmail?: authEntity;
};

function transformToUserEntity(
  user: {
    id: number;
    nickname: string;
    state: string;
  },
  areas: AreaRecord[],
  authList: AuthenticationRecord[],
): userEntity {
  const areaParser = (category) =>
    areas?.find((area) => area.category === category);
  const authParser = (category) =>
    authList?.find((auth) => auth.category === category);

  return {
    id: user.id,
    nickname: user.nickname,
    state: user.state,
    dinningArea: areaParser(AreaCategory.DINING_AREA) as areaEntity,
    activityArea: areaParser(AreaCategory.ACTIVITY_AREA),
    accountEmail: authParser(AuthenticationCategory.ACCOUNT) as authEntity,
    companyEmail: authParser(AuthenticationCategory.COMPANY),
  };
}

export async function getProfileLegacy(userId: number) {
  const user = await getUserById(userId);
  if (!user) {
    throw new CallerWrongUsageException(
      ErrorNameEnum.NO_DATA,
      `user not found: ${userId}`,
    );
  }
  const areas = await getAreasByUserId(userId);
  const authList = await getAuthenticationsByUserId(userId);
  return transformToUserEntity({ ...user }, areas, authList);
}

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
async function searchAreas(userId: number) {
  const areas = await getAreasByUserId(userId);
  return {
    dinningArea: areas.find(
      (area) => area.category == AreaCategory.DINING_AREA,
    ),
    activityArea: areas.find(
      (area) => area.category == AreaCategory.ACTIVITY_AREA,
    ),
  };
}

export type AuthEntity = Awaited<ReturnType<typeof searchAuthList>>;
async function searchAuthList(userId: number) {
  const authList = await getAuthenticationsByUserId(userId);
  return {
    account: authList.find(
      (auth) => auth.category == AuthenticationCategory.ACCOUNT,
    ),
    company: authList.find(
      (auth) => auth.category == AuthenticationCategory.COMPANY,
    ),
  };
}

export async function createProfile(dto: RegisterUserDTO) {
  const user = await createUser(dto.userProperty);
  await createAgreements(user.id, dto.agreements);
  await createAreas(user.id, dto.areas);
  await createAuth(user.id, dto.account);

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

export const _private = {
  createRandomNickname,
  createUser,
  changeCompany,
};
