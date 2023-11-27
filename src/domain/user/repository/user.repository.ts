import { UserState } from '@domain/user/user.enum';
import { Prisma } from '@prisma/client';
import newPrisma from '@common/database/new.prisma';

export interface UserRecord {
  id: number;
  nickname: string;
  state: string;
  property?: Prisma.JsonValue;
  createdAt?: Date;
  updatedAt?: Date;
}
export async function saveUser(param: {
  nickname: string;
  state: UserState;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  property: Record<string, any>;
}) {
  return newPrisma.users.create({ data: param });
}

export async function saveUsers(
  params: {
    nickname: string;
    state: UserState;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }[],
) {
  return newPrisma.users.createMany({ data: params });
}

export async function getUserById(id: number) {
  const user = await getUsers({ ids: [id] }, 1);
  return user[0];
}

export async function getUsers(
  param: { ids?: number[]; nicknames?: string[]; states?: UserState[] },
  take = 100,
) {
  return newPrisma.users.findMany({
    where: {
      id: {
        in: param.ids,
      },
      nickname: {
        in: param.nicknames,
      },
      state: {
        in: param.states,
      },
    },
    take,
  });
}

export async function updateUserById(
  id: number,
  param: {
    nickname?: string;
    state?: string;
    property?: Record<string, any>;
  },
) {
  return newPrisma.users.update({
    where: { id },
    data: param,
  });
}
