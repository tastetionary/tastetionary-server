import { Injectable } from '@nestjs/common';
import { AgreementCategory } from '@domain/user/user.enum';
import prismaClient from '@root/src/common/database/prisma';

export async function saveAgreement(param: {
  userId: number;
  category: AgreementCategory;
  is_agree: boolean;
}) {
  await saveAgreements([param]);
}

export async function saveAgreements(
  params: {
    userId: number;
    category: AgreementCategory;
    is_agree: boolean;
  }[],
) {
  return prismaClient.agreements.createMany({ data: params });
}

export async function getAgreementById(id: number) {
  return prismaClient.agreements.findUnique({ where: { id } });
}

export async function getAgreementsByUserId(userId: number) {
  return prismaClient.agreements.findMany({ where: { userId } });
}

export async function updateAgreementById(
  id: number,
  param: {
    is_agree: boolean;
  },
) {
  return prismaClient.agreements.update({
    where: { id },
    data: param,
  });
}
