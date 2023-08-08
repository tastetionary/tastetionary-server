import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from './app.module';

describe('AppController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  describe('/health-check', () => {
    it('Successfully return server health check', async () => {
      const res = await request(app.getHttpServer())
        .get('/health-check')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('timestamp');
      expect(res.body).toHaveProperty('version');
    });
  });
});
