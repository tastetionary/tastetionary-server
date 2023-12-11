import { define, extend, random, sequence } from 'cooky-cutter';
import { AreaRecord } from '@domain/user/repository/area.repository';
import { AreaCategory, UserState } from '@domain/user/user.enum';
import { UserRecord } from '@domain/user/repository/user.repository';
import { AreaEntity, UserEntity } from '@domain/user/service/user.service';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { AuthenticationRecord } from '@domain/authentication/repository/authentication.repository';
type model = { id: number };
const baseModel = define<model>({
  id: random,
});

export function userEntityFactory(param?: { state?: UserState }) {
  return extend<model, UserEntity>(baseModel, {
    nickname: (i) => `${i}-nickname`,
    state: param?.state ?? UserState.ACTIVE,
    property: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  })();
}

function authRecordFactory(param: {
  userId?: number;
  category?: AuthenticationCategory;
  type?: AuthenticationType;
  state?: AuthenticationState;
}) {
  return extend<model, AuthenticationRecord>(baseModel, {
    userId: param.userId ?? random,
    category: param.category ?? AuthenticationCategory.ACCOUNT,
    type: param.type ?? AuthenticationType.EMAIL,
    state: param.state ?? AuthenticationState.DONE,
    identification: (i) => `${i}@ide.com`,
  })();
}

// TODO entity 변환 로직 추가 해야함
export function accountAuthFactory(userId: number) {
  return authRecordFactory({
    userId,
    category: AuthenticationCategory.ACCOUNT,
  });
}

export function companyAuthFactory(userId: number) {
  return authRecordFactory({
    userId,
    category: AuthenticationCategory.COMPANY,
  });
}

const seoulLatLon = {
  address: 'default seoul',
  lat: 37.56653329687443,
  lon: 126.97792364116825,
};

export function areaEntityFactory(param: {
  userId: number;
  location?: { address: string; lat: number; lon: number };
}) {
  const location = param.location ?? seoulLatLon;
  // TODO order에 sequence 가 왜 안되는지 확인 필요
  return define<AreaEntity>({
    dinningArea: () => {
      return {
        id: random(),
        userId: param.userId ?? random(),
        category: AreaCategory.DINING_AREA,
        order: 1,
        address: `factory_${location.address}`,
        latitude: location.lat,
        longitude: location.lon,
      };
    },
    activityArea: () => {
      return {
        id: random(),
        userId: param.userId ?? random(),
        category: AreaCategory.DINING_AREA,
        order: 1,
        address: `factory_${location.address}`,
        latitude: location.lat,
        longitude: location.lon,
      };
    },
  })();
}

function areaRecordFactory(param: {
  userId?: number;
  location?: { address: string; lat: number; lon: number };
  category: AreaCategory;
}) {
  const location = param.location ?? seoulLatLon;
  return extend<model, AreaRecord>(baseModel, {
    userId: param.userId ?? random,
    category: param.category ?? AreaCategory.DINING_AREA,
    order: sequence,
    address: () => `${param.userId} ${location.address}`,
    latitude: location.lat,
    longitude: location.lon,
  })();
}

// TODO entity 변환 로직 추가 해야함
export function dinningAreaFactory(userId: number) {
  return areaRecordFactory({ userId, category: AreaCategory.DINING_AREA });
}

export function activityAreaFactory(userId: number) {
  return areaRecordFactory({ userId, category: AreaCategory.ACTIVITY_AREA });
}
