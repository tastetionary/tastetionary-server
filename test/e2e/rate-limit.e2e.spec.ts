import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '@src/app.module';

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
    const body = { prices: [], keywords: [], category: [], latitude: 37.5665, longitude: 126.978 };

    it('allows up to 15 requests per minute, blocks on the 16th', async () => {
      for (let i = 0; i < 15; i++) {
        const res = await request(app.getHttpServer())
          .post('/v1/restaurant/recommendation')
          .send(body);

        expect(res.status).not.toBe(429);
      }

      const res = await request(app.getHttpServer())
        .post('/v1/restaurant/recommendation')
        .send(body);

      expect(res.status).toBe(429);
    });
  });
});
