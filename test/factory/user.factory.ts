import { define, extend, random, sequence } from 'cooky-cutter';
import { AreaRecord } from '@domain/user/repository/area.repository';
import { AreaCategory, UserState } from '@domain/user/user.enum';
import { UserRecord } from '@root/src/domain/user/repository/user.repository';
type model = { id: number };
const baseModel = define<model>({
  id: random,
});

export function userFactory(param?: { state?: UserState }) {
  return extend<model, UserRecord>(baseModel, {
    nickname: (i) => `${i}-nickname`,
    state: param?.state ?? UserState.ACTIVE,
  })();
}

const seoulLatLon = {
  address: 'default seoul',
  lat: 37.56653329687443,
  lon: 126.97792364116825,
};

function areaFactory(param: {
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

export function dinningAreaFactory(userId: number) {
  return areaFactory({ userId, category: AreaCategory.DINING_AREA });
}

export function activityAreaFactory(userId: number) {
  return areaFactory({ userId, category: AreaCategory.ACTIVITY_AREA });
}
