import { Prisma } from '@prisma/client';
import {
  RestaurantCategory,
  RestaurantKeyword,
  RestaurantPrice,
  RestaurantCategoryIcons,
  RestaurantKeywordEmoji,
} from '@domain/restaurant/restaurant.enum';
import prismaClient from '@root/src/common/database/prisma';

export interface RestaurantReviewRecord {
  id: number;
  external_restaurant_information_id: bigint;
  userId: number;
  category: RestaurantCategory;
  summary: string;
  opinion: string | null;
  keywords: string[];
  price: number;
  like: number;
  dislike: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ExternalRestaurantInformationRecord {
  id: bigint;
  name: string;
  externalUUID: bigint;
  referenceLink: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function saveReview(param: {
  userId: number;
  keywords: string[];
  category: RestaurantCategory;
  price: number;
  summary: string;
  opinion?: string;
  externalRestaurantInformationId: bigint;
}) {
  await saveReviews([param]);
}

export async function saveReviews(
  params: {
    userId: number;
    keywords: string[];
    category: RestaurantCategory;
    price: number;
    summary: string;
    opinion?: string;
    externalRestaurantInformationId: bigint;
  }[],
) {
  const data: any[] = params.map((param) => {
    const { externalRestaurantInformationId, ...rest } = param;
    rest['external_restaurant_information_id'] =
      externalRestaurantInformationId;
    return rest;
  });
  await prismaClient.restaurantReviews.createMany({ data });
}

export async function getReviewsByUserId(userId: number) {
  return prismaClient.restaurantReviews.findMany({ where: { userId } });
}

export async function getUserReviewCount(userId: number) {
  return prismaClient.restaurantReviews.count({ where: { userId } });
}

export async function saveExternalRestaurantInformation(param: {
  externalUUID: bigint;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  referenceLink?: string;
}) {
  await saveExternalRestaurantInformations([param]);
}

export async function saveExternalRestaurantInformations(
  param: {
    externalUUID: bigint;
    name: string;
    location: {
      latitude: number;
      longitude: number;
    };
    referenceLink?: string;
  }[],
) {
  const values = param.map(
    (param) =>
      Prisma.sql`(${param.externalUUID}, ${param.name}, 
        st_point(${param.location.longitude},${param.location.latitude}), 
        ${param.referenceLink},
        ${new Date()})`,
  );
  await prismaClient.$queryRaw`
      INSERT INTO external_restaurant_informations (external_uuid, name, location, reference_link, updated_at) 
      VALUES ${Prisma.join(values)}`;
}

export async function getExternalRestaurantInformation(externalUUid: bigint) {
  return prismaClient.externalRestaurantInformations.findFirst({
    where: { external_uuid: externalUUid },
  });
}

export async function getReviewsByConditions(param: {
  restaurantIds?: bigint[];
  keywords?: string[];
  ltePrice?: number;
  categories?: RestaurantCategory[];
}): Promise<RestaurantReviewRecord[]> {
  const condition = {};

  if (param.restaurantIds && param.restaurantIds.length >= 1) {
    condition['external_restaurant_information_id'] = {
      in: param.restaurantIds,
    };
  }

  if (param.keywords && param.keywords.length >= 1) {
    condition['keywords'] = { hasSome: param.keywords };
  }

  if (param.ltePrice) {
    condition['price'] = { lte: param.ltePrice };
  }

  if (param.categories) {
    condition['category'] = {
      in: param.categories,
    };
  }

  const res = await prismaClient.restaurantReviews.findMany({
    where: condition,
  });

  return res.map((r) => {
    const { category, ...rest } = r;
    const enumCategory = Object.values(RestaurantCategory).find(
      (key) => key == category,
    ) as RestaurantCategory;

    return { ...rest, category: enumCategory };
  });
}

export async function getExternalRestaurantIdsByDistance(param: {
  latitude: number;
  longitude: number;
  maxDistanceMeter?: number;
  excludedIds?: bigint[];
}): Promise<ExternalRestaurantInformationRecord[]> {
  let excludedIds = [0];
  if (param.excludedIds && param.excludedIds.length > 0) {
    excludedIds = param.excludedIds as any;
  }

  const queryRaw = Prisma.sql`
      SELECT id, 
          name, 
          external_uuid as "externalUUID", 
          reference_link as "referenceLink",
          ST_Y(location::geometry) as latitude,
          ST_X(location::geometry) as longitude, 
          ST_Distance(location, ST_MakePoint(${param.longitude}, ${
    param.latitude
  })) as distance
      FROM external_restaurant_informations 
        WHERE id NOT IN (${Prisma.join(excludedIds)})
        AND st_dwithin(location, ST_MakePoint(${param.longitude}, ${
    param.latitude
  }), ${param.maxDistanceMeter})`;

  return await prismaClient.$queryRaw(queryRaw);
}

export function getRestaurantOptionsRecord() {
  const categories = Object.values(RestaurantCategory).map(
    (category, index) => {
      return {
        id: index,
        name: category,
        icon: RestaurantCategoryIcons[category],
      };
    },
  );

  const keywords = Object.values(RestaurantKeyword).map((keyword, index) => {
    return {
      id: index,
      name: keyword + RestaurantKeywordEmoji[keyword],
    };
  });

  const prices = Object.values(RestaurantPrice).map((price, index) => {
    return {
      id: index,
      name: price,
    };
  });

  return {
    categories,
    keywords,
    prices,
  };
}
