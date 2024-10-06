import prismaClient from '@root/src/common/database/prisma';
import { PreferenceCategory } from '@domain/user/user.enum';
import { UserPreferences } from '@prisma/client';

export async function getPreferencesByUserId(userId: number) {
  return prismaClient.userPreferences.findUnique({
    where: { userId: userId },
  });
}

export async function savePreference(param: {
  userId: number;
  category: PreferenceCategory;
  restaurantId: number;
}) {
  return prismaClient.userPreferences.upsert({
    where: { userId: param.userId },
    update: {
      [param.category]: {
        push: param.restaurantId,
      },
    },
    create: { userId: param.userId, [param.category]: [param.restaurantId] },
  });
}

export async function deletePreferenceRestaurant(param: {
  userId: number;
  category: PreferenceCategory;
  restaurantId: number;
  userPreferences: UserPreferences;
}) {
  const updatedIds = param.userPreferences[param.category].filter(
    (id: number) => id !== param.restaurantId,
  );

  return prismaClient.userPreferences.update({
    where: { userId: param.userId },
    data: { [param.category]: updatedIds },
  });
}

export async function deletePreference(userId: number) {
  return prismaClient.userPreferences.delete({
    where: { userId: userId },
  });
}
