import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';

@Injectable()
export class UserRepository {
  constructor(private prisma: PrismaService) {}

  async saveUsers(data: { nickname: string; state: string }[]) {
    return this.prisma.users.createMany({ data });
  }

  async getUsers() {
    return this.prisma.users.findMany();
  }
}
