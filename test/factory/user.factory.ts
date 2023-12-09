import { define, extend, random, sequence } from 'cooky-cutter';
import { AreaRecord } from '@domain/user/repository/area.repository';
import { AreaCategory, UserState } from '@domain/user/user.enum';
import { UserRecord } from '@domain/user/repository/user.repository';
import { userEntity, areaEntity } from '@domain/user/service/user.service';
type model = { id: number };
const baseModel = define<model>({
  id: random,
});

export function userEntityFactory(param?: {
  state?: UserState;
  dinningArea?: areaEntity;
  activityArea?: areaEntity;
}) {
  const user = userRecordFactory({ state: param?.state });
  const diningArea = param?.dinningArea ?? dinningAreaFactory(user.id);

  let activityArea: undefined | AreaRecord = undefined;
  if (param && param?.activityArea == undefined) {
    activityArea = undefined;
  } else {
    activityArea = activityAreaFactory(user.id);
  }

  return extend<model, userEntity>(baseModel, {
    nickname: user.nickname,
    state: user.state,
    dinningArea: () => diningArea,
    activityArea: () => activityArea,
  })();
}

export function userRecordFactory(param?: { state?: UserState }) {
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
