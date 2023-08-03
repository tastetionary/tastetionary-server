import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '@src/app.module';
import { INestApplication } from '@nestjs/common';

describe('PlaygroundController', () => {
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
      .get('/v1/playground')
      .expect(200)
      .expect('Hello World!');
  });
});
