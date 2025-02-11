import { areaEntityFactory } from '@root/test/factory/user.factory';
import {
  getFilterOptions,
  getReviewFilterOptions,
  getRecommendations,
  getReviews,
  registerReview,
  getNearByRestaurants,
} from '@domain/restaurant/facade/restaurant.facade';
import * as userService from '@domain/user/service/user.service';
import { CallerWrongDomainRuleException } from '@common/exception/internal.exception';
import {
  RestaurantCategory,
  RestaurantPrice,
} from '@domain/restaurant/restaurant.enum';

describe('facade', () => {
  describe('getRecommendations', () => {
    it('with not area user should throw error', async () => {
      const userId = 99;
      await expect(
        getRecommendations({
          userId,
          maxDistanceMeter: 100,
          keywords: ['clean'],
          prices: [RestaurantPrice.OVER_20000],
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
    jest.spyOn(userService, 'searchAreas').mockResolvedValueOnce(null as any);

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

describe('getNearbyRestaurants', () => {
  it('getNearbyRestaurants should return data', async () => {
    const userId = 99;

    await expect(
      getNearByRestaurants({
        userId,
        maxDistanceMeter: 100,
        latitude: 10,
        longitude: 10,
      }),
    ).rejects.toThrowError(CallerWrongDomainRuleException);
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
