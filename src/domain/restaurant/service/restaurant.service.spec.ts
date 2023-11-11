import { TestingModule } from '@nestjs/testing';
import {
  appModuleFixture,
  truncateTables,
  userEntityFactory,
} from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { ExternalRestaurantInformationDTO } from '@domain/restaurant/dto/restaurant.dto';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { UserModule } from '@domain/user/user.module';
import { EndUser } from '@domain/user/core/end-user';
import { AreaCategory } from '@domain/user/user.enum';
import {
  CallerWrongDomainRuleException,
  CallerWrongUsageException,
} from '@common/exception/internal.exception';

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
    it('should calc average price', () => {
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
        },
      ];

      const res = service.aggregateRestaurantReview(reviews);
      expect(res.data.aggregatePrice.avg).toBe(12_500);
      expect(res.data.revisitRatio).toBe(33.3);
    });

    it('aggregatePrice, should return expected', () => {
      const res = service.aggregatePrice([10000, 15000]);
      expect(res).toEqual({ 10000: 1, 15000: 1, avg: 12500 });

      const resTwo = service.aggregatePrice([10000, 10000, 15000]);
      expect(resTwo).toEqual({ 10000: 2, 15000: 1, avg: 12500 });
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
      const tempUser = userEntityFactory(userId);
      const user = new EndUser(tempUser, { areas: [diningArea, activityArea] });
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
      const res = (await service.getRecommendedRestaurant(
        {
          userId,
          masDistanceMeter: maxDistance,
          keywords: ['clean'],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        },
        user,
      )) as any;
      expect(res).not.toBeNull();
    });

    it('with not restaurant within distance, should return null', async () => {
      const userId = 1;
      const user = await createRestaurant(1, {
        latitude: 1,
        longitude: 1,
      });
      const maxDistance = 1000;
      const res = await service.getRecommendedRestaurant(
        {
          userId,
          masDistanceMeter: maxDistance,
          keywords: [],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        },
        user,
      );
      expect(res.restaurant).toBeNull();
    });

    it('with un dinning area user, should throw error', async () => {
      await expect(
        service.getRecommendedRestaurant({
          userId: 129292929,
          masDistanceMeter: 1000,
          keywords: [],
          ltePrice: 10_000,
          categories: [RestaurantCategory.ASIAN],
          excludeRestaurantIds: [],
        }),
      ).rejects.toThrowError(CallerWrongUsageException);
    });
  });

  describe('registerReview', () => {
    it('with not register activity_area, should not register review', async () => {
      const endUser = new EndUser(userEntityFactory(1));
      await expect(
        service.registerReview(
          {
            userId: 1,
            externalDto: EXTERNAL_DTO,
            dto: DTO,
          },
          endUser,
        ),
      ).rejects.toThrowError(CallerWrongDomainRuleException);
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
      const tempUser = userEntityFactory(userId);
      const user = new EndUser(tempUser, { areas: [area] });
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

  describe('option', () => {
    it('should get restaurant option', async () => {
      const res = await service.getRestaurantOptions();
      expect(res).toHaveProperty('categories');
      expect(res).toHaveProperty('keywords');
      expect(res).toHaveProperty('prices');
    });
  });
});
