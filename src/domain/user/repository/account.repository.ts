import { Injectable } from '@nestjs/common';
import { PrismaService } from '@common/database/prisma.service';
import { AccountCategory } from '@domain/user/user.enum';

@Injectable()
export class AccountRepository {
  constructor(private prisma: PrismaService) {}

  async saveAccount(param: {
    userId: number;
    category: AccountCategory;
    identification: string;
    password: string;
  }) {
    await this.saveAccounts([param]);
  }

  async saveAccounts(
    params: {
      userId: number;
      category: AccountCategory;
      identification: string;
      password: string;
    }[],
  ) {
    return this.prisma.accounts.createMany({ data: params });
  }

  async getAccountById(id: number) {
    return this.prisma.accounts.findUnique({ where: { id } });
  }

  async getAccount(param: { identification: string; password: string }) {
    return this.prisma.accounts.findFirst({ where: param });
  }

  async updateAccountById(
    id: number,
    param: {
      identification: string;
      password: string;
    },
  ) {
    return this.prisma.accounts.update({
      where: { id },
      data: param,
    });
  }
}
