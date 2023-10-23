import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserState } from '@domain/user/user.enum';
import { Prisma } from '@prisma/client';

export interface UserEntity {
  id: number;
  nickname: string;
  state: string;
  property?: Prisma.JsonValue;
  createdAt?: Date;
  updatedAt?: Date;
}

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async saveUser(param: {
    nickname: string;
    state: UserState;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }) {
    return this.prisma.users.create({ data: param });
  }

  async saveUsers(
    params: {
      nickname: string;
      state: UserState;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      property: Record<string, any>;
    }[],
  ) {
    return this.prisma.users.createMany({ data: params });
  }

  async getUserById(id: number) {
    const user = await this.getUsers({ ids: [id] }, 1);
    return user[0];
  }

  async getUsers(
    param: { ids?: number[]; nicknames?: string[]; states?: UserState[] },
    take = 100,
  ) {
    return this.prisma.users.findMany({
      where: {
        id: {
          in: param.ids,
        },
        nickname: {
          in: param.nicknames,
        },
        state: {
          in: param.states,
        },
      },
      take,
    });
  }

  async updateUserById(
    id: number,
    param: {
      nickname?: string;
      state?: string;
      property?: Record<string, any>;
    },
  ) {
    return this.prisma.users.update({
      where: { id },
      data: param,
    });
  }

  // TODO for testing mock, it will be removed after merge service/core PR
  async tempMethod() {
    return ['origin'];
  }
}
