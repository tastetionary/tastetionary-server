import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import {
  appModuleFixture,
  assertStatusCode,
  createUserToken,
} from '@root/jest.setup';
import { UserModule } from '@domain/user/user.module';
import { AccountCategory } from '@domain/account/account.enum';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import * as service from '@domain/user/service/user.service';
import { profileEntityFactory } from '@root/test/factory/user.factory';

describe('user controller', () => {
  let app: INestApplication;
  let configService: ConfigurationService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [UserModule],
    )) as TestingModule;
    app = module.createNestApplication();
    configService = module.get<ConfigurationService>(ConfigurationService);
    await app.init();
  });

  it('myPage profile should return data', async () => {
    const profile = profileEntityFactory();
    jest.spyOn(service, 'searchProfile').mockResolvedValueOnce(profile);
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(profile.user.id, key, {
      expiresIn: '10h',
    });

    const res = await request(app.getHttpServer())
      .get('/v1/user')
      .set('Authorization', `Bearer ${token}`);

    assertStatusCode(res, 200);

    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data).toHaveProperty('nickname');
    expect(res.body.data).toHaveProperty('area');
    expect(res.body.data).toHaveProperty('account');
    expect(res.body.data.area).toHaveProperty('diningArea');
    expect(res.body.data.area).toHaveProperty('activityArea');
  });

  it('updateArea should return success', async () => {
    jest.spyOn(service, 'changeArea').mockImplementation();
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
    jest.spyOn(service, 'createUser').mockImplementation();

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
          identification: `test-${new Date().getMilliseconds}`,
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

    assertStatusCode(res, 200);
  });

  it('wrong input should return bad request', async () => {
    jest.spyOn(service, 'createProfile').mockImplementation();

    const res = await request(app.getHttpServer())
      .post('/v1/user')
      .send({ id: 1 });
    expect(res.statusCode).toEqual(400);
  });
});
