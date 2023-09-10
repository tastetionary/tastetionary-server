import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture } from '@root/jest.setup';
import { AccountModule } from '@domain/account/account.module';
import { AccountService } from '@domain/account/service/account.service';
import { AccountCategory } from '@domain/account/account.enum';

describe('user controller', () => {
  let app: INestApplication;
  let accountService: AccountService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [AccountModule],
    )) as TestingModule;
    app = module.createNestApplication();
    accountService = module.get<AccountService>(AccountService);
    await app.init();
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
