import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async saveUser(data: {
    nickname: string;
    state: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    property: Record<string, any>;
  }) {
    await this.saveUsers([data]);
  }

  async saveUsers(
    data: {
      nickname: string;
      state: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      property: Record<string, any>;
    }[],
  ) {
    return this.prisma.users.createMany({ data });
  }

  async getUser(data: { id?: number; nickname?: string; state?: string }) {
    return this.getUsers(data, 1);
  }

  // TODO modify type state to enum
  async getUsers(
    data: { id?: number; nickname?: string; state?: string },
    take = 100,
  ) {
    return this.prisma.users.findMany({
      where: {
        id: data.id,
        nickname: data.nickname,
        state: data.state,
      },
      take,
    });
  }
}
