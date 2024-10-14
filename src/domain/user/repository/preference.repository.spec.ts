import { truncateTables } from '@root/jest.setup';
import prismaClient from '@root/src/common/database/prisma';
import {
  deletePreference,
  deletePreferenceRestaurant,
  getPreferencesByUserId,
  savePreferenceRestaurant,
} from '@domain/user/repository/preference.repository';
import {
  PreferenceCategory,
  PreferenceCategoryToColumnMapping,
} from '@domain/user/user.enum';

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
    const column = PreferenceCategoryToColumnMapping[data.category];

    const preference = await getPreferencesByUserId(data.userId);
    expect(preference).not.toBeNull();
    expect(preference![column]).toEqual([data.restaurantId]);
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
    const column = PreferenceCategoryToColumnMapping[data.category];
    preference = await getPreferencesByUserId(data.userId);
    expect(preference![column]).toEqual([]);
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
