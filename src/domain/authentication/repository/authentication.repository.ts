import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';
import { Prisma } from '@prisma/client';
import prismaClient from '@root/src/common/database/prisma';
import { ErrorNameEnum } from '@root/src/common/exception/enum';
import { InternalDomainException } from '@root/src/common/exception/internal.exception';
import * as E from 'fp-ts/Either';
export interface AuthenticationHistoryRecord {
  id: number;
  identification: string;
  type: AuthenticationType;
  category: AuthenticationCategory;
  code: string;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthenticationRecord {
  id: number;
  category: AuthenticationCategory;
  type: AuthenticationType;
  state: AuthenticationState;
  userId: number | null;
  identification: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export async function saveAuthentication(param: {
  userId?: number;
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
  state: AuthenticationState;
}) {
  return await prismaClient.authentications.create({
    data: {
      userId: param.userId,
      identification: param.identification,
      category: param.category,
      type: param.type,
      state: param.state,
    },
  });
}

export async function saveAuthenticationHistory(param: {
  identification: string;
  category: AuthenticationCategory;
  type: AuthenticationType;
  code: string;
  expiredAt: Date;
}) {
  return await prismaClient.authenticationHistories.create({
    data: {
      identification: param.identification,
      category: param.category,
      type: param.type,
      code: param.code,
      expiredAt: param.expiredAt,
    },
  });
}

export function transformAuthentications(
  records: {
    id: number;
    userId: number | null;
    identification: string;
    category: string;
    type: string;
    state: string;
    createdAt: Date;
    updatedAt: Date;
  }[],
): AuthenticationRecord[] {
  return records.map((record) => {
    const { category, type, state, ...rest } = record;
    return {
      ...rest,
      category: AuthenticationCategory[
        category.toUpperCase()
      ] as AuthenticationCategory,
      type: AuthenticationType[type.toUpperCase()] as AuthenticationType,
      state: AuthenticationState[state.toUpperCase()] as AuthenticationState,
    };
  });
}

export async function getAuthenticationByIdentification(
  identification: string,
  category: AuthenticationCategory,
  type: AuthenticationType,
): Promise<AuthenticationRecord | null> {
  const record = await prismaClient.authentications.findFirst({
    where: { category, type, identification },
  });
  if (!record) return null;

  return transformAuthentications([record])[0];
}

export async function getAuthenticationsByUserId(
  userId,
): Promise<AuthenticationRecord[]> {
  const records = await prismaClient.authentications.findMany({
    where: { userId },
  });
  return transformAuthentications(records);
}

export async function getAuthentications(param: {
  userId: number;
  type: AuthenticationType;
}): Promise<AuthenticationRecord[]> {
  const records = await prismaClient.authentications.findMany({
    where: { userId: param.userId, type: param.type },
  });
  return transformAuthentications(records);
}

export async function getHistoryById(
  id: number,
): Promise<AuthenticationHistoryRecord | null> {
  const record = await prismaClient.authenticationHistories.findUnique({
    where: { id },
  });
  if (!record) {
    return null;
  }
  const { category, type, ...rest } = record;
  return {
    ...rest,
    category: AuthenticationCategory[
      category.toUpperCase()
    ] as AuthenticationCategory,
    type: AuthenticationType[type.toUpperCase()] as AuthenticationType,
  };
}

// @NOTE add params when needed
export async function updateAuthentication(param: UpdateParam) {
  const data = {};
  if ('userId' in param) {
    data['userId'] = param.userId;
  }
  if ('state' in param) {
    data['state'] = param.state;
  }
  await prismaClient.authentications.update({
    where: { id: param.id },
    data,
  });
}

export async function deleteAuthentications(ids: number[]) {
  await prismaClient.authentications.deleteMany({
    where: { id: { in: ids } },
  });
}

export async function deleteAuthenticationByUserId(userId: number) {
  try {
    await prismaClient.authentications.deleteMany({
      where: { userId },
    });
    return E.right({ userId });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return E.left(
        new InternalDomainException(
          ErrorNameEnum.INTERNAL_ERROR,
          e.message,
          e.code,
        ),
      );
    }
    return E.left(new InternalDomainException(ErrorNameEnum.INTERNAL_ERROR, e));
  }
}

type UpdateParam =
  | { id: number; userId: number }
  | { id: number; state: string };
