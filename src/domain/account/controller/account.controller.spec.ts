import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  appModuleFixture,
  assertStatusCode,
  createUserToken,
} from '@root/jest.setup';
import { AccountModule } from '@domain/account/account.module';
import { AccountCategory } from '@domain/account/account.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import * as accountService from '@domain/account/service/account.service';
import * as facade from '@domain/account/facade/account.facade';

describe('account controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AccountModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    await app.init();
  });

  it('/password/reset should success', async () => {
    jest.spyOn(facade, 'resetPassword').mockReturnValue(Promise.resolve('abc'));

    const res = await request(app.getHttpServer())
      .put('/v1/account/password/reset')
      .send({
        code: '1'.repeat(6),
        historyId: 1,
        password: 'pwd',
      });

    assertStatusCode(res, 200);
  });

  it('/password should success', async () => {
    jest
      .spyOn(accountService, 'changePassword')
      .mockReturnValue(Promise.resolve());

    const userId = 123;
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });
    const res = await request(app.getHttpServer())
      .put('/v1/account/password')
      .set('Authorization', `Bearer ${token}`)
      .send({
        password: 'pwd',
      });

    assertStatusCode(res, 200);
  });

  it('should delete success', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    jest
      .spyOn(accountService, 'removeAllToken')
      .mockImplementation(async () => {});

    const res = await request(app.getHttpServer())
      .delete('/v1/account/tokens')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
  });

  it('should return tokens', async () => {
    jest.spyOn(accountService, 'createToken').mockImplementation(async () => {
      return {
        accessToken: '',
        refreshToken: '',
        accessTokenExpiredAt: new Date(),
        refreshTokenExpiredAt: new Date(),
      };
    });

    const res = await request(app.getHttpServer())
      .post('/v1/account/tokens')
      .send({
        authenticationId: 1,
        identification: 'test',
        password: 'pwd',
        category: AccountCategory.EMAIL,
      });

    assertStatusCode(res, 200);
  });

  it('invalid request, should return tokens', async () => {
    const res = await request(app.getHttpServer()).post('/v1/account/tokens');
    expect(res.statusCode).toEqual(400);
  });
});
