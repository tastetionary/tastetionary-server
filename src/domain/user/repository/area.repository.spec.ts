import { AreaRepository } from '@domain/user/repository/area.repository';
import { TestingModule } from '@nestjs/testing';
import { PrismaService } from '@common/database/prisma.service';
import { appModuleFixture, truncateTables } from '@root/jest.setup';
import { ConfigurationService } from '@domain/configuration/configuration.service';
import { AreaCategory } from '@domain/user/user.enum';

describe('area repository', () => {
  let repo: AreaRepository;
  let prisma: PrismaService;
  beforeAll(async () => {
    const module = (await appModuleFixture(
      [],
      [ConfigurationService, PrismaService, AreaRepository],
    )) as TestingModule;
    repo = module.get(AreaRepository);
    prisma = module.get(PrismaService);
  });

  beforeEach(async () => {
    await truncateTables(prisma, ['user_areas']);
  });

  it('should delete area', async () => {
    const data = [
      {
        userId: 1,
        category: AreaCategory.ACTIVITY_AREA,
        order: 0,
        address: 'address',
        location: {
          latitude: 1,
          longitude: 1,
        },
      },
    ];
    await repo.saveAreas(data);

    await repo.deleteArea({ userId: 1, category: AreaCategory.ACTIVITY_AREA });
    const res = await repo.getAreasByUserId(1);
    expect(res.length).toEqual(0);
  });

  it('should save area', async () => {
    const data = [
      {
        userId: 1,
        category: AreaCategory.ACTIVITY_AREA,
        order: 0,
        address: 'address',
        location: {
          latitude: 1,
          longitude: 1,
        },
      },
    ];
    await repo.saveAreas(data);
    await repo.saveArea(data[0]);

    const res = await repo.getAreasByUserId(1);
    expect(res.length).toEqual(2);
  });
});
