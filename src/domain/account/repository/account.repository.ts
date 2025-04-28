import { AccountCategory } from '@domain/account/account.enum';
import { Prisma } from '@prisma/client';
import prismaClient from '@common/database/prisma';
import { ErrorCodeEnum, ErrorSubCategoryEnum } from '@common/exception/enum';
import {
  ErrorContents,
  InternalDomainException,
} from '@common/exception/internal.exception';
import * as E from 'fp-ts/Either';
import * as TE from 'fp-ts/TaskEither';
import { pipe } from 'fp-ts/lib/function';

type TokenRecord = {
  id: number;
  userId: number;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiredAt: Date;
  refreshTokenExpiredAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export async function saveAccount(param: {
  userId: number;
  category: AccountCategory;
  identification: string;
  password: string;
}) {
  await saveAccounts([param]);
}

export async function saveAccounts(
  params: {
    userId: number;
    category: AccountCategory;
    identification: string;
    password: string;
  }[],
) {
  return prismaClient.accounts.createMany({ data: params });
}

export async function getIdentification(
  identification: string,
  category: AccountCategory,
) {
  return prismaClient.accounts.findFirst({
    where: { identification, category },
  });
}

export async function getAccountById(id: number) {
  return prismaClient.accounts.findUnique({ where: { id } });
}

export async function getAccount(param: {
  identification: string;
  password: string;
}) {
  return prismaClient.accounts.findFirst({ where: param });
}

export async function getAccountByUserId(userId: number) {
  return prismaClient.accounts.findFirst({ where: { userId } });
}

export async function updateAccountById(
  id: number,
  param: {
    identification: string;
    password: string;
    requirePassChange: boolean;
  },
) {
  return prismaClient.accounts.update({
    where: { id },
    data: param,
  });
}

export async function deleteAccountByUserId(userId: number) {
  try {
    await prismaClient.accounts.deleteMany({ where: { userId } });
    return E.right({ userId });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return E.left(
        new InternalDomainException(
          ErrorSubCategoryEnum.INTERNAL_ERROR,
          e.message,
          ErrorCodeEnum.INTERNAL_SERVER_ERROR,
          e.code,
        ),
      );
    }
    return E.left(
      new InternalDomainException(
        ErrorSubCategoryEnum.INTERNAL_ERROR,
        e,
        ErrorCodeEnum.INTERNAL_SERVER_ERROR,
      ),
    );
  }
}

export function getToken(
  accessToken: string,
): TE.TaskEither<ErrorContents, TokenRecord> {
  return pipe(
    TE.tryCatch(
      () =>
        prismaClient.userTokens.findFirstOrThrow({
          where: { accessToken },
        }),
      E.toError,
    ),
    TE.mapError((_error) => {
      return {
        subCategory: ErrorSubCategoryEnum.INVALID_INPUT,
        message: 'no data, it is deleted so can not use',
      };
    }),
  );
}
