import { Prisma, REACTION_TYPE } from '@prisma/client';
import {
  RestaurantCategory,
  RestaurantKeyword,
  RestaurantPrice,
  RestaurantCategoryIcons,
  RestaurantKeywordEmoji,
  ReviewReportCategory,
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
  createdAt?: Date;
  updatedAt?: Date;
  reactions?: RestaurantReviewReactionSummaryRecord[];
}

export type RestaurantReviewRxnDistinctCnt = Record<REACTION_TYPE, number>;

export interface RestaurantReviewReactionRecord {
  id: number;
  userId: number;
  reviewId: number;
  reactionType: REACTION_TYPE;
  createdAt?: Date;
  updatedAt?: Date;
}

export type RestaurantReviewReactionSummaryRecord = Pick<
  RestaurantReviewReactionRecord,
  'userId' | 'reactionType'
>;

export interface ExternalRestaurantInformationRecord {
  id: bigint;
  name: string;
  externalUUID: bigint;
  referenceLink: string | null;
  latitude: number;
  longitude: number;
  distance: number;
  address?: string;
  phone?: string;
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

export async function getReviewById(id: number) {
  return prismaClient.restaurantReviews.findUnique({ where: { id } });
}

export async function saveReviewReport(param: {
  userId: number;
  reviewId: number;
  category: ReviewReportCategory;
  content: string;
}) {
  await saveReviewReports([param]);
}

export async function saveReviewReports(
  params: {
    userId: number;
    reviewId: number;
    category: ReviewReportCategory;
    content: string;
  }[],
) {
  await prismaClient.reviewReports.createMany({ data: params });
}

export async function getReviewReportById(id: number) {
  return prismaClient.reviewReports.findUnique({ where: { id } });
}

export async function saveExternalRestaurantInformation(param: {
  externalUUID: bigint;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  referenceLink?: string;
  address?: string;
  phone?: string;
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
    address?: string;
    phone?: string;
  }[],
) {
  const values = param.map(
    (param) =>
      Prisma.sql`(${param.externalUUID}, ${param.name}, 
        st_point(${param.location.longitude},${param.location.latitude}), 
        ${param.referenceLink},
        ${param.address},
        ${param.phone},
        ${new Date()})`,
  );
  await prismaClient.$queryRaw`
      INSERT INTO external_restaurant_informations (external_uuid, name, location, reference_link, address, phone, updated_at) 
      VALUES ${Prisma.join(values)}`;
}

export async function getExternalRestaurantInformation(externalUUid: bigint) {
  return prismaClient.externalRestaurantInformations.findFirst({
    where: { external_uuid: externalUUid },
  });
}

export async function getExternalRestaurantInformationById(id: number) {
  return prismaClient.externalRestaurantInformations.findUnique({
    where: { id },
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
    include: {
      reactions: {
        select: {
          userId: true,
          reactionType: true,
        },
      },
    },
  });

  return res.map((r) => {
    const { category, ...rest } = r;
    const enumCategory = Object.values(RestaurantCategory).find(
      (key) => key == category,
    ) as RestaurantCategory;

    return { ...rest, category: enumCategory };
  });
}

function getRestaurantRxnDistinctCnt(
  reactionList: Array<{ userId: number; reactionType: REACTION_TYPE }>,
): RestaurantReviewRxnDistinctCnt {
  const map: RestaurantReviewRxnDistinctCnt = Object.values(
    REACTION_TYPE,
  ).reduce(
    (map, key) => ({ ...map, [key]: 0 }),
    {} as RestaurantReviewRxnDistinctCnt,
  );
  reactionList.forEach(({ reactionType }) => map[reactionType]++);
  return map;
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
    ST_Distance(location, ST_MakePoint(cast(${
      param.longitude
    } as numeric), cast(${param.latitude} as numeric))) as distance
  FROM external_restaurant_informations
  WHERE id NOT IN (${Prisma.join(excludedIds)})
    AND st_dwithin(location, ST_MakePoint(cast(${
      param.longitude
    } as numeric), cast(${param.latitude} as numeric)), ${
    param.maxDistanceMeter
  })`;
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

export async function saveReviewReaction(params: {
  userId: number;
  reviewId: number;
  reactionType: REACTION_TYPE;
}): Promise<void> {
  const data = {
    userId: params.userId,
    reviewId: params.reviewId,
    reactionType: params.reactionType,
  };
  await prismaClient.restaurantReviewReactions.upsert({
    create: data,
    update: data,
    where: {
      userId_reviewId: { userId: params.userId, reviewId: params.reviewId },
    },
  });
}

export async function deleteReviewReaction(params: {
  userId: number;
  reviewId: number;
}): Promise<void> {
  await prismaClient.restaurantReviewReactions.delete({
    where: {
      userId_reviewId: { userId: params.userId, reviewId: params.reviewId },
    },
  });
}
