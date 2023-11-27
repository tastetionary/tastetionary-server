import { AccountCategory } from '@domain/account/account.enum';
import newPrisma from '@common/database/new.prisma';

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
  return newPrisma.accounts.createMany({ data: params });
}

export async function getIdentification(
  identification: string,
  category: AccountCategory,
) {
  return newPrisma.accounts.findFirst({
    where: { identification, category },
  });
}

export async function getAccountById(id: number) {
  return newPrisma.accounts.findUnique({ where: { id } });
}

export async function getAccount(param: {
  identification: string;
  password: string;
}) {
  return newPrisma.accounts.findFirst({ where: param });
}

export async function updateAccountById(
  id: number,
  param: {
    identification: string;
    password: string;
  },
) {
  return newPrisma.accounts.update({
    where: { id },
    data: param,
  });
}
