import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { FoodService } from '@domain/food/service/food.service';
import { FoodModule } from '@domain/food/food.module';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';

describe('food controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;
  let service: FoodService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [FoodModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    service = module.get(FoodService);
    await app.init();
  });

  beforeEach(async () => {
    await jest.clearAllMocks();
  });

  const DATA = {
    categories: [FoodCategory.ASIAN],
    keywords: [FoodKeyword.FLAVORFUL],
  };

  it('should return 200', async () => {
    jest.spyOn(service, 'getRecommendedFood').mockImplementation();
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    const res = await request(app.getHttpServer())
      .post('/v1/food/recommend')
      .set('Authorization', `Bearer ${token}`)
      .send(DATA);

    expect(res.statusCode).toEqual(200);
  });
});
