import { getRedisClient } from '@common/redis/redis.client';

export const METRIC_RETENTION_DAYS = 90;

const RETENTION_SECONDS = METRIC_RETENTION_DAYS * 24 * 60 * 60;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

export const RECOMMENDATION_TYPES = ['food', 'restaurant'] as const;

export type RecommendationType = (typeof RECOMMENDATION_TYPES)[number];

export interface RecommendationMetricSummary {
  total: number;
  periodTotal: number;
  daily: Record<string, number>;
}

export interface RecommendationMetrics {
  collectedAt: string;
  timezone: string;
  days: number;
  food: RecommendationMetricSummary;
  restaurant: RecommendationMetricSummary;
}

function toDateKey(date: Date): string {
  return new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);
}

function recentDateKeys(days: number): string[] {
  const now = Date.now();
  return Array.from({ length: days }, (_, index) =>
    toDateKey(new Date(now - index * 24 * 60 * 60 * 1000)),
  );
}

function totalKey(type: RecommendationType): string {
  return `metric:reco:${type}:total`;
}

function dailyKey(type: RecommendationType, dateKey: string): string {
  return `metric:reco:${type}:${dateKey}`;
}

export async function incrementRecommendation(
  type: RecommendationType,
): Promise<void> {
  const client = await getRedisClient();
  const key = dailyKey(type, toDateKey(new Date()));

  await client
    .multi()
    .incr(totalKey(type))
    .incr(key)
    .expire(key, RETENTION_SECONDS)
    .exec();
}

export async function getRecommendationMetrics(
  days: number,
): Promise<RecommendationMetrics> {
  const client = await getRedisClient();
  const dateKeys = recentDateKeys(days);

  const keys = RECOMMENDATION_TYPES.flatMap((type) => [
    totalKey(type),
    ...dateKeys.map((dateKey) => dailyKey(type, dateKey)),
  ]);

  const values = await client.mGet(keys);
  const counts = values.map((value) => Number(value ?? 0));

  const summaries = RECOMMENDATION_TYPES.map((type, typeIndex) => {
    const offset = typeIndex * (dateKeys.length + 1);
    const daily = Object.fromEntries(
      dateKeys.map((dateKey, dayIndex) => [
        dateKey,
        counts[offset + 1 + dayIndex],
      ]),
    );

    return {
      total: counts[offset],
      periodTotal: Object.values(daily).reduce((sum, count) => sum + count, 0),
      daily,
    } satisfies RecommendationMetricSummary;
  });

  const [food, restaurant] = summaries;

  return {
    collectedAt: new Date().toISOString(),
    timezone: 'Asia/Seoul',
    days,
    food,
    restaurant,
  };
}
