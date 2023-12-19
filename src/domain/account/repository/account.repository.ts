import { AccountCategory } from '@domain/account/account.enum';
import prismaClient from '@root/src/common/database/prisma';

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

export async function updateAccountById(
  id: number,
  param: {
    identification: string;
    password: string;
  },
) {
  return prismaClient.accounts.update({
    where: { id },
    data: param,
  });
}
