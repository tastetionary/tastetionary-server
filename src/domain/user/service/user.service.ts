import { Injectable } from '@nestjs/common';
import { UserRepository } from '@domain/user/repository/user.repository';
import { AccountRepository } from '@domain/user/repository/account.repository';
import { EndUser } from '@domain/user/core/end-user';
import { Account } from '@domain/user/core/account';
import { RegisterUserDTO } from '@domain/user/dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    private userRepo: UserRepository,
    private accountRepo: AccountRepository,
  ) {}

  async registerEndUser(dto: RegisterUserDTO) {
    const endUser = new EndUser(this.userRepo);
    const user = await endUser.register();

    const account = new Account(this.accountRepo, {
      identification: dto.identification,
      password: dto.password,
      category: dto.category,
    });
    await account.register(user.id);
    return user;
  }
}
