import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

@Injectable()
export class AuthenticationRepository {
  constructor(private prisma: PrismaService) {}

  async saveAuthentication(param: {
    userId: number;
    identification: string;
    category: AuthenticationCategory;
    type: AuthenticationType;
    state: AuthenticationState;
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
    type: AuthenticationType;
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
  // TODO change mapping way about enum ..
  async getAuthenticationByUserId(userId: number) {
    const records = await this.prisma.authentications.findMany({
      where: { userId },
    });
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

  async getAuthenticationHistoryByUserId(userId: number, type: string) {
    const records = await this.prisma.authenticationHistories.findMany({
      where: { userId, type },
    });

    return records.map((record) => {
      const { type, ...rest } = record;
      return {
        ...rest,
        type: AuthenticationType[type.toUpperCase()] as AuthenticationType,
      };
    });
  }

  // @NOTE add params when needed
  async updateAuthentication(param: {
    id: number;
    state: AuthenticationState;
  }) {
    await this.prisma.authentications.update({
      where: { id: param.id },
      data: { state: param.state },
    });
  }
}
