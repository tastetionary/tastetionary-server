import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { RestaurantModule } from '@root/src/domain/restaurant/restaurant.module';
import { ConfigurationService } from '@domain/configuration/configuration.service';

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

  it('should return 200', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .post('/v1/restaurant/review')
      .set('Authorization', `Bearer ${token}`)
      .send({
        category: 'category',
        keywords: 'key',
        price: 10_000,
        summary: 'one-line summary',
      });
    expect(res.statusCode).toEqual(200);
  });
});
