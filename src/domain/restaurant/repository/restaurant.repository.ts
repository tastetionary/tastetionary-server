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
  prices: RestaurantPrice[];
  createdAt?: Date;
  updatedAt?: Date;
  reactions?: RestaurantReviewReactionSummaryRecord[];
}

/**
 * Distinct number of reactions for each reaction type (L: '도움이 돼요', D: '도움이 안돼요')
 * example: { [REACTION_TYPE.L]: 10, [REACTION_TYPE.D]: 2 }
 * @type Record<REACTION_TYPE, number>
 */
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
  prices: RestaurantPrice[];
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
    prices: RestaurantPrice[];
    summary: string;
    opinion?: string;
    externalRestaurantInformationId: bigint;
  }[],
) {
  const data: any[] = params.map((param) => {
    const { prices, externalRestaurantInformationId, ...rest } = param;
    rest['prices'] = [...new Set(prices)];
    rest['external_restaurant_information_id'] =
      externalRestaurantInformationId;
    return rest;
  });
  await prismaClient.restaurantReviews.createMany({ data });
}

export async function getReviewsByUserId(userId: number) {
  const res = await prismaClient.restaurantReviews.findMany({
    where: { userId },
  });
  return res.map((r) => {
    const { category, prices, ...rest } = r;
    const enumCategory = Object.values(RestaurantCategory).find(
      (key) => key == category,
    ) as RestaurantCategory;

    const enumPrice = prices.map((price) => {
      return Object.values(RestaurantPrice).find(
        (key) => key == price,
      ) as RestaurantPrice;
    });

    return { ...rest, category: enumCategory, prices: enumPrice };
  });
}

export async function getUserReviewCount(userId: number) {
  return prismaClient.restaurantReviews.count({ where: { userId } });
}

export async function getReviewById(
  id: number,
  includeDeleted: boolean = false,
) {
  const where = { id };
  if (!includeDeleted) {
    where['deletedAt'] = null;
  }

  const res = await prismaClient.restaurantReviews.findUnique({
    where,
  });
  if (!res) return null;

  const { prices, ...rest } = res;
  const enumPrices = prices.map((price) => {
    return Object.values(RestaurantPrice).find(
      (key) => key == price,
    ) as RestaurantPrice;
  });

  return { ...rest, prices: enumPrices };
}

export async function saveReviewReport(param: {
  userId: number;
  reviewId: number;
  category: ReviewReportCategory;
  content: string;
  imageUrl?: string;
}) {
  await saveReviewReports([param]);
}

export async function saveReviewReports(
  params: {
    userId: number;
    reviewId: number;
    category: ReviewReportCategory;
    content: string;
    imageUrl?: string;
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
  const values = param.map((param) => {
    const baseValues = [
      param.externalUUID,
      param.name,
      Prisma.sql`st_point(${param.location.longitude},${param.location.latitude})`,
      param.referenceLink ?? null,
      new Date(),
      param.address ?? '',
      param.phone ?? '00-0000-0000',
    ];

    return Prisma.sql`(${Prisma.join(baseValues)})`;
  });

  await prismaClient.$queryRaw`
      INSERT INTO external_restaurant_informations (external_uuid, name, location, reference_link, updated_at, address, phone) 
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

export async function getReviewsOrderedByCreatedTime(
  count: number,
): Promise<RestaurantReviewRecord[]> {
  const res = await prismaClient.restaurantReviews.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    take: count,
  });

  return res.map((r) => {
    const { category, prices, ...rest } = r;
    const enumCategory = Object.values(RestaurantCategory).find(
      (key) => key == category,
    ) as RestaurantCategory;

    const enumPrice = prices.map((price) => {
      return Object.values(RestaurantPrice).find(
        (key) => key == price,
      ) as RestaurantPrice;
    });

    return { ...rest, category: enumCategory, prices: enumPrice };
  });
}

export async function getReviewsByConditions(param: {
  restaurantIds?: bigint[];
  keywords?: string[];
  categories?: RestaurantCategory[];
  reviewerId?: number;
  prices?: RestaurantPrice[];
  includeDeleted?: boolean;
}): Promise<RestaurantReviewRecord[]> {
  const condition = {};
  const includeDeleted = param.includeDeleted ?? false;

  if (param.restaurantIds && param.restaurantIds.length >= 1) {
    condition['external_restaurant_information_id'] = {
      in: param.restaurantIds,
    };
  }

  if (param.keywords && param.keywords.length >= 1) {
    condition['keywords'] = { hasSome: param.keywords };
  }

  if (param.prices && param.prices.length > 0) {
    condition['prices'] = {
      hasSome: param.prices,
    };
  }

  if (param.categories) {
    condition['category'] = {
      in: param.categories,
    };
  }

  if (param.reviewerId) {
    condition['userId'] = { equals: param.reviewerId };
  }

  if (!includeDeleted) {
    condition['deletedAt'] = null;
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
    const { category, prices, ...rest } = r;
    const enumCategory = Object.values(RestaurantCategory).find(
      (key) => key == category,
    ) as RestaurantCategory;

    const enumPrice = prices.map((price) => {
      return Object.values(RestaurantPrice).find(
        (key) => key == price,
      ) as RestaurantPrice;
    });

    return { ...rest, category: enumCategory, prices: enumPrice };
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

export function getReportOptionRecord() {
  return Object.entries(ReviewReportCategory).map(([key, value], index) => ({
    id: index,
    key,
    label: value,
  }));
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

export async function markReviewAsDeleted(reviewId: number) {
  return await prismaClient.restaurantReviews.update({
    where: { id: reviewId },
    data: { deletedAt: new Date() },
  });
}

export async function deleteReviewById(reviewId: number) {
  return await prismaClient.restaurantReviews.delete({
    where: { id: reviewId },
  });
}

export async function updateReviewById(param: {
  reviewId: number;
  userId: number;
  keywords: string[];
  category: RestaurantCategory;
  prices: RestaurantPrice[];
  summary: string;
  opinion?: string;
  externalRestaurantInformationId: bigint;
}) {
  const { prices, externalRestaurantInformationId, reviewId, ...rest } = param;
  const data = {
    ...rest,
    prices: [...new Set(prices)],
    external_restaurant_information_id: externalRestaurantInformationId,
  };

  return await prismaClient.restaurantReviews.update({
    where: {
      id: reviewId,
    },
    data,
  });
}
