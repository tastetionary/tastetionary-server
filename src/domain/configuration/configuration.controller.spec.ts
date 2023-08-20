import { V1ConfigurationController } from '@domain/configuration/configuration.controller';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { INestApplication } from '@nestjs/common';
import { TestingModule } from '@nestjs/testing';
import { appModuleFixture } from '@root/jest.setup';
import * as request from 'supertest';

describe('configuration controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const module = (await appModuleFixture(
      [V1ConfigurationController],
      [ConfigurationService],
    )) as TestingModule;
    app = module.createNestApplication();
    await app.init();
  });

  describe('/v1/configuration', () => {
    it('should return env', async () => {
      const res = await request(app.getHttpServer()).get('/v1/configuration');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toEqual({ ENV: 'test' });
    });
  });

  describe('/v1/server-status', () => {
    it('Successfully return server health check', async () => {
      const res = await request(app.getHttpServer())
        .get('/v1/configuration/server-status')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('serverTime');
      expect(res.body).toHaveProperty('version');
    });
  });
});
