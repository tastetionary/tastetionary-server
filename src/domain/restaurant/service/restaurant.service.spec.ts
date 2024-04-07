import { truncateTables } from '@root/jest.setup';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { ExternalRestaurantInformationDTO } from '@domain/restaurant/dto/restaurant.dto';
import {
  aggregateRestaurantReview,
  createReview,
  findExternalRestaurant,
  getRecommendedRestaurant,
  getReviews,
  getSearchOptions,
  getRestaurantReviews,
  _private,
} from '@domain/restaurant/service/restaurant.service';
import { EmptyContentException } from '@common/exception/internal.exception';
import prismaClient from '@root/src/common/database/prisma';
import * as repo from '@domain/restaurant/repository/restaurant.repository';
import { areaEntityFactory } from '@root/test/factory/user.factory';
import * as userService from '@domain/user/service/user.service';
import {
  externalRestaurantInformationRecordFactory,
  restaurantReviewRecordFactory,
} from '@root/test/factory/restaurant.factory';
import { profileEntityFactory } from '@root/test/factory/user.factory';

describe('restaurant service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'user_areas',
      'restaurant_reviews',
      'external_restaurant_informations',
    ]);
  });

  const LATITUDE = 37.517331925853;
  const LONGITUDE = 127.047377408384;
  const DTO = {
    category: RestaurantCategory.ASIAN,
    keywords: ['clean🥰'],
    price: 10_000,
    summary: 'never come again',
    opinion: 'N',
  };

  const EXTERNAL_DTO: ExternalRestaurantInformationDTO = {
    externalUUID: 123123,
    name: 'some',
    latitude: LATITUDE,
    longitude: LONGITUDE,
    referenceLink: 'https://www.naver.com',
  };

  describe('aggregateRestaurant', () => {
    it('should calc average price and filter duplicated keywords', () => {
      const reviews = [
        {
          id: 1,
          external_restaurant_information_id: 1n,
          userId: 1,
          category: RestaurantCategory.ASIAN,
          summary: 'asian',
          opinion: 'Y',
          keywords: ['clean'],
          price: 10_000,
          like: 0,
          dislike: 0,
        },
        {
          id: 2,
          external_restaurant_information_id: 1n,
          userId: 1,
          category: RestaurantCategory.BUFFET,
          summary: 'buffet',
          opinion: 'N',
          keywords: ['kind'],
          price: 15_000,
          like: 0,
          dislike: 0,
        },
        {
          id: 3,
          external_restaurant_information_id: 1n,
          userId: 1,
          category: RestaurantCategory.BUFFET,
          summary: 'buffet',
          opinion: 'N',
          keywords: ['kind'],
          price: 15_000,
          like: 0,
          dislike: 0,
        },
      ];

      const res = aggregateRestaurantReview(reviews);
      expect(res.data.aggregatePrice.avg).toBe(12_500);
      expect(res.data.revisitRatio).toBe(33.3);

      expect(res.data.keywords.length).toBe(2);
    });

    it('aggregatePrice, should return expected', () => {
      const res = _private.aggregatePrice([10000, 15000]);
      expect(res).toEqual({ 10000: 1, 15000: 1, avg: 12500 });

      const resTwo = _private.aggregatePrice([10000, 10000, 15000]);
      expect(resTwo).toEqual({ 10000: 2, 15000: 1, avg: 12500 });
    });
  });

  describe('getRecommendedRestaurant', () => {
    it('should return proper restaurant', async () => {
      const userId = 999;
      const external = externalRestaurantInformationRecordFactory({});
      jest
        .spyOn(repo, 'getExternalRestaurantIdsByDistance')
        .mockResolvedValueOnce([external]);
      const review = restaurantReviewRecordFactory({ id: external.id, userId });
      jest.spyOn(repo, 'getReviewsByConditions').mockResolvedValue([review]);

      const maxDistance = 1000;
      const res = await getRecommendedRestaurant({
        userAreas: areaEntityFactory({ userId }),
        maxDistanceMeter: maxDistance,
        keywords: ['clean'],
        ltePrice: 10_000,
        categories: [RestaurantCategory.ASIAN],
        excludeRestaurantIds: [],
      });
      expect(res.aggregateReviews.keywords).toEqual(['깨끗해요✨']);
      expect(res).not.toBeNull();
    });

    it('with not restaurant within distance, should return null', async () => {
      const userId = 1000;
      const maxDistance = 1000;

      await expect(
        getRecommendedRestaurant({
          userAreas: areaEntityFactory({ userId }),
          maxDistanceMeter: maxDistance,
          keywords: [],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        }),
      ).rejects.toThrow(EmptyContentException);
    });

    it('with no dining area user, should throw error', async () => {
      const userId = 99;
      const entity = areaEntityFactory({ userId });
      entity.diningArea = undefined as any;

      await expect(
        getRecommendedRestaurant({
          userAreas: entity,
          maxDistanceMeter: 1000,
          keywords: [],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        }),
      ).rejects.toThrowError(EmptyContentException);
    });
  });

  describe('createReview', () => {
    it('with new restaurant, should save or update', async () => {
      await _private.registerExternalRestaurantInformationWhenNoData(
        EXTERNAL_DTO,
      );
      const res = await findExternalRestaurant(EXTERNAL_DTO.externalUUID);
      expect(res).not.toBeNull();
    });

    it('should create review and detach emoji', async () => {
      const userId = 99;
      const entity = areaEntityFactory({ userId });
      jest.spyOn(userService, 'searchAreas').mockResolvedValueOnce(entity);

      await createReview({
        userId,
        externalDto: EXTERNAL_DTO,
        dto: DTO,
      });
      const res = await getReviews(userId);

      expect(res).toHaveLength(1);
      expect(res[0].keywords).toEqual(['clean']);
    });
  });

  describe('getSearchOptions', () => {
    it('should get restaurant option', () => {
      const res = getSearchOptions();
      expect(res).toHaveProperty('categories');
      expect(res).toHaveProperty('keywords');
      expect(res).toHaveProperty('prices');
    });
  });

  describe('getReviewsByRestaurantId', () => {
    it('should get reviews by restaurant id', async () => {
      const userId = 999;
      const profile = profileEntityFactory();
      const review = restaurantReviewRecordFactory({ userId });
      jest.spyOn(repo, 'getReviewsByConditions').mockResolvedValue([review]);
      jest.spyOn(userService, 'searchProfile').mockResolvedValueOnce(profile);
      jest.spyOn(repo, 'getUserReviewCount').mockResolvedValue(1);

      const restaurantId = 1n;
      const res = await getRestaurantReviews(restaurantId);
      expect(res).toHaveLength(1);
    });
  });
});
