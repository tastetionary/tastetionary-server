import { AreaCategory } from '@domain/user/user.enum';
import { Prisma } from '@prisma/client';
import prismaClient from '@root/src/common/database/prisma';

export interface AreaRecord {
  id: number;
  userId: number;
  category: AreaCategory;
  order: number;
  address: string;
  latitude: number;
  longitude: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function saveAreas(
  params: {
    userId: number;
    category: AreaCategory;
    order: number;
    address: string;
    location: { latitude: number; longitude: number };
  }[],
) {
  const query = params.map(
    (param) =>
      Prisma.sql`(${param.userId}, ${param.category}, ${param.order}, ${
        param.address
      }, st_point(${param.location.longitude},${
        param.location.latitude
      }), ${new Date()})`,
  );
  await prismaClient.$queryRaw`
      INSERT INTO user_areas (user_id, category, "order", address, location, updated_at) 
      VALUES ${Prisma.join(query)}`;
}

export async function saveArea(param: {
  userId: number;
  category: AreaCategory;
  order: number;
  address: string;
  location: { latitude: number; longitude: number };
}) {
  await saveAreas([param]);
}

export async function getAreasByUserId(userId: number) {
  const areas: AreaRecord[] = await prismaClient.$queryRaw`
      SELECT
          id,
          user_id,
          category,
          "order",
          address,
          ST_X(location::geometry) as longitude,
          ST_Y(location::geometry) as latitude
      FROM user_areas WHERE user_id = ${userId}`;
  return areas;
}

export async function deleteAreas(params: { userId; category: AreaCategory }) {
  await prismaClient.userAreas.deleteMany({
    where: { userId: params.userId, category: params.category },
  });
}
