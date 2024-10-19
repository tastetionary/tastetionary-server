import {
  WithdrawalTypeEnum,
  OpinionCategory,
  UserState,
} from '@domain/user/user.enum';
import { Prisma } from '@prisma/client';
import prismaClient from '@root/src/common/database/prisma';
import * as nicknameSource from '@domain/user/resource/nickname.json';
import { ErrorContents } from '@common/exception/internal.exception';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';
import { ErrorSubCategoryEnum } from '@root/src/common/exception/enum';

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

export async function getUserByNickname(nickname: string) {
  const user = await getUsers({ nicknames: [nickname] }, 1);
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
  category: OpinionCategory;
  type: WithdrawalTypeEnum;
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

export function validateInvalidNickName(
  nickname: string,
): TE.TaskEither<ErrorContents, boolean> {
  return pipe(
    TE.tryCatch(
      async () => {
        const bannedWords = await prismaClient.bannedWords.findMany({
          where: {
            word: {
              contains: nickname,
              mode: 'insensitive',
            },
          },
        });

        if (bannedWords.length > 0) {
          return false;
        }

        const similarMatch: string[] = await prismaClient.$queryRaw`
          SELECT * FROM banned_words
          WHERE similarity(${nickname}, word) > 0.3
        `;

        if (similarMatch.length > 0) {
          return false;
        }

        return true;
      },
      () => ({
        subCategory: ErrorSubCategoryEnum.INVALID_INPUT,
        message: 'failed to check banned words',
      }),
    ),
    TE.mapLeft(() => ({
      subCategory: ErrorSubCategoryEnum.INVALID_INPUT,
      message: 'failed to check banned words',
    })),
  );
}
