import prismaClient from '@root/src/common/database/prisma';
import {
  PreferenceCategory,
  PreferenceCategoryToColumnMapping,
} from '@domain/user/user.enum';
import { UserPreferences } from '@prisma/client';

export async function getPreferencesByUserId(userId: number) {
  return prismaClient.userPreferences.findUnique({
    where: { userId: userId },
  });
}

export async function savePreferenceRestaurant(param: {
  userId: number;
  category: PreferenceCategory;
  restaurantId: number;
}) {
  const column = PreferenceCategoryToColumnMapping[param.category];
  await prismaClient.userPreferences.upsert({
    where: { userId: param.userId },
    update: {
      [column]: {
        push: param.restaurantId,
      },
    },
    create: { userId: param.userId, [column]: [param.restaurantId] },
  });
}

export async function deletePreferenceRestaurant(param: {
  userId: number;
  category: PreferenceCategory;
  restaurantId: number;
  preference: UserPreferences;
}) {
  const column = PreferenceCategoryToColumnMapping[param.category];
  const updatedIds = param.preference[column].filter(
    (id: number) => id !== param.restaurantId,
  );

  await prismaClient.userPreferences.update({
    where: { userId: param.userId },
    data: { [column]: updatedIds },
  });
}

export async function deletePreference(userId: number) {
  await prismaClient.userPreferences.delete({
    where: { userId: userId },
  });
}
