import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { UserModule } from '@domain/user/user.module';
import { UserService } from '@domain/user/service/user.service';
import { AccountCategory } from '@domain/account/account.enum';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { EndUser } from '@domain/user/core/end-user';

describe('user controller', () => {
  let app: INestApplication;
  let service: UserService;
  let configService: ConfigurationService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [UserModule],
    )) as TestingModule;
    service = module.get<UserService>(UserService);
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    await app.init();
  });
  it('getProfile should return data', async () => {
    const userId = 122;
    jest
      .spyOn(service, 'getEndUser')
      .mockResolvedValueOnce(
        new EndUser({ id: userId, nickname: 'nick', state: 'state' }),
      );
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(userId, key, {
      expiresIn: '10h',
    });

    const res = await request(app.getHttpServer())
      .get('/v1/user')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(200);

    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('nickname');
    expect(res.body.data).toHaveProperty('activity_area');
    expect(res.body.data).toHaveProperty('dining_area');
  });

  it('updateArea should return success', async () => {
    jest.spyOn(service, 'updateArea').mockImplementation();
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(122, key, {
      expiresIn: '10h',
    });

    const res = await request(app.getHttpServer())
      .put('/v1/user')
      .set('Authorization', `Bearer ${token}`)
      .send({
        latitude: 1,
        longitude: 1,
        category: AreaCategory.ACTIVITY_AREA,
        address: 'test',
      });

    expect(res.statusCode).toEqual(200);
  });

  it('register should return success', async () => {
    jest.spyOn(service, 'register').mockImplementation();

    const res = await request(app.getHttpServer())
      .post('/v1/user')
      .send({
        userProperty: { companyName: 'test' },
        areas: [
          {
            latitude: 1,
            longitude: 1,
            category: AreaCategory.ACTIVITY_AREA,
            address: 'test',
          },
          {
            latitude: 1,
            longitude: 1,
            category: AreaCategory.DINING_AREA,
            address: 'test',
          },
        ],
        account: {
          identification: 'test',
          password: 'pwd',
          category: AccountCategory.EMAIL,
        },
        agreements: [
          {
            category: AgreementCategory.PERSONAL_INFORMATION,
            is_agree: true,
          },
        ],
      });

    expect(res.statusCode).toEqual(200);
  });

  it('wrong input should return bad request', async () => {
    jest.spyOn(service, 'register').mockImplementation();

    const res = await request(app.getHttpServer())
      .post('/v1/user')
      .send({ id: 1 });
    expect(res.statusCode).toEqual(400);
  });
});
