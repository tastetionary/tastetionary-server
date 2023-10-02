import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { RestaurantModule } from '@domain/restaurant/restaurant.module';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { RestaurantCategory } from '@domain/restaurant/restaurant.enum';
import { RestaurantService } from '@domain/restaurant/service/restaurant.service';

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
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
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
    console.log(res.body);
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
});
