import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class UserTokenRepository {
  constructor(private prisma: PrismaService) {}

  async saveToken(param: {
    userId: number;
    accessToken: string;
    refreshToken: string;
    accessTokenExpiredAt: Date;
    refreshTokenExpiredAt: Date;
  }) {
    return await this.prisma.userTokens.create({ data: param });
  }

  async getTokenByUserId(userId: number) {
    return this.prisma.userTokens.findFirst({
      where: { userId },
    });
  }
}
