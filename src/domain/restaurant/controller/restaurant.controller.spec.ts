import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  appModuleFixture,
  createUserToken,
  userEntityFactory,
} from '@root/jest.setup';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import {
  RestaurantCategory,
  RestaurantKeyword,
  RestaurantPrice,
} from '@domain/restaurant/restaurant.enum';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';
import { UserService } from '@domain/user/service/user.service';
import { EndUser } from '@domain/user/core/end-user';
import { AreaCategory } from '@domain/user/user.enum';

describe('restaurant controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;
  let service: RestaurantService;
  let userService: UserService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [RestaurantModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    service = module.get(RestaurantService);
    userService = module.get(UserService);
    await app.init();
  });

  const REVIEW_INPUT = {
    review: {
      category: RestaurantCategory.ASIAN,
      keywords: ['key'],
      price: 10_000,
      summary: 'one-line summary',
    },
    external: {
      externalUUID: 1,
      name: 'test',
      latitude: 1,
      longitude: 1,
      referenceLink: 'https://www.naver.com',
    },
  };

  it('/recommendation, should return 200', async () => {
    const userId = 123;
    const userEntity = userEntityFactory(userId);
    jest.spyOn(userService, 'getEndUser').mockImplementation(async () => {
      return new EndUser(userEntity, {
        areas: [
          {
            id: 1,
            userId,
            category: AreaCategory.DINING_AREA,
            order: 1,
            address: 'address',
            latitude: 37.517331925853,
            longitude: 127.047377408384,
          },
        ],
      });
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
        category: RestaurantCategory.ASIAN,
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
