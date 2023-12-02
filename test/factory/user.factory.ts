import { define, extend, random, sequence } from 'cooky-cutter';
import { AreaRecord } from '@domain/user/repository/area.repository';
import { AreaCategory } from '@domain/user/user.enum';
type Model = { id: number };
const baseModel = define<Model>({
  id: random,
});

const seoulLatLon = {
  address: 'default seoul',
  lat: 37.56653329687443,
  lon: 126.97792364116825,
};

const area = (param: {
  userId?: number;
  location?: { address: string; lat: number; lon: number };
  category: AreaCategory;
}) => {
  const location = param.location ?? seoulLatLon;
  return extend<Model, AreaRecord>(baseModel, {
    userId: param.userId ?? random,
    category: param.category ?? AreaCategory.DINING_AREA,
    order: sequence,
    address: () => `${param.userId} ${location.address}`,
    latitude: location.lat,
    longitude: location.lon,
  })();
};

export function dinningAreaFactory(userId: number) {
  return area({ userId, category: AreaCategory.DINING_AREA });
}

export function activityAreaFactory(userId: number) {
  return area({ userId, category: AreaCategory.ACTIVITY_AREA });
}
