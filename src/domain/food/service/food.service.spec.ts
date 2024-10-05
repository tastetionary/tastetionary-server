import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { getRecommendedFood } from '@domain/food/service/food.service';
import { EmptyContentException } from '@root/src/common/exception/internal.exception';

describe('service', () => {
  const data = {
    categories: [FoodCategory.KOREAN, FoodCategory.CHINESE],
    keywords: [FoodKeyword.SPICY, FoodKeyword.GREASY],
  };

  it('should get recommend Food', async () => {
    const res = getRecommendedFood(data);
    expect(res).not.toBeNull();
  });

  it('with no data, should throw error', () => {
    expect(() => {
      getRecommendedFood({
        keywords: [FoodKeyword.RICH],
        categories: [FoodCategory.SALAD],
      });
    }).toThrowError(EmptyContentException);
  });
});
