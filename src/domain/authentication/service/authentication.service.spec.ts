import { TestingModule } from '@nestjs/testing';
import { appModuleFixture } from '@root/jest.setup';
import { PrismaService } from '@common/database/prisma.service';
import { AuthenticationModule } from '@domain/authentication/authentication.module';

describe('authentication service', () => {
  let prisma: PrismaService;
  let module: TestingModule;
  beforeAll(async () => {
    module = (await appModuleFixture(
      [],
      [],
      [AuthenticationModule],
    )) as TestingModule;
    prisma = module.get(PrismaService);
    console.log(prisma);
  });
});
