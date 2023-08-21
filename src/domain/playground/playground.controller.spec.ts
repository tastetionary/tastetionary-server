import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { INestApplication } from '@nestjs/common';
import { ConfigurationModule } from '@root/src/domain/configuration/configuration.module';

describe('playground controller', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule, ConfigurationModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should be defined', () => {
    return request(app.getHttpServer())
      .post('/v1/playground/nestia')
      .send({ title: 'title', body: 'body', password: 'pwd' })
      .expect(201);
  });

  it('should return error format', async () => {
    const res = await request(app.getHttpServer())
      .get('/v1/playground/error')
      .send();
    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('detail');
    expect(res.body).toHaveProperty('path');
    expect(res.body).toHaveProperty('statusCode');
    expect(res.body).toHaveProperty('timestamp');
  });
});
