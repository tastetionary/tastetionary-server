import { UserState } from '@domain/user/user.enum';
import { Prisma } from '@prisma/client';
import prismaClient from '@root/src/common/database/prisma';
import * as nicknameSource from '@domain/user/resource/nickname.json';

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
  return prismaClient.users.create({ data: param });
}

export async function saveUsers(
  params: {
    nickname: string;
    state: UserState;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }[],
) {
  return prismaClient.users.createMany({ data: params });
}

export async function getUserById(id: number) {
  const user = await getUsers({ ids: [id] }, 1);
  return user[0];
}

export async function getUsers(
  param: { ids?: number[]; nicknames?: string[]; states?: UserState[] },
  take = 100,
) {
  return prismaClient.users.findMany({
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

export interface UserOpinion {
  id: number;
  userId: number;
  category: string;
  type: string;
  opinion: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export async function saveOpinion(param: {
  userId: number;
  category: string;
  type: string;
  opinion?: string;
}): Promise<UserOpinion> {
  return prismaClient.userOpinions.create({ data: param });
}

export async function getOpinionsByUserId(param: {
  userIds: number[];
}): Promise<UserOpinion[]> {
  return prismaClient.userOpinions.findMany({
    where: { userId: { in: param.userIds } },
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
  return prismaClient.users.update({
    where: { id },
    data: param,
  });
}
interface nicknamePartsRecord {
  adj: string[];
  name: {
    animal: string[];
    food: string[];
    cooking: string[];
  };
}

export function getNicknamePartRecord(): nicknamePartsRecord {
  return nicknameSource;
}
