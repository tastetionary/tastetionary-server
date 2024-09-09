import {
  deleteAreas,
  getAreasByUserId,
  saveArea,
  saveAreas,
} from '@domain/user/repository/area.repository';
import { truncateTables } from '@root/jest.setup';
import prismaClient from '@root/src/common/database/prisma';

describe('new area repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['user_areas']);
  });

  it('should save area', async () => {
    const userId = 1;
    const data = {
      userId,
      order: 0,
      address: 'address',
      location: {
        latitude: 1,
        longitude: 1,
      },
    };
    await saveArea(data);
    const res = await getAreasByUserId(userId);
    expect(res).toEqual({
      id: 1,
      userId,
      order: 0,
      address: 'address',
      latitude: 1,
      longitude: 1,
    });
  });

  it('should delete area', async () => {
    const userId = 1;
    const data = {
      userId,
      order: 0,
      address: 'address',
      location: {
        latitude: 1,
        longitude: 1,
      },
    };
    await saveArea(data);

    await deleteAreas({ userId });
    const res = await getAreasByUserId(userId);
    expect(res).toBeUndefined();
  });
});
