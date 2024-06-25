import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  appModuleFixture,
  assertStatusCode,
  createUserToken,
} from '@root/jest.setup';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import * as restaurantService from '@domain/restaurant/service/restaurant.service';
import * as userService from '@domain/user/service/user.service';
import { areaEntityFactory } from '@root/test/factory/user.factory';

describe('restaurant controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [RestaurantModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    await app.init();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const REVIEW_INPUT = {
    review: {
      category: RestaurantCategory.ASIAN,
      keywords: ['key'],
      price: 10_000,
      summary: 'one-line summary',
      opinion: 'N',
    },
    external: {
      externalUUID: 1,
      name: 'test',
      latitude: 1,
      longitude: 1,
      referenceLink: 'https://www.naver.com',
    },
  };

  it('/recommendation, with empty should return 204', async () => {
    const userId = 999;
    const entity = areaEntityFactory({ userId });
    jest
      .spyOn(userService, 'searchAreas')
      .mockReturnValueOnce(Promise.resolve(entity));

    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/recommendation')
      .set('Authorization', `Bearer ${token}`)
      .send({
        excludeIds: [],
        category: [RestaurantCategory.ASIAN],
        keywords: ['key'],
        price: 10_000,
      });

    assertStatusCode(res, 204);
  });

  it('/recommendation, should return 200', async () => {
    const userId = 123;
    const entity = areaEntityFactory({ userId });
    jest
      .spyOn(userService, 'searchAreas')
      .mockReturnValueOnce(Promise.resolve(entity));
    jest
      .spyOn(restaurantService, 'getRecommendedRestaurant')
      .mockResolvedValueOnce({
        restaurant: {
          id: 1n,
          name: 'name',
          externalUUID: 123n,
          referenceLink: null,
          latitude: 12,
          longitude: 12,
          distance: 10,
        },
        aggregateReviews: {
          categories: [RestaurantCategory.KOREAN],
          summaries: [''],
          opinions: [''],
          keywords: [''],
          prices: [10],
          aggregatePrice: { '10': 10 },
          revisitRatio: 10,
          totalCount: 10,
        },
      });

    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/recommendation')
      .set('Authorization', `Bearer ${token}`)
      .send({
        excludeIds: [],
        category: [RestaurantCategory.ASIAN],
        keywords: ['key'],
        price: 10_000,
      });

    assertStatusCode(res, 200);
  });

  it('/review, not activity user, should return 400', async () => {
    const userId = 123;
    const entity = areaEntityFactory({ userId });
    jest
      .spyOn(userService, 'searchAreas')
      .mockReturnValueOnce(Promise.resolve(entity));
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/review')
      .set('Authorization', `Bearer ${token}`)
      .send(REVIEW_INPUT);

    expect(res.statusCode).toEqual(400);
  });

  it('/review, should return 200', async () => {
    const userId = 123;
    const entity = areaEntityFactory({ userId });
    jest
      .spyOn(userService, 'searchAreas')
      .mockReturnValueOnce(Promise.resolve(entity));
    jest
      .spyOn(restaurantService, 'createReview')
      .mockImplementation(async () => {});

    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/review')
      .set('Authorization', `Bearer ${token}`)
      .send(REVIEW_INPUT);

    assertStatusCode(res, 200);
  });

  it('/:restaurantId/review, should return 200', async () => {
    const userId = 123;
    const restaurantId = 1n;
    jest
      .spyOn(restaurantService, 'getRestaurantReviews')
      .mockImplementation(async () => {
        return {
          keywordReviews: {
            total: 10,
            keywordCounts: [],
            revisitRatio: 0,
          },
          data: [],
        };
      });

    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .get(`/v1/restaurant/${restaurantId}/review`)
      .set('Authorization', `Bearer ${token}`)
      .send();

    assertStatusCode(res, 200);
  });

  it('/review/report, should return 201', async () => {
    const userId = 123;
    const reviewId = 123;
    const content = 'content';
    const category = '스팸';
    jest
      .spyOn(restaurantService, 'reportRestaurantReview')
      .mockImplementation(async () => {});

    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/review/report')
      .set('Authorization', `Bearer ${token}`)
      .send({
        reviewId,
        content,
        category,
      });

    assertStatusCode(res, 201);
  });

  it('/option, should return 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/restaurant/option')
      .send();

    expect(res.statusCode).toEqual(200);
  });

  it('/review/option, should return 200', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/restaurant/review/option')
      .send();

    expect(res.statusCode).toEqual(200);
  });
});
