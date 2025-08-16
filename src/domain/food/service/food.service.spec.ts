import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRecommendedFood } from '@domain/food/service/food.service';
import { EmptyContentException } from '@root/src/common/exception/internal.exception';
import * as redisOperations from '@common/redis/redis.operations';

jest.mock('@common/redis/redis.operations', () => ({
  redisGet: jest.fn(),
  redisSet: jest.fn(),
  redisExpire: jest.fn(),
}));

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
    const res = await getRecommendedFood(data);
    expect(res).not.toBeNull();
  });

  it('with no data, should throw error', async () => {
    await expect(
      getRecommendedFood({
        keywords: [FoodKeyword.RICH],
        categories: [FoodCategory.SALAD],
      }),
    ).rejects.toThrow(EmptyContentException);
  });
});
