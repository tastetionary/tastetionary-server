import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRecommendedFood } from '@domain/food/service/food.service';
import { EmptyContentException } from '@root/src/common/exception/internal.exception';
import { RedisService } from '@common/redis/redis.service';

const mockRedisService = {
  get: jest.fn(),
  set: jest.fn(),
  expire: jest.fn(),
} as unknown as RedisService;

describe('service', () => {
  const data = {
    categories: [FoodCategory.KOREAN, FoodCategory.CHINESE],
    keywords: [FoodKeyword.SPICY, FoodKeyword.GREASY],
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  it('should get recommend Food', async () => {
    const res = await getRecommendedFood(mockRedisService, data);
    expect(res).not.toBeNull();
  });

  it('with no data, should throw error', async () => {
    await expect(
      getRecommendedFood(mockRedisService, {
        keywords: [FoodKeyword.RICH],
        categories: [FoodCategory.SALAD],
      }),
    ).rejects.toThrow(EmptyContentException);
  });
});
