import { truncateTables } from '@root/jest.setup';
import {
  RestaurantCategory,
  RestaurantPrice,
} from '@domain/restaurant/restaurant.enum';
import { ExternalRestaurantInformationDTO } from '@domain/restaurant/dto/restaurant.dto';
import {
  aggregateRestaurantReview,
  createReview,
  findExternalRestaurant,
  getRecommendedRestaurant,
  getReviews,
  getSearchOptions,
  getRestaurantReviews,
  getRestaurantReviewsByUserId,
  _private,
  getRecentReviews,
  updateReview,
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
import {
  InternalDomainException,
  CallerWrongUsageException,
} from '@common/exception/internal.exception';

describe('restaurant service', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, [
      'user_areas',
      'restaurant_reviews',
      'external_restaurant_informations',
    ]);

    jest.clearAllMocks();
  });

  const LATITUDE = 37.517331925853;
  const LONGITUDE = 127.047377408384;
  const DTO = {
    category: RestaurantCategory.ASIAN,
    keywords: ['clean🥰'],
    prices: [RestaurantPrice.UNDER_10000],
    summary: 'never come again',
    opinion: 'N',
  };

  const EXTERNAL_DTO: ExternalRestaurantInformationDTO = {
    externalUUID: 123123,
    name: 'some',
    latitude: LATITUDE,
    longitude: LONGITUDE,
    referenceLink: 'https://www.naver.com',
    address: 'test',
    phone: '010-1234-5678',
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
          prices: [RestaurantPrice.UNDER_10000],
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
          prices: [RestaurantPrice.UNDER_16000],
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
          prices: [RestaurantPrice.OVER_20000],
          like: 0,
          dislike: 0,
        },
      ];

      const res = aggregateRestaurantReview(reviews);
      expect(res.data.aggregatePrice.avg).toBe(16000);
      expect(res.data.revisitRatio).toBe(33.3);

      expect(res.data.keywords.length).toBe(2);
    });

    it('aggregatePrice, should return expected', () => {
      const res = _private.aggregatePrice([
        RestaurantPrice.UNDER_10000,
        RestaurantPrice.OVER_20000,
      ]);
      expect(res).toEqual({
        [RestaurantPrice.UNDER_10000]: 1,
        [RestaurantPrice.UNDER_13000]: 0,
        [RestaurantPrice.UNDER_16000]: 0,
        [RestaurantPrice.UNDER_20000]: 0,
        [RestaurantPrice.OVER_20000]: 1,
        avg: 16000,
      });

      const resTwo = _private.aggregatePrice([
        RestaurantPrice.UNDER_10000,
        RestaurantPrice.UNDER_10000,
        RestaurantPrice.UNDER_16000,
      ]);
      expect(resTwo).toEqual({
        [RestaurantPrice.UNDER_10000]: 2,
        [RestaurantPrice.UNDER_13000]: 0,
        [RestaurantPrice.UNDER_16000]: 1,
        [RestaurantPrice.UNDER_20000]: 0,
        [RestaurantPrice.OVER_20000]: 0,
        avg: 10000,
      });
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
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        }),
      ).rejects.toThrow(EmptyContentException);
    });

    it('with no dining area user, should throw error', async () => {
      const userId = 99;
      const entity = undefined as any;

      await expect(
        getRecommendedRestaurant({
          userAreas: entity,
          maxDistanceMeter: 1000,
          keywords: [],
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

  describe('updateReview', () => {
    it('should update review and detach emoji', async () => {
      const userId = 99;
      const entity = areaEntityFactory({ userId });
      jest.spyOn(userService, 'searchAreas').mockResolvedValueOnce(entity);

      await createReview({
        userId,
        externalDto: EXTERNAL_DTO,
        dto: DTO,
      });
      const reviews = await getReviews(userId);
      expect(reviews).toHaveLength(1);

      const updateDto = {
        category: RestaurantCategory.BUFFET,
        keywords: ['clean🥰', 'kind💕'],
        prices: [RestaurantPrice.UNDER_16000],
        summary: 'updated summary',
        opinion: 'Y',
      };

      await updateReview({
        userId,
        reviewId: reviews[0].id,
        dto: updateDto,
      });

      const updatedReviews = await getReviews(userId);
      expect(updatedReviews).toHaveLength(1);
      expect(updatedReviews[0].category).toBe(RestaurantCategory.BUFFET);
      expect(updatedReviews[0].keywords).toEqual(['clean', 'kind']);
      expect(updatedReviews[0].prices).toEqual([RestaurantPrice.UNDER_16000]);
      expect(updatedReviews[0].summary).toBe('updated summary');
      expect(updatedReviews[0].opinion).toBe('Y');
    });

    it('should throw error when review does not exist', async () => {
      const userId = 99;
      const updateDto = {
        category: RestaurantCategory.BUFFET,
        keywords: ['clean🥰'],
        prices: [RestaurantPrice.UNDER_16000],
        summary: 'updated summary',
        opinion: 'Y',
      };

      await expect(
        updateReview({
          userId,
          reviewId: 99999,
          dto: updateDto,
        }),
      ).rejects.toThrow(InternalDomainException);
    });

    it('should throw error when user is not the owner', async () => {
      const userId = 99;
      const otherUserId = 100;
      const entity = areaEntityFactory({ userId });
      jest.spyOn(userService, 'searchAreas').mockResolvedValueOnce(entity);

      await createReview({
        userId,
        externalDto: EXTERNAL_DTO,
        dto: DTO,
      });
      const reviews = await getReviews(userId);
      expect(reviews).toHaveLength(1);

      const updateDto = {
        category: RestaurantCategory.BUFFET,
        keywords: ['clean🥰'],
        prices: [RestaurantPrice.UNDER_16000],
        summary: 'updated summary',
        opinion: 'Y',
      };

      await expect(
        updateReview({
          userId: otherUserId,
          reviewId: reviews[0].id,
          dto: updateDto,
        }),
      ).rejects.toThrow(CallerWrongUsageException);
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
      expect(res).not.toBeNull();
      expect(res.data).toHaveLength(1);
    });
  });

  describe('getRecentReviews', () => {
    it('should get recent reviews', async () => {
      const userId = 999;
      const review = restaurantReviewRecordFactory({ userId });
      const count = 3;
      jest
        .spyOn(repo, 'getReviewsOrderedByCreatedTime')
        .mockResolvedValueOnce([review, review, review]);
      jest
        .spyOn(repo, 'getExternalRestaurantInformationById')
        .mockResolvedValue({
          id: BigInt(1),
          external_uuid: BigInt(1),
          address: 'test-address',
          phone: 'test-phone',
          reference_link: 'test-reference-link',
          createdAt: new Date(),
          updatedAt: new Date(),
          name: 'test-name',
        });

      const res = await getRecentReviews(count);
      expect(res).not.toBeNull();
      expect(res).toHaveLength(3);
    });
  });

  describe('getRestaurantReviewsByUserId', () => {
    it('should get my reviews using the reviewer user id', async () => {
      const profile = profileEntityFactory();
      const reviewerId = profile.user.id;
      const review = restaurantReviewRecordFactory({ userId: reviewerId });
      jest.spyOn(repo, 'getReviewsByConditions').mockResolvedValue([review]);
      jest.spyOn(userService, 'searchProfile').mockResolvedValueOnce(profile);

      const res = await getRestaurantReviewsByUserId(999, 999);
      expect(res).not.toBeNull();
      expect(res.reviews).toHaveLength(1);
    });
  });
});
