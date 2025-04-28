import { define, extend, random } from 'cooky-cutter';
import { UserState } from '@domain/user/user.enum';
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
import { AccountEntity } from '@root/src/domain/account/service/account.service';
import { AccountCategory } from '@root/src/domain/account/account.enum';
type model = { id: number };
const baseModel = define<model>({
  id: random,
});

export function profileEntityFactory() {
  const user = userEntityFactory();
  const account = accountEntityFactory({ userId: user.id });
  const area = areaEntityFactory({ userId: user.id });

  return {
    user,
    area,
    account,
  };
}

export function userEntityFactory(param?: { state?: UserState }) {
  return extend<model, UserEntity>(baseModel, {
    nickname: (i) => `${i}-nickname`,
    state: param?.state ?? UserState.ACTIVE,
    property: {},
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
  })();
}

export function authEntityFactory(param: {
  userId?: number;
  accountState?: AuthenticationState;
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
  })();
}

export function accountEntityFactory(param: {
  userId?: number;
  identification?: string;
  password?: string;
}) {
  return define<AccountEntity>({
    id: random(),
    userId: param.userId || random(),
    identification: param.identification || `${random()}@ide.com`,
    password: param.password || 'password',
    category: AccountCategory.EMAIL,
    requirePassChange: false,
    createdAt: new Date(),
    updatedAt: new Date(),
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
  return define<AreaEntity>({
        id: random(),
        userId: param.userId ?? random(),
        order: 1,
        address: `factory_${location.address}`,
        latitude: location.lat,
        longitude: location.lon,
  })();
}
