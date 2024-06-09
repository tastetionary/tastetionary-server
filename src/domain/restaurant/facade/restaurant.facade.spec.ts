import { areaEntityFactory } from '@root/test/factory/user.factory';
import {
  getFilterOptions,
  getReviewFilterOptions,
  getRecommendations,
  getReviews,
  registerReview,
} from '@domain/restaurant/facade/restaurant.facade';
import * as userService from '@domain/user/service/user.service';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';

describe('facade', () => {
  describe('getRecommendations', () => {
    it('with not area user should throw error', async () => {
      const userId = 99;
      await expect(
        getRecommendations({
          userId,
          maxDistanceMeter: 100,
          keywords: ['clean'],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        }),
      ).rejects.toThrowError(CallerWrongDomainRuleException);
    });
  });
});

describe('registerReview', () => {
  it('with not register activity_area, should not register review', async () => {
    const userId = 99;
    const entity = areaEntityFactory({ userId });
    entity.activityArea = null;
    jest.spyOn(userService, 'searchAreas').mockResolvedValueOnce(entity);

    await expect(
      registerReview({
        userId,
        externalDto: '' as any,
        dto: '' as any,
      }),
    ).rejects.toThrowError(CallerWrongDomainRuleException);
  });
});

describe('getReviews', () => {
  it('getReviews should return data', async () => {
    const res = await getReviews({ restaurantId: 1n });
    expect(res).not.toBeNull();
    expect(res.data).toHaveLength(0);
  });
});

describe('getFilterOptions', () => {
  it('getFilterOptions should return data', () => {
    const res = getFilterOptions();
    expect(res).toHaveProperty('categories');
    expect(res).toHaveProperty('keywords');
    expect(res).toHaveProperty('prices');
  });
});

describe('getReviewFilterOptions', () => {
  it('getFilterOptions should return data', () => {
    const res = getReviewFilterOptions();
    expect(res).toHaveProperty('categories');
    expect(res).toHaveProperty('keywords');
    expect(res).toHaveProperty('prices');
  });
});
