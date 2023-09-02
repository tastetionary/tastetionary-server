import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { UserState } from '@domain/user/user.enum';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async saveUser(param: {
    nickname: string;
    state: UserState;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }) {
    await this.saveUsers([param]);
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
    return this.getUsers({ ids: [id] }, 1);
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
    param: { nickname?: string; state?: string },
  ) {
    return this.prisma.users.update({
      where: { id },
      data: param,
    });
  }
}
