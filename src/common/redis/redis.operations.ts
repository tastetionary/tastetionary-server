import { getRedisClient } from './redis.client';

export async function redisGet(key: string): Promise<string | null> {
  const client = await getRedisClient();
  return client.get(key);
}

export async function redisSet(key: string, value: string): Promise<void> {
  const client = await getRedisClient();
  await client.set(key, value);
}

export async function redisExpire(
  key: string,
  seconds: number,
): Promise<boolean> {
  const client = await getRedisClient();
  return client.expire(key, seconds);
}

export async function redisKeys(pattern: string): Promise<string[]> {
  const client = await getRedisClient();
  return client.keys(pattern);
}
