import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { appModuleFixture } from '@root/jest.setup';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';

describe('AppController', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = (await appModuleFixture([AppModule])) as TestingModule;
    app = module.createNestApplication();
    await app.init();
  });

  it('should return env', async () => {
    const res = await request(app.getHttpServer()).get('/');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toEqual({ env: 'TEST', port: '3000' });
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
