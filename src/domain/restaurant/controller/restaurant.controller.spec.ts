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
import {
  RestaurantCategory,
  RestaurantKeyword,
  RestaurantPrice,
} from '@domain/restaurant/restaurant.enum';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { EmptyContentException } from '@common/exception/internal.exception';

describe('restaurant controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;
  let service: RestaurantService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [RestaurantModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    service = module.get(RestaurantService);
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
    jest
      .spyOn(service, 'getRecommendedRestaurant')
      .mockRejectedValue(new EmptyContentException('no data'));

    const userId = 999;
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
    expect(res.headers).toHaveProperty('no-content-reason');
  });

  it('/recommendation, should return 200', async () => {
    const userId = 123;
    jest.spyOn(service, 'getRecommendedRestaurant').mockResolvedValueOnce({
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
        categories: [RestaurantCategory.ALL],
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
    expect(res.statusCode).toEqual(200);
  });

  it('/review, not activity user, should return 400', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/review')
      .set('Authorization', `Bearer ${token}`)
      .send(REVIEW_INPUT);

    expect(res.statusCode).toEqual(400);
  });

  it('/review, should return 200', async () => {
    jest.spyOn(service, 'registerReview').mockImplementation(async () => {});

    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/review')
      .set('Authorization', `Bearer ${token}`)
      .send(REVIEW_INPUT);

    expect(res.statusCode).toEqual(200);
  });

  it('/option, should return 200', async () => {
    jest.spyOn(service, 'getRestaurantOptions').mockImplementation(async () => {
      return {
        categories: [
          {
            id: 1,
            name: RestaurantCategory.ASIAN,
            icon: 'icon',
          },
        ],
        keywords: [
          {
            id: 1,
            name: RestaurantKeyword.ATMOSPHERE,
          },
        ],
        prices: [
          {
            id: 1,
            name: RestaurantPrice.OVER_13000,
          },
        ],
      };
    });
    const res = await request(app.getHttpServer())
      .get('/v1/restaurant/option')
      .send();

    expect(res.statusCode).toEqual(200);
  });
});
