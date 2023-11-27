import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AgreementCategory } from '@domain/user/user.enum';
import newPrisma from '@common/database/new.prisma';

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
  return newPrisma.agreements.createMany({ data: params });
}

export async function getAgreementById(id: number) {
  return newPrisma.agreements.findUnique({ where: { id } });
}

export async function getAgreementsByUserId(userId: number) {
  return newPrisma.agreements.findMany({ where: { userId } });
}

export async function updateAgreementById(
  id: number,
  param: {
    is_agree: boolean;
  },
) {
  return newPrisma.agreements.update({
    where: { id },
    data: param,
  });
}
