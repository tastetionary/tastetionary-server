import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import {
  appModuleFixture,
  assertStatusCode,
  createUserToken,
} from '@root/jest.setup';
import { AuthenticationModule } from '@domain/authentication/authentication.module';
import request from 'supertest';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import * as facade from '@domain/authentication/facade/authentication.facade';

describe('authentication controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AuthenticationModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    await app.init();
  });

  it('/status/done should return 200', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    jest.spyOn(facade, 'finishAuthProgress').mockResolvedValue({ id: 1 });

    const res = await request(app.getHttpServer())
      .post('/v1/authentication/status/done')
      .set('Authorization', `Bearer ${token}`)
      .send({
        historyId: 1,
        code: '1234',
      });
    expect(res.statusCode).toEqual(200);
  });

  it.each([
    [AuthenticationCategory.ACCOUNT],
    [AuthenticationCategory.COMPANY],
    [AuthenticationCategory.PASSWORD],
  ])('/authentication/{$category} should return 200', async (category) => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    jest
      .spyOn(facade, 'beginAuthProgress')
      .mockResolvedValue({ id: 1, expiredAt: new Date() });

    const res = await request(app.getHttpServer())
      .post(`/v1/authentication/${category}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identification: 'test@email.com',
        type: AuthenticationType.EMAIL,
      });

    assertStatusCode(res, 200);
  });
});
