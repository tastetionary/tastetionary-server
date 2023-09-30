import { TestingModule } from '@nestjs/testing';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { ExternalRestaurantInformationDTO } from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { ServiceException } from '@common/exception/custom.exception';
import { UserModule } from '@domain/user/user.module';
import { EndUser } from '@domain/user/core/end-user';
import { AreaCategory } from '@domain/user/user.enum';

describe('restaurant service', () => {
  let prisma: PrismaService;
  let module: TestingModule;
  let service: RestaurantService;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [UserModule, RestaurantModule],
    )) as TestingModule;
    prisma = module.get(PrismaService);
    service = module.get(RestaurantService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, [
      'user_areas',
      'restaurant_reviews',
      'external_restaurant_informations',
    ]);
  });

  const LATITUDE = 37.517331925853;
  const LONGITUDE = 127.047377408384;
  const DTO = {
    category: RestaurantCategory.ASIAN,
    keywords: ['clean'],
    price: 10_000,
    summary: 'never come again',
  };

  const EXTERNAL_DTO: ExternalRestaurantInformationDTO = {
    externalUUID: 123123,
    name: 'some',
    latitude: LATITUDE,
    longitude: LONGITUDE,
    referenceLink: 'https://www.naver.com',
  };
  describe('aggregateRestaurant', () => {
    it('should calc average price', () => {
      const reviews = [
        {
          id: 1,
          external_restaurant_information_id: 1n,
          userId: 1,
          category: RestaurantCategory.ASIAN,
          summary: 'asian',
          opinion: null,
          keywords: ['clean'],
          price: 10_000,
        },
        {
          id: 2,
          external_restaurant_information_id: 1n,
          userId: 1,
          category: RestaurantCategory.BUFFET,
          summary: 'buffet',
          opinion: null,
          keywords: ['kind'],
          price: 15_000,
        },
      ];

      const res = service.aggregateRestaurant(reviews);
      expect(res.avgPrice).toBe(12_500);
    });
  });

  describe('getRecommendedRestaurant', () => {
    const createRestaurant = async (
      userId: number,
      diningLocation: {
        latitude: number;
        longitude: number;
      },
    ) => {
      const diningArea = {
        id: 1,
        userId,
        category: AreaCategory.DINING_AREA,
        order: 1,
        address: 'address',
        latitude: diningLocation.latitude,
        longitude: diningLocation.longitude,
      };

      const activityArea = {
        id: 1,
        userId,
        category: AreaCategory.ACTIVITY_AREA,
        order: 1,
        address: 'address',
        latitude: LATITUDE,
        longitude: LONGITUDE,
      };

      const user = new EndUser(userId, [diningArea, activityArea]);
      await service.registerReview(
        {
          userId,
          externalDto: EXTERNAL_DTO,
          dto: DTO,
        },
        user,
      );
      return user;
    };
    it('should return proper restaurant', async () => {
      const userId = 1;
      const user = await createRestaurant(1, {
        latitude: LATITUDE,
        longitude: LONGITUDE,
      });
      const maxDistance = 1000;
      const res = await service.getRecommendedRestaurant(
        {
          userId,
          maxDistance,
          keywords: ['clean'],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
        },
        user,
      );
      expect(res.length).toEqual(1);
    });

    it('with not restaurant within distance, should return empty array', async () => {
      const userId = 1;
      const user = await createRestaurant(1, {
        latitude: 1,
        longitude: 1,
      });
      const maxDistance = 1000;
      const res = await service.getRecommendedRestaurant(
        {
          userId,
          maxDistance,
          keywords: [],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
        },
        user,
      );
      expect(res).toEqual([]);
    });

    it('with un dinning area user, should throw error', async () => {
      await expect(
        service.getRecommendedRestaurant({
          userId: 1,
          maxDistance: 1000,
          keywords: [],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
        }),
      ).rejects.toThrowError(ServiceException);
    });
  });

  describe('registerReview', () => {
    it('with not register activity_area, should not register review', async () => {
      const userId = 1;
      await expect(
        service.registerReview({
          userId,
          externalDto: EXTERNAL_DTO,
          dto: DTO,
        }),
      ).rejects.toThrowError(new ServiceException('domaine rule error'));
    });

    it('with new restaurant, should save or update', async () => {
      await service.registerExternalRestaurantInformationWhenNoData(
        EXTERNAL_DTO,
      );
      const res = await service.getExternalRestaurant(
        EXTERNAL_DTO.externalUUID,
      );
      expect(res).not.toBeNull();
    });

    it('should create review data and external data', async () => {
      const userId = 999;
      const area = {
        id: 1,
        userId,
        category: AreaCategory.ACTIVITY_AREA,
        order: 1,
        address: 'address',
        latitude: 1,
        longitude: 1,
      };

      const user = new EndUser(userId, [area]);
      await service.registerReview(
        {
          userId,
          externalDto: EXTERNAL_DTO,
          dto: DTO,
        },
        user,
      );
      const res = await service.getReviews(userId);

      expect(res).toHaveLength(1);
    });
  });
});
