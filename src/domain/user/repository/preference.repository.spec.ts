import { truncateTables } from '@root/jest.setup';
import prismaClient from '@root/src/common/database/prisma';
import {
  deletePreference,
  deletePreferenceRestaurant,
  getPreferencesByUserId,
  savePreferenceRestaurant,
} from '@domain/user/repository/preference.repository';
import { PreferenceCategory } from '@domain/user/user.enum';

describe('preference repository', () => {
  beforeEach(async () => {
    await truncateTables(prismaClient, ['user_preferences']);
  });

  it('should save preferences', async () => {
    const data = {
      userId: 1,
      category: PreferenceCategory.BOOKMARK,
      restaurantId: 1,
    };
    await savePreferenceRestaurant(data);

    const preference = await getPreferencesByUserId(data.userId);
    expect(preference).not.toBeNull();
    expect(preference![data.category]).toEqual([data.restaurantId]);
  });

  it('should delete preferences restaurant', async () => {
    const data = {
      userId: 1,
      category: PreferenceCategory.BOOKMARK,
      restaurantId: 1,
    };

    await savePreferenceRestaurant(data);
    let preference = await getPreferencesByUserId(data.userId);
    expect(preference).not.toBeNull();

    await deletePreferenceRestaurant({
      userId: data.userId,
      category: data.category,
      restaurantId: data.restaurantId,
      preference: preference!,
    });

    preference = await getPreferencesByUserId(data.userId);
    expect(preference![data.category]).toEqual([]);
  });

  it('should delete preferences restaurant', async () => {
    const data = {
      userId: 1,
      category: PreferenceCategory.BOOKMARK,
      restaurantId: 1,
    };

    await savePreferenceRestaurant(data);
    await deletePreference(data.userId);

    const preference = await getPreferencesByUserId(data.userId);
    expect(preference).toBeNull();
  });
});
