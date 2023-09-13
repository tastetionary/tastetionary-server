import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture, createUserToken } from '@root/jest.setup';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserModule } from '@domain/user/user.module';
import { ConfigurationService } from '@domain/configuration/configuration.service';

describe('user controller', () => {
  let app: INestApplication;
  let repo: UserRepository;
  let configService: ConfigurationService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [UserModule],
    )) as TestingModule;
    repo = module.get<UserRepository>(UserRepository);
    configService = module.get<ConfigurationService>(ConfigurationService);
    app = module.createNestApplication();
    await app.init();
  });

  it('temp - mock test', async () => {
    const result = ['test'];
    jest.spyOn(repo, 'tempMethod').mockImplementation(async () => result);

    const res = await request(app.getHttpServer())
      .post('/v1/users/')
      .send({ identification: 'test', password: 'pwd' });

    expect(res.statusCode).toEqual(201);
  });

  it('temp - with expires token should return 401', async () => {
    const key = configService.getTokenData().accessTokenSecret;
    const token = createUserToken(123, key, {
      expiresIn: '1ms',
    });
    const res = await request(app.getHttpServer())
      .get('/v1/users/test')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toEqual(401);
  });

  it('temp - with none token should return 401', async () => {
    const res = await request(app.getHttpServer()).get('/v1/users/test');
    expect(res.statusCode).toEqual(401);
  });

  it('wrong input should return bad request', async () => {
    const result = ['test'];
    jest.spyOn(repo, 'tempMethod').mockImplementation(async () => result);

    const res = await request(app.getHttpServer())
      .post('/v1/users/')
      .send({ id: 1 });

    expect(res.statusCode).toEqual(400);
    expect(res.body.detail.reason).toContain('not following');
  });
});
