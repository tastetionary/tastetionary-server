import { Inject, Injectable } from '@nestjs/common';
import {
  AgreementDTO,
  AreaDto,
  CompanyDto,
  RegisterUserDTO,
  UserPropertyDto,
} from '@domain/user/dto/user.dto';
import {
  AccountService,
  register as registerAuth,
} from '@domain/account/service/account.service';
import * as nicknameSource from '@domain/user/resource/nickname.json';
import { UserState } from '@domain/user/user.enum';
import { getRandomItem } from '@common/util';
import { EndUser } from '@domain/user/core/end-user';
import {
  AuthenticationService,
  syncAuthentication,
} from '@domain/authentication/service/authentication.service';
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

export type AreaEntity = AreaRecord;
export type UserEntity = {
  readonly id: number;
  readonly nickname: string;
  readonly state: string;
  readonly areas: AreaEntity[];
};

function transformToUserEntity(
  user: {
    id: number;
    nickname: string;
    state: string;
  },
  areas: AreaRecord[],
): UserEntity {
  return {
    id: user.id,
    nickname: user.nickname,
    state: user.state,
    areas,
  };
}

export function getUser(userId: number) {}

export async function registerUser(dto: RegisterUserDTO) {
  const user = await createUser(dto.userProperty);

  await createAgreements(user.id, dto.agreements);
  await createAreas(user.id, dto.areas);
  await registerAuth(user.id, dto.account);

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

async function createUser(dto: UserPropertyDto) {
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

@Injectable()
export class UserService {
  @Inject(AccountService)
  private readonly accountService: AccountService;

  @Inject(AuthenticationService)
  private readonly authenticationService: AuthenticationService;

  async getEndUser(userId: number) {
    const user = await getUserById(userId);
    if (!user) {
      throw new CallerWrongUsageException(
        ErrorNameEnum.NO_DATA,
        `user not found: ${userId}`,
      );
    }
    const areas = await getAreasByUserId(userId);
    return new EndUser(user, { areas });
  }

  async register(dto: RegisterUserDTO) {
    const user = await this.registerUser(dto.userProperty);

    await this.registerAgreements(user.id, dto.agreements);

    await this.registerArea(user.id, dto.areas);

    await this.accountService.register(user.id, dto.account);
    return user;
  }

  private async registerArea(userId: number, dtoList: AreaDto[]) {
    const areaParams = dtoList.map((dto) => {
      return {
        userId,
        order: 0,
        category: dto.category,
        address: dto.address,
        location: { latitude: dto.latitude, longitude: dto.longitude },
      };
    });
    await saveAreas(areaParams);
  }

  private async registerAgreements(userId: number, dtoList: AgreementDTO[]) {
    const params = dtoList.map((dto) => {
      return { userId, ...dto };
    });
    await saveAgreements(params);
  }

  private async registerUser(dto: UserPropertyDto) {
    const nickname = this.getNickname();

    const user = await saveUser({
      state: UserState.ACTIVE,
      nickname,
      property: {},
    });
    if (dto.companyData) {
      await this.authenticationService.syncAuthentication({
        userId: user.id,
        authenticationId: dto.companyData.authenticationId,
      });
      await updateUserById(user.id, {
        property: { companyName: dto.companyData.companyName },
      });
    }
    return user;
  }

  protected getNickname() {
    const nicknameList = this.getNicknameFromSource();
    const randomAdj = getRandomItem(nicknameList.adj);
    const randomNameKey = getRandomItem(Object.keys(nicknameList.name));
    const randomName = getRandomItem(nicknameList.name[randomNameKey]);

    return `${randomAdj} ${randomName}`;
  }

  private getNicknameFromSource(): {
    adj: string[];
    name: {
      animal: string[];
      food: string[];
      cooking: string[];
    };
  } {
    return nicknameSource;
  }

  // TODO modify to use area-id and update, not delete and insert
  async updateArea(userId: number, dto: AreaDto) {
    await deleteAreas({ userId, category: dto.category });
    await this.registerArea(userId, [dto]);
    return true;
  }
}
