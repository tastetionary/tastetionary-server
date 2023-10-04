import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture } from '@root/jest.setup';
import { AuthenticationModule } from '@domain/authentication/authentication.module';
import request from 'supertest';

describe('authentication controller', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AuthenticationModule],
    )) as TestingModule;
    app = module.createNestApplication();
    await app.init();
  });

  it('should return 200', async () => {
    const res = await request(app.getHttpServer())
      .post('/v1/authentication/')
      .send({ identification: 'test@email.com' });

    expect(res.statusCode).toEqual(200);
  });
});
