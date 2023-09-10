import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { appModuleFixture } from '@root/jest.setup';
import { UserRepository } from '@domain/user/repository/user.repository';
import { UserModule } from '@domain/user/user.module';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';

describe('user controller', () => {
  let app: INestApplication;
  let repo: UserRepository;
  let jwt: JwtService;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [],
      [UserModule],
    )) as TestingModule;
    repo = module.get<UserRepository>(UserRepository);
    app = module.createNestApplication();
    jwt = module.get<JwtService>(JwtService);
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
    const payload = {
      userId: 123,
    };
    const options: JwtSignOptions = {
      expiresIn: '1ms', // Include expiresIn in JwtSignOptions
      secret: 'my-secret-access',
    };

    const token = jwt.sign(payload, options);

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
