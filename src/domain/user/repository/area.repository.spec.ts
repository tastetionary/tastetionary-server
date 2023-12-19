import {
  deleteAreas,
  getAreasByUserId,
  saveArea,
  saveAreas,
} from '@domain/user/repository/area.repository';
import { truncateTables } from '@root/jest.setup';
import { AreaCategory } from '@domain/user/user.enum';
import prismaClient from '@root/src/common/database/prisma';

describe('new area repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['user_areas']);
  });

  it('should save area', async () => {
    const userId = 1;
    const data = [
      {
        userId,
        category: AreaCategory.ACTIVITY_AREA,
        order: 0,
        address: 'address',
        location: {
          latitude: 1,
          longitude: 1,
        },
      },
    ];
    await saveAreas(data);
    await saveArea(data[0]);
    const res = await getAreasByUserId(userId);
    expect(res.length).toEqual(2);
  });

  it('should delete area', async () => {
    const userId = 1;
    const data = [
      {
        userId,
        category: AreaCategory.ACTIVITY_AREA,
        order: 0,
        address: 'address',
        location: {
          latitude: 1,
          longitude: 1,
        },
      },
    ];
    await saveAreas(data);

    await deleteAreas({ userId, category: AreaCategory.ACTIVITY_AREA });
    const res = await getAreasByUserId(userId);
    expect(res.length).toEqual(0);
  });
});
