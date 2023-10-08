import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class AuthenticationRepository {
  constructor(private prisma: PrismaService) {}

  async saveAuthentication(param: {
    userId: number;
    identification: string;
    category: string;
    type: string;
    state: string;
  }) {
    await this.prisma.authentications.create({
      data: {
        userId: param.userId,
        identification: param.identification,
        category: param.category,
        type: param.type,
        state: param.state,
      },
    });
  }

  async saveAuthenticationHistory(param: {
    userId: number;
    identification: string;
    type: string;
    code: string;
    expiredAt: Date;
  }) {
    await this.prisma.authenticationHistories.create({
      data: {
        userId: param.userId,
        identification: param.identification,
        type: param.type,
        code: param.code,
        expiredAt: param.expiredAt,
      },
    });
  }

  async getAuthenticationByUserId(userId: number) {
    return this.prisma.authentications.findMany({ where: { userId } });
  }

  async getAuthenticationHistoryByUserId(userId: number, type: string) {
    return this.prisma.authenticationHistories.findMany({
      where: { userId, type },
    });
  }

  // @NOTE add params when needed
  async updateAuthentication(param: { id: number; state: string }) {
    await this.prisma.authentications.update({
      where: { id: param.id },
      data: { state: param.state },
    });
  }
}
