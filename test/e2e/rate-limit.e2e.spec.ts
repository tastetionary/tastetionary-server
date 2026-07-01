import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@src/app.module';

const masterAuth = (userId: number) =>
  `Bearer master-tastionary:${userId}`;

describe('Rate Limit (e2e)', () => {
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

  describe('POST /v1/restaurant/recommendation', () => {
    const body = { prices: [], keywords: [], category: [] };

    it('allows up to 15 requests per minute, blocks on the 16th', async () => {
      for (let i = 0; i < 15; i++) {
        const res = await request(app.getHttpServer())
          .post('/v1/restaurant/recommendation')
          .set('Authorization', masterAuth(999991))
          .send(body);

        expect(res.status).not.toBe(429);
      }

      const res = await request(app.getHttpServer())
        .post('/v1/restaurant/recommendation')
        .set('Authorization', masterAuth(999991))
        .send(body);

      expect(res.status).toBe(429);
    });

    it('each user has an independent rate limit counter', async () => {
      // Exhaust user A's limit
      for (let i = 0; i < 15; i++) {
        await request(app.getHttpServer())
          .post('/v1/restaurant/recommendation')
          .set('Authorization', masterAuth(999992))
          .send(body);
      }

      const resA = await request(app.getHttpServer())
        .post('/v1/restaurant/recommendation')
        .set('Authorization', masterAuth(999992))
        .send(body);
      expect(resA.status).toBe(429);

      // User B should still pass rate limit
      const resB = await request(app.getHttpServer())
        .post('/v1/restaurant/recommendation')
        .set('Authorization', masterAuth(999993))
        .send(body);
      expect(resB.status).not.toBe(429);
    });
  });
});
