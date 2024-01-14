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

  describe('[public]', () => {
    it('/public/status/done should return 200', async () => {
      jest.spyOn(facade, 'finishAuthProgress').mockResolvedValue({ id: 1 });

      const res = await request(app.getHttpServer())
        .post('/v1/authentication/public/status/done')
        .send({
          historyId: 1,
          code: '1234',
        });
      assertStatusCode(res, 200);
    });

    it.each([
      [AuthenticationCategory.ACCOUNT],
      [AuthenticationCategory.COMPANY],
      [AuthenticationCategory.PASSWORD],
    ])(
      '/authentication/public/{$category} should return 200',
      async (category) => {
        jest
          .spyOn(facade, 'beginAuthProgress')
          .mockResolvedValue({ id: 1, expiredAt: new Date() });

        const res = await request(app.getHttpServer())
          .post(`/v1/authentication/public/${category}`)
          .send({
            identification: 'test@email.com',
            type: AuthenticationType.EMAIL,
          });

        assertStatusCode(res, 200);
      },
    );
  });

  it('/status/done should return 200', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const spy = jest.spyOn(facade, 'finishAuthProgress');
    spy.mockResolvedValue({ id: 1 });

    const userId = 123;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });

    const data = {
      historyId: 1,
      code: '1234',
    };
    const res = await request(app.getHttpServer())
      .post('/v1/authentication/status/done')
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    expect(spy).toHaveBeenCalledWith({
      ...data,
      userId,
    });
    assertStatusCode(res, 200);
  });

  it('/authentication/{$category} should return 200', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const userId = 123;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });
    const spy = jest.spyOn(facade, 'beginAuthProgress');
    spy.mockResolvedValue({ id: 1, expiredAt: new Date() });

    const data = {
      identification: 'test@email.com',
      type: AuthenticationType.EMAIL,
    };
    const res = await request(app.getHttpServer())
      .post('/v1/authentication/company')
      .set('Authorization', `Bearer ${token}`)
      .send(data);

    expect(spy).toHaveBeenCalledWith({
      ...data,
      category: 'company',
      userId,
    });
    assertStatusCode(res, 200);
  });
});
