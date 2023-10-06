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

  async getAuthenticationByUserId(userId: number) {
    return this.prisma.authentications.findMany({ where: { userId } });
  }
}
