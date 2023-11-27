import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import {
  AuthenticationCategory,
  AuthenticationState,
  AuthenticationType,
} from '@domain/authentication/authentication.enum';

export interface AuthenticationHistoryEntity {
  id: number;
  identification: string;
  type: AuthenticationType;
  category: AuthenticationCategory;
  code: string;
  expiredAt: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AuthenticationEntity {
  category: AuthenticationCategory;
  type: AuthenticationType;
  state: AuthenticationState;
  id: number;
  userId: number | null;
  identification: string;
  createdAt?: Date;
  updatedAt?: Date;
}

type UpdateParam =
  | { id: number; userId: number }
  | { id: number; state: string };

@Injectable()
export class AuthenticationRepository {
  constructor(private prisma: PrismaService) {}

  async saveAuthentication(param: {
    userId?: number;
    identification: string;
    category: AuthenticationCategory;
    type: AuthenticationType;
    state: AuthenticationState;
  }) {
    return await this.prisma.authentications.create({
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
    identification: string;
    category: AuthenticationCategory;
    type: AuthenticationType;
    code: string;
    expiredAt: Date;
  }) {
    return await this.prisma.authenticationHistories.create({
      data: {
        identification: param.identification,
        category: param.category,
        type: param.type,
        code: param.code,
        expiredAt: param.expiredAt,
      },
    });
  }

  transformAuthentications(
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
  ): AuthenticationEntity[] {
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

  async getAuthenticationByIdentification(
    identification: string,
    category: AuthenticationCategory,
    type: AuthenticationType,
  ): Promise<AuthenticationEntity | null> {
    const record = await this.prisma.authentications.findFirst({
      where: { category, type, identification },
    });
    if (!record) return null;

    return this.transformAuthentications([record])[0];
  }

  async getAuthenticationsByUserId(param: {
    userId: number;
    type: AuthenticationType;
  }): Promise<AuthenticationEntity[]> {
    const records = await this.prisma.authentications.findMany({
      where: {
        userId: param.userId,
        type: param.type,
      },
    });
    return this.transformAuthentications(records);
  }

  async getAuthenticationByUserId(
    userId: number,
  ): Promise<AuthenticationEntity[]> {
    const records = await this.prisma.authentications.findMany({
      where: { userId },
    });
    return this.transformAuthentications(records);
  }

  async getHistoryById(
    id: number,
  ): Promise<AuthenticationHistoryEntity | null> {
    const record = await this.prisma.authenticationHistories.findUnique({
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
  async updateAuthentication(param: UpdateParam) {
    const data = {};
    if ('userId' in param) {
      data['userId'] = param.userId;
    }
    if ('state' in param) {
      data['state'] = param.state;
    }
    await this.prisma.authentications.update({
      where: { id: param.id },
      data,
    });
  }

  async deleteAuthentications(ids: number[]) {
    await this.prisma.authentications.deleteMany({
      where: { id: { in: ids } },
    });
  }
}
