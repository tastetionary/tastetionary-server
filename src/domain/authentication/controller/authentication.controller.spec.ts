import { TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { AuthenticationModule } from '@domain/authentication/authentication.module';
import request from 'supertest';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import {
  AuthenticationCategory,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { AuthenticationService } from '@domain/authentication/service/authentication.service';

describe('authentication controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;
  let service: AuthenticationService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AuthenticationModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    service = module.get(AuthenticationService);
    await app.init();
  });

  it('doneProgress should return 200', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    jest.spyOn(service, 'doneProgressAuthentication').mockResolvedValue();

    const res = await request(app.getHttpServer())
      .post('/v1/authentication/status/done')
      .set('Authorization', `Bearer ${token}`)
      .send({
        historyId: 1,
        code: '1234',
      });
    expect(res.statusCode).toEqual(200);
  });

  it('progress should return 200', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '10h',
    });

    jest
      .spyOn(service, 'createProgressAuthentication')
      .mockResolvedValue({ id: 1, expiredAt: new Date() });

    const res = await request(app.getHttpServer())
      .post(`/v1/authentication/${AuthenticationCategory.COMPANY}`)
      .set('Authorization', `Bearer ${token}`)
      .send({
        identification: 'test@email.com',
        type: AuthenticationType.EMAIL,
      });

    expect(res.statusCode).toEqual(200);
  });
});
