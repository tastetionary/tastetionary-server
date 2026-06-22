import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@src/app.module';
import { FoodCategory, FoodKeyword } from '@domain/food/food.enum';

describe('Food recommendation (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /v1/food/recommendation - returns a recommended food', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/food/recommendation')
      .send({
        categories: [FoodCategory.KOREAN],
        keywords: [FoodKeyword.LIGHT],
      })
      .expect(200);

    expect(res.body.data.id).toBeDefined();
    expect(typeof res.body.data.id).toBe('number');
    expect(res.body.data.name).toBeDefined();
    expect(typeof res.body.data.name).toBe('string');
  });

  it('POST /v1/food/recommendation - returns 204 when no matching food', async () => {
    await request(app.getHttpServer())
      .post('/v1/food/recommendation')
      .send({
        categories: [FoodCategory.CAFE_AND_DESERT],
        keywords: [FoodKeyword.SPICY],
      })
      .expect(204);
  });
});
