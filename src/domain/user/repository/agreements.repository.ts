import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AgreementCategory } from '@domain/user.enum';

@Injectable()
export class AgreementRepository {
  constructor(private prisma: PrismaService) {}

  async saveAgreement(param: {
    userId: number;
    category: AgreementCategory;
    is_agree: boolean;
  }) {
    await this.saveAgreements([param]);
  }

  async saveAgreements(
    params: {
      userId: number;
      category: AgreementCategory;
      is_agree: boolean;
    }[],
  ) {
    return this.prisma.agreements.createMany({ data: params });
  }

  async getAgreementById(id: number) {
    return this.prisma.agreements.findUnique({ where: { id } });
  }

  async getAgreementsByUserId(userId: number) {
    return this.prisma.agreements.findMany({ where: { userId } });
  }

  async updateAgreementById(
    id: number,
    param: {
      is_agree: boolean;
    },
  ) {
    return this.prisma.agreements.update({
      where: { id },
      data: param,
    });
  }
}
