import { TestingModule } from '@nestjs/testing';
import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { UserController } from '@domain/user/controller/user.controller';
import { appModuleFixture } from '@root/jest.setup';
import { UserRepository } from '@domain/user/repository/user.repository';
import { PrismaService } from '@common/database/prisma.service';
import { ConfigurationService } from '@domain/configuration/configuration.service';
describe('user controller', () => {
  let app: INestApplication;
  let repo: UserRepository;

  beforeAll(async () => {
    const module = (await appModuleFixture(
      [UserController],
      [ConfigurationService, PrismaService, UserRepository],
    )) as TestingModule;
    repo = module.get<UserRepository>(UserRepository);
    app = module.createNestApplication();
    await app.init();
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
