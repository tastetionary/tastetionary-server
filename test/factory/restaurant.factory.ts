import { define, extend, random } from 'cooky-cutter';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import {
  ExternalRestaurantInformationRecord,
  RestaurantReviewRecord,
} from '@domain/restaurant/repository/restaurant.repository';

type model = { id: number };
const baseModel = define<model>({
  id: random,
});

export function externalRestaurantInformationRecordFactory(param: {
  location?: { lat: number; lon: number };
  distanceMeter?: number;
}) {
  return define<ExternalRestaurantInformationRecord>({
    id: BigInt(random()),
    name: 'name',
    externalUUID: BigInt(1),
    referenceLink: 'link',
    latitude: param.location?.lat || 37.56653329687443,
    longitude: param.location?.lon || 126.97792364116825,
    distance: param.distanceMeter || 1_000,
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
  })();
}

export function restaurantReviewRecordFactory(param: {
  id?: bigint;
  userId: number;
  category?: RestaurantCategory;
  keywords?: string[];
  price?: number;
  like?: number;
  dislike?: number;
  summary?: string;
  opinion?: string;
}) {
  return extend<model, RestaurantReviewRecord>(baseModel, {
    external_restaurant_information_id: param.id || BigInt(random()),
    userId: param.userId,
    category: param.category || RestaurantCategory.ASIAN,
    summary: param.summary || '',
    opinion: param.opinion || '',
    keywords: () => {
      return param.keywords || ['깨끗해요'];
    },
    price: param.price || 10_000,
    like: param.like || 0,
    dislike: param.dislike || 0,
    createdAt: () => new Date(),
    updatedAt: () => new Date(),
  })();
}
