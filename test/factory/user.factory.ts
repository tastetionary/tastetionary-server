import { define, extend, random } from 'cooky-cutter';
import { AreaCategory, UserState } from '@domain/user/user.enum';
import {
  AreaEntity,
  AuthEntity,
  UserEntity,
} from '@domain/user/service/user.service';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
type model = { id: number };
const baseModel = define<model>({
  id: random,
});

export function profileEntityFactory() {
  const user = userEntityFactory();
  const authList = authEntityFactory({ userId: user.id });
  const areas = areaEntityFactory({ userId: user.id });

  return {
    user,
    areas,
    authList,
  };
}

export function userEntityFactory(param?: { state?: UserState }) {
  return extend<model, UserEntity>(baseModel, {
    nickname: (i) => `${i}-nickname`,
    state: param?.state ?? UserState.ACTIVE,
    property: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  })();
}

export function authEntityFactory(param: {
  userId?: number;
  accountState?: AuthenticationState;
  companyState?: AuthenticationState;
}) {
  return define<AuthEntity>({
    account: () => {
      return {
        id: random(),
        category: AuthenticationCategory.ACCOUNT,
        type: AuthenticationType.EMAIL,
        state: param.accountState || AuthenticationState.DONE,
        userId: param.userId || random(),
        identification: `${random()}@ide.com`,
      };
    },
    company: () => {
      return {
        id: random(),
        category: AuthenticationCategory.COMPANY,
        type: AuthenticationType.EMAIL,
        state: param.companyState || AuthenticationState.DONE,
        userId: param.userId || random(),
        identification: `${random()}@ide.com`,
      };
    },
  })();
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
