import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture } from '@root/jest.setup';
import { UserModule } from '@domain/user/user.module';
import { UserService } from '@domain/user/service/user.service';
import { AccountCategory } from '@domain/account/account.enum';
import { AgreementCategory, AreaCategory } from '@domain/user/user.enum';

describe('user controller', () => {
  let app: INestApplication;
  let service: UserService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [UserModule],
    )) as TestingModule;
    service = module.get<UserService>(UserService);
    app = module.createNestApplication();
    await app.init();
  });

  it('should return success', async () => {
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
    expect(res.body.detail.reason).toContain('not following');
  });
});
