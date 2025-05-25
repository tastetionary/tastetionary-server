import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture } from '@root/jest.setup';
import { FoodModule } from '@domain/food/food.module';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';
import * as foodService from '@domain/food/service/food.service';

describe('food controller', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [FoodModule],
    )) as TestingModule;
    app = module.createNestApplication();
    await app.init();
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  const DATA = {
    categories: [FoodCategory.ASIAN],
    keywords: [FoodKeyword.FLAVORFUL],
  };

  it('should return 200', async () => {
    jest
      .spyOn(foodService, 'getRecommendedFood')
      .mockImplementation(async () => {
        const mock = {
          id: 1,
          name: 'Mock Food',
          category: ['Mock Category'],
          keyword: ['Mock Keyword'],
        };
        return mock;
      });

    const res = await request(app.getHttpServer())
      .post('/v1/food/recommendation')
      .send(DATA);

    expect(res.statusCode).toEqual(200);
  });
});
