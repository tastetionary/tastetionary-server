import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { AccountModule } from '@domain/account/account.module';
import { AccountCategory } from '@domain/account/account.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import * as accountService from '@domain/account/service/account.service';

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

  it('should delete success', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    jest
      .spyOn(accountService, 'deleteTokens')
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
        identification: 'test',
        password: 'pwd',
        category: AccountCategory.EMAIL,
      });

    expect(res.statusCode).toEqual(200);
  });

  it('invalid request, should return tokens', async () => {
    const res = await request(app.getHttpServer()).post('/v1/account/tokens');
    expect(res.statusCode).toEqual(400);
  });
});
